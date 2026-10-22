"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { DownloaderMode } from "./Header";
import { IconCheck, IconClipboard, IconClose, IconDownload, IconSearch } from "./icons";

const MODE_PATHS: Record<DownloaderMode, string> = {
  video: "/",
  gif: "/gif",
  image: "/image",
  mp3: "/mp3",
};

interface PasteFormProps {
  mode: DownloaderMode;
  url: string;
  invalid: boolean;
  onUrlChange: (url: string) => void;
  onPaste: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onSample: () => void;
}

export function PasteForm({ mode, url, invalid, onUrlChange, onPaste, onSubmit, onSample }: PasteFormProps) {
  const t = useTranslations("home");
  const nav = useTranslations("nav");
  const modeT = useTranslations(`modes.${mode}`);

  const pills: DownloaderMode[] = ["video", "gif", "image", "mp3"];

  return (
    <section className="flex flex-col items-center gap-5 px-4 pt-7 pb-7 text-center sm:px-10 sm:pt-16">
      <nav aria-label={t("fmtNav")} className="flex flex-wrap justify-center gap-2">
        {pills.map((p) => {
          const on = p === mode;
          return (
            <Link
              key={p}
              href={MODE_PATHS[p]}
              aria-current={on ? "page" : undefined}
              className="flex min-h-11 items-center rounded-full border-[1.5px] px-[18px] text-[15px] font-bold no-underline"
              style={{
                background: on ? "var(--inv)" : "var(--sf)",
                color: on ? "var(--on-inv)" : "var(--tx)",
                borderColor: on ? "var(--inv)" : "var(--bd)",
              }}
            >
              {nav(p)}
            </Link>
          );
        })}
      </nav>

      <h1 className="m-0 max-w-[900px] font-[var(--font-display)] text-[36px] leading-[1.04] font-extrabold tracking-[-0.025em] text-balance sm:text-[64px]">
        {modeT("h1a")}
        <span className="rounded-[0.18em] bg-[var(--ac)] px-[0.14em] text-[var(--on-ac)] [box-decoration-break:clone]">{modeT("h1b")}</span>
        {modeT("h1c")}
      </h1>
      <p className="m-0 max-w-[560px] text-[17px] leading-snug text-[var(--tx2)] text-pretty sm:text-[19px]">{modeT("sub")}</p>

      <form onSubmit={onSubmit} className="mt-1 flex w-full max-w-[760px] flex-wrap gap-3">
        <label htmlFor="xl-url" className="sr-only">
          {t("inputLabel")}
        </label>
        <div
          className="xl-field flex min-w-0 flex-1 basis-full items-center gap-1.5 rounded-[18px] border-2 bg-[var(--sf)] p-1.5 ps-3.5 shadow-[var(--shadow)] sm:basis-[420px]"
          style={{ borderColor: invalid ? "var(--dng)" : "var(--bd-strong)" }}
        >
          <IconSearch width={20} height={20} className="flex-none text-[var(--tx2)]" />
          <input
            id="xl-url"
            type="url"
            inputMode="url"
            autoComplete="off"
            spellCheck={false}
            placeholder={t("placeholder")}
            value={url}
            onChange={(e) => onUrlChange(e.target.value)}
            aria-invalid={invalid}
            className="h-12 min-w-0 flex-1 border-0 bg-transparent text-base text-[var(--tx)]"
          />
          {url && (
            <button
              type="button"
              onClick={() => onUrlChange("")}
              aria-label={t("clear")}
              className="flex h-11 w-11 flex-none items-center justify-center rounded-xl text-[var(--tx2)]"
            >
              <IconClose width={18} height={18} />
            </button>
          )}
          <button
            type="button"
            onClick={onPaste}
            className="flex min-h-11 flex-none items-center gap-1.5 rounded-xl border border-[var(--bd)] bg-[var(--sf2)] px-3.5 text-[15px] font-bold text-[var(--tx)]"
          >
            <IconClipboard width={18} height={18} />
            <span>{t("paste")}</span>
          </button>
        </div>
        <button
          type="submit"
          className="xl-cta flex min-h-[60px] flex-1 basis-full items-center justify-center gap-2.5 rounded-[18px] border-2 border-[var(--ac-bd)] bg-[var(--ac)] font-[var(--font-display)] text-[19px] font-extrabold tracking-[-0.025em] text-[var(--on-ac)] shadow-[0_4px_0_var(--ac-sh)] sm:basis-[210px]"
        >
          <IconDownload width={22} height={22} />
          <span>{t("download")}</span>
        </button>
      </form>

      <ul aria-label={t("trustLabel")} className="m-0 flex list-none flex-wrap justify-center gap-2 p-0">
        {(t.raw("chips") as string[]).map((chip) => (
          <li
            key={chip}
            className="flex items-center gap-1.5 rounded-full border border-[var(--bd)] bg-[var(--sf)] py-1.5 ps-2 pe-3 text-sm font-semibold"
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--ac)] text-[var(--on-ac)]">
              <IconCheck width={11} height={11} />
            </span>
            <span>{chip}</span>
          </li>
        ))}
      </ul>

      <button type="button" onClick={onSample} className="-mt-2.5 min-h-11 px-3 text-sm font-semibold text-[var(--ac-tx)] underline">
        {t("sample")}
      </button>
    </section>
  );
}
