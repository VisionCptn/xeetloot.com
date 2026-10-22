import { Hono } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import { isNormalizedUrl, isShortLink, normalizeXUrl, type ResolveErrorCode } from "@xeetloot/shared";
import { isBreakerOpen, recordUpstreamStatus } from "./breaker.js";
import { getCachedResolve, setCachedResolve } from "./cache.js";
import { callExtractorInfo, ExtractContainer } from "./container.js";
import { handleConvert } from "./convert.js";
import { runCanaryCheck, runNightlyUpdate } from "./cron.js";
import { handleDownload } from "./dl.js";
import type { Env } from "./env.js";
import { mapExtractorInfoToMedia, mapSyndicationTweetToMedia } from "./mapMedia.js";
import { checkRateLimit } from "./ratelimit.js";
import { signMediaDownloads } from "./sign.js";
import { renderStatusPage } from "./status.js";
import { fetchSyndicationTweet } from "./syndication.js";
import { verifyTurnstileToken } from "./turnstile.js";
import type { ResolvedMedia } from "@xeetloot/shared";

// Re-exported so wrangler.toml's `[exports.ExtractContainer]` has a class
// to bind to.
export { ExtractContainer };

function errorStatus(code: ResolveErrorCode): ContentfulStatusCode {
  switch (code) {
    case "unrecognized_url":
      return 400;
    case "not_found":
      return 404;
    case "protected_account":
    case "age_restricted":
    case "spaces_unsupported":
      return 403;
    case "rate_limited":
      return 429;
    default:
      return 502;
  }
}

const app = new Hono<{ Bindings: Env }>();

app.get("/resolve", async (c) => {
  const rawUrl = c.req.query("url")?.trim();
  const turnstileToken = c.req.query("turnstileToken") ?? null;
  if (!rawUrl) return c.json({ error: "unrecognized_url" satisfies ResolveErrorCode }, 400);

  const ipHeader = c.req.header("CF-Connecting-IP");
  const ip = ipHeader ?? "unknown";
  const rate = await checkRateLimit(c.env, ip);
  if (!rate.allowed) return c.json({ error: "rate_limited", limitedBy: rate.limitedBy }, 429);

  // Never pass the "unknown" rate-limit-bucket placeholder to Cloudflare's
  // siteverify as `remoteip` — that's not a real IP and Turnstile rejects
  // the verification outright if it's set to garbage.
  const verified = await verifyTurnstileToken(turnstileToken, ipHeader ?? null, c.env.TURNSTILE_SECRET_KEY);
  if (!verified) return c.json({ error: "turnstile_failed" }, 403);

  // t.co doesn't encode the tweet id in the URL text — follow the redirect
  // once, then normalize whatever it lands on.
  let normalized = normalizeXUrl(rawUrl);
  if (isShortLink(normalized)) {
    try {
      const res = await fetch(normalized.url, { redirect: "follow" });
      normalized = normalizeXUrl(res.url);
    } catch {
      normalized = null;
    }
  }
  if (!isNormalizedUrl(normalized)) {
    return c.json({ error: "unrecognized_url" satisfies ResolveErrorCode }, 400);
  }
  const { platform, id } = normalized;

  // Cached and freshly-resolved media are both kept UNSIGNED — /dl links
  // carry a 1h expiry, well inside the 24h cache TTL, so signing happens
  // once below, fresh on every response, never on the cached copy itself.
  let media: ResolvedMedia | null = await getCachedResolve(c.env.RESOLVE_CACHE, platform, id);
  const cacheStatus = media ? "HIT" : "MISS";

  if (!media) {
    // Tier 1 — X syndication API (the same endpoint the embed widget uses).
    if (!(await isBreakerOpen(c.env.BREAKER_STATE, "syndication"))) {
      const result = await fetchSyndicationTweet(id);

      if (result.ok) {
        media = mapSyndicationTweetToMedia(result.tweet);
        await setCachedResolve(c.env.RESOLVE_CACHE, media);
      } else {
        if (result.status) await recordUpstreamStatus(c.env.BREAKER_STATE, "syndication", result.status);
        if (result.terminal) {
          return c.json(
            { error: result.terminal.code, message: result.terminal.message },
            errorStatus(result.terminal.code),
          );
        }
      }
    }
  }

  if (!media) {
    // Tier 2 — extractor (yt-dlp), reached only on a tier-1 miss or open
    // breaker. yt-dlp's Twitter extractor doesn't recognize nitter/
    // vxtwitter/fxtwitter hosts, so this uses a canonical x.com URL built
    // from the normalized id rather than the user's original raw input.
    if (!(await isBreakerOpen(c.env.BREAKER_STATE, "extractor"))) {
      const canonicalUrl = `https://x.com/i/status/${id}`;
      const outcome = await callExtractorInfo(c.env, canonicalUrl);

      if (outcome.ok) {
        if (outcome.info.formats.length > 0) {
          media = mapExtractorInfoToMedia(platform, id, outcome.info);
          await setCachedResolve(c.env.RESOLVE_CACHE, media);
        }
      } else {
        await recordUpstreamStatus(c.env.BREAKER_STATE, "extractor", outcome.status);
        if (outcome.error) {
          return c.json(
            { error: outcome.error.error, message: outcome.error.message },
            errorStatus(outcome.error.error),
          );
        }
      }
    }
  }

  if (!media) {
    return c.json({ error: "unavailable" satisfies ResolveErrorCode, message: "Could not resolve this tweet" }, 502);
  }

  const signed = await signMediaDownloads(media, c.env.DL_HMAC_SECRET);
  return c.json(signed, 200, { "X-Resolve-Cache": cacheStatus });
});

app.get("/dl", async (c) => {
  const u = c.req.query("u");
  const name = c.req.query("name");
  const sig = c.req.query("sig");
  const exp = c.req.query("exp");
  if (!u || !name || !sig || !exp) return c.text("missing_params", 400);
  return handleDownload(c.env, { u, name, sig, exp }, c.req.header("Range") ?? null);
});

app.post("/convert", async (c) => {
  const body = (await c.req.json().catch(() => null)) as { id?: string; kind?: string; source?: string } | null;
  if (!body?.id || (body.kind !== "gif" && body.kind !== "mp3") || !body.source) {
    return c.json({ error: "invalid_request" }, 400);
  }
  const result = await handleConvert(c.env, { id: body.id, kind: body.kind, source: body.source });
  if (!result) return c.json({ error: "unavailable" satisfies ResolveErrorCode }, 502);
  return c.json(result);
});

app.get("/status", async (c) => {
  const key = c.req.query("key");
  // Fails closed, same rule as every other secret check here: an unset
  // STATUS_SECRET must never be treated as "no auth required".
  if (!c.env.STATUS_SECRET || key !== c.env.STATUS_SECRET) return c.text("not_found", 404);
  return c.html(await renderStatusPage(c.env));
});

const worker = {
  fetch: app.fetch,
  async scheduled(event: ScheduledController, env: Env): Promise<void> {
    if (event.cron === "0 3 * * *") {
      await runNightlyUpdate(env);
    } else {
      await runCanaryCheck(env);
    }
  },
};

export default worker;
