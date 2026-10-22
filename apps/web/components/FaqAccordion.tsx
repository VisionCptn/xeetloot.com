"use client";

import { useId, useState } from "react";
import { Link } from "@/i18n/navigation";
import { IconPlus } from "./icons";

export interface FaqItem {
  q: string;
  a: string;
  link?: string;
  href?: string;
}

/** Shared accordion for every FAQ block on the site (home/tool pages,
 * guide pages). The answer `<div>` is always mounted and toggled with the
 * `hidden` attribute rather than conditionally rendered — its text must
 * be present in the server-rendered HTML (matching the page's FAQPage
 * JSON-LD `acceptedAnswer` text) for crawlers that don't execute JS or
 * open the accordion. */
export function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [open, setOpen] = useState<number | null>(null);
  const idPrefix = useId();

  return (
    <div className="border-t border-[var(--bd)]">
      {items.map((f, i) => {
        const isOpen = open === i;
        const answerId = `${idPrefix}-faq-a-${i}`;
        return (
          <div key={f.q} className="border-b border-[var(--bd)]">
            <h3 className="m-0">
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={answerId}
                onClick={() => setOpen(isOpen ? null : i)}
                className="flex min-h-[60px] w-full items-center justify-between gap-4 border-0 bg-transparent py-3.5 text-start text-[17px] font-bold leading-snug text-[var(--tx)]"
              >
                <span>{f.q}</span>
                <span
                  className="flex h-8 w-8 flex-none items-center justify-center rounded-full transition-transform"
                  style={{
                    background: isOpen ? "var(--ac)" : "var(--sf2)",
                    color: isOpen ? "var(--on-ac)" : "var(--tx)",
                    transform: isOpen ? "rotate(45deg)" : "rotate(0deg)",
                  }}
                >
                  <IconPlus width={16} height={16} />
                </span>
              </button>
            </h3>
            <div id={answerId} hidden={!isOpen} className="max-w-[680px] pb-4.5 text-base leading-relaxed text-[var(--tx2)]">
              <span>{f.a}</span>
              {f.link && f.href && (
                <>
                  {" "}
                  <Link href={`/${f.href}`} className="font-bold text-[var(--ac-tx)]">
                    {f.link}
                  </Link>
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
