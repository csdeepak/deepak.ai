"use client";

import { BENCH_POS, TWIN_POS } from "../../shared/constants";
import { heroAssets } from "../assets/manifest";

/**
 * The Twin + bench — placeholder stand-ins (Sprint H-01).
 *
 * SWAP CONTRACT (docs/22 §10-11): when `heroAssets.twin.lod2` is
 * non-null, this component becomes the Suspense-wrapped progressive
 * GLB loader (silhouette → LOD1 → LOD0, never swapping while
 * observed). Until then: a capsule at the seated position and a box
 * bench — enough to prove camera framing, lighting, and occlusion.
 */
export function TwinPlaceholder() {
  // Future: if (heroAssets.twin.lod2) return <TwinGLB/>;
  void heroAssets;

  return (
    <group>
      {/* The Twin — seated-scale capsule (≈1.3m seated height) */}
      <mesh position={TWIN_POS} castShadow={false}>
        <capsuleGeometry args={[0.22, 0.65, 8, 16]} />
        {/* Warm ceramic stand-in (docs/20 §2) */}
        <meshStandardMaterial color="#8a8078" roughness={0.8} metalness={0} />
      </mesh>
      {/* Bench — box stand-in at working height (0.74m top) */}
      <mesh position={[BENCH_POS[0], 0.37, BENCH_POS[2]]}>
        <boxGeometry args={[1.4, 0.74, 0.7]} />
        <meshStandardMaterial color="#3a3f47" roughness={0.9} metalness={0} />
      </mesh>
      {/* Dock marker — the artifact socket (docs/21 §5 DOCK_socket) */}
      <mesh position={[BENCH_POS[0] - 0.3, 0.82, BENCH_POS[2]]}>
        <icosahedronGeometry args={[0.09, 0]} />
        <meshStandardMaterial color="#6b7280" roughness={0.85} />
      </mesh>
    </group>
  );
}
