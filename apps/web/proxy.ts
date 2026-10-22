import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

// Matches the address-bar-trick URL shape exactly: /<user>/status/<id>,
// nothing else in the path. <user> intentionally isn't checked against
// routing.locales here — app/status/[user]/[id]/page.tsx does the real
// validation (username charset, numeric id) and 404s itself.
const STATUS_URL_RE = /^\/([A-Za-z0-9_]{1,15})\/status\/(\d{1,40})\/?$/;

export default function proxy(request: NextRequest) {
  // Canonical host/scheme: redirect http:// and www. to the bare https://
  // apex before anything else runs. Cloudflare's zone-level "Always Use
  // HTTPS" and a www redirect rule aren't available to this deploy token
  // (zone write isn't granted), so this is the one place that can
  // actually enforce it — every request reaches this Worker either way.
  const url = request.nextUrl;
  const proto = request.headers.get("x-forwarded-proto") ?? url.protocol.replace(":", "");
  const isWww = url.hostname.startsWith("www.");
  if (proto === "http" || isWww) {
    const canonical = new URL(url);
    canonical.protocol = "https:";
    if (isWww) canonical.hostname = url.hostname.slice(4);
    return NextResponse.redirect(canonical, 308);
  }

  const match = STATUS_URL_RE.exec(request.nextUrl.pathname);
  if (match) {
    // Rewrite only — the address bar keeps showing /<user>/status/<id>;
    // internally this resolves to app/status/[user]/[id], a static
    // "status" segment that doesn't collide with [locale]'s dynamic
    // segment. See that route's layout.tsx for why it can't live
    // directly under app/[user]/status/[id].
    const url = request.nextUrl.clone();
    url.pathname = `/status/${match[1]}/${match[2]}`;
    return NextResponse.rewrite(url);
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
