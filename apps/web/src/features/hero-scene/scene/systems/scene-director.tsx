"use client";

import { useEffect, useRef } from "react";
import { invalidate, useFrame } from "@react-three/fiber";
import { BOOT } from "../../shared/constants";
import { bootProgressRef } from "../../shared/refs";
import { useHeroStore } from "../../shared/hero-store";
import type { DexState } from "../../shared/types";

/**
 * Scene Director (bible §6.2) — the headless conductor of the scene's
 * life. Two jobs, no rendering:
 *
 *  1. THE BOOT (Act I). Drives `bootProgressRef` 0→1 over BOOT.durationMs
 *     — the "workspace comes online" moment. Once per session
 *     (sessionStorage), instant under reduced motion, and skippable on
 *     the first scroll / pointer / key intent (never trap the visitor).
 *
 *  2. ACT → DEX. Dex awakens with the narrative: resting through the
 *     early acts, curious as the research glows, active at the handoff
 *     (bible §6.2 Act V). Discrete transitions only, set on change.
 *
 * `bootProgressRef` is set SYNCHRONOUSLY on first render (before sibling
 * objects render) so the very first paint is correct in every path:
 * full for an instant boot, dark for the animated one.
 */
export function SceneDirector() {
  const elapsed = useRef(0);
  const done = useRef(false);
  const instant = useRef<boolean | null>(null);
  const skip = useRef(false);
  const lastDex = useRef<DexState>("resting");

  // Lazy, synchronous init — runs once in render, before object siblings.
  if (instant.current === null) {
    const already =
      typeof sessionStorage !== "undefined" &&
      sessionStorage.getItem(BOOT.sessionKey) === "1";
    const rm = useHeroStore.getState().reducedMotion;
    instant.current = already || rm;
    bootProgressRef.current = instant.current ? 1 : 0;
    done.current = instant.current;
  }

  // Instant path: mark live and force one render for demand frameloop (RM).
  useEffect(() => {
    if (!done.current) return;
    useHeroStore.getState().finishBoot();
    invalidate();
  }, []);

  // Skip intent — the visitor takes over; the boot yields immediately.
  useEffect(() => {
    if (done.current) return;
    const onIntent = () => {
      skip.current = true;
    };
    window.addEventListener("wheel", onIntent, { passive: true });
    window.addEventListener("pointerdown", onIntent, { passive: true });
    window.addEventListener("keydown", onIntent);
    return () => {
      window.removeEventListener("wheel", onIntent);
      window.removeEventListener("pointerdown", onIntent);
      window.removeEventListener("keydown", onIntent);
    };
  }, []);

  useFrame((_, dt) => {
    // ── 1. Boot ──
    if (!done.current) {
      elapsed.current = skip.current
        ? BOOT.durationMs
        : elapsed.current + dt * 1000;
      const p = Math.min(1, elapsed.current / BOOT.durationMs);
      bootProgressRef.current = p;
      if (p >= 1) {
        done.current = true;
        if (typeof sessionStorage !== "undefined") {
          sessionStorage.setItem(BOOT.sessionKey, "1");
        }
        useHeroStore.getState().finishBoot();
      }
    }

    // ── 2. Act → Dex (discrete, set-on-change) ──
    const act = useHeroStore.getState().act;
    const next: DexState =
      act >= 4 ? "active" : act === 3 ? "curious" : "resting";
    if (next !== lastDex.current) {
      lastDex.current = next;
      useHeroStore.getState().setDexState(next);
    }
  });

  return null;
}
