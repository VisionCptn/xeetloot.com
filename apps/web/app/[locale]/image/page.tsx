import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { DownloadTypePage } from "@/components/DownloadTypePage";
import { localeAlternates, openGraph } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "modes.image" });
  const title = t("title");
  const description = t("description");
  return {
    title,
    description,
    alternates: localeAlternates(locale, "/image"),
    openGraph: openGraph(title, description, locale, "/image"),
  };
}

export default async function ImagePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <DownloadTypePage mode="image" />;
}
