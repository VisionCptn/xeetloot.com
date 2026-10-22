/** Platform identifier. Only "x" exists today — kept as a union (not a bare
 * string) so adding Pinterest later is a type-checked, grep-able change. */
export type Platform = "x";

export interface NormalizedUrl {
  platform: Platform;
  id: string;
}

/** A URL a normalizer recognizes as belonging to its platform, but whose id
 * can't be read from the URL text alone (e.g. a t.co short link) — the
 * caller must follow the redirect and normalize the resulting URL. Kept out
 * of the shared package so normalizer unit tests stay network-free. */
export interface ShortLinkUrl {
  platform: Platform;
  shortLink: true;
  url: string;
}

export type NormalizeResult = NormalizedUrl | ShortLinkUrl | null;

export function isShortLink(result: NormalizeResult): result is ShortLinkUrl {
  return result !== null && "shortLink" in result;
}

export function isNormalizedUrl(result: NormalizeResult): result is NormalizedUrl {
  return result !== null && !("shortLink" in result);
}

/** One platform's URL recognizer, kept behind this interface so a second
 * platform (Pinterest) can be registered without touching call sites that
 * already loop over a list of normalizers. */
export interface PlatformNormalizer {
  platform: Platform;
  normalize(rawUrl: string): NormalizeResult;
}

export type MediaKind = "video" | "gif" | "photo";

export interface MediaVariant {
  bitrate?: number;
  contentType: string;
  /** Direct video.twimg.com/pbs.twimg.com URL — safe to use as an inline
   * <video>/<img> src for preview, but never for a "Download" action (not
   * forced, no filename). */
  url: string;
  width?: number;
  height?: number;
  /** Signed, relative `/dl?...` link — loot-api fills this in before
   * returning the response (see apps/api/src/sign.ts), so the web app
   * never needs the HMAC secret. Join with loot-api's public origin to
   * get a full URL. Absent until signed. */
  downloadUrl?: string;
}

export interface MediaItem {
  kind: MediaKind;
  width?: number;
  height?: number;
  thumbnailUrl?: string;
  /** Only set for "video" and "gif". */
  durationMs?: number;
  /** Always sorted highest quality (bitrate, then width) first. */
  variants: MediaVariant[];
}

export interface ResolvedAuthor {
  handle: string;
  name: string;
  avatarUrl?: string;
}

export interface ResolvedMedia {
  platform: Platform;
  id: string;
  author: ResolvedAuthor;
  text: string;
  /** ISO 8601. */
  createdAt: string;
  media: MediaItem[];
}

export type ResolveErrorCode =
  | "unrecognized_url"
  | "protected_account"
  | "age_restricted"
  | "spaces_unsupported"
  | "not_found"
  | "unavailable"
  | "rate_limited"
  | "upstream_error"
  | "turnstile_failed";

/** Codes that mean "this tweet needs an authenticated session we will never
 * have" — callers must surface these to the UI and must NOT retry through
 * another resolve tier, since no tier here uses auth and a retry would just
 * waste a request for the same guaranteed failure. */
export const AUTH_REQUIRED_CODES: ReadonlySet<ResolveErrorCode> = new Set([
  "protected_account",
  "age_restricted",
  "spaces_unsupported",
]);
