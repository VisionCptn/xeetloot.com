# web

Next.js 15+ (App Router), deployed to Cloudflare Workers via
`@opennextjs/cloudflare`. Talks to `loot-api` (`apps/api`) only through a
Service Binding — no browser code and no route handler ever sees
`EXTRACTOR_URL` or any extractor-shaped URL.

## Local dev

```
pnpm install
pnpm --filter @xeetloot/web dev          # next dev, port 3000
pnpm --filter @xeetloot/web test         # Playwright e2e (mocks /api/resolve, no backend needed)
```

`next dev` calls `initOpenNextCloudflareForDev()` (see `next.config.ts`),
which wires up local Cloudflare bindings (including the `API` service
binding to `loot-api`) so `app/api/*` route handlers work the same as in
production — but only if `loot-api`'s own `wrangler dev` is also running
locally (see `apps/api/README.md`). Playwright's tests don't need this:
they intercept `/api/resolve` directly in the browser before it ever
reaches the server.

**This only covers server-side `getCloudflareContext().env` access —**
it deliberately does *not* load `.dev.vars` into `process.env` (it calls
wrangler's platform proxy with `envFiles: []`). `NEXT_PUBLIC_*` vars are
read from `process.env` and inlined into the **client** bundle, so they
need Next's own env file instead: copy `.env.local` (already gitignored,
create it if missing) with the same `NEXT_PUBLIC_*` values as `.dev.vars`.
Without it, `process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY` is `""` under
plain `next dev`, which crashes the page (Cloudflare's Turnstile script
throws synchronously on an empty `sitekey`) — `components/Turnstile.tsx`
guards against that now, but the widget still won't actually verify
without a real key.

To exercise the full `wrangler dev` (OpenNext worker) build locally:

```
pnpm build        # next build
npx opennextjs-cloudflare build
npx wrangler dev --port 8788
```

## i18n

`en` is the default locale (no URL prefix); every other locale is prefixed
(`/tr`, `/pt-BR`, …). Message files live in `messages/<locale>.json` — see
`messages/README.md` for translation status and the TODO list for the
locales still shipping as English placeholders.

The address-bar-trick route (`/[user]/status/[id]`, e.g. swapping
`x.com` for `xeetloot.com` on a tweet URL) is rewritten by `proxy.ts` to
`app/status/[user]/[id]`, a fixed English/LTR experience outside
next-intl's routing entirely — see that route's `layout.tsx` for why it
can't live directly under `app/[user]/status/[id]` (Next.js requires
every dynamic segment at the same depth to share one param name, and
`[user]` would collide with `[locale]`).

## Secrets / env vars

All three below are `NEXT_PUBLIC_*` — public-safe by design, set via real
env vars at **build** time (see note above): `.env.local` locally
(gitignored; Next's own convention, separate from `.dev.vars`), real
CI/deploy-shell env vars in production.

- `NEXT_PUBLIC_TURNSTILE_SITE_KEY` — Turnstile site key (public by
  design). `1x00000000000000000000AA` is Cloudflare's "always passes"
  test key, used as the local default.
- `NEXT_PUBLIC_API_BASE_URL` — loot-api's public origin, used only to
  build the full href for an already-signed `/dl` link (that link is
  meant to be hit directly by the browser, not proxied again through
  this app). Never used for `/resolve` or `/convert`, which always go
  through the service binding.
- `NEXT_PUBLIC_ADS_PROVIDER` — `"none"` (default, renders the reserved ad
  slot's placeholder) or a real provider key; see `components/AdSlot.tsx`.
- `NEXT_PUBLIC_GA_ID` — Google Analytics 4 measurement ID (e.g.
  `G-XXXXXXXXXX`). Unset locally on purpose so dev traffic isn't tracked;
  see `components/GoogleAnalytics.tsx`, which renders nothing without it.
- `NEXT_PUBLIC_CLARITY_ID` — Microsoft Clarity project ID. Same
  unset-locally-on-purpose pattern; see `components/Clarity.tsx`.

## Resources to provision before deploying

- `wrangler.jsonc`'s `services` array needs `loot-api` actually deployed
  under that name first (Service Bindings resolve by Worker name).
- Run `pnpm cf-typegen` after changing `wrangler.jsonc` bindings to
  regenerate `cloudflare-env.d.ts` (gitignored, deterministic from the
  config — no Cloudflare account needed to generate it).
