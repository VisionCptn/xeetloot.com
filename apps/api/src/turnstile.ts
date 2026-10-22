const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

/** Fails closed: a missing secret or an unreachable verify endpoint is
 * "not verified", not "let it through" — this is the only gate between the
 * public internet and our X/extractor calls, so a broken config should be
 * loud, not permissive. */
export async function verifyTurnstileToken(
  token: string | null,
  ip: string | null,
  secret: string | undefined,
): Promise<boolean> {
  if (!token) return false;
  if (!secret) {
    console.error("[loot-api] TURNSTILE_SECRET_KEY is not configured — rejecting request");
    return false;
  }

  const body = new URLSearchParams({ secret, response: token });
  if (ip) body.set("remoteip", ip);

  try {
    const res = await fetch(VERIFY_URL, { method: "POST", body });
    const data = (await res.json()) as { success?: boolean; "error-codes"?: string[] };
    if (!data.success) {
      console.error("[loot-api] Turnstile verification failed", data["error-codes"]);
    }
    return data.success === true;
  } catch (err) {
    console.error("[loot-api] Turnstile verify request failed", err);
    return false;
  }
}
