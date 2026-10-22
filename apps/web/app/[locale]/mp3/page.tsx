import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { DownloadTypePage } from "@/components/DownloadTypePage";
import { localeAlternates, openGraph } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "modes.mp3" });
  const title = t("title");
  const description = t("description");
  return {
    title,
    description,
    alternates: localeAlternates(locale, "/mp3"),
    openGraph: openGraph(title, description, locale, "/mp3"),
  };
}

export default async function Mp3Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <DownloadTypePage mode="mp3" />;
}
