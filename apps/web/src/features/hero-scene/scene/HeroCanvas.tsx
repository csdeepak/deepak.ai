"use client";

import { Suspense, useEffect } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { Atmosphere } from "./objects/Atmosphere";
import { LightRig } from "./objects/LightRig";
import { GraphPlaceholder } from "./objects/GraphPlaceholder";
import { TwinPlaceholder } from "./objects/TwinPlaceholder";
import { DexPlaceholder } from "./objects/DexPlaceholder";
import { ParticlesPlaceholder } from "./objects/ParticlesPlaceholder";
import { CameraRail } from "./camera/CameraRail";
import { PerfGovernor } from "./systems/perf-governor";
import { AnchorProjector } from "./systems/anchor-projector";
import { useHeroStore } from "../shared/hero-store";
import type { Frameloop } from "../shared/types";

/**
 * HeroCanvas — the lazy 3D chunk's root (docs/22 §3). Everything here
 * is procedural or placeholder; the DOM never waits on any of it.
 * Frameloop is controlled by the region (visibility/RM policy §9).
 */
export default function HeroCanvas({ frameloop }: { frameloop: Frameloop }) {
  return (
    <Canvas
      frameloop={frameloop}
      dpr={[1, 2]}
      camera={{ fov: 45, near: 0.1, far: 40, position: [0, 1.6, 7.5] }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      aria-hidden
      className="pointer-events-auto"
    >
      <ContextLossGuard />
      <Atmosphere />
      <LightRig />
      <GraphPlaceholder />
      {/*
       * Asset boundary (docs/22 §10): when real GLBs exist, the twin
       * mounts here behind Suspense with the silhouette as fallback.
       * The placeholder needs no assets, so Suspense is inert — but
       * the seam is fixed now (the swap is a child change, not a
       * structure change).
       */}
      <Suspense fallback={<TwinPlaceholder />}>
        <TwinPlaceholder />
      </Suspense>
      <DexPlaceholder />
      <ParticlesPlaceholder />
      <CameraRail />
      <PerfGovernor />
      <AnchorProjector />
    </Canvas>
  );
}

/**
 * Context-loss guard (docs/22 §14): one silent restore attempt; a
 * second loss resolves the ladder downward (canvas unmounts, Tier 0
 * DOM remains).
 */
function ContextLossGuard() {
  const gl = useThree((s) => s.gl);

  useEffect(() => {
    const el = gl.domElement;
    let losses = 0;

    const onLost = (e: Event) => {
      e.preventDefault(); // permit restoration
      losses += 1;
      if (losses > 1) useHeroStore.getState().failCanvas();
    };
    el.addEventListener("webglcontextlost", onLost);
    return () => el.removeEventListener("webglcontextlost", onLost);
  }, [gl]);

  return null;
}
