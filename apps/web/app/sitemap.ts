import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";

const BASE = "https://xeetloot.com";
const PATHS = ["", "/gif", "/image", "/mp3", "/iphone", "/android", "/privacy", "/terms", "/dmca", "/contact"];

function localizedUrl(locale: string, path: string): string {
  if (locale === routing.defaultLocale) return `${BASE}${path || "/"}`;
  return `${BASE}/${locale}${path}`;
}

export default function sitemap(): MetadataRoute.Sitemap {
  return PATHS.map((path) => ({
    url: localizedUrl(routing.defaultLocale, path),
    lastModified: new Date(),
    alternates: {
      languages: {
        "x-default": localizedUrl(routing.defaultLocale, path),
        ...Object.fromEntries(routing.locales.map((l) => [l, localizedUrl(l, path)])),
      },
    },
  }));
}
