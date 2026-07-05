"use client";

import { useEffect, type RefObject } from "react";
import { scrollProgressRef } from "../shared/refs";
import { useHeroStore } from "../shared/hero-store";
import { ACT_THRESHOLDS } from "../shared/constants";
import type { ActIndex } from "../shared/types";

/**
 * Scroll Bridge (docs/22 §5): native scroll owns truth. A passive
 * listener + rAF writes progress (0–1) to the shared ref; acts are
 * derived as discrete threshold crossings into the store. No scroll
 * hijacking exists anywhere in this system.
 */
export function useScrollBridge(
  regionRef: RefObject<HTMLElement | null>,
  enabled: boolean,
) {
  useEffect(() => {
    if (!enabled) return;
    const region = regionRef.current;
    if (!region) return;

    let raf = 0;
    let scheduled = false;

    const measure = () => {
      scheduled = false;
      const rect = region.getBoundingClientRect();
      const travel = rect.height - window.innerHeight;
      const progress =
        travel <= 0 ? 0 : Math.min(1, Math.max(0, -rect.top / travel));
      scrollProgressRef.current = progress;

      // Derived, discrete: act index from thresholds.
      let act: ActIndex = 0;
      for (let i = ACT_THRESHOLDS.length - 1; i >= 0; i--) {
        const t = ACT_THRESHOLDS[i];
        if (t !== undefined && progress >= t) {
          act = i as ActIndex;
          break;
        }
      }
      useHeroStore.getState().setAct(act);
    };

    const onScroll = () => {
      if (!scheduled) {
        scheduled = true;
        raf = requestAnimationFrame(measure);
      }
    };

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [regionRef, enabled]);
}
