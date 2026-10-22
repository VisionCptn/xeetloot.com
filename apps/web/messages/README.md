# Translation status

| Locale | Status |
| --- | --- |
| `en` | Canonical source |
| `es`, `pt-BR`, `tr`, `id`, `vi` | Native-quality, translated |
| `ar` | Native-quality (home/FAQ/errors/footer reuse the original design's own Arabic copy; guides/legal pages are fresh translations) |
| `ru`, `uk`, `de`, `fr`, `ja`, `ko`, `th`, `hi` | **TODO — English placeholder, NOT routed.** These files are exact copies of `en.json`, but they're deliberately left out of `i18n/routing.ts`'s `locales` array — serving English copy under e.g. `<html lang="ru">` is worse for SEO/i18n than just not having the route. `/ru/*` etc. 404 until the file is actually translated and the locale is added back to that array. |

## Adding a locale back once it's translated

1. Translate the file (see the checklist below) — don't change any keys or array lengths.
2. Run `pnpm --filter @xeetloot/web check-translations` — it fails loudly if any value is still byte-identical to the English source (outside a small allowlist of brand/technical terms in `check-translated.mjs`).
3. Add the locale code to `i18n/routing.ts`'s `locales` array and `lib/locales.ts`'s `LOCALE_INFO` (native + English name, for the language picker).

## TODO: locales needing translation

For each of `ru.json`, `uk.json`, `de.json`, `fr.json`, `ja.json`, `ko.json`, `th.json`, `hi.json`:

- [ ] Translate `meta.*` (site description used in `<meta>` tags)
- [ ] Translate `nav.*` (header labels)
- [ ] Translate `modes.*` (per-mode H1/subtitle/SEO title+description — these drive ranking, worth getting right)
- [ ] Translate `home.*` (paste form, trust chips, how-it-works, features, address-bar-trick section, FAQ/legal section labels)
- [ ] Translate `errors.*` (shown on every failed resolve — keep tone reassuring, not alarming)
- [ ] Translate `faq.items` (6 questions — keep the `href` sub-field English route slugs, e.g. `"iphone"`, `"android"`, unchanged)
- [ ] Translate `footer.*`
- [ ] Translate `langPicker.*`
- [ ] Translate `guides.iphone` / `guides.android` (step-by-step guide pages)
- [ ] Translate `legal.privacy` / `legal.terms` / `legal.dmca` / `legal.contact` (full legal pages)

When translating, keep every JSON key and array length identical to `en.json` — only the string values change. Keep brand/product names, domains (`x.com`, `twitter.com`, `xeetloot.com`), and ICU placeholders (e.g. `{count}`) untouched.
