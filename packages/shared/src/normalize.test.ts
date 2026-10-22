import { describe, expect, it } from "vitest";
import { normalizeXUrl } from "./normalize.js";

describe("normalizeXUrl — accepted forms", () => {
  const cases: Array<[string, string]> = [
    ["https://twitter.com/jack/status/20", "20"],
    ["https://www.twitter.com/jack/status/20", "20"],
    ["http://twitter.com/jack/status/20", "20"],
    ["https://mobile.twitter.com/jack/status/20", "20"],
    ["https://twitter.com/jack/statuses/20", "20"],
    ["twitter.com/jack/status/20", "20"],
    ["https://x.com/jack/status/20", "20"],
    ["https://www.x.com/jack/status/20", "20"],
    ["https://mobile.x.com/jack/status/20", "20"],
    ["x.com/jack/status/20", "20"],
    ["https://x.com/jack/status/20?s=20", "20"],
    ["https://x.com/jack/status/20/", "20"],
    ["https://x.com/jack/status/20#reply", "20"],
    ["https://x.com/jack/status/20/photo/1", "20"],
    ["https://x.com/jack/status/20/video/1", "20"],
    ["https://nitter.net/jack/status/20", "20"],
    ["https://nitter.poast.org/jack/status/20", "20"],
    ["https://nitter.1d4.us/jack/status/20", "20"],
    ["https://vxtwitter.com/jack/status/20", "20"],
    ["https://www.vxtwitter.com/jack/status/20", "20"],
    ["https://fxtwitter.com/jack/status/20", "20"],
    ["https://www.fxtwitter.com/jack/status/20", "20"],
    ["https://xeetloot.com/jack/status/20", "20"],
    ["https://www.xeetloot.com/jack/status/20", "20"],
    ["https://x.com/a_b_c_123/status/1790637656616943991", "1790637656616943991"],
  ];

  for (const [input, expectedId] of cases) {
    it(`extracts id ${expectedId} from ${input}`, () => {
      const result = normalizeXUrl(input);
      expect(result).toEqual({ platform: "x", id: expectedId });
    });
  }
});

describe("normalizeXUrl — short links", () => {
  it("flags t.co as a short link needing redirect resolution", () => {
    const result = normalizeXUrl("https://t.co/abc123");
    expect(result).toEqual({ platform: "x", shortLink: true, url: "https://t.co/abc123" });
  });
});

describe("normalizeXUrl — rejected forms", () => {
  const rejected = [
    "https://example.com/jack/status/20",
    "https://twitter.com/jack",
    "https://twitter.com/jack/likes",
    "https://twitter.com/i/spaces/1abcDEF",
    "not a url at all",
    "https://pinterest.com/pin/123456789/",
    "https://fakexnitter.com/jack/status/20",
  ];

  for (const input of rejected) {
    it(`rejects ${input}`, () => {
      expect(normalizeXUrl(input)).toBeNull();
    });
  }
});
