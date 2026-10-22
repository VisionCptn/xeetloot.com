# loot-api

Hono Worker. Resolves X/Twitter URLs into direct, downloadable media and
proxies forced downloads through a signed `/dl` route. Calls the extractor
(`apps/extractor`, a Cloudflare Container running yt-dlp + ffmpeg) only as a
tier-2 fallback when the X syndication API misses.

## Local dev

```
pnpm install
pnpm --filter @xeetloot/api dev   # wrangler dev
pnpm --filter @xeetloot/api test  # vitest (via @cloudflare/vitest-pool-workers)
```

`wrangler dev` builds and starts the extractor's Docker image locally via
the `[[containers]]` binding — Docker must be running.

## Resources to provision before deploying

- **KV namespaces** — `RESOLVE_CACHE`, `BREAKER_STATE`, `CANARY_STATE`.
  `wrangler kv namespace create <name>`, then paste the returned id into
  `wrangler.toml`.
- **R2 bucket** — `xeetloot-media` (`wrangler r2 bucket create xeetloot-media`,
  then `wrangler r2 bucket lifecycle add xeetloot-media expire-converted-media
  --expire-days 1`) — see `apps/extractor/README.md`.
- **Rate limiting** — `[[ratelimits]]` bindings need a real `namespace_id`
  (any positive integer unique to your account); see
  https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/.
- **Canary fixture URLs** — `CANARY_VIDEO_URL` / `CANARY_GIF_URL` /
  `CANARY_PHOTO_URL` in `wrangler.toml`'s `[vars]` currently point at a
  placeholder (a text-only tweet). Point these at tweets **you control**
  (post one of each media type from a test account you own) — a
  third-party tweet can be deleted at any time and would then page on
  nothing but the fixture itself going away.

## Secrets

Set with `wrangler secret put <NAME>`, never committed:

- `TURNSTILE_SECRET_KEY` — from the Cloudflare Turnstile dashboard.
- `DL_HMAC_SECRET` — signs/verifies `/dl` and `/convert` download links.
  Generate with `openssl rand -hex 32`.
- `EXTRACTOR_SECRET` — shared `x-secret` header value the extractor
  container checks on every request. Must match the container's own
  `EXTRACTOR_SECRET` env var (passed through via `ExtractContainer.envVars`
  in `src/container.ts`). Generate with `openssl rand -hex 32`.
- `STATUS_SECRET` — gates `GET /status`. Visit `/status?key=<STATUS_SECRET>`
  for a plain HTML page of the last canary run and each tier's circuit
  breaker state — a quick "is it working" check, not meant to be public.
  Generate with `openssl rand -hex 32`.

## Resolve tiers

1. **Syndication** (`src/syndication.ts`) — the same `cdn.syndication.
   twimg.com` endpoint X's own embed widget calls. No auth, no official
   docs; can change or disappear without notice.
2. **Extractor** (`src/container.ts` → `apps/extractor`) — yt-dlp, used
   only when tier 1 misses or its breaker is open.

Each tier has its own circuit breaker in `BREAKER_STATE` (`src/breaker.ts`):
a 429 or 403 from a tier opens it for 15 minutes. A 404/401 from the
syndication fetch is treated as terminal — typed error returned
immediately, tier 2 is not tried (brief: "on 404/401 return typed error
without retrying other tiers").
