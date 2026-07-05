"use client";

import { useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { DEX_BREATH_PERIOD, DEX_PERCH } from "../../shared/constants";
import { useHeroStore } from "../../shared/hero-store";
import { useCssColor } from "../../shared/use-css-color";

/**
 * Dex — the body only (docs/22 §13 seam: the mind stays in
 * features/dex). A small accent-emissive sphere + the scene's only
 * small caster. Breath = the one permitted loop (2.4s); resting
 * drift is a slow offset around the perch (sheds with nodeDrift).
 * Reduced motion: static dot (breath handled by frameloop="demand" —
 * no frames render at rest).
 */
export function DexPlaceholder() {
  const group = useRef<THREE.Group>(null);
  const light = useRef<THREE.PointLight>(null);
  const accent = useCssColor("--interactive-default", "#2563eb");

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const breath =
      1 + 0.2 * Math.sin((t * Math.PI * 2) / DEX_BREATH_PERIOD);
    if (light.current) light.current.intensity = 1.4 * breath;

    const g = group.current;
    if (!g) return;
    const { quality } = useHeroStore.getState();
    if (quality.nodeDrift) {
      // Slow habitat drift (≥8s period, sub-perceptual radius)
      g.position.x = DEX_PERCH[0] + Math.sin(t * 0.35) * 0.12;
      g.position.y = DEX_PERCH[1] + Math.sin(t * 0.22) * 0.08;
      g.position.z = DEX_PERCH[2] + Math.cos(t * 0.28) * 0.1;
    } else {
      g.position.set(...DEX_PERCH);
    }
  });

  return (
    <group ref={group} position={DEX_PERCH}>
      <mesh>
        <sphereGeometry args={[0.06, 24, 24]} />
        <meshStandardMaterial
          color={accent}
          emissive={accent}
          emissiveIntensity={1.6}
          roughness={0.4}
        />
      </mesh>
      {/* Presence as illumination — the only small caster (docs/18 §5) */}
      <pointLight ref={light} color={accent} intensity={1.4} distance={2.2} />
    </group>
  );
}
