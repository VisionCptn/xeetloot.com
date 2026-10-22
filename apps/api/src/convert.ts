import { getContainer } from "@cloudflare/containers";
import { signDownloadUrl } from "@xeetloot/shared";
import type { Env } from "./env.js";

export type ConvertKind = "gif" | "mp3";

export interface ConvertRequest {
  id: string;
  kind: ConvertKind;
  source: string;
}

export interface ConvertSuccess {
  downloadUrl: string;
}

// Short-lived — this URL is only meant to carry the user from "conversion
// finished" to "file downloaded", not to be bookmarked.
const CONVERT_LINK_TTL_SECONDS = 15 * 60;

/** Calls the extractor container's /remux ("gif") or /mp3 endpoint, which
 * does the ffmpeg work and uploads the result to R2 itself (S3-compatible
 * client, not a Workers binding — see apps/extractor). The container hands
 * back an R2 presigned URL; we wrap that in our own /dl HMAC so every
 * download — converted or not — goes through the same signed, range-aware
 * proxy route. */
export async function handleConvert(env: Env, req: ConvertRequest): Promise<ConvertSuccess | null> {
  const container = getContainer(env.EXTRACT_CONTAINER, req.id);
  const path = req.kind === "gif" ? "/gif" : "/mp3";

  let res: Response;
  try {
    res = await container.fetch(`http://container${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-secret": env.EXTRACTOR_SECRET },
      body: JSON.stringify({ id: req.id, source: req.source }),
    });
  } catch (err) {
    console.error("[loot-api] /convert container call failed", err);
    return null;
  }
  if (!res.ok) return null;

  const data = (await res.json().catch(() => null)) as { url?: string; filename?: string } | null;
  if (!data?.url || !data.filename) return null;

  const exp = Math.floor(Date.now() / 1000) + CONVERT_LINK_TTL_SECONDS;
  const sig = await signDownloadUrl({ u: data.url, name: data.filename, exp }, env.DL_HMAC_SECRET);
  const downloadUrl = `/dl?u=${encodeURIComponent(data.url)}&name=${encodeURIComponent(data.filename)}&sig=${sig}&exp=${exp}`;
  return { downloadUrl };
}
