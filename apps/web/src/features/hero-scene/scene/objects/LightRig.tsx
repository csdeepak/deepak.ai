"use client";

import { useHeroStore } from "../../shared/hero-store";
import { BENCH_POS } from "../../shared/constants";

/**
 * Lighting rig (docs/20 §3 approximated with runtime lights):
 * key ("the window", warm, upper-left) · atmosphere fill (ambient) ·
 * task pool (warm spot on the bench) · separation hairlight (cool,
 * behind-above, capped).
 *
 * Stand-in values; look-dev calibrates against the moodboard's Kelvin
 * targets. Time-of-day drift (Full tier) arrives with look-dev.
 */
export function LightRig() {
  const debugKey = useHeroStore((s) => s.debug.keyIntensity);

  return (
    <>
      {/* Key — soft warm, azimuth ~30° camera-left, elevation ~40° */}
      <directionalLight
        position={[-4, 5, 3]}
        intensity={debugKey ?? 2.2}
        color="#fff2e2"
      />
      {/* Fill — atmosphere ambient, never dramatic */}
      <ambientLight intensity={0.35} />
      {/* Task pool — the warm heart on the bench (docs/18 §3) */}
      <spotLight
        position={[BENCH_POS[0] + 0.4, 2.4, BENCH_POS[2] + 0.8]}
        target-position={BENCH_POS}
        angle={0.5}
        penumbra={0.8}
        intensity={8}
        distance={6}
        color="#ffd9a8"
      />
      {/* Separation hairlight — cool, behind-above, ≤15% of key (D-032) */}
      <directionalLight
        position={[2, 4, -5]}
        intensity={0.3}
        color="#dbe6f5"
      />
    </>
  );
}
