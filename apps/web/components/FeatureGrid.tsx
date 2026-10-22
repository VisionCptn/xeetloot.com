import { getTranslations } from "next-intl/server";
import { IconFilm, IconGrid, IconLayers, IconLink, IconMusic, IconRefreshCw } from "./icons";

const ICONS = [IconFilm, IconRefreshCw, IconGrid, IconMusic, IconLayers, IconLink];

export async function FeatureGrid() {
  const t = await getTranslations("home");

  const features = [1, 2, 3, 4, 5, 6].map((n) => ({
    title: t(`feat${n}Title`),
    desc: t(`feat${n}Desc`),
    Icon: ICONS[n - 1]!,
  }));

  return (
    <section className="px-4 py-6 sm:px-10">
      <div className="mx-auto flex max-w-[1120px] flex-col gap-6">
        <div className="flex flex-col gap-1.5">
          <span className="text-[13px] font-extrabold tracking-[0.08em] text-[var(--ac-tx)] uppercase">{t("featEyebrow")}</span>
          <h2 className="m-0 font-[var(--font-display)] text-[28px] leading-tight font-extrabold tracking-[-0.025em] text-balance sm:text-[40px]">
            {t("featTitle")}
          </h2>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {features.map(({ title, desc, Icon }) => (
            <div key={title} className="flex flex-col gap-2.5 rounded-[20px] border border-[var(--bd)] bg-[var(--sf)] p-4.5">
              <span className="flex h-11 w-11 items-center justify-center rounded-[13px] bg-[var(--ac)] text-[var(--on-ac)]">
                <Icon width={22} height={22} />
              </span>
              <h3 className="m-0 text-[16px] leading-snug">{title}</h3>
              <p className="m-0 text-sm leading-snug text-[var(--tx2)]">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
