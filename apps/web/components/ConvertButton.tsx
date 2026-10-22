"use client";

import { useState } from "react";
import { toApiUrl } from "@/lib/config";
import { IconDownload } from "./icons";

interface ConvertButtonProps {
  id: string;
  source: string;
  kind: "gif" | "mp3";
  label: string;
  busyLabel: string;
  errorLabel: string;
  className?: string;
}

type State = "idle" | "loading" | "error";

/** GIF and MP3 aren't part of a plain resolve — X only ever hands out the
 * mp4 version of both. This triggers loot-api's /convert (which runs
 * ffmpeg in the extractor container) on click, then swaps itself for a
 * real download link once the signed URL comes back. */
export function ConvertButton({ id, source, kind, label, busyLabel, errorLabel, className }: ConvertButtonProps) {
  const [state, setState] = useState<State>("idle");
  const [href, setHref] = useState<string | null>(null);

  async function handleClick() {
    setState("loading");
    try {
      const res = await fetch("/api/convert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, kind, source }),
      });
      if (!res.ok) throw new Error(`convert failed: ${res.status}`);
      const data = (await res.json()) as { downloadUrl?: string };
      if (!data.downloadUrl) throw new Error("no downloadUrl in response");
      setHref(toApiUrl(data.downloadUrl));
      setState("idle");
    } catch {
      setState("error");
    }
  }

  if (href) {
    return (
      <a href={href} download className={className}>
        <IconDownload width={18} height={18} />
        <span>{label}</span>
      </a>
    );
  }

  return (
    <button type="button" onClick={handleClick} disabled={state === "loading"} className={className}>
      <IconDownload width={18} height={18} />
      <span>{state === "loading" ? busyLabel : state === "error" ? errorLabel : label}</span>
    </button>
  );
}
