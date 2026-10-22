import { describe, expect, it } from "vitest";
import { mapSyndicationTweetToMedia } from "../src/mapMedia.js";
import type { SyndicationTweet } from "../src/syndication.js";
import gifFixture from "./fixtures/syndication-gif.json";
import photoFixture from "./fixtures/syndication-photo.json";
import videoFixture from "./fixtures/syndication-video.json";

describe("mapSyndicationTweetToMedia — real video fixture", () => {
  const media = mapSyndicationTweetToMedia(videoFixture as SyndicationTweet);

  it("maps author, text, platform, id", () => {
    expect(media.platform).toBe("x");
    expect(media.id).toBe("1790637656616943991");
    expect(media.author.handle).toBe("historyinmemes");
    expect(media.text).toContain("most intense moments");
  });

  it("produces exactly one video media item with mp4-only variants", () => {
    expect(media.media).toHaveLength(1);
    const item = media.media[0];
    expect(item?.kind).toBe("video");
    for (const v of item?.variants ?? []) {
      expect(v.contentType).toBe("video/mp4");
    }
  });

  it("sorts variants highest bitrate first", () => {
    const bitrates = (media.media[0]?.variants ?? []).map((v) => v.bitrate ?? 0);
    expect(bitrates).toEqual([...bitrates].sort((a, b) => b - a));
  });

  it("reads per-variant dimensions out of the URL path, not one shared size", () => {
    const widths = new Set((media.media[0]?.variants ?? []).map((v) => v.width));
    expect(widths.size).toBeGreaterThan(1);
  });
});

describe("mapSyndicationTweetToMedia — gif fixture", () => {
  const media = mapSyndicationTweetToMedia(gifFixture as SyndicationTweet);

  it("maps the animated_gif type to kind 'gif' with a direct mp4 variant", () => {
    expect(media.media).toHaveLength(1);
    expect(media.media[0]?.kind).toBe("gif");
    expect(media.media[0]?.variants[0]?.contentType).toBe("video/mp4");
  });
});

describe("mapSyndicationTweetToMedia — 4-photo fixture", () => {
  const media = mapSyndicationTweetToMedia(photoFixture as SyndicationTweet);

  it("maps all 4 photos, each with a single orig-quality variant", () => {
    expect(media.media).toHaveLength(4);
    for (const item of media.media) {
      expect(item.kind).toBe("photo");
      expect(item.variants).toHaveLength(1);
      expect(item.variants[0]?.url).toMatch(/\?name=orig$/);
    }
  });
});

describe("mapSyndicationTweetToMedia — no media", () => {
  it("returns an empty media array for a text-only tweet", () => {
    const media = mapSyndicationTweetToMedia({
      id_str: "20",
      text: "just setting up my twttr",
      created_at: "2006-03-21T20:50:14.000Z",
      user: { screen_name: "jack", name: "jack", profile_image_url_https: "" },
    });
    expect(media.media).toEqual([]);
  });
});
