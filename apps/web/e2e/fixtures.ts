import type { Page } from "@playwright/test";

/** Stubs window.turnstile before any page script runs, so tests never
 * depend on reaching challenges.cloudflare.com. Mirrors the real widget's
 * invisible-mode contract: render() registers the callback, execute()
 * fires it — see components/Turnstile.tsx. */
export async function stubTurnstile(page: Page): Promise<void> {
  await page.addInitScript(() => {
    interface FakeTurnstile {
      render: (el: HTMLElement, opts: { callback: (token: string) => void }) => string;
      execute: () => void;
      reset: () => void;
      remove: () => void;
    }
    const w = window as unknown as { turnstile?: FakeTurnstile; __turnstileCallback?: (token: string) => void };
    w.turnstile = {
      render: (_el, opts) => {
        w.__turnstileCallback = opts.callback;
        return "test-widget";
      },
      execute: () => w.__turnstileCallback?.("test-token"),
      reset: () => {},
      remove: () => {},
    };
  });
}

export const SAMPLE_VIDEO_MEDIA = {
  platform: "x",
  id: "1790637656616943991",
  author: { handle: "historyinmemes", name: "Historic Vids" },
  text: "One of the most intense moments in history",
  createdAt: "2024-05-15T06:57:40.000Z",
  media: [
    {
      kind: "video",
      width: 728,
      height: 720,
      durationMs: 15488,
      variants: [
        {
          bitrate: 2176000,
          contentType: "video/mp4",
          url: "https://video.twimg.com/amplify_video/1/vid/avc1/728x720/a.mp4",
          width: 728,
          height: 720,
          downloadUrl: "/dl?u=a&name=a.mp4&sig=test&exp=9999999999",
        },
        {
          bitrate: 832000,
          contentType: "video/mp4",
          url: "https://video.twimg.com/amplify_video/1/vid/avc1/364x360/b.mp4",
          width: 364,
          height: 360,
          downloadUrl: "/dl?u=b&name=b.mp4&sig=test&exp=9999999999",
        },
        {
          bitrate: 288000,
          contentType: "video/mp4",
          url: "https://video.twimg.com/amplify_video/1/vid/avc1/272x270/c.mp4",
          width: 272,
          height: 270,
          downloadUrl: "/dl?u=c&name=c.mp4&sig=test&exp=9999999999",
        },
      ],
    },
  ],
};
