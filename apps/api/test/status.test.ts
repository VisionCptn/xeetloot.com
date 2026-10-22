import { env } from "cloudflare:test";
import { beforeEach, describe, expect, it } from "vitest";
import worker from "../src/index.js";
import { CANARY_KEY } from "../src/cron.js";

const ctx = { waitUntil: () => {}, passThroughOnException: () => {} } as unknown as ExecutionContext;

describe("GET /status", () => {
  beforeEach(async () => {
    await env.CANARY_STATE.delete(CANARY_KEY);
  });

  it("404s with no key", async () => {
    const res = await worker.fetch(new Request("https://loot-api.test/status"), env, ctx);
    expect(res.status).toBe(404);
  });

  it("404s with the wrong key", async () => {
    const res = await worker.fetch(new Request("https://loot-api.test/status?key=wrong"), env, ctx);
    expect(res.status).toBe(404);
  });

  it("renders the status page with the right key, even with no canary data yet", async () => {
    const res = await worker.fetch(
      new Request(`https://loot-api.test/status?key=${env.STATUS_SECRET}`),
      env,
      ctx,
    );
    expect(res.status).toBe(200);
    const body = await res.text();
    expect(body).toContain("loot-api status");
    expect(body).toContain("No canary data yet");
  });

  it("renders canary results once they exist", async () => {
    await env.CANARY_STATE.put(
      CANARY_KEY,
      JSON.stringify({
        video: { url: "https://x.com/a/status/1", ok: true, checkedAt: "2026-01-01T00:00:00.000Z" },
        gif: { url: "https://x.com/a/status/2", ok: false, checkedAt: "2026-01-01T00:00:00.000Z", error: "resolve_failed" },
        photo: { url: "https://x.com/a/status/3", ok: true, checkedAt: "2026-01-01T00:00:00.000Z" },
        updatedAt: "2026-01-01T00:00:00.000Z",
      }),
    );

    const res = await worker.fetch(
      new Request(`https://loot-api.test/status?key=${env.STATUS_SECRET}`),
      env,
      ctx,
    );
    const body = await res.text();
    expect(body).toContain("Canary: video");
    expect(body).toContain("resolve_failed");
  });
});
