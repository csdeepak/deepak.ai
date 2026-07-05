"use client";

import { useEffect, useState } from "react";

/** SSR-safe media query hook. Returns false until mounted. */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(query);
    setMatches(mql.matches);
    const onChange = (e: MediaQueryListEvent) => setMatches(e.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [query]);

  return matches;
}

/** Mobile = below `break.sm` (640px, docs/15 §2.5). */
export function useIsMobile(): boolean {
  return useMediaQuery("(max-width: 639px)");
}
