"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

/** Light/dark toggle — icon morph is a state change (docs/15 §6 icons). */
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // Stable placeholder pre-mount: zero layout shift (DSVL Law 16).
  // Matches the mounted button's box exactly, including the touch padding.
  if (!mounted) {
    return <span aria-hidden className="inline-block size-11" />;
  }

  const isDark = resolvedTheme === "dark";
  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      // size-11 (44px) is the touch target; the icon stays 18px, so this
      // reads identically and simply stops being a 32px miss on a phone.
      className="inline-flex size-11 items-center justify-center rounded-sm text-muted transition-colors duration-(--duration-fast) hover:bg-surface hover:text-ink"
    >
      {isDark ? <Sun size={18} aria-hidden /> : <Moon size={18} aria-hidden />}
    </button>
  );
}
