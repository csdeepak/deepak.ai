"use client";

import { BENCH_POS, TWIN_POS } from "../../shared/constants";
import { useCssColor } from "../../shared/use-css-color";
import { heroAssets } from "../assets/manifest";

/**
 * The Twin + bench — placeholder stand-ins (bible §7).
 *
 * SWAP CONTRACT (docs/22 §10-11): when `heroAssets.twin.lod2` is
 * non-null, this component becomes the Suspense-wrapped progressive
 * GLB loader (silhouette → LOD1 → LOD0, never swapping while
 * observed). Until then: a capsule at the seated position and a box
 * bench — enough to prove camera framing, lighting, and occlusion.
 *
 * The Twin is LIT (meshStandardMaterial), unlike the unlit graph — the
 * human is a real object catching the key + task light, graphite-
 * neutral so the only warmth on it is the task-light (bible §7.2).
 * Materials read design tokens (no hex in scene code, D-025).
 */
export function TwinPlaceholder() {
  // Future: if (heroAssets.twin.lod2) return <TwinGLB/>;
  void heroAssets;

  const twinColor = useCssColor("--scene-twin", "#9aa0a8");
  const benchColor = useCssColor("--scene-bench", "#3a3f47");

  return (
    <group>
      {/* The Twin — seated-scale capsule (≈1.3m seated height) */}
      <mesh position={TWIN_POS}>
        <capsuleGeometry args={[0.22, 0.65, 8, 16]} />
        {/* Matte ceramic stand-in (bible §7.2): no metalness, high roughness */}
        <meshStandardMaterial color={twinColor} roughness={0.8} metalness={0} />
      </mesh>
      {/* Bench — box stand-in at working height (0.74m top) */}
      <mesh position={[BENCH_POS[0], 0.37, BENCH_POS[2]]}>
        <boxGeometry args={[1.4, 0.74, 0.7]} />
        <meshStandardMaterial color={benchColor} roughness={0.9} metalness={0} />
      </mesh>
      {/* Dock marker — the artifact socket (docs/21 §5 DOCK_socket) */}
      <mesh position={[BENCH_POS[0] - 0.3, 0.82, BENCH_POS[2]]}>
        <icosahedronGeometry args={[0.09, 0]} />
        <meshStandardMaterial color={benchColor} roughness={0.85} />
      </mesh>
    </group>
  );
}
