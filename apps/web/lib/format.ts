import type { MediaVariant } from "@xeetloot/shared";

export function qualityLabel(variant: MediaVariant): string {
  return variant.height ? `${variant.height}p` : "MP4";
}

export function qualityMeta(variant: MediaVariant): string {
  const dims = variant.width && variant.height ? `${variant.width}×${variant.height}` : null;
  return [dims, "MP4"].filter(Boolean).join(" · ");
}

export function formatDuration(ms?: number): string {
  if (!ms) return "";
  const totalSeconds = Math.round(ms / 1000);
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function truncate(text: string, max = 140): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).trimEnd()}…`;
}
