import { env } from "cloudflare:test";
import { beforeEach, describe, expect, it } from "vitest";
import { isBreakerOpen, recordUpstreamStatus, tripBreaker } from "../src/breaker.js";

describe("breaker", () => {
  beforeEach(async () => {
    // BREAKER_STATE is a real (Miniflare-simulated) KV binding here, not a
    // fake — clear both keys between tests so state doesn't leak.
    await env.BREAKER_STATE.delete("breaker:syndication");
    await env.BREAKER_STATE.delete("breaker:extractor");
  });

  it("starts closed for a tier that has never tripped", async () => {
    expect(await isBreakerOpen(env.BREAKER_STATE, "syndication")).toBe(false);
  });

  it("opens after tripBreaker and stays scoped to its own tier", async () => {
    await tripBreaker(env.BREAKER_STATE, "syndication");
    expect(await isBreakerOpen(env.BREAKER_STATE, "syndication")).toBe(true);
    expect(await isBreakerOpen(env.BREAKER_STATE, "extractor")).toBe(false);
  });

  it("trips on 429 and 403, not on other statuses", async () => {
    await recordUpstreamStatus(env.BREAKER_STATE, "extractor", 500);
    expect(await isBreakerOpen(env.BREAKER_STATE, "extractor")).toBe(false);

    await recordUpstreamStatus(env.BREAKER_STATE, "extractor", 429);
    expect(await isBreakerOpen(env.BREAKER_STATE, "extractor")).toBe(true);
  });

  it("trips on 403 as well as 429", async () => {
    await recordUpstreamStatus(env.BREAKER_STATE, "syndication", 403);
    expect(await isBreakerOpen(env.BREAKER_STATE, "syndication")).toBe(true);
  });
});
