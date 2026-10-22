import type { ResolvedMedia } from "@xeetloot/shared";

const CACHE_TTL_SECONDS = 24 * 60 * 60;

function cacheKey(platform: string, id: string): string {
  return `${platform}:${id}`;
}

export async function getCachedResolve(kv: KVNamespace, platform: string, id: string): Promise<ResolvedMedia | null> {
  try {
    const raw = await kv.get(cacheKey(platform, id));
    return raw ? (JSON.parse(raw) as ResolvedMedia) : null;
  } catch (err) {
    console.error("[loot-api] RESOLVE_CACHE read failed, continuing without cache", err);
    return null;
  }
}

export async function setCachedResolve(kv: KVNamespace, media: ResolvedMedia): Promise<void> {
  try {
    await kv.put(cacheKey(media.platform, media.id), JSON.stringify(media), {
      expirationTtl: CACHE_TTL_SECONDS,
    });
  } catch (err) {
    console.error("[loot-api] RESOLVE_CACHE write failed, continuing without cache", err);
  }
}
