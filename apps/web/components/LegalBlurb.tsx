import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { IconShield } from "./icons";

export async function LegalBlurb() {
  const t = await getTranslations("home");

  return (
    <section className="px-4 pt-6 pb-10 sm:px-10 sm:pb-20">
      <div className="mx-auto flex max-w-[1120px] flex-wrap items-start gap-3.5 rounded-[20px] border border-[var(--bd)] p-5">
        <span className="flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-[var(--sf2)] text-[var(--tx)]">
          <IconShield width={20} height={20} />
        </span>
        <div className="flex min-w-0 flex-1 basis-[260px] flex-col gap-1 text-start">
          <h2 className="m-0 text-[17px]">{t("legalTitle")}</h2>
          <p className="m-0 text-[15px] text-[var(--tx2)]">{t("legalBody")}</p>
        </div>
        <Link href="/dmca" className="flex min-h-11 items-center px-1 text-[15px] font-bold text-[var(--ac-tx)]">
          {t("dmcaLink")}
        </Link>
      </div>
    </section>
  );
}
