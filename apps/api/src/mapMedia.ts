import type { MediaItem, MediaKind, MediaVariant, Platform, ResolvedMedia } from "@xeetloot/shared";
import type { ExtractorInfoResult } from "./container.js";
import type { SyndicationMediaDetail, SyndicationTweet } from "./syndication.js";

// X's mp4 renditions encode their resolution in the path itself
// (.../vid/avc1/1280x720/...), which is the only place per-variant
// dimensions exist — `original_info` is one shared size for the whole
// media item, not per-bitrate.
const URL_DIMENSIONS_RE = /\/(\d+)x(\d+)\//;

function dimensionsFromUrl(url: string): { width?: number; height?: number } {
  const match = url.match(URL_DIMENSIONS_RE);
  return match ? { width: Number(match[1]), height: Number(match[2]) } : {};
}

function mapKind(type: SyndicationMediaDetail["type"]): MediaKind {
  if (type === "animated_gif") return "gif";
  if (type === "video") return "video";
  return "photo";
}

function mapVariants(detail: SyndicationMediaDetail): MediaVariant[] {
  if (detail.type === "photo") {
    return [
      {
        contentType: "image/jpeg",
        url: `${detail.media_url_https}?name=orig`,
        width: detail.original_info?.width,
        height: detail.original_info?.height,
      },
    ];
  }

  const variants = detail.video_info?.variants ?? [];
  return variants
    // The HLS manifest entry has no bitrate and isn't a single downloadable
    // file — excluded so every variant here is a direct, forceable download
    // (non-negotiable rule: resolve only ever returns direct media URLs).
    .filter((v) => v.content_type === "video/mp4")
    .map((v) => {
      const dims = dimensionsFromUrl(v.url);
      return {
        bitrate: v.bitrate,
        contentType: v.content_type,
        url: v.url,
        width: dims.width ?? detail.original_info?.width,
        height: dims.height ?? detail.original_info?.height,
      };
    })
    .sort((a, b) => (b.bitrate ?? 0) - (a.bitrate ?? 0));
}

function mapMediaItem(detail: SyndicationMediaDetail): MediaItem {
  return {
    kind: mapKind(detail.type),
    width: detail.original_info?.width,
    height: detail.original_info?.height,
    thumbnailUrl: detail.media_url_https,
    durationMs: detail.video_info?.duration_millis,
    variants: mapVariants(detail),
  };
}

export function mapSyndicationTweetToMedia(tweet: SyndicationTweet): ResolvedMedia {
  return {
    platform: "x",
    id: tweet.id_str,
    author: {
      handle: tweet.user.screen_name,
      name: tweet.user.name,
      avatarUrl: tweet.user.profile_image_url_https,
    },
    text: tweet.text,
    createdAt: tweet.created_at,
    media: (tweet.mediaDetails ?? []).map(mapMediaItem),
  };
}

/** Tier-2 (yt-dlp) fallback mapping. yt-dlp's generic `formats[]` carries
 * far less than the syndication API (no author, no per-tweet text) — this
 * is a deliberately minimal shape; Phase 2 can enrich it once the
 * extractor's real /info response is in hand. */
export function mapExtractorInfoToMedia(platform: Platform, id: string, info: ExtractorInfoResult): ResolvedMedia {
  const variants: MediaVariant[] = info.formats
    .filter((f) => f.ext === "mp4")
    .map((f) => ({ bitrate: f.vbr, contentType: "video/mp4", url: f.url, width: f.width, height: f.height }))
    .sort((a, b) => (b.bitrate ?? 0) - (a.bitrate ?? 0));

  return {
    platform,
    id,
    author: { handle: "", name: "" },
    text: info.title ?? "",
    createdAt: new Date().toISOString(),
    media: variants.length ? [{ kind: "video", variants }] : [],
  };
}
