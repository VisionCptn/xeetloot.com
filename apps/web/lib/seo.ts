import type { Metadata } from "next";
import { routing } from "@/i18n/routing";

const BASE = "https://xeetloot.com";

function urlFor(locale: string, path: string): string {
  if (locale === routing.defaultLocale) return `${BASE}${path || "/"}`;
  return `${BASE}/${locale}${path}`;
}

/** hreflang + x-default + canonical for one path across every locale —
 * pass the path without a locale prefix, e.g. "/gif", "" for home. */
export function localeAlternates(locale: string, path: string): Metadata["alternates"] {
  return {
    canonical: urlFor(locale, path),
    languages: {
      "x-default": urlFor(routing.defaultLocale, path),
      ...Object.fromEntries(routing.locales.map((l) => [l, urlFor(l, path)])),
    },
  };
}

export function openGraph(title: string, description: string, locale: string, path: string): Metadata["openGraph"] {
  return {
    title,
    description,
    url: urlFor(locale, path),
    siteName: "XeetLoot",
    locale,
    type: "website",
  };
}
