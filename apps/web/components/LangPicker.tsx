"use client";

import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { Link, usePathname } from "@/i18n/navigation";
import { LOCALE_INFO } from "@/lib/locales";
import { IconCheck, IconClose, IconSearch } from "./icons";

export function LangPicker({ onClose }: { onClose: () => void }) {
  const t = useTranslations("langPicker");
  const current = useLocale();
  const pathname = usePathname();
  const [q, setQ] = useState("");

  const ql = q.trim().toLowerCase();
  const langs = LOCALE_INFO.filter(
    (l) => !ql || l.native.toLowerCase().includes(ql) || l.english.toLowerCase().includes(ql) || l.code.toLowerCase() === ql,
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="xl-lang-title"
      className="flex w-full flex-col gap-3.5 rounded-[22px] border border-[var(--bd)] bg-[var(--sf)] p-[18px] text-[var(--tx)] shadow-[var(--shadow)]"
    >
      <div className="flex items-center justify-between gap-3">
        <h2 id="xl-lang-title" className="m-0 font-[var(--font-display)] text-[22px] font-extrabold">
          {t("title")}
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label={t("close")}
          className="flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--bd)] bg-[var(--sf2)] text-[var(--tx)]"
        >
          <IconClose width={18} height={18} />
        </button>
      </div>

      <div className="relative">
        <label htmlFor="xl-lang-q" className="sr-only">
          {t("search")}
        </label>
        <IconSearch
          width={18}
          height={18}
          className="pointer-events-none absolute top-[15px] start-[14px] text-[var(--tx2)]"
        />
        <input
          id="xl-lang-q"
          type="search"
          placeholder={t("search")}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="box-border h-12 w-full rounded-[14px] border-[1.5px] border-[var(--bd-strong)] bg-[var(--bg)] ps-[42px] pe-3.5 text-base text-[var(--tx)]"
        />
      </div>

      <ul className="m-0 grid list-none grid-cols-2 gap-1.5 p-0 sm:grid-cols-3">
        {langs.map((l) => {
          const on = l.code === current;
          return (
            <li key={l.code}>
              <Link
                href={pathname}
                locale={l.code}
                lang={l.code}
                hrefLang={l.code}
                aria-current={on}
                onClick={onClose}
                className="flex min-h-[52px] items-center justify-between gap-2 rounded-xl border-[1.5px] px-3 py-1.5 no-underline"
                style={{
                  background: on ? "var(--sf2)" : "transparent",
                  borderColor: on ? "var(--ac-tx)" : "transparent",
                  color: "var(--tx)",
                }}
              >
                <span className="flex min-w-0 flex-col leading-tight">
                  <span dir="auto" className="text-[15px] font-bold">
                    {l.native}
                  </span>
                  <span className="text-xs text-[var(--tx2)]">{l.english}</span>
                </span>
                {on && (
                  <span className="flex h-6 w-6 flex-none items-center justify-center rounded-full bg-[var(--ac)] text-[var(--on-ac)]">
                    <IconCheck width={14} height={14} />
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>

      {langs.length === 0 && <p className="m-0 p-2 text-[var(--tx2)]">{t("none")}</p>}
    </div>
  );
}
