import { ResolveError } from "@xeetloot/shared";

const SYNDICATION_URL = "https://cdn.syndication.twimg.com/tweet-result";

// Workers' default fetch User-Agent gets a flat 400 from this endpoint
// (observed under `wrangler dev` — same URL succeeds from a plain curl
// with a browser-like UA). Not spoofing anything exotic, just not
// identifying as a bare HTTP client.
const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

// Same features list the X embed widget sends — matches vercel/react-tweet,
// which reverse-engineered this from the widget's own network calls. There
// is no documented spec for this; X can change or kill the endpoint any
// time with no notice.
const FEATURES = [
  "tfw_timeline_list:",
  "tfw_follower_count_sunset:true",
  "tfw_tweet_edit_backend:on",
  "tfw_refsrc_session:on",
  "tfw_fosnr_soft_interventions_enabled:on",
  "tfw_show_birdwatch_pivots_enabled:on",
  "tfw_show_business_verified_badge:on",
  "tfw_duplicate_scribes_to_settings:on",
  "tfw_use_profile_image_shape_enabled:on",
  "tfw_show_blue_verified_badge:on",
  "tfw_legacy_timeline_sunset:true",
  "tfw_show_gov_verified_badge:on",
  "tfw_show_business_affiliate_badge:on",
  "tfw_tweet_edit_frontend:on",
].join(";");

/** ((id / 1e15) * pi) in base 36, digits/dots stripped — the exact
 * derivation vercel/react-tweet uses. Not a secret, just an undocumented
 * anti-abuse token the syndication endpoint checks for. */
function getToken(id: string): string {
  return ((Number(id) / 1e15) * Math.PI).toString(36).replace(/(0+|\.)/g, "");
}

export interface SyndicationMediaVariant {
  bitrate?: number;
  content_type: string;
  url: string;
}

export interface SyndicationMediaDetail {
  type: "photo" | "animated_gif" | "video";
  media_url_https: string;
  original_info?: { width: number; height: number };
  video_info?: { variants: SyndicationMediaVariant[]; duration_millis?: number };
}

export interface SyndicationTweet {
  __typename?: "Tweet" | "TweetTombstone";
  id_str: string;
  text: string;
  created_at: string;
  user: { screen_name: string; name: string; profile_image_url_https: string };
  mediaDetails?: SyndicationMediaDetail[];
}

export interface SyndicationHit {
  ok: true;
  tweet: SyndicationTweet;
}

export interface SyndicationMiss {
  ok: false;
  /** Set only for a definitive, no-point-retrying-tier-2 outcome (brief:
   * "on 404/401 return typed error without retrying other tiers"). Left
   * undefined for a tombstone/empty/network/5xx response, which the caller
   * should still try tier 2 for. */
  terminal?: ResolveError;
  /** HTTP status actually observed, so the caller can trip the breaker on
   * 429/403 — undefined for a network-level failure (no response at all). */
  status?: number;
}

export type SyndicationResult = SyndicationHit | SyndicationMiss;

export async function fetchSyndicationTweet(
  id: string,
  fetchImpl: typeof fetch = fetch,
): Promise<SyndicationResult> {
  const url = new URL(SYNDICATION_URL);
  url.searchParams.set("id", id);
  url.searchParams.set("lang", "en");
  url.searchParams.set("features", FEATURES);
  url.searchParams.set("token", getToken(id));

  let res: Response;
  try {
    res = await fetchImpl(url.toString(), { headers: { "User-Agent": USER_AGENT, Accept: "application/json" } });
  } catch (err) {
    console.error("[loot-api] syndication fetch failed", err);
    return { ok: false };
  }

  if (res.status === 404 || res.status === 401) {
    return { ok: false, status: res.status, terminal: new ResolveError("Tweet not found or unavailable", "not_found") };
  }
  if (!res.ok) {
    return { ok: false, status: res.status };
  }

  const data = (await res.json().catch(() => null)) as SyndicationTweet | Record<string, never> | null;
  if (!data || Object.keys(data).length === 0 || data.__typename === "TweetTombstone") {
    // Ambiguous on purpose — could be deleted, protected, age-restricted,
    // or just a syndication quirk. Let tier 2 (yt-dlp) have its own look
    // rather than guessing a specific error code from this alone.
    return { ok: false, status: res.status };
  }

  return { ok: true, tweet: data as SyndicationTweet };
}
