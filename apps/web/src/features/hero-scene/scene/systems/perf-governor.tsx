"use client";

import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { PERF } from "../../shared/constants";
import { useHeroStore } from "../../shared/hero-store";

/**
 * Performance Governor (docs/22 §9, D-036): headless system component.
 *
 * Degradation order: DPR steps down FIRST (resolution before features),
 * then quality flags shed in the bible's order (particles → lighting
 * drift → node drift → parallax). Recovery: sustained good fps restores
 * DPR steps, then full quality (Tier 2 only).
 *
 * Pause-when-hidden/off-viewport is handled upstream by the region's
 * frameloop control — the governor only manages in-frame quality.
 */
export function PerfGovernor() {
  const setDpr = useThree((s) => s.setDpr);
  const baseDpr = useRef(
    Math.min(typeof window !== "undefined" ? window.devicePixelRatio : 1, 2),
  );
  const dprScale = useRef(1);
  const frames = useRef(0);
  const elapsed = useRef(0);
  const goodSinceMs = useRef<number | null>(null);

  useFrame((_, dt) => {
    frames.current += 1;
    elapsed.current += dt;
    if (frames.current < PERF.sampleFrames) return;

    const fps = frames.current / elapsed.current;
    frames.current = 0;
    elapsed.current = 0;

    const store = useHeroStore.getState();

    if (fps < PERF.degradeBelowFps) {
      goodSinceMs.current = null;
      // Lever 1: resolution.
      if (dprScale.current > PERF.minDprScale) {
        dprScale.current = Math.max(
          PERF.minDprScale,
          dprScale.current - PERF.dprStep,
        );
        setDpr(baseDpr.current * dprScale.current);
        return;
      }
      // Lever 2: shed features in the bible's order.
      store.shedQuality();
      return;
    }

    if (fps > PERF.recoverAboveFps) {
      const now = performance.now();
      if (goodSinceMs.current === null) {
        goodSinceMs.current = now;
        return;
      }
      if (now - goodSinceMs.current >= PERF.recoverAfterMs) {
        goodSinceMs.current = null;
        if (dprScale.current < 1) {
          dprScale.current = Math.min(1, dprScale.current + PERF.dprStep);
          setDpr(baseDpr.current * dprScale.current);
        } else {
          store.restoreQuality();
        }
      }
    } else {
      goodSinceMs.current = null;
    }
  });

  return null;
}
