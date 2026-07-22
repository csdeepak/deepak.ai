"use client";

import { useEffect, useState } from "react";
import { ACT_BREAKPOINTS, HERO_REGION_VH } from "./constants";

/**
 * useScrollAct — the self-contained, dependency-free driver for the
 * Arrival sub-line (D-050 amendment).
 *
 * Replaces the old `useHeroStore((s) => s.act)` coupling: when the ambient
 * R3F scene was removed from `/`, the scene's scroll rail — which used to
 * publish `act` — went with it. This reads NATIVE scroll position only
 * (the animation doctrine: "native scroll owns truth; no hijack") and
 * maps it to a discrete act index for a plain text swap. No GSAP, no
 * Lenis, no library of any kind.
 *
 * Reduced motion: holds act 0 (stillness is the default) and attaches no
 * scroll listener at all.
 */
export function useScrollAct(): number {
  const [act, setAct] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    const compute = () => {
      raf = 0;
      const span =
        (HERO_REGION_VH / 100) * window.innerHeight - window.innerHeight;
      const p = span > 0 ? Math.min(1, Math.max(0, window.scrollY / span)) : 0;
      let next = 0;
      for (let i = ACT_BREAKPOINTS.length - 1; i >= 0; i--) {
        const bp = ACT_BREAKPOINTS[i];
        if (bp !== undefined && p >= bp) {
          next = i;
          break;
        }
      }
      setAct((prev) => (prev === next ? prev : next));
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(compute);
    };

    compute();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return act;
}
