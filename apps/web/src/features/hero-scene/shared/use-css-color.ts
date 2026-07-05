"use client";

import { useEffect, useState } from "react";

/**
 * Reads a CSS custom property (design token) as a color string and
 * tracks theme changes — the scene consumes the same token system as
 * the DOM (three-tier law, D-025): no hex ever lives in scene code.
 */
export function useCssColor(variable: string, fallback: string): string {
  const [color, setColor] = useState(fallback);

  useEffect(() => {
    const read = () => {
      const value = getComputedStyle(document.documentElement)
        .getPropertyValue(variable)
        .trim();
      if (value) setColor(value);
    };
    read();

    // Theme swaps toggle the `dark` class on <html>.
    const observer = new MutationObserver(read);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, [variable]);

  return color;
}
