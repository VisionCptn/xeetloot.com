"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import type { ResolvedMedia, ResolveErrorCode } from "@xeetloot/shared";
import { ErrorCard } from "./ErrorCard";
import { LoadingSkeleton } from "./LoadingSkeleton";
import { MediaResultCard } from "./MediaResultCard";
import { Turnstile, type TurnstileHandle } from "./Turnstile";
import { BrandMark } from "./icons";

interface ApiErrorBody {
  error: ResolveErrorCode;
  message?: string;
}

/** The address-bar-trick landing page: swap x.com for xeetloot.com on a
 * tweet URL and land straight here, pre-resolved — no paste step. */
export function AutoResolveShell({ tweetUrl }: { tweetUrl: string }) {
  const t = useTranslations("home");
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "";
  const turnstileRef = useRef<TurnstileHandle>(null);
  const started = useRef(false);

  const [phase, setPhase] = useState<"loading" | "result" | "error">("loading");
  const [media, setMedia] = useState<ResolvedMedia | null>(null);
  const [errorCode, setErrorCode] = useState<ResolveErrorCode>("unavailable");

  async function resolve(token: string) {
    try {
      const qs = new URLSearchParams({ url: tweetUrl, turnstileToken: token });
      const res = await fetch(`/api/resolve?${qs.toString()}`);
      const data = (await res.json()) as ResolvedMedia | ApiErrorBody;
      if (res.ok) {
        setMedia(data as ResolvedMedia);
        setPhase("result");
      } else {
        setErrorCode((data as ApiErrorBody).error || "unavailable");
        setPhase("error");
      }
    } catch {
      setErrorCode("unavailable");
      setPhase("error");
    }
  }

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    turnstileRef.current?.execute();
  }, []);

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--tx)]">
      <Turnstile ref={turnstileRef} siteKey={siteKey} onToken={resolve} />
      <header className="flex min-h-16 items-center gap-2.5 border-b border-[var(--bd)] px-4 sm:px-10">
        <a href="https://xeetloot.com" className="flex items-center gap-2.5 text-[var(--tx)] no-underline">
          <BrandMark width={28} height={28} />
          <span className="font-[var(--font-display)] text-[20px] font-extrabold tracking-[-0.02em]">
            Xeet<span className="rounded-md bg-[var(--ac)] px-1.5 py-0.5 text-[var(--on-ac)]">Loot</span>
          </span>
        </a>
      </header>
      <main className="flex justify-center px-4 py-8 sm:px-10">
        <div className="w-full max-w-[760px]">
          {phase === "loading" && <LoadingSkeleton />}
          {phase === "error" && <ErrorCard code={errorCode} onRetry={() => turnstileRef.current?.execute()} />}
          {phase === "result" && media && <MediaResultCard media={media} mode="video" />}
          <p className="mt-6 text-center text-sm text-[var(--tx2)]">
            {t("trickNote")} &middot;{" "}
            <a href="https://xeetloot.com" className="font-semibold text-[var(--ac-tx)]">
              xeetloot.com
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
