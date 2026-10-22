# xeetloot.com

Free Twitter (X) media downloader — video (MP4), GIF, images, MP3. Logged-out
only; never proxies media except through a signed, forced download.

## Architecture

```
apps/web        Next.js 15 (App Router) on Cloudflare Workers via @opennextjs/cloudflare.
                 UI + i18n (next-intl). Talks to loot-api only through a Service Binding.
apps/api         "loot-api" — Hono Worker. Resolves X URLs (syndication API, then yt-dlp
                 fallback), signs /dl download links, proxies /convert to the extractor.
apps/extractor   FastAPI + yt-dlp + ffmpeg, running as a Cloudflare Container (bound into
                 loot-api) — not a VPS. Does the real work for /info, /gif, /mp3, /remux.
packages/shared  Types, URL normalizer (pluggable per platform), HMAC sign/verify.
```

Request flow: browser → `apps/web` (page + `/api/resolve`, `/api/convert` route
handlers) → Service Binding → `loot-api` → syndication API or the extractor
container. `/dl` is hit **directly** by the browser (it's loot-api's own
public endpoint, signed and forced-download) — never proxied through
`apps/web`.

## Local dev

```
pnpm install

# Terminal 1 — backend
cd apps/api && pnpm dev            # wrangler dev, needs Docker running
                                    # (builds apps/extractor's image)

# Terminal 2 — frontend
cd apps/web && pnpm dev            # next dev
```

For a full end-to-end check through the real Workers runtime (service
binding actually dispatching, not just UI work):

```
cd apps/api  && pnpm build && npx wrangler dev --port 8787
cd apps/web  && pnpm build && npx opennextjs-cloudflare build && npx wrangler dev --port 8788
```

Each package also has its own README with details: `apps/api/README.md`,
`apps/web/README.md`, `apps/extractor/README.md`.

## Testing

```
pnpm lint        # eslint, repo-wide (one shared eslint.config.mjs)
pnpm typecheck   # tsc --noEmit in every package
pnpm test        # vitest (shared, api) + Playwright (web, mocks the API)
```

CI (`.github/workflows/ci.yml`) runs all three on every PR, plus a
build-only sanity check of the extractor's Dockerfile.

## Deploying

`.github/workflows/deploy.yml` runs on push to `main`: deploys `loot-api`
first (which also builds and uploads the extractor's container image to
Cloudflare itself — no separate registry push needed), then `apps/web`.
Needs these repo secrets/vars:

- `secrets.CLOUDFLARE_API_TOKEN`, `secrets.CLOUDFLARE_ACCOUNT_ID`
- `vars.NEXT_PUBLIC_API_BASE_URL`, `vars.NEXT_PUBLIC_ADS_PROVIDER`,
  `vars.NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `vars.NEXT_PUBLIC_GA_ID`,
  `vars.NEXT_PUBLIC_CLARITY_ID` (all public-safe values, not secrets — see
  `apps/web/README.md`)

## Resources to provision once, by hand

- **KV namespaces** (`loot-api`): `RESOLVE_CACHE`, `BREAKER_STATE`,
  `CANARY_STATE`. `wrangler kv namespace create <name>`, paste the id into
  `apps/api/wrangler.toml`.
- **R2 bucket**: `xeetloot-media`. `wrangler r2 bucket create xeetloot-media`,
  then `wrangler r2 bucket lifecycle add xeetloot-media expire-converted-media
  --expire-days 1` (R2 lifecycle rules can't express "1 hour" — the actual
  download links expire far sooner than that regardless; see
  `apps/extractor/README.md`).
- **Rate limiting bindings**: need a real `namespace_id` per binding (any
  positive integer unique to your account) in `apps/api/wrangler.toml`.
- **Cloudflare Container**: nothing extra to provision — `wrangler deploy`
  from `apps/api` builds `apps/extractor`'s Dockerfile and uploads the image
  itself. (The original plan was a Hetzner VPS behind a Cloudflare Tunnel;
  we moved to a Cloudflare Container instead — same yt-dlp/ffmpeg work, no
  VPS to patch or monitor. `apps/extractor/README.md` has the operational
  notes that replace the old Hetzner/cloudflared setup.)
- **Turnstile widget**: create one in the Cloudflare dashboard, use its site
  key for `NEXT_PUBLIC_TURNSTILE_SITE_KEY` and secret key for `loot-api`'s
  `TURNSTILE_SECRET_KEY`.
- **Canary fixture tweets**: `apps/api/wrangler.toml`'s `CANARY_*_URL` vars
  default to a placeholder. Point them at tweets **you control** (post one
  video, one GIF, one photo from a test account) so the 15-min canary cron
  never fails just because a third party deleted their tweet. Check results
  at `loot-api`'s `/status?key=<STATUS_SECRET>`.

Every other secret is listed in `apps/api/README.md` / `apps/web/README.md`.

## Adding a new platform (e.g. Pinterest)

`packages/shared/src/normalize.ts` already defines the normalizer as a
`PlatformNormalizer` interface (`{ platform, normalize(url) }`), kept
separate from any single platform's implementation on purpose. To add one:

1. Write a new normalizer (e.g. `normalizePinterestUrl`) in
   `packages/shared/src/normalize.ts`, exported alongside `normalizeXUrl`.
2. Add the platform to the shared `Platform` union in
   `packages/shared/src/types.ts`.
3. In `apps/api`, add a tier-1/tier-2 resolver pair for that platform
   (mirroring `src/syndication.ts` + `src/container.ts`'s `callExtractorInfo`)
   and branch on `normalized.platform` in `src/index.ts`'s `/resolve` handler.
4. `apps/extractor` already wraps yt-dlp generically — most platforms yt-dlp
   supports need no extractor changes at all, only a normalizer and a
   mapping function from its response to `ResolvedMedia`.
5. In `apps/web`, add the platform's routes under `app/[locale]/` and its
   own `modes.*` copy in `messages/en.json` (+ translations).

## Adding a new language

1. Copy `apps/web/messages/en.json` to `messages/<locale>.json` and
   translate every value (not the keys, and not the `href` route slugs
   inside `faq.items`, e.g. `"iphone"`).
2. Add the locale code to `apps/web/i18n/routing.ts`'s `locales` array (and
   to `rtlLocales` if it's right-to-left).
3. Add it to `apps/web/lib/locales.ts`'s `LOCALE_INFO` (native name + English
   name, for the language picker).
4. Run `pnpm --filter @xeetloot/web build` (fails if any key is missing)
   and `pnpm --filter @xeetloot/web check-translations` (fails if any value
   is still byte-identical to English — i.e. actually untranslated).

See `apps/web/messages/README.md` for the current translation status (which
locales are native-quality vs. English placeholders pending translation).
