import { defineRouting } from "next-intl/routing";

// en is default (no URL prefix); every other locale is prefixed
// (/tr/..., /pt-BR/..., ...). All locales listed here must have
// fully-translated messages/<locale>.json — ru/uk/de/fr/ja/ko/th/hi are
// deliberately NOT listed: their message files are still English-content
// stubs (see messages/README.md), and serving English copy under e.g.
// <html lang="ru"> is worse for SEO/i18n than not having the route at
// all. Routes under those prefixes 404 via [locale]/layout.tsx's
// hasLocale() guard. Add a locale back here only once its file is
// actually translated (CI enforces this — see messages/check-translated.mjs).
export const locales = ["en", "tr", "pt-BR", "id", "es", "vi", "ar"] as const;

export type Locale = (typeof locales)[number];

export const rtlLocales: ReadonlySet<Locale> = new Set(["ar"]);

export const routing = defineRouting({
  locales,
  defaultLocale: "en",
  localePrefix: "as-needed",
});
