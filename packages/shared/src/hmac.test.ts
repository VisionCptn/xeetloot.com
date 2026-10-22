import { describe, expect, it } from "vitest";
import { signDownloadUrl, signHmac, verifyDownloadUrl, verifyHmac } from "./hmac.js";

describe("signHmac / verifyHmac", () => {
  it("verifies a signature produced by signHmac with the same secret", async () => {
    const sig = await signHmac("hello", "secret-key");
    expect(await verifyHmac("hello", sig, "secret-key")).toBe(true);
  });

  it("rejects a signature produced with a different secret", async () => {
    const sig = await signHmac("hello", "secret-key");
    expect(await verifyHmac("hello", sig, "wrong-key")).toBe(false);
  });

  it("rejects a tampered payload", async () => {
    const sig = await signHmac("hello", "secret-key");
    expect(await verifyHmac("hello-but-different", sig, "secret-key")).toBe(false);
  });

  it("rejects a malformed signature instead of throwing", async () => {
    expect(await verifyHmac("hello", "not-hex!!", "secret-key")).toBe(false);
    expect(await verifyHmac("hello", "abc", "secret-key")).toBe(false);
  });
});

describe("signDownloadUrl / verifyDownloadUrl", () => {
  const secret = "dl-secret";
  const params = { u: "https://video.twimg.com/a.mp4", name: "xeetloot-video.mp4", exp: 2000000000 };

  it("verifies a freshly signed, unexpired download link", async () => {
    const sig = await signDownloadUrl(params, secret);
    expect(await verifyDownloadUrl(params, sig, secret, 1000000000)).toBe(true);
  });

  it("rejects once past the expiry, even with a valid signature", async () => {
    const sig = await signDownloadUrl(params, secret);
    expect(await verifyDownloadUrl(params, sig, secret, 2000000001)).toBe(false);
  });

  it("rejects a signature for different params (url/name/exp swapped)", async () => {
    const sig = await signDownloadUrl(params, secret);
    expect(await verifyDownloadUrl({ ...params, name: "other.mp4" }, sig, secret, 1000000000)).toBe(false);
  });
});
