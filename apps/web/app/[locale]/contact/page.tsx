import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "legal.contact" });
  return { title: `${t("title")} | XeetLoot` };
}

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("legal.contact");

  return (
    <>
      <Header active="none" />
      <main className="px-4 py-10 sm:px-10 sm:py-16">
        <article className="mx-auto flex max-w-[720px] flex-col gap-4 text-start">
          <h1 className="m-0 font-[var(--font-display)] text-[32px] leading-tight font-extrabold tracking-[-0.025em] sm:text-[44px]">
            {t("title")}
          </h1>
          <p className="m-0 text-base text-[var(--tx2)]">{t("intro")}</p>
          <a href={`mailto:${t("email")}`} className="text-xl font-bold text-[var(--ac-tx)]">
            {t("email")}
          </a>
          <p className="m-0 text-sm text-[var(--tx2)]">{t("note")}</p>
        </article>
      </main>
      <Footer />
    </>
  );
}
