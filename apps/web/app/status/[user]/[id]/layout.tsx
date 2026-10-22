import type { Metadata } from "next";
import { Bricolage_Grotesque } from "next/font/google";
import { ThemeScript } from "@/components/ThemeScript";
import "../../../globals.css";

const display = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["700", "800"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  // Deliberately not indexed — it's a redirect-equivalent convenience
  // route (swap x.com for xeetloot.com in the address bar), not a page
  // meant to rank; /[locale]/[video|gif|...] pages carry the real SEO.
  robots: { index: false, follow: true },
};

// Address-bar-trick route: one fixed English/LTR experience, independent
// of next-intl entirely — a visitor lands here straight from swapping
// x.com for xeetloot.com, so there's no locale to detect from the URL.
//
// Lives under a static "status" segment (app/status/[user]/[id]/), not
// directly under app/[user]/status/[id]/ — Next.js's router requires
// every dynamic segment at a given depth to share one param name across
// the whole tree, and that would collide with app/[locale]'s dynamic
// segment at the same top-level depth ("You cannot use different slug
// names for the same dynamic path"). middleware.ts rewrites the real
// public URL (/<user>/status/<id>) to this path internally; the address
// bar itself never shows "/status/<user>/<id>".
export default function StatusLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr" className={display.variable} suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body>{children}</body>
    </html>
  );
}
