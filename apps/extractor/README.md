# extractor

FastAPI + yt-dlp + ffmpeg. Resolve tier 2 (`/info`) and the real work behind
`/convert` (`/gif`, `/mp3`, `/remux`). Runs as a Cloudflare Container,
bound into `loot-api` (see `apps/api/wrangler.toml`'s `[[containers]]` +
`src/container.ts`) — not a public service, and never called from the
browser directly.

Every endpoint except `/health` requires an `x-secret` header matching
`EXTRACTOR_SECRET`, which must be the same value as `loot-api`'s own
`EXTRACTOR_SECRET` secret.

## Local testing

```
cp .env.example .env   # fill in EXTRACTOR_SECRET + R2 credentials
docker compose up --build
curl http://localhost:8080/health
curl -X POST http://localhost:8080/info \
  -H "Content-Type: application/json" \
  -H "x-secret: $(grep EXTRACTOR_SECRET .env | cut -d= -f2)" \
  -d '{"url": "https://x.com/jack/status/20"}'
```

`/gif`, `/mp3` and `/remux` need real R2 credentials (S3-compatible API
token) in `.env` to actually upload anywhere — without them you'll get a
502 from boto3, not a 401.

## Endpoints

- `GET /health` — `{"status": "ok", "yt_dlp_version": "..."}` .
- `POST /info {url}` — yt-dlp `extract_info(skip_download=True)`, returns
  `{"title", "formats": [{url, ext, width, height, vbr, abr}]}` with only
  direct mp4 formats (HLS manifests filtered out, same rule as tier 1).
  Returns a typed `{"error", "message"}` body on failure — `error` is one
  of `protected_account` / `age_restricted` / `not_found` / `unavailable`,
  classified by matching substrings in yt-dlp's own error message (yt-dlp
  has no structured error codes, so this is necessarily best-effort).
- `POST /remux {id, source}` — stream-copies `source` (e.g. an HLS
  manifest) into a single mp4 via ffmpeg, uploads to R2, returns a
  presigned download URL + filename. Not yet called by `loot-api` — ready
  for when an HLS-only tweet needs to be made downloadable.
- `POST /gif {id, source}` — ffmpeg palettegen/paletteuse, ≤15s, 480px
  wide. Uploads to R2, returns a presigned URL + filename.
- `POST /mp3 {id, source}` — ffmpeg audio extract (libmp3lame, 192kbps).
  Uploads to R2, returns a presigned URL + filename.
- `POST /update` — `pip install --upgrade yt-dlp`, self-tests the new
  version in a fresh subprocess, then hard-exits so the process restarts
  into it. **Important:** Cloudflare Containers reset their disk on every
  stop, so this upgrade does not survive the container's next cold start
  — it only buys time until then. The durable fix is bumping the pinned
  version in `requirements.txt` and redeploying `loot-api` (which rebuilds
  this image). Called nightly by `loot-api`'s cron (`src/cron.ts`).

## R2 object keys and lifecycle

Objects are written to `<id>/<kind>.<ext>` in the `xeetloot-media` bucket
(must match `apps/api/wrangler.toml`'s `MEDIA_BUCKET` binding), which has a
lifecycle rule expiring every object after 1 day:

```
wrangler r2 bucket lifecycle add xeetloot-media expire-converted-media --expire-days 1
```

R2 lifecycle rules only support day-level granularity — there's no way to
express "1 hour" directly. In practice this doesn't matter: every
`/convert` download link is HMAC-signed with its own short expiry (15–60
min, see `apps/api/src/convert.ts` / `src/sign.ts`), so the *link* is
already useless well before the underlying R2 object is cleaned up. The
1-day rule is just backstop storage hygiene, not the real access control.

## Resource limits

`docker-compose.yml`'s `mem_limit`/`cpus` are for local testing only. In
production, `apps/api/wrangler.toml`'s `[[containers]] instance_type`
governs actual resource limits — bump it there (and `max_instances` for
concurrency) if ffmpeg jobs are getting killed for memory.
