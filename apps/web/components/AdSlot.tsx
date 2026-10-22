import { getTranslations } from "next-intl/server";

interface AdSlotProps {
  width: number;
  height: number;
  className?: string;
}

/** True once a real ad network is wired up (`NEXT_PUBLIC_ADS_PROVIDER`
 * set to anything but the default "none"). Slots render nothing at all
 * while this is false, rather than a visible placeholder box — see
 * AdSlot/MainAdSlot below. */
export function adsEnabled(): boolean {
  const provider = process.env.NEXT_PUBLIC_ADS_PROVIDER ?? "none";
  return provider !== "none";
}

/** Fixed width/height always, so the ad never shifts layout once it loads
 * (brief: reserved slots with fixed heights, no CLS). Renders nothing
 * until `NEXT_PUBLIC_ADS_PROVIDER` is set to a real provider — callers
 * that need to skip their own wrapper too (so no empty gap is left in
 * the layout) should check `adsEnabled()` themselves; see MainAdSlot. */
export async function AdSlot({ width, height, className }: AdSlotProps) {
  if (!adsEnabled()) return null;
  const t = await getTranslations("home");

  return (
    <div
      aria-label={t("adAria")}
      className={`relative flex items-center justify-center rounded-[10px] border border-dashed border-[var(--bd)] bg-[var(--sf)] text-xs text-[var(--tx2)] ${className ?? ""}`}
      style={{ width, maxWidth: "100%", height }}
    >
      <span className="absolute top-1.5 start-1.5 rounded bg-[var(--sf2)] px-1.5 text-[11px] font-bold leading-[18px] text-[var(--tx2)]">
        {t("ad")}
      </span>
      {/* The real provider's tag/script renders here, keyed off
          NEXT_PUBLIC_ADS_PROVIDER, once one is wired up. */}
    </div>
  );
}

/** The slot below the input+result (brief: never between input and
 * result) — 320×100 on mobile, 728×90 on desktop. Both are rendered so
 * swapping breakpoints never causes layout shift; only one is ever
 * actually laid out at a given viewport width. Renders nothing (not even
 * the wrapping padding) until ads are enabled. */
export async function MainAdSlot() {
  if (!adsEnabled()) return null;
  return (
    <div className="flex flex-col items-center gap-1 px-4 py-6 sm:px-10">
      <div className="sm:hidden">
        <AdSlot width={320} height={100} />
      </div>
      <div className="hidden sm:block">
        <AdSlot width={728} height={90} />
      </div>
    </div>
  );
}
