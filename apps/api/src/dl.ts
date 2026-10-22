import { verifyDownloadUrl } from "@xeetloot/shared";
import type { Env } from "./env.js";

// Non-negotiable: never proxy media bytes except through this route, and
// only for these hosts — direct video.twimg.com/pbs.twimg.com URLs, or a
// presigned (already "signed" by S3) R2 URL our own /convert handed out.
const ALLOWED_HOSTS = new Set(["video.twimg.com", "pbs.twimg.com"]);
const R2_HOST_SUFFIX = ".r2.cloudflarestorage.com";

function isAllowedHost(hostname: string): boolean {
  return ALLOWED_HOSTS.has(hostname) || hostname.endsWith(R2_HOST_SUFFIX);
}

export interface DownloadParams {
  u: string;
  name: string;
  sig: string;
  exp: string;
}

export async function handleDownload(env: Env, params: DownloadParams, range: string | null): Promise<Response> {
  const exp = Number(params.exp);
  if (!Number.isFinite(exp)) return new Response("invalid_request", { status: 400 });

  let target: URL;
  try {
    target = new URL(params.u);
  } catch {
    return new Response("invalid_request", { status: 400 });
  }

  if (target.protocol !== "https:" || !isAllowedHost(target.hostname)) {
    return new Response("forbidden_host", { status: 403 });
  }

  const verified = await verifyDownloadUrl({ u: params.u, name: params.name, exp }, params.sig, env.DL_HMAC_SECRET);
  if (!verified) return new Response("invalid_or_expired_signature", { status: 403 });

  const upstreamHeaders: HeadersInit = {};
  if (range) upstreamHeaders.Range = range;

  let upstream: Response;
  try {
    upstream = await fetch(target.toString(), { headers: upstreamHeaders });
  } catch (err) {
    console.error("[loot-api] /dl upstream fetch failed", err);
    return new Response("upstream_unavailable", { status: 502 });
  }

  if (!upstream.ok && upstream.status !== 206) {
    return new Response("upstream_unavailable", { status: 502 });
  }

  const headers = new Headers(upstream.headers);
  headers.set("Content-Disposition", `attachment; filename="${params.name.replace(/"/g, "")}"`);
  headers.set("Cache-Control", "private, max-age=0");

  return new Response(upstream.body, { status: upstream.status, headers });
}
