"use client";

import { useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { DEX_BREATH_PERIOD, DEX_PERCH } from "../../shared/constants";
import { useHeroStore } from "../../shared/hero-store";
import { useCssColor } from "../../shared/use-css-color";
import { bootProgressRef } from "../../shared/refs";
import { smoothstep } from "../../shared/ease";
import type { DexState } from "../../shared/types";

/**
 * Dex — the body only (docs/22 §13 seam: the mind stays in
 * features/dex). A small accent-emissive sphere + the scene's only
 * small caster. Breath = the one permitted loop (2.4s).
 *
 * Awakening (bible §6.2, §8.2): Dex brightens with the narrative —
 * dim while resting, brighter when curious, full at the handoff — and
 * fades in LAST during boot (after the room and the graph). The change
 * is eased, never a snap. Drift is Full-tier only (sheds with nodeDrift);
 * reduced motion renders on demand, so at rest no frames advance.
 */

const STATE_GLOW: Record<DexState, number> = {
  resting: 0.9,
  curious: 1.7,
  introducing: 2.2,
  active: 2.7,
};
const STATE_SCALE: Record<DexState, number> = {
  resting: 1,
  curious: 1.06,
  introducing: 1.1,
  active: 1.16,
};

export function DexPlaceholder() {
  const group = useRef<THREE.Group>(null);
  const mat = useRef<THREE.MeshStandardMaterial>(null);
  const light = useRef<THREE.PointLight>(null);
  const glow = useRef(STATE_GLOW.resting);
  const scale = useRef(1);
  const accent = useCssColor("--interactive-default", "#3e8eff");

  useFrame(({ clock }, dt) => {
    const t = clock.elapsedTime;
    const { dexState, quality } = useHeroStore.getState();
    const boot = smoothstep(0.5, 1, bootProgressRef.current);

    // Ease glow + scale toward the state's targets (awaken, don't snap).
    const k = 1 - Math.exp(-dt / 0.35);
    glow.current += (STATE_GLOW[dexState] - glow.current) * k;
    scale.current += (STATE_SCALE[dexState] - scale.current) * k;

    const breath = 1 + 0.2 * Math.sin((t * Math.PI * 2) / DEX_BREATH_PERIOD);
    const emissive = glow.current * breath * boot;
    if (mat.current) mat.current.emissiveIntensity = emissive;
    if (light.current) light.current.intensity = 0.9 * emissive;

    const g = group.current;
    if (!g) return;
    const s = scale.current * (0.4 + 0.6 * boot);
    g.scale.setScalar(s);
    if (quality.nodeDrift) {
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
          ref={mat}
          color={accent}
          emissive={accent}
          emissiveIntensity={0.9}
          roughness={0.4}
          toneMapped={false}
        />
      </mesh>
      {/* Presence as illumination — the only small caster (docs/18 §5) */}
      <pointLight ref={light} color={accent} intensity={0.9} distance={2.2} />
    </group>
  );
}
