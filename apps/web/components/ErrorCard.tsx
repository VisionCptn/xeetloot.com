"use client";

import { useTranslations } from "next-intl";
import type { ResolveErrorCode } from "@xeetloot/shared";
import { IconAgeRestricted, IconLinkBroken, IconLock, IconRefreshCw } from "./icons";

const ICONS: Partial<Record<ResolveErrorCode, typeof IconLock>> = {
  protected_account: IconLock,
  age_restricted: IconAgeRestricted,
  unrecognized_url: IconLinkBroken,
  unavailable: IconRefreshCw,
  rate_limited: IconRefreshCw,
  not_found: IconLinkBroken,
  spaces_unsupported: IconLinkBroken,
  turnstile_failed: IconRefreshCw,
};

export function ErrorCard({ code, onRetry }: { code: ResolveErrorCode; onRetry: () => void }) {
  const t = useTranslations("errors");
  const home = useTranslations("home");
  const Icon = ICONS[code] ?? IconLinkBroken;
  const isDown = code === "unavailable" || code === "rate_limited" || code === "turnstile_failed";
  const isLinkErr = code === "unrecognized_url";

  return (
    <article
      id="xl-err"
      className="flex flex-wrap items-start gap-4 rounded-[20px] border p-5 shadow-[var(--shadow)]"
      style={{ background: "var(--sf)", borderColor: isLinkErr ? "var(--dng)" : "var(--bd)" }}
    >
      <span
        className="flex h-[52px] w-[52px] flex-none items-center justify-center rounded-2xl"
        style={{ background: isLinkErr ? "var(--dng-bg)" : "var(--sf2)", color: isLinkErr ? "var(--dng)" : "var(--tx)" }}
      >
        <Icon width={26} height={26} />
      </span>
      <div className="flex min-w-0 flex-1 basis-[240px] flex-col gap-1.5 text-start">
        <h2 className="m-0 text-[19px] leading-tight font-extrabold">{t(`${code}.title`)}</h2>
        <p className="m-0 text-[15px] text-[var(--tx2)]">{t(`${code}.desc`)}</p>
        <div className="mt-2.5 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onRetry}
            className="xl-cta flex min-h-12 items-center gap-2 rounded-2xl border-2 px-5 text-base font-extrabold"
            style={
              isDown
                ? { background: "var(--ac)", color: "var(--on-ac)", borderColor: "var(--ac-bd)", boxShadow: "0 3px 0 var(--ac-sh)" }
                : { background: "var(--sf2)", color: "var(--tx)", borderColor: "var(--bd)" }
            }
          >
            {t(`${code}.action`)}
          </button>
          <a href="#faq" className="flex min-h-12 items-center px-1 text-[15px] font-semibold text-[var(--ac-tx)]">
            {home("readFaq")}
          </a>
        </div>
      </div>
    </article>
  );
}
