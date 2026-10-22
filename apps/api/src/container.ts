import { Container, getContainer } from "@cloudflare/containers";
import type { ResolveErrorCode } from "@xeetloot/shared";
import type { Env } from "./env.js";

/** Stateless per-request tool (resolve tier 2, /convert) — no reason to
 * keep an instance warm long. Mirrors pinloot's lib/ig-container-client.ts
 * pattern, swapped for xeetloot's own extractor image. */
export class ExtractContainer extends Container<Env> {
  defaultPort = 8080;
  sleepAfter = "3m";

  envVars = {
    EXTRACTOR_SECRET: this.env.EXTRACTOR_SECRET ?? "",
  };
}

export interface ExtractorFormat {
  url: string;
  ext: string;
  width?: number;
  height?: number;
  vbr?: number;
  abr?: number;
}

export interface ExtractorInfoResult {
  title?: string;
  formats: ExtractorFormat[];
}

export interface ExtractorErrorBody {
  error: ResolveErrorCode;
  message: string;
}

export type ExtractorInfoOutcome =
  | { ok: true; info: ExtractorInfoResult }
  // `status` is 0 for a network-level failure (no response at all) —
  // distinct from a real HTTP status so the breaker logic in index.ts
  // doesn't mistake "container unreachable" for a 4xx/5xx worth recording.
  | { ok: false; status: number; error?: ExtractorErrorBody };

/** Calls the extractor container's /info for one tweet URL — resolve tier
 * 2, used only after tier 1 (syndication) misses. `tweetUrl` should
 * already be a canonical x.com URL (see index.ts) — yt-dlp's Twitter
 * extractor doesn't recognize nitter/vxtwitter/fxtwitter hosts. */
export async function callExtractorInfo(env: Env, tweetUrl: string): Promise<ExtractorInfoOutcome> {
  let res: Response;
  try {
    const container = getContainer(env.EXTRACT_CONTAINER, tweetUrl);
    res = await container.fetch("http://container/info", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-secret": env.EXTRACTOR_SECRET },
      body: JSON.stringify({ url: tweetUrl }),
    });
  } catch (err) {
    console.error("[loot-api] extractor container /info call failed", err);
    return { ok: false, status: 0 };
  }

  if (res.ok) {
    return { ok: true, info: (await res.json()) as ExtractorInfoResult };
  }
  const error = (await res.json().catch(() => null)) as ExtractorErrorBody | null;
  return { ok: false, status: res.status, error: error ?? undefined };
}

/** Nightly cron: tells the container to self-update yt-dlp. Fire-and-log —
 * a failed update should not alarm anyone louder than a log line, since the
 * container keeps serving its previously-installed version either way. */
export async function callExtractorUpdate(env: Env): Promise<boolean> {
  try {
    const container = getContainer(env.EXTRACT_CONTAINER, "update");
    const res = await container.fetch("http://container/update", {
      method: "POST",
      headers: { "x-secret": env.EXTRACTOR_SECRET },
    });
    return res.ok;
  } catch (err) {
    console.error("[loot-api] extractor container /update call failed", err);
    return false;
  }
}
