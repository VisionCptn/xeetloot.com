export type Tier = "syndication" | "extractor";

const OPEN_DURATION_SECONDS = 15 * 60;

function breakerKey(tier: Tier): string {
  return `breaker:${tier}`;
}

/** KV read failures fail OPEN (treated as "not tripped") — a cache outage
 * should degrade to normal traffic, not silently block every request. */
export async function isBreakerOpen(kv: KVNamespace, tier: Tier): Promise<boolean> {
  try {
    return (await kv.get(breakerKey(tier))) !== null;
  } catch (err) {
    console.error(`[loot-api] breaker read failed for tier "${tier}", failing open`, err);
    return false;
  }
}

/** Presence of the key = open; KV's own TTL closes the breaker again, so
 * there's nothing to explicitly "reset". */
export async function tripBreaker(kv: KVNamespace, tier: Tier): Promise<void> {
  try {
    await kv.put(breakerKey(tier), "open", { expirationTtl: OPEN_DURATION_SECONDS });
  } catch (err) {
    console.error(`[loot-api] breaker write failed for tier "${tier}"`, err);
  }
}

/** Call after any upstream fetch — trips the breaker on 429/403, otherwise
 * a no-op. Centralized here so /resolve's two tiers apply the same rule. */
export async function recordUpstreamStatus(kv: KVNamespace, tier: Tier, status: number): Promise<void> {
  if (status === 429 || status === 403) {
    await tripBreaker(kv, tier);
  }
}
