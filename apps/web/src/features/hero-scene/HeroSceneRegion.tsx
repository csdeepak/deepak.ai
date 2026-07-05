"use client";

import dynamic from "next/dynamic";
import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { decideTier } from "./gate";
import { useHeroStore } from "./shared/hero-store";
import { useScrollBridge } from "./systems/scroll-bridge";
import { usePointerBridge } from "./systems/pointer-bridge";
import { SceneOverlay } from "./overlay/SceneOverlay";
import { RAIL_REGION_VH } from "./shared/constants";
import type { Frameloop } from "./shared/types";

/**
 * HeroSceneRegion — the orchestrator (docs/22 §1-3).
 *
 * Layering law: `children` = the Tier-0 DOM content, always rendered,
 * complete without the canvas. The canvas mounts BEHIND it (Tier ≥1
 * only, lazy, after the gate) as pure enhancement. If the canvas
 * fails, unmounting it is the entire error story.
 */

// The ONLY import path to three.js — tier-gated, lazy, client-only.
const HeroCanvas = dynamic(() => import("./scene/HeroCanvas"), {
  ssr: false,
});

// Dev tooling: dead-code-eliminated from production builds.
const DevControls =
  process.env.NODE_ENV === "development"
    ? dynamic(() => import("./scene/systems/dev-controls"))
    : null;

export function HeroSceneRegion({ children }: { children: ReactNode }) {
  const regionRef = useRef<HTMLElement>(null);
  const tier = useHeroStore((s) => s.tier);
  const gateResolved = useHeroStore((s) => s.gateResolved);
  const reducedMotion = useHeroStore((s) => s.reducedMotion);
  const canvasFailed = useHeroStore((s) => s.canvasFailed);
  const setFocusedNode = useHeroStore((s) => s.setFocusedNode);

  const [visible, setVisible] = useState(true);
  const [pageVisible, setPageVisible] = useState(true);

  // The gate runs once, client-side, before any 3D import (docs/22 §2).
  useEffect(() => {
    const decision = decideTier();
    useHeroStore.getState().resolveGate(decision.tier, decision.reducedMotion);
  }, []);

  const sceneEnabled = gateResolved && tier >= 1 && !canvasFailed;

  useScrollBridge(regionRef, sceneEnabled);
  usePointerBridge(sceneEnabled && tier === 2);

  // Frameloop policy (docs/22 §9): pause off-viewport / hidden tab;
  // reduced motion renders on demand (station changes only).
  useEffect(() => {
    const region = regionRef.current;
    if (!region || !sceneEnabled) return;

    const io = new IntersectionObserver(
      ([entry]) => setVisible(entry?.isIntersecting ?? true),
      { rootMargin: "10%" },
    );
    io.observe(region);

    const onVisibility = () => setPageVisible(!document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [sceneEnabled]);

  // Esc yields the scene back (docs/22 §12).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFocusedNode(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setFocusedNode]);

  const frameloop: Frameloop = !(visible && pageVisible)
    ? "never"
    : reducedMotion
      ? "demand"
      : "always";

  return (
    <section
      ref={regionRef}
      style={{ minHeight: `${RAIL_REGION_VH}svh` }}
      className="relative"
    >
      <div className="sticky top-0 h-svh overflow-hidden">
        {/* Canvas behind (enhancement layer) */}
        {sceneEnabled && (
          <div className="absolute inset-0">
            <HeroCanvas frameloop={frameloop} />
          </div>
        )}

        {/* Tier-0 DOM content — always present, always complete */}
        <div className="pointer-events-none relative z-10 [&_a]:pointer-events-auto [&_button]:pointer-events-auto">
          {children}
        </div>

        {/* Overlay: captions + focus proxies */}
        {sceneEnabled && <SceneOverlay />}

        {DevControls && sceneEnabled && <DevControls />}
      </div>
    </section>
  );
}
