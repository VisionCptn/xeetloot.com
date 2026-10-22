import { getTranslations } from "next-intl/server";
import { FaqAccordion, type FaqItem } from "./FaqAccordion";
import { FaqJsonLd } from "./JsonLd";

/** FAQ block for the guide pages (/iphone, /android) — separate from the
 * main site FAQ (components/FaqSection.tsx), with its own JSON-LD scoped
 * to just these questions. */
export async function GuideFaqSection({ namespace }: { namespace: "guides.iphone" | "guides.android" }) {
  const t = await getTranslations(namespace);
  const home = await getTranslations("home");
  const items = t.raw("faq.items") as FaqItem[];

  return (
    <section className="px-4 py-6 sm:px-10">
      <FaqJsonLd items={items} />
      <div className="mx-auto flex max-w-[720px] flex-col gap-4">
        <h2 className="m-0 font-[var(--font-display)] text-[28px] leading-tight font-extrabold tracking-[-0.025em] sm:text-[40px]">
          {home("faqTitle")}
        </h2>
        <FaqAccordion items={items} />
      </div>
    </section>
  );
}
