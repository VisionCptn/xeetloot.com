import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  // Icons/screenshots are hand-authored SVG, not fetched remote images.
  images: { unoptimized: true },
};

initOpenNextCloudflareForDev();

export default withNextIntl(nextConfig);
