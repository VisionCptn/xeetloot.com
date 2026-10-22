import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { rtlLocales, type Locale } from "@/i18n/routing";
import { BrandMark } from "./icons";

export async function Footer() {
  const t = await getTranslations("footer");
  const locale = (await getLocale()) as Locale;
  const dir = rtlLocales.has(locale) ? "rtl" : "ltr";

  const groups = [
    {
      title: t("toolsGroup"),
      items: [
        { label: t("toolVideo"), href: "/" },
        { label: t("toolGif"), href: "/gif" },
        { label: t("toolImage"), href: "/image" },
        { label: t("toolMp3"), href: "/mp3" },
      ],
    },
    {
      title: t("guidesGroup"),
      items: [
        { label: t("guideIos"), href: "/iphone" },
        { label: t("guideAndroid"), href: "/android" },
      ],
    },
    {
      title: t("legalGroup"),
      items: [
        { label: t("legalPrivacy"), href: "/privacy" },
        { label: t("legalTerms"), href: "/terms" },
        { label: t("legalDmca"), href: "/dmca" },
        { label: t("legalContact"), href: "/contact" },
      ],
    },
  ];

  return (
    <footer dir={dir} className="border-t border-[var(--bd)] bg-[var(--sf)] px-4 py-12 text-[15px] text-[var(--tx)] sm:px-10">
      <div className="mx-auto flex max-w-[1120px] flex-col gap-8">
        <div className="flex flex-wrap gap-8">
          <div className="flex min-w-[260px] flex-1 flex-col items-start gap-3">
            <Link href="/" className="flex min-h-11 items-center gap-2.5 text-[var(--tx)] no-underline">
              <BrandMark width={30} height={30} />
              <span dir="ltr" className="flex items-center gap-0.5 font-[var(--font-display)] text-[22px] font-extrabold tracking-[-0.02em]">
                Xeet
                <span className="rounded-md bg-[var(--ac)] px-[5px] py-[3px] text-[var(--on-ac)]">Loot</span>
              </span>
            </Link>
            <p className="m-0 max-w-[280px] text-[var(--tx2)]">{t("tagline")}</p>
          </div>

          <div className="grid min-w-0 flex-[3_1_560px] grid-cols-2 gap-6 sm:grid-cols-4">
            {groups.map((g) => (
              <nav key={g.title} aria-label={g.title} className="flex flex-col gap-0.5">
                <h2 className="m-0 mb-1 text-[13px] font-extrabold tracking-[0.08em] text-[var(--tx2)] uppercase">{g.title}</h2>
                {g.items.map((it) => (
                  <Link key={it.label} href={it.href} className="flex min-h-11 flex-col justify-center font-semibold text-[var(--tx)] no-underline">
                    {it.label}
                  </Link>
                ))}
              </nav>
            ))}
            <nav aria-label={t("sistersGroup")} className="flex flex-col gap-0.5">
              <h2 className="m-0 mb-1 text-[13px] font-extrabold tracking-[0.08em] text-[var(--tx2)] uppercase">{t("sistersGroup")}</h2>
              <a href="https://pinloot.me" className="flex min-h-11 flex-col justify-center font-semibold text-[var(--tx)] no-underline">
                pinloot.me
                <span className="text-[13px] font-normal text-[var(--tx2)]">{t("sisterPinterest")}</span>
              </a>
            </nav>
          </div>
        </div>

        <div className="flex flex-wrap justify-between gap-2 border-t border-[var(--bd)] pt-5 text-[13px] text-[var(--tx2)]">
          <span>{t("copy")}</span>
          <span>{t("made")}</span>
        </div>
      </div>
    </footer>
  );
}
