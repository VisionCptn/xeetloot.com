import { CANARY_KEY, type CanaryStatus } from "./cron.js";
import { isBreakerOpen } from "./breaker.js";
import type { Env } from "./env.js";

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

function row(label: string, ok: boolean, detail: string): string {
  const color = ok ? "#2e7d32" : "#c62828";
  const status = ok ? "OK" : "FAIL";
  return `<tr><td>${escapeHtml(label)}</td><td style="color:${color};font-weight:700">${status}</td><td>${escapeHtml(detail)}</td></tr>`;
}

/** Plain HTML status page, gated by a shared secret — "for me" (brief),
 * not meant to be public. Reads the canary cron's last result
 * (src/cron.ts) and the current breaker state for both resolve tiers. */
export async function renderStatusPage(env: Env): Promise<string> {
  const [raw, syndicationOpen, extractorOpen] = await Promise.all([
    env.CANARY_STATE.get(CANARY_KEY),
    isBreakerOpen(env.BREAKER_STATE, "syndication"),
    isBreakerOpen(env.BREAKER_STATE, "extractor"),
  ]);

  const canary = raw ? (JSON.parse(raw) as CanaryStatus) : null;

  const canaryRows = canary
    ? [
        row("Canary: video", canary.video.ok, canary.video.error ?? canary.video.checkedAt),
        row("Canary: gif", canary.gif.ok, canary.gif.error ?? canary.gif.checkedAt),
        row("Canary: photo", canary.photo.ok, canary.photo.error ?? canary.photo.checkedAt),
      ].join("\n")
    : `<tr><td colspan="3">No canary data yet — the cron runs every 15 min.</td></tr>`;

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>loot-api status</title>
<style>
  body { font: 15px/1.5 -apple-system, system-ui, sans-serif; max-width: 640px; margin: 40px auto; padding: 0 16px; }
  table { width: 100%; border-collapse: collapse; margin: 16px 0; }
  td { padding: 8px; border-bottom: 1px solid #ddd; }
  h1 { font-size: 20px; }
  .meta { color: #666; font-size: 13px; }
</style>
</head>
<body>
<h1>loot-api status</h1>
<p class="meta">Canary last updated: ${escapeHtml(canary?.updatedAt ?? "never")}</p>
<table>
${row("Breaker: syndication", !syndicationOpen, syndicationOpen ? "open (tripped)" : "closed")}
${row("Breaker: extractor", !extractorOpen, extractorOpen ? "open (tripped)" : "closed")}
${canaryRows}
</table>
</body>
</html>`;
}
