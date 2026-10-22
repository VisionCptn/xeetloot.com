import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { StaticPage } from "@/components/StaticPage";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "legal.dmca" });
  return { title: `${t("title")} | XeetLoot` };
}

export default async function DmcaPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("legal.dmca");

  return (
    <>
      <Header active="none" />
      <StaticPage title={t("title")} updated={t("updated")} body={t.raw("body")} />
      <Footer />
    </>
  );
}
