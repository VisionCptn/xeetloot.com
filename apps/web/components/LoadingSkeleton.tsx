import { useTranslations } from "next-intl";

const ROW_WIDTHS = [70, 60, 64, 44, 52];

export function LoadingSkeleton() {
  const t = useTranslations("home");
  return (
    <article aria-busy="true" className="overflow-hidden rounded-[20px] border border-[var(--bd)] bg-[var(--sf)] shadow-[var(--shadow)]">
      <div className="flex flex-wrap gap-4 p-4">
        <div className="flex flex-1 basis-[280px] flex-col items-center justify-center gap-1.5 rounded-2xl bg-[var(--sf2)] p-3 text-center aspect-video">
          <span className="text-[17px] font-bold">{t("loadingTitle")}</span>
          <span className="text-sm text-[var(--tx2)]">{t("loadingDesc")}</span>
        </div>
        <div className="flex flex-1 basis-[260px] flex-col gap-3 pt-1">
          <div className="flex items-center gap-2.5">
            <span className="xl-shimmer h-10 w-10 rounded-full" />
            <span className="xl-shimmer h-3.5 w-[120px] rounded-[7px]" />
          </div>
          <span className="xl-shimmer h-3.5 rounded-[7px]" />
          <span className="xl-shimmer h-3.5 w-4/5 rounded-[7px]" />
          <span className="xl-shimmer h-3.5 w-2/5 rounded-[7px]" />
        </div>
      </div>
      <ul className="m-0 list-none p-0">
        {ROW_WIDTHS.map((w, i) => (
          <li key={i} className="flex min-h-[65px] items-center gap-3 border-t border-[var(--bd)] px-4 py-2.5">
            <div className="flex flex-1 flex-col gap-2">
              <span className="xl-shimmer h-3.5 rounded-[7px]" style={{ width: `${w}%` }} />
              <span className="h-2.5 w-[110px] rounded-[5px] bg-[var(--sf2)]" />
            </div>
            <span className="h-11 w-32 flex-none rounded-xl bg-[var(--sf2)]" />
          </li>
        ))}
      </ul>
    </article>
  );
}
