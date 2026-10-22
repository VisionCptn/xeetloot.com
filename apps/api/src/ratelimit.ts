import type { Env } from "./env.js";

export interface RateLimitResult {
  allowed: boolean;
  /** Which axis rejected the request, for the 429 body — undefined when allowed. */
  limitedBy?: "ip" | "site";
}

/** Checks both axes (brief: "per IP (30/min) + per site"). Cloudflare's own
 * docs caution against using raw IPs as the rate-limit key (high
 * cardinality) — we do it anyway here because the brief and DoD check
 * ("31st request from one IP gets 429") specifically require per-IP limits. */
export async function checkRateLimit(env: Env, ip: string): Promise<RateLimitResult> {
  const [ipResult, siteResult] = await Promise.all([
    env.RATE_LIMIT_IP.limit({ key: ip }),
    env.RATE_LIMIT_SITE.limit({ key: env.SITE }),
  ]);

  if (!ipResult.success) return { allowed: false, limitedBy: "ip" };
  if (!siteResult.success) return { allowed: false, limitedBy: "site" };
  return { allowed: true };
}
