import { env } from "cloudflare:test";
import { signDownloadUrl } from "@xeetloot/shared";
import { describe, expect, it } from "vitest";
import { handleDownload } from "../src/dl.js";

const SECRET = "test-dl-secret";

describe("handleDownload — host allowlist", () => {
  it("rejects a host that isn't video.twimg.com, pbs.twimg.com, or *.r2.cloudflarestorage.com", async () => {
    const params = { u: "https://evil.example.com/a.mp4", name: "a.mp4", exp: String(Math.floor(Date.now() / 1000) + 60) };
    const sig = await signDownloadUrl(
      { u: params.u, name: params.name, exp: Number(params.exp) },
      env.DL_HMAC_SECRET || SECRET,
    );
    const res = await handleDownload({ ...env, DL_HMAC_SECRET: env.DL_HMAC_SECRET || SECRET }, { ...params, sig }, null);
    expect(res.status).toBe(403);
  });

  it("rejects a non-https URL even for an otherwise allowed host", async () => {
    const params = { u: "http://video.twimg.com/a.mp4", name: "a.mp4", exp: String(Math.floor(Date.now() / 1000) + 60) };
    const res = await handleDownload(
      { ...env, DL_HMAC_SECRET: SECRET },
      { ...params, sig: "deadbeef" },
      null,
    );
    expect(res.status).toBe(403);
  });
});

describe("handleDownload — signature verification", () => {
  const allowedUrl = "https://video.twimg.com/amplify_video/123/vid/avc1/720x720/x.mp4";

  it("rejects a request with no valid signature", async () => {
    const exp = String(Math.floor(Date.now() / 1000) + 60);
    const res = await handleDownload(
      { ...env, DL_HMAC_SECRET: SECRET },
      { u: allowedUrl, name: "video.mp4", sig: "0000", exp },
      null,
    );
    expect(res.status).toBe(403);
  });

  it("rejects an expired, otherwise-valid signature", async () => {
    const exp = Math.floor(Date.now() / 1000) - 60;
    const sig = await signDownloadUrl({ u: allowedUrl, name: "video.mp4", exp }, SECRET);
    const res = await handleDownload(
      { ...env, DL_HMAC_SECRET: SECRET },
      { u: allowedUrl, name: "video.mp4", sig, exp: String(exp) },
      null,
    );
    expect(res.status).toBe(403);
  });

  it("rejects malformed exp", async () => {
    const res = await handleDownload(
      { ...env, DL_HMAC_SECRET: SECRET },
      { u: allowedUrl, name: "video.mp4", sig: "abc", exp: "not-a-number" },
      null,
    );
    expect(res.status).toBe(400);
  });
});
