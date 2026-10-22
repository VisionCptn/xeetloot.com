function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

/** xeetloot-{slug of the tweet text or id}-{quality}.{ext} — used as the
 * Content-Disposition filename for every /dl link. */
export function buildDownloadFilename(tweetText: string | undefined, id: string, quality: string, ext: string): string {
  const base = (tweetText && slugify(tweetText)) || id;
  const q = slugify(quality) || "download";
  return `xeetloot-${base}-${q}.${ext}`;
}
