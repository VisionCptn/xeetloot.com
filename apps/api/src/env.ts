import type { ExtractContainer } from "./container.js";

export interface Env {
  RESOLVE_CACHE: KVNamespace;
  BREAKER_STATE: KVNamespace;
  CANARY_STATE: KVNamespace;
  MEDIA_BUCKET: R2Bucket;
  EXTRACT_CONTAINER: DurableObjectNamespace<ExtractContainer>;
  RATE_LIMIT_IP: RateLimit;
  RATE_LIMIT_SITE: RateLimit;
  SITE: string;
  CANARY_VIDEO_URL: string;
  CANARY_GIF_URL: string;
  CANARY_PHOTO_URL: string;
  TURNSTILE_SECRET_KEY: string;
  DL_HMAC_SECRET: string;
  EXTRACTOR_SECRET: string;
  /** Gates GET /status (brief: "a simple /api/status page reading canary
   * results for me") — not meant to be public. */
  STATUS_SECRET: string;
}
