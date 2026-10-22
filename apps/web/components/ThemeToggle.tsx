"use client";

import { useState } from "react";
import { IconMoon, IconSun } from "./icons";

function initialTheme(): "dark" | "light" {
  // No `document` during SSR — ThemeScript has already set the real
  // value on <html> by the time this renders on the client, so reading
  // it synchronously here (instead of via an effect) avoids both a
  // cascading extra render and a flash of the wrong icon.
  if (typeof document === "undefined") return "dark";
  const current = document.documentElement.getAttribute("data-theme");
  return current === "light" ? "light" : "dark";
}

export function ThemeToggle({ toLightLabel, toDarkLabel }: { toLightLabel: string; toDarkLabel: string }) {
  const [theme, setTheme] = useState<"dark" | "light">(initialTheme);

  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("xl-theme", next);
    } catch {
      // Private browsing / storage disabled — the toggle still works for
      // this page view, it just won't persist.
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={theme === "dark" ? toLightLabel : toDarkLabel}
      className="flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--bd)] bg-[var(--sf)] text-[var(--tx)]"
    >
      {/* Server-rendered markup always assumes "dark" (no access to the
          visitor's stored preference); a light-theme visitor's first
          client render legitimately differs, which React would otherwise
          flag as a hydration mismatch. */}
      <span suppressHydrationWarning>{theme === "dark" ? <IconMoon /> : <IconSun />}</span>
    </button>
  );
}
