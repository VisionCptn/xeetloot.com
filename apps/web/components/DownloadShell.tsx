"use client";

import { useTranslations } from "next-intl";
import { useCallback, useRef, useState } from "react";
import type { ResolvedMedia, ResolveErrorCode } from "@xeetloot/shared";
import type { DownloaderMode } from "./Header";
import { PasteForm } from "./PasteForm";
import { Toast } from "./Toast";
import { LoadingSkeleton } from "./LoadingSkeleton";
import { ErrorCard } from "./ErrorCard";
import { MediaResultCard } from "./MediaResultCard";
import { Turnstile, type TurnstileHandle } from "./Turnstile";

// Real public tweets, confirmed live — used only for the "Try a sample
// link" button. Each mode gets a tweet that actually contains that kind of
// media, so the sample demonstrates the real result instead of (e.g.) a
// video tweet showing up empty on the /image page.
const SAMPLE_URLS: Record<DownloaderMode, string> = {
  video: "https://x.com/nocontextscats/status/2110507945444196665",
  gif: "https://x.com/TwalibZaitunk/status/2110114078848901177",
  image: "https://x.com/NASA/status/2040059740848283920",
  mp3: "https://x.com/nocontextscats/status/2110507945444196665",
};

type Phase = "idle" | "loading" | "result" | "error";

interface ApiErrorBody {
  error: ResolveErrorCode;
  message?: string;
}

export function DownloadShell({ mode, adSlot }: { mode: DownloaderMode; adSlot: React.ReactNode }) {
  const t = useTranslations("home");
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "";

  const [url, setUrl] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [media, setMedia] = useState<ResolvedMedia | null>(null);
  const [errorCode, setErrorCode] = useState<ResolveErrorCode>("unrecognized_url");
  const [toast, setToast] = useState(false);

  const turnstileRef = useRef<TurnstileHandle>(null);
  const pendingUrlRef = useRef<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const resolve = useCallback(async (targetUrl: string, token: string) => {
    try {
      const qs = new URLSearchParams({ url: targetUrl, turnstileToken: token });
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
  }, []);

  const handleToken = useCallback(
    (token: string) => {
      const target = pendingUrlRef.current;
      pendingUrlRef.current = null;
      if (target) void resolve(target, token);
    },
    [resolve],
  );

  function submitUrl(targetUrl: string) {
    const trimmed = targetUrl.trim();
    if (!trimmed) return;
    setPhase("loading");
    pendingUrlRef.current = trimmed;
    turnstileRef.current?.execute();
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    submitUrl(url);
  }

  async function handlePaste() {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setUrl(text);
        setToast(true);
        clearTimeout(toastTimer.current);
        toastTimer.current = setTimeout(() => setToast(false), 2400);
      }
    } catch {
      // Clipboard permission denied or unavailable — the input is still
      // focused and typable, nothing else to do.
    }
  }

  function handleSample() {
    setUrl(SAMPLE_URLS[mode]);
  }

  function handleRetry() {
    if (errorCode === "unrecognized_url") {
      setPhase("idle");
      return;
    }
    submitUrl(url || SAMPLE_URLS[mode]);
  }

  return (
    <div className="relative">
      <PasteForm
        mode={mode}
        url={url}
        invalid={phase === "error" && errorCode === "unrecognized_url"}
        onUrlChange={setUrl}
        onPaste={handlePaste}
        onSubmit={handleSubmit}
        onSample={handleSample}
      />

      <Turnstile ref={turnstileRef} siteKey={siteKey} onToken={handleToken} />

      {toast && <Toast message={t("toast")} />}

      {phase !== "idle" && (
        <section aria-live="polite" aria-label={t("results")} className="flex justify-center px-4 pb-2 sm:px-10">
          <div className="w-full max-w-[760px]">
            {phase === "loading" && <LoadingSkeleton />}
            {phase === "error" && <ErrorCard code={errorCode} onRetry={handleRetry} />}
            {phase === "result" && media && <MediaResultCard media={media} mode={mode} />}
          </div>
        </section>
      )}

      {adSlot}
    </div>
  );
}
