import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { GuideSection } from "@/components/GuideSection";
import { GuideFaqSection } from "@/components/GuideFaqSection";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "guides.iphone" });
  return { title: `${t("title")} | XeetLoot`, description: t("description") };
}

export default async function IphonePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("guides.iphone");

  return (
    <>
      <Header active="none" />
      <GuideSection title={t("title")} intro={t("intro")} steps={t.raw("steps")} />
      <GuideFaqSection namespace="guides.iphone" />
      <Footer />
    </>
  );
}
