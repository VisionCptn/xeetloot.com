import { getTranslations } from "next-intl/server";
import { IconArrowDown, IconLock } from "./icons";

export async function AddressBarTrick() {
  const t = await getTranslations("home");

  return (
    <section className="px-4 py-6 sm:px-10">
      <div className="mx-auto flex max-w-[1120px] flex-wrap items-center gap-7 rounded-[28px] border border-[var(--bd)] bg-[var(--sf)] p-5 sm:p-10">
        <div className="flex min-w-0 flex-1 basis-[320px] flex-col gap-2.5 text-start">
          <span className="text-[13px] font-extrabold tracking-[0.08em] text-[var(--ac-tx)] uppercase">{t("trickEyebrow")}</span>
          <h2 className="m-0 font-[var(--font-display)] text-[28px] leading-tight font-extrabold tracking-[-0.025em] sm:text-[40px]">
            {t("trickTitle")}
          </h2>
          <p className="m-0 text-base text-[var(--tx2)] text-pretty">{t("trickBody")}</p>
          <p className="m-0 text-sm text-[var(--tx2)]">{t("trickNote")}</p>
        </div>
        <div className="flex min-w-0 flex-1 basis-[420px] flex-col gap-2">
          <span className="text-xs font-extrabold tracking-[0.08em] text-[var(--tx2)] uppercase">{t("trickBefore")}</span>
          <div
            dir="ltr"
            className="flex min-h-[52px] items-center gap-2 overflow-hidden rounded-2xl border border-[var(--bd)] bg-[var(--sf2)] px-3.5 font-mono text-sm whitespace-nowrap"
          >
            <IconLock width={14} height={14} className="flex-none text-[var(--tx2)]" />
            <span className="font-bold text-[var(--tx)] line-through" style={{ textDecorationColor: "var(--dng)" }}>
              x.com
            </span>
            <span className="-ms-2 text-[var(--tx2)]">/lootie/status/1849&hellip;</span>
          </div>
          <span
            aria-hidden
            className="flex h-10 w-10 items-center justify-center self-center rounded-full border-2 border-[var(--ac-bd)] bg-[var(--ac)] text-[var(--on-ac)]"
          >
            <IconArrowDown width={18} height={18} />
          </span>
          <span className="text-xs font-extrabold tracking-[0.08em] text-[var(--tx2)] uppercase">{t("trickAfter")}</span>
          <div
            dir="ltr"
            className="flex min-h-[52px] items-center gap-2 overflow-hidden rounded-2xl border-2 border-[var(--ac-tx)] bg-[var(--sf2)] px-3.5 font-mono text-sm whitespace-nowrap"
          >
            <IconLock width={14} height={14} className="flex-none text-[var(--tx2)]" />
            <span className="rounded-md bg-[var(--ac)] px-1.5 py-px font-extrabold text-[var(--on-ac)]">xeetloot.com</span>
            <span className="-ms-2 text-[var(--tx2)]">/lootie/status/1849&hellip;</span>
          </div>
        </div>
      </div>
    </section>
  );
}
