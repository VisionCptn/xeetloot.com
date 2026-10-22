import { getTranslations } from "next-intl/server";
import { Header, type DownloaderMode } from "./Header";
import { Footer } from "./Footer";
import { DownloadShell } from "./DownloadShell";
import { HowItWorks } from "./HowItWorks";
import { FeatureGrid } from "./FeatureGrid";
import { AddressBarTrick } from "./AddressBarTrick";
import { FaqSection } from "./FaqSection";
import { LegalBlurb } from "./LegalBlurb";
import { FaqJsonLd } from "./JsonLd";
import { AdSlot, adsEnabled, MainAdSlot } from "./AdSlot";

export async function DownloadTypePage({ mode }: { mode: DownloaderMode }) {
  const faqT = await getTranslations("faq");
  const faqItems = faqT.raw("items") as Array<{ q: string; a: string }>;

  return (
    <>
      <FaqJsonLd items={faqItems} />
      <Header active={mode} />
      <main>
        <DownloadShell mode={mode} adSlot={<MainAdSlot />} />
        <HowItWorks mode={mode} />
        <FeatureGrid />
        <AddressBarTrick />
        <FaqSection adSlot={adsEnabled() ? <AdSlot width={300} height={250} /> : null} />
        <LegalBlurb />
      </main>
      <Footer />
    </>
  );
}
