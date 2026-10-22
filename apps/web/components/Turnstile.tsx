"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (container: HTMLElement, options: Record<string, unknown>) => string;
      execute: (widgetId: string) => void;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
  }
}

export interface TurnstileHandle {
  execute: () => void;
  reset: () => void;
}

interface TurnstileProps {
  siteKey: string;
  onToken: (token: string) => void;
}

/** Invisible Turnstile widget (brief: "invisible Turnstile"). Cloudflare
 * dropped `size: "invisible"` from the current API (now throws "Invalid
 * value for parameter size" — only compact/flexible/normal are valid) —
 * the documented way to get the same "no UI unless a challenge is
 * actually needed" behavior now is `appearance: "execute"` (stay hidden
 * except while running) paired with `execution: "execute"` (don't
 * auto-run on render). Call `execute()` on submit; the token arrives via
 * `onToken`. */
export const Turnstile = forwardRef<TurnstileHandle, TurnstileProps>(function Turnstile({ siteKey, onToken }, ref) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const widgetId = useRef<string | null>(null);
  const onTokenRef = useRef(onToken);
  onTokenRef.current = onToken;

  useEffect(() => {
    // A missing/empty site key is a config error, not something the
    // widget itself tolerates — it throws synchronously (uncaught) rather
    // than failing gracefully, which can take down the whole page. Skip
    // loading it entirely and fail loud in the console instead.
    if (!siteKey) {
      console.error("[Turnstile] no siteKey provided — widget will not render; resolve/convert calls will fail Turnstile verification");
      return;
    }

    let cancelled = false;

    function render() {
      if (cancelled || !containerRef.current || !window.turnstile) return;
      try {
        widgetId.current = window.turnstile!.render(containerRef.current, {
          sitekey: siteKey,
          appearance: "execute",
          execution: "execute",
          callback: (token: string) => onTokenRef.current(token),
        });
      } catch (err) {
        // Defense in depth — never let a third-party script's exception
        // escape uncaught, regardless of what triggered it.
        console.error("[Turnstile] render failed", err);
      }
    }

    if (window.turnstile) {
      render();
    } else {
      const existing = document.querySelector<HTMLScriptElement>('script[src^="https://challenges.cloudflare.com/turnstile"]');
      if (existing) {
        existing.addEventListener("load", render, { once: true });
      } else {
        const script = document.createElement("script");
        script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
        script.async = true;
        script.onload = render;
        document.head.appendChild(script);
      }
    }

    return () => {
      cancelled = true;
      if (widgetId.current && window.turnstile) window.turnstile.remove(widgetId.current);
    };
  }, [siteKey]);

  useImperativeHandle(ref, () => ({
    execute: () => {
      if (widgetId.current && window.turnstile) window.turnstile.execute(widgetId.current);
    },
    reset: () => {
      if (widgetId.current && window.turnstile) window.turnstile.reset(widgetId.current);
    },
  }));

  // In-flow placement right under the paste form: with `appearance:
  // "execute"` the widget collapses to ~0 height and is invisible until
  // `execute()` actually runs a challenge, so sitting it here doesn't
  // shift the rest of the page — it only ever appears (e.g. the test
  // key's "Success!" watermark, or a real interactive challenge) right
  // next to the Download button that triggered it, not floating
  // unanchored over unrelated content further down the page.
  return <div ref={containerRef} className="mx-auto flex justify-center" />;
});
