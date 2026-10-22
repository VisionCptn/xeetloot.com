import { callExtractorUpdate } from "./container.js";
import { fetchSyndicationTweet } from "./syndication.js";
import type { Env } from "./env.js";

export interface CanaryResult {
  url: string;
  ok: boolean;
  checkedAt: string;
  error?: string;
}

export interface CanaryStatus {
  video: CanaryResult;
  gif: CanaryResult;
  photo: CanaryResult;
  updatedAt: string;
}

export const CANARY_KEY = "canary:x";

async function checkCanary(url: string): Promise<CanaryResult> {
  const checkedAt = new Date().toISOString();
  const idMatch = url.match(/status\/(\d+)/);
  if (!idMatch?.[1]) return { url, ok: false, checkedAt, error: "no_id_in_fixture_url" };

  const result = await fetchSyndicationTweet(idMatch[1]);
  return { url, ok: result.ok, checkedAt, error: result.ok ? undefined : "resolve_failed" };
}

/** Every 15 min: resolve the 3 fixture tweets (video/gif/photo) and record
 * pass/fail — see apps/api/README.md for why these should point at an
 * account you control, not a random third-party tweet. */
export async function runCanaryCheck(env: Env): Promise<void> {
  const [video, gif, photo] = await Promise.all([
    checkCanary(env.CANARY_VIDEO_URL),
    checkCanary(env.CANARY_GIF_URL),
    checkCanary(env.CANARY_PHOTO_URL),
  ]);

  try {
    await env.CANARY_STATE.put(CANARY_KEY, JSON.stringify({ video, gif, photo, updatedAt: new Date().toISOString() }));
  } catch (err) {
    console.error(`[loot-api] failed to write ${CANARY_KEY} status`, err);
  }
}

/** Nightly: self-update yt-dlp inside the extractor container. Fire and
 * log — a failed update just means the container keeps serving whatever
 * version it already has, not an outage. */
export async function runNightlyUpdate(env: Env): Promise<void> {
  const ok = await callExtractorUpdate(env);
  console.log(`[loot-api] nightly extractor update ${ok ? "succeeded" : "failed"}`);
}
