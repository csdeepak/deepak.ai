"use client";

import { useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useHeroStore } from "../../shared/hero-store";
import { useCssColor } from "../../shared/use-css-color";
import { bootProgressRef } from "../../shared/refs";
import { smoothstep } from "../../shared/ease";
import { BENCH_POS } from "../../shared/constants";

/**
 * Lighting rig (bible §6.5): ONE cool key + soft ambient fill + the
 * single warm task-light over the bench (the one warmth in a cool
 * world) + a capped cool separation rim. Colours come from the
 * `--scene-*` design tokens — no hex ever lives in scene code (D-025).
 *
 * Boot (bible §6.2): the room comes online — the key rises first, the
 * task-light warms a beat later. Read from `bootProgressRef`, so the
 * first paint is dark (animated boot) or full (instant/RM) with no flash.
 */

// Target intensities (rim ≤15% of key, D-032).
const KEY = 2.4;
const FILL = 0.28;
const TASK = 9;
const RIM = 0.34;

const keyEase = (b: number) => smoothstep(0, 0.8, b);
const taskEase = (b: number) => smoothstep(0.35, 1, b);
const fillEase = (b: number) => smoothstep(0, 0.9, b);

export function LightRig() {
  const debugKey = useHeroStore((s) => s.debug.keyIntensity);
  const keyColor = useCssColor("--scene-key", "#e6ecf6");
  const taskColor = useCssColor("--scene-task", "#ffb877");
  const rimColor = useCssColor("--scene-rim", "#cdddf5");

  const keyRef = useRef<THREE.DirectionalLight>(null);
  const fillRef = useRef<THREE.AmbientLight>(null);
  const taskRef = useRef<THREE.SpotLight>(null);
  const rimRef = useRef<THREE.DirectionalLight>(null);

  // First-paint intensities read boot synchronously (see SceneDirector).
  const b0 = bootProgressRef.current;

  useFrame(() => {
    const b = bootProgressRef.current;
    if (keyRef.current) keyRef.current.intensity = (debugKey ?? KEY) * keyEase(b);
    if (fillRef.current) fillRef.current.intensity = FILL * fillEase(b);
    if (taskRef.current) taskRef.current.intensity = TASK * taskEase(b);
    if (rimRef.current) rimRef.current.intensity = RIM * keyEase(b);
  });

  return (
    <>
      {/* Key — cool, azimuth ~30° camera-left, elevation ~40° */}
      <directionalLight
        ref={keyRef}
        position={[-4, 5, 3]}
        intensity={(debugKey ?? KEY) * keyEase(b0)}
        color={keyColor}
      />
      {/* Fill — atmosphere ambient, never dramatic */}
      <ambientLight ref={fillRef} intensity={FILL * fillEase(b0)} />
      {/* Task pool — the one warm heart, over the bench (bible §3.3) */}
      <spotLight
        ref={taskRef}
        position={[BENCH_POS[0] + 0.4, 2.4, BENCH_POS[2] + 0.8]}
        target-position={BENCH_POS}
        angle={0.5}
        penumbra={0.8}
        intensity={TASK * taskEase(b0)}
        distance={6}
        color={taskColor}
      />
      {/* Separation hairlight — cool, behind-above, ≤15% of key (D-032) */}
      <directionalLight
        ref={rimRef}
        position={[2, 4, -5]}
        intensity={RIM * keyEase(b0)}
        color={rimColor}
      />
    </>
  );
}
