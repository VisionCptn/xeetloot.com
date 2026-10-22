import type { Metadata } from "next";
import { Bricolage_Grotesque } from "next/font/google";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing, rtlLocales, type Locale } from "@/i18n/routing";
import { ThemeScript } from "@/components/ThemeScript";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import { Clarity } from "@/components/Clarity";
import "../globals.css";

const display = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["700", "800"],
  variable: "--font-display",
  display: "swap",
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return {
    metadataBase: new URL("https://xeetloot.com"),
    // No title template — every page below sets its own complete,
    // already-suffixed title (e.g. modes.*.title ends in "| XeetLoot"
    // itself), so a template here would double it up.
    title: t("siteName"),
    description: t("ogDescription"),
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const dir = rtlLocales.has(locale as Locale) ? "rtl" : "ltr";

  return (
    <html lang={locale} dir={dir} className={display.variable} suppressHydrationWarning>
      <head>
        <ThemeScript />
        <GoogleAnalytics />
        <Clarity />
      </head>
      <body>
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
