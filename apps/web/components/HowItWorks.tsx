import { getTranslations } from "next-intl/server";
import type { DownloaderMode } from "./Header";

const PHONE_FRAMES = [
  <>
    <span className="block h-[36px] rounded-md bg-[var(--sf2)]" />
    <div className="mt-auto flex flex-col gap-1 rounded-lg bg-[var(--sf2)] p-1.5">
      <span className="block h-1.5 w-[70%] rounded bg-[var(--bd)]" />
      <span className="block h-3.5 rounded bg-[var(--ac)]" />
      <span className="block h-1.5 w-1/2 rounded bg-[var(--bd)]" />
    </div>
  </>,
  <>
    <span className="mx-auto mt-2.5 block h-[7px] w-12 rounded bg-[var(--tx2)]" />
    <span className="block h-4 rounded bg-[var(--ac)]" />
  </>,
  <>
    <span className="block h-[30px] rounded-md bg-[var(--sf2)]" />
    <span className="mx-auto mt-auto block h-[30px] w-[30px] rounded-full bg-[var(--ac)]" />
  </>,
];

export async function HowItWorks({ mode }: { mode: DownloaderMode }) {
  const t = await getTranslations("home");
  const modeT = await getTranslations(`modes.${mode}`);

  const steps = [
    { title: t("step1Title"), desc: t("step1Desc") },
    { title: t("step2Title"), desc: t("step2Desc") },
    { title: t("step3Title"), desc: t("step3Desc") },
  ];

  return (
    <section className="px-4 py-10 sm:px-10 sm:py-20">
      <div className="mx-auto flex max-w-[1120px] flex-col gap-6">
        <div className="flex flex-col gap-1.5">
          <span className="text-[13px] font-extrabold tracking-[0.08em] text-[var(--ac-tx)] uppercase">{t("howEyebrow")}</span>
          <h2 className="m-0 font-[var(--font-display)] text-[28px] leading-tight font-extrabold tracking-[-0.025em] text-balance sm:text-[40px]">
            {modeT("howTitle")}
          </h2>
        </div>
        <ol className="m-0 grid list-none grid-cols-1 gap-3.5 p-0 sm:grid-cols-3">
          {steps.map((step, i) => (
            <li key={i} className="flex items-center gap-4 rounded-[20px] border border-[var(--bd)] bg-[var(--sf)] p-4">
              <div
                aria-hidden
                className="flex h-[156px] w-[88px] flex-none flex-col gap-1.5 rounded-[18px] border-2 border-[var(--tx2)] bg-[var(--bg)] p-2"
              >
                <span className="mx-auto block h-1 w-[26px] rounded bg-[var(--bd)]" />
                {PHONE_FRAMES[i]}
              </div>
              <div className="flex flex-col gap-1 text-start">
                <span className="font-[var(--font-display)] text-[15px] font-extrabold text-[var(--ac-tx)]">0{i + 1}</span>
                <h3 className="m-0 text-[18px] leading-tight">{step.title}</h3>
                <p className="m-0 text-[15px] text-[var(--tx2)]">{step.desc}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
