import { verifyDownloadUrl } from "@xeetloot/shared";
import { describe, expect, it } from "vitest";
import { signMediaDownloads } from "../src/sign.js";
import type { ResolvedMedia } from "@xeetloot/shared";

const SECRET = "test-sign-secret";

const media: ResolvedMedia = {
  platform: "x",
  id: "1790637656616943991",
  author: { handle: "historyinmemes", name: "Historic Vids" },
  text: "One of the most intense moments in history",
  createdAt: "2024-05-15T06:57:40.000Z",
  media: [
    {
      kind: "video",
      width: 728,
      height: 720,
      variants: [
        { bitrate: 2176000, contentType: "video/mp4", url: "https://video.twimg.com/a.mp4", width: 728, height: 720 },
        { bitrate: 288000, contentType: "video/mp4", url: "https://video.twimg.com/b.mp4", width: 272, height: 270 },
      ],
    },
  ],
};

describe("signMediaDownloads", () => {
  it("attaches a downloadUrl to every variant, parseable back into valid sig/exp", async () => {
    const signed = await signMediaDownloads(media, SECRET);
    const variants = signed.media[0]?.variants ?? [];
    expect(variants).toHaveLength(2);

    for (const v of variants) {
      expect(v.downloadUrl).toBeDefined();
      const url = new URL(v.downloadUrl!, "https://loot-api.internal");
      const u = url.searchParams.get("u")!;
      const name = url.searchParams.get("name")!;
      const sig = url.searchParams.get("sig")!;
      const exp = Number(url.searchParams.get("exp"));
      expect(u).toBe(v.url);
      expect(await verifyDownloadUrl({ u, name, exp }, sig, SECRET)).toBe(true);
    }
  });

  it("gives each variant a distinct filename when there are multiple", async () => {
    const signed = await signMediaDownloads(media, SECRET);
    const names = (signed.media[0]?.variants ?? []).map((v) => new URL(v.downloadUrl!, "https://x").searchParams.get("name"));
    expect(new Set(names).size).toBe(names.length);
  });

  it("leaves the original media object's variants untouched (no downloadUrl)", async () => {
    await signMediaDownloads(media, SECRET);
    expect(media.media[0]?.variants[0]?.downloadUrl).toBeUndefined();
  });
});
