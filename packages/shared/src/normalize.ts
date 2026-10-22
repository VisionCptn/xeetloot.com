import type { NormalizeResult, PlatformNormalizer } from "./types.js";

// Path shape shared by every direct (non-short-link) host:
// /<handle>/status/<id> — also accepts the legacy "statuses" spelling and a
// trailing /photo/1, /video/1 etc. that some share links append.
const STATUS_ID_RE = /\/[A-Za-z0-9_]{1,15}\/status(?:es)?\/(\d{1,40})(?:[/?#]|$)/;

const DIRECT_HOSTS = new Set([
  "twitter.com",
  "www.twitter.com",
  "mobile.twitter.com",
  "x.com",
  "www.x.com",
  "mobile.x.com",
  "vxtwitter.com",
  "www.vxtwitter.com",
  "fxtwitter.com",
  "www.fxtwitter.com",
  "xeetloot.com",
  "www.xeetloot.com",
]);

function isNitterHost(hostname: string): boolean {
  return hostname === "nitter" || hostname.startsWith("nitter.");
}

const SHORT_LINK_HOSTS = new Set(["t.co"]);

function parseUrl(rawUrl: string): URL | null {
  const trimmed = rawUrl.trim();
  try {
    return new URL(trimmed);
  } catch {
    try {
      return new URL(`https://${trimmed}`);
    } catch {
      return null;
    }
  }
}

/** Recognizes twitter.com/x.com/their mobile+www variants, t.co short
 * links, nitter mirrors, vxtwitter/fxtwitter embed-fixer links, and our own
 * "xeetloot.com/<user>/status/<id>" address-bar-trick route. */
export function normalizeXUrl(rawUrl: string): NormalizeResult {
  const url = parseUrl(rawUrl);
  if (!url) return null;

  const hostname = url.hostname.toLowerCase();

  if (SHORT_LINK_HOSTS.has(hostname)) {
    return { platform: "x", shortLink: true, url: url.toString() };
  }

  if (!DIRECT_HOSTS.has(hostname) && !isNitterHost(hostname)) return null;

  const match = url.pathname.match(STATUS_ID_RE);
  if (!match) return null;

  const id = match[1];
  if (!id) return null;
  return { platform: "x", id };
}

export const xNormalizer: PlatformNormalizer = {
  platform: "x",
  normalize: normalizeXUrl,
};
