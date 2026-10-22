"use client";

import { useTranslations } from "next-intl";
import { FaqAccordion, type FaqItem } from "./FaqAccordion";

export function FaqSection({ adSlot }: { adSlot: React.ReactNode }) {
  const t = useTranslations("faq");
  const home = useTranslations("home");
  const items = t.raw("items") as FaqItem[];

  return (
    <section id="faq" className="px-4 py-6 sm:px-10">
      <div className="mx-auto flex max-w-[1120px] flex-wrap items-start gap-8">
        <div className="flex min-w-0 flex-[999_1_560px] flex-col gap-4">
          <h2 className="m-0 font-[var(--font-display)] text-[28px] leading-tight font-extrabold tracking-[-0.025em] sm:text-[40px]">
            {home("faqTitle")}
          </h2>
          <FaqAccordion items={items} />
        </div>
        {adSlot && <aside className="flex flex-1 basis-[300px] justify-center">{adSlot}</aside>}
      </div>
    </section>
  );
}
