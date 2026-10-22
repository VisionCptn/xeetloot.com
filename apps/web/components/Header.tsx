"use client";

import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { rtlLocales, type Locale } from "@/i18n/routing";
import { LOCALE_INFO } from "@/lib/locales";
import { BrandMark, IconChevronDown, IconGlobe } from "./icons";
import { LangPicker } from "./LangPicker";
import { ThemeToggle } from "./ThemeToggle";

export type DownloaderMode = "video" | "gif" | "image" | "mp3";

const MODE_PATHS: Record<DownloaderMode, string> = {
  video: "/",
  gif: "/gif",
  image: "/image",
  mp3: "/mp3",
};

export function Header({ active }: { active: DownloaderMode | "none" }) {
  const t = useTranslations("nav");
  const locale = useLocale() as Locale;
  const dir = rtlLocales.has(locale) ? "rtl" : "ltr";
  const [langOpen, setLangOpen] = useState(false);
  const current = LOCALE_INFO.find((l) => l.code === locale);

  const links: Array<{ key: DownloaderMode; label: string }> = [
    { key: "video", label: t("video") },
    { key: "gif", label: t("gif") },
    { key: "image", label: t("image") },
    { key: "mp3", label: t("mp3") },
  ];

  return (
    <header
      dir={dir}
      className="relative flex min-h-16 items-center justify-between gap-3 border-b border-[var(--bd)] bg-[var(--bg)] px-4 text-[var(--tx)] sm:px-10"
    >
      <Link href="/" aria-label={t("homeAria")} className="flex min-h-11 items-center gap-2.5 text-[var(--tx)] no-underline">
        <BrandMark width={30} height={30} />
        <span dir="ltr" className="flex items-center gap-0.5 font-[var(--font-display)] text-[22px] font-extrabold tracking-[-0.02em]">
          Xeet
          <span className="rounded-md bg-[var(--ac)] px-[5px] py-[3px] text-[var(--on-ac)]">Loot</span>
        </span>
      </Link>

      <nav aria-label={t("mainLabel")} className="ms-auto me-3 hidden gap-1 sm:flex">
        {links.map((l) => (
          <Link
            key={l.key}
            href={MODE_PATHS[l.key]}
            aria-current={active === l.key ? "page" : undefined}
            className="flex min-h-11 items-center border-b-[3px] px-3 text-[15px] font-bold no-underline"
            style={{
              borderColor: active === l.key ? "var(--ac-tx)" : "transparent",
              color: active === l.key ? "var(--tx)" : "var(--tx2)",
            }}
          >
            {l.label}
          </Link>
        ))}
      </nav>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setLangOpen(true)}
          aria-haspopup="dialog"
          aria-label={t("langAria")}
          className="flex min-h-11 items-center gap-1.5 rounded-xl border border-[var(--bd)] bg-[var(--sf)] px-3 text-sm font-bold text-[var(--tx)]"
        >
          <IconGlobe width={18} height={18} />
          <span className="hidden sm:inline">{current?.native ?? t("langLabel")}</span>
          <span className="sm:hidden">{t("langLabelShort")}</span>
          <IconChevronDown width={14} height={14} />
        </button>
        <ThemeToggle toLightLabel={t("themeToLight")} toDarkLabel={t("themeToDark")} />
      </div>

      {langOpen && (
        <>
          <button
            type="button"
            aria-label={t("langAria")}
            tabIndex={-1}
            onClick={() => setLangOpen(false)}
            className="fixed inset-0 z-30 cursor-default border-0 bg-[var(--scrim)] p-0"
          />
          <div className="absolute inset-x-2 top-[72px] z-40 sm:inset-x-auto sm:end-10 sm:w-[560px]">
            <LangPicker onClose={() => setLangOpen(false)} />
          </div>
        </>
      )}
    </header>
  );
}
