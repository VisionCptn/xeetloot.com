const ALGO = { name: "HMAC", hash: "SHA-256" };

function toHex(buf: ArrayBuffer): string {
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function fromHex(hex: string): Uint8Array<ArrayBuffer> | null {
  if (hex.length % 2 !== 0 || !/^[0-9a-f]*$/i.test(hex)) return null;
  const bytes = new Uint8Array(new ArrayBuffer(hex.length / 2));
  for (let i = 0; i < bytes.length; i++) bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  return bytes;
}

async function importKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey("raw", new TextEncoder().encode(secret), ALGO, false, ["sign", "verify"]);
}

export async function signHmac(payload: string, secret: string): Promise<string> {
  const key = await importKey(secret);
  const sig = await crypto.subtle.sign(ALGO, key, new TextEncoder().encode(payload));
  return toHex(sig);
}

/** Constant-time (Web Crypto's own `verify`) — never compare signatures
 * with `===`. */
export async function verifyHmac(payload: string, signatureHex: string, secret: string): Promise<boolean> {
  const sigBytes = fromHex(signatureHex);
  if (!sigBytes) return false;
  try {
    const key = await importKey(secret);
    return await crypto.subtle.verify(ALGO, key, sigBytes, new TextEncoder().encode(payload));
  } catch {
    return false;
  }
}

export interface SignedDownloadParams {
  /** The upstream media URL /dl will stream from. */
  u: string;
  /** Filename sent in Content-Disposition. */
  name: string;
  /** Unix seconds expiry. */
  exp: number;
}

function canonicalDownloadPayload(p: SignedDownloadParams): string {
  return `${p.u}\n${p.name}\n${p.exp}`;
}

export async function signDownloadUrl(p: SignedDownloadParams, secret: string): Promise<string> {
  return signHmac(canonicalDownloadPayload(p), secret);
}

/** Checks both the signature and the expiry — a request past `exp` is
 * rejected even with a mathematically valid signature, since /dl links are
 * meant to be short-lived. */
export async function verifyDownloadUrl(
  p: SignedDownloadParams,
  signatureHex: string,
  secret: string,
  now: number = Math.floor(Date.now() / 1000),
): Promise<boolean> {
  if (now > p.exp) return false;
  return verifyHmac(canonicalDownloadPayload(p), signatureHex, secret);
}
