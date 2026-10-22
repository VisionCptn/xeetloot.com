import { signDownloadUrl, type MediaVariant, type ResolvedMedia } from "@xeetloot/shared";
import { buildDownloadFilename } from "./filename.js";

const DOWNLOAD_LINK_TTL_SECONDS = 60 * 60; // matches the cache TTL these links are served under

function extFromContentType(contentType: string): string {
  if (contentType === "video/mp4") return "mp4";
  if (contentType === "image/jpeg") return "jpg";
  if (contentType === "image/gif") return "gif";
  return "bin";
}

async function signVariant(variant: MediaVariant, tweetText: string, id: string, quality: string, secret: string): Promise<MediaVariant> {
  const exp = Math.floor(Date.now() / 1000) + DOWNLOAD_LINK_TTL_SECONDS;
  const name = buildDownloadFilename(tweetText, id, quality, extFromContentType(variant.contentType));
  const sig = await signDownloadUrl({ u: variant.url, name, exp }, secret);
  const downloadUrl = `/dl?u=${encodeURIComponent(variant.url)}&name=${encodeURIComponent(name)}&sig=${sig}&exp=${exp}`;
  return { ...variant, downloadUrl };
}

/** Attaches a signed /dl link to every variant in a resolved tweet's media
 * — the only place in loot-api that touches DL_HMAC_SECRET for a plain
 * resolve, so the web app never needs it (see apps/api/src/dl.ts for the
 * verifying side). */
export async function signMediaDownloads(media: ResolvedMedia, secret: string): Promise<ResolvedMedia> {
  const signedItems = await Promise.all(
    media.media.map(async (item) => {
      const quality = item.kind === "photo" ? "orig" : item.kind === "gif" ? "gif" : `${item.width ?? ""}x${item.height ?? ""}`;
      const variants = await Promise.all(
        item.variants.map((v, i) =>
          signVariant(v, media.text, media.id, item.variants.length > 1 ? `${quality}-${i}` : quality, secret),
        ),
      );
      return { ...item, variants };
    }),
  );
  return { ...media, media: signedItems };
}
