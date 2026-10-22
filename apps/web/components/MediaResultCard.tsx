"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import type { MediaItem, ResolvedMedia } from "@xeetloot/shared";
import { toApiUrl } from "@/lib/config";
import { formatDuration, qualityLabel, qualityMeta, truncate } from "@/lib/format";
import type { DownloaderMode } from "./Header";
import { ConvertButton } from "./ConvertButton";
import { IconDownload, IconGrid, IconLayers, IconMusic, IconPlay } from "./icons";

const ROW_CTA_CLASS =
  "xl-cta flex min-h-11 flex-none items-center gap-2 rounded-xl border-2 border-[var(--ac-bd)] bg-[var(--ac)] px-4 text-[15px] font-extrabold text-[var(--on-ac)] shadow-[0_3px_0_var(--ac-sh)]";

function AuthorLine({ media }: { media: ResolvedMedia }) {
  return (
    <div className="flex items-center gap-2.5">
      {media.author.avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- remote avatar from X's own CDN, not optimizable by next/image across arbitrary hosts
        <img src={media.author.avatarUrl} alt="" width={40} height={40} className="h-10 w-10 flex-none rounded-full" />
      ) : (
        <span className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-[var(--ac)] font-[var(--font-display)] text-lg font-extrabold text-[var(--on-ac)]">
          {media.author.name?.[0]?.toUpperCase() ?? "X"}
        </span>
      )}
      <div className="flex min-w-0 flex-col leading-tight">
        <strong className="text-[15px]">{media.author.name}</strong>
        <span dir="ltr" className="text-sm text-[var(--tx2)]">
          @{media.author.handle}
        </span>
      </div>
    </div>
  );
}

function QualityRow({ label, meta, action }: { label: string; meta: string; action: React.ReactNode }) {
  return (
    <li className="flex min-h-[65px] items-center gap-3 border-t border-[var(--bd)] px-4 py-2.5">
      <div className="flex min-w-0 flex-1 flex-col gap-0.5 text-start">
        <strong className="text-base">{label}</strong>
        <span className="text-[13px] text-[var(--tx2)]">{meta}</span>
      </div>
      {action}
    </li>
  );
}

function VideoOrGifCard({ media, item, mode }: { media: ResolvedMedia; item: MediaItem; mode: DownloaderMode }) {
  const t = useTranslations("home");
  const videoItems = media.media.filter((m) => m.kind === "video" || m.kind === "gif");
  const [active, setActive] = useState(0);
  const current = videoItems[active] ?? item;

  return (
    <article className="flex flex-col overflow-hidden rounded-[20px] border border-[var(--bd)] bg-[var(--sf)] shadow-[var(--shadow)]">
      {videoItems.length > 1 && (
        <div className="flex flex-wrap items-center justify-between gap-2.5 border-b border-[var(--bd)] px-4 py-3">
          <span className="text-sm font-bold text-[var(--tx2)]">{t("multiVideos", { count: videoItems.length })}</span>
          <div className="flex gap-1.5">
            {videoItems.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-pressed={active === i}
                onClick={() => setActive(i)}
                className="min-h-11 rounded-full border-[1.5px] px-3.5 text-sm font-bold"
                style={{
                  background: active === i ? "var(--inv)" : "transparent",
                  color: active === i ? "var(--on-inv)" : "var(--tx)",
                  borderColor: active === i ? "var(--inv)" : "var(--bd)",
                }}
              >
                Video {i + 1}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-4 p-4">
        <div className="relative flex aspect-video flex-1 basis-[280px] items-center justify-center overflow-hidden rounded-2xl bg-[var(--sf2)]">
          {current.variants[0]?.url ? (
            <video
              key={current.variants[0].url}
              controls
              playsInline
              preload="metadata"
              poster={current.thumbnailUrl}
              className="h-full w-full object-contain"
            >
              <source src={current.variants[0].url} type={current.variants[0].contentType || "video/mp4"} />
            </video>
          ) : (
            <IconPlay width={22} height={22} className="relative z-10 text-[var(--tx2)]" />
          )}
          {current.kind === "gif" && (
            <span className="pointer-events-none absolute top-2 start-2 z-10 rounded-md bg-[var(--ac)] px-2 py-0.5 text-xs font-extrabold tracking-[0.04em] text-[var(--on-ac)]">
              GIF
            </span>
          )}
          {current.durationMs ? (
            <span className="pointer-events-none absolute bottom-2 end-2 z-10 rounded-md bg-black/80 px-2 py-0.5 text-xs font-bold text-white tabular-nums">
              {formatDuration(current.durationMs)}
            </span>
          ) : null}
        </div>
        <div className="flex min-w-0 flex-1 basis-[260px] flex-col gap-2.5 text-start">
          <AuthorLine media={media} />
          <p className="m-0 line-clamp-2 text-[15px] leading-snug">{truncate(media.text)}</p>
        </div>
      </div>

      <ul className="m-0 list-none p-0">
        {mode === "gif" && current.kind === "gif" ? (
          <>
            <QualityRow
              label={t("dl")}
              meta={`GIF · ${qualityMeta(current.variants[0] ?? { contentType: "", url: "" })}`}
              action={
                <ConvertButton
                  id={media.id}
                  source={current.variants[0]?.url ?? ""}
                  kind="gif"
                  label={t("dl")}
                  busyLabel={t("loadingTitle")}
                  errorLabel={t("dl")}
                  className={ROW_CTA_CLASS}
                />
              }
            />
            {current.variants[0] && (
              <QualityRow
                label="MP4"
                meta={t("again")}
                action={
                  <a href={toApiUrl(current.variants[0].downloadUrl ?? "")} download className={ROW_CTA_CLASS}>
                    <IconDownload width={18} height={18} />
                    <span>{t("dl")}</span>
                  </a>
                }
              />
            )}
          </>
        ) : (
          current.variants.map((v, i) => (
            <QualityRow
              key={i}
              label={qualityLabel(v)}
              meta={qualityMeta(v)}
              action={
                <a href={toApiUrl(v.downloadUrl ?? "")} download className={ROW_CTA_CLASS}>
                  <IconDownload width={18} height={18} />
                  <span>{t("dl")}</span>
                </a>
              }
            />
          ))
        )}
      </ul>

      {videoItems.length > 1 && (
        <div className="flex items-center justify-between gap-2 border-t border-[var(--bd)] bg-[var(--sf2)] px-4 py-3">
          <span className="text-sm text-[var(--tx2)]">{t("downloadAllVideos", { count: videoItems.length })}</span>
          <div className="flex flex-wrap gap-1.5">
            {videoItems.map((vi, i) => {
              const best = vi.variants[0];
              return best?.downloadUrl ? (
                <a key={i} href={toApiUrl(best.downloadUrl)} download className={ROW_CTA_CLASS}>
                  <IconLayers width={16} height={16} />
                  <span>{`${i + 1}`}</span>
                </a>
              ) : null;
            })}
          </div>
        </div>
      )}
    </article>
  );
}

function PhotoCard({ media }: { media: ResolvedMedia }) {
  const t = useTranslations("home");
  const photos = media.media.filter((m) => m.kind === "photo");
  if (photos.length === 0) return null;

  return (
    <article className="overflow-hidden rounded-[20px] border border-[var(--bd)] bg-[var(--sf)] shadow-[var(--shadow)]">
      <div className="flex items-center gap-2.5 px-4 pt-4 pb-2 text-start">
        <AuthorLine media={media} />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-1">
        <strong className="text-[15px]">{t("photosInTweet", { count: photos.length })}</strong>
      </div>
      <div className="grid grid-cols-2 gap-2.5 p-4 sm:grid-cols-4">
        {photos.map((p, i) => {
          const v = p.variants[0];
          return (
            <figure key={i} className="m-0 flex flex-col gap-1.5">
              <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-xl bg-[var(--sf2)] text-[var(--tx2)]">
                {v?.url ? (
                  // eslint-disable-next-line @next/next/no-img-element -- remote photo from X's own CDN, not optimizable by next/image across arbitrary hosts
                  <img src={v.url} alt="" loading="lazy" className="h-full w-full object-cover" />
                ) : (
                  <IconGrid width={28} height={28} />
                )}
                {v?.downloadUrl && (
                  <a
                    href={toApiUrl(v.downloadUrl)}
                    download
                    aria-label={`${t("dl")} ${i + 1}`}
                    className="absolute end-1.5 bottom-1.5 flex h-11 w-11 items-center justify-center rounded-xl bg-black/80 text-white"
                  >
                    <IconDownload width={18} height={18} />
                  </a>
                )}
              </div>
              <figcaption className="text-start text-xs text-[var(--tx2)]">
                {p.width && p.height ? `${p.width}×${p.height}` : null}
              </figcaption>
            </figure>
          );
        })}
      </div>
    </article>
  );
}

function Mp3Card({ media }: { media: ResolvedMedia }) {
  const t = useTranslations("home");
  const source = media.media.find((m) => m.kind === "video");
  const sourceVariant = source?.variants[0];

  return (
    <article className="overflow-hidden rounded-[20px] border border-[var(--bd)] bg-[var(--sf)] shadow-[var(--shadow)]">
      <div className="flex items-center gap-3.5 p-4 text-start">
        <div className="flex h-[76px] w-[76px] flex-none items-center justify-center rounded-2xl bg-[var(--sf2)] text-[var(--ac-tx)]">
          <IconMusic width={32} height={32} />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <AuthorLine media={media} />
          <p className="m-0 line-clamp-2 text-[15px] leading-snug">{truncate(media.text)}</p>
        </div>
      </div>
      {sourceVariant?.url && (
        <div className="px-4 pb-3">
          <audio key={sourceVariant.url} controls preload="metadata" className="w-full">
            <source src={sourceVariant.url} />
          </audio>
        </div>
      )}
      <ul className="m-0 list-none p-0">
        <QualityRow
          label="MP3"
          meta={formatDuration(source?.durationMs) || "Audio"}
          action={
            sourceVariant ? (
              <ConvertButton
                id={media.id}
                source={sourceVariant.url}
                kind="mp3"
                label={t("dl")}
                busyLabel={t("loadingTitle")}
                errorLabel={t("dl")}
                className={ROW_CTA_CLASS}
              />
            ) : null
          }
        />
      </ul>
    </article>
  );
}

export function MediaResultCard({ media, mode }: { media: ResolvedMedia; mode: DownloaderMode }) {
  if (mode === "image") return <PhotoCard media={media} />;
  if (mode === "mp3") return <Mp3Card media={media} />;

  const item = media.media.find((m) => m.kind === "video" || m.kind === "gif");
  if (!item) return null;
  return <VideoOrGifCard media={media} item={item} mode={mode} />;
}
