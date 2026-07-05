"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import {
  CAMERA_DAMPING,
  PARALLAX_MAX,
  PLACEHOLDER_NODES,
  RAIL_STATIONS,
  RM_STATIONS,
} from "../../shared/constants";
import {
  pointerRef,
  railPositionRef,
  scrollProgressRef,
} from "../../shared/refs";
import { useHeroStore } from "../../shared/hero-store";

/**
 * Camera Rail (docs/22 §5-6): camera = rail(t) ⊕ parallax(pointer).
 *
 * - The rail is a code-authored CatmullRom stand-in over the five
 *   act stations. SWAP TARGET: samples from `cam_rail.glb` (docs/21
 *   §13) via the manifest — same sampler, authored data.
 * - Native scroll drives t; damping ≤150ms; scrub-back is free.
 * - Reduced motion: snap to the nearest station (the stations model).
 * - Keyboard focus on a node overrides the aim (focus drives camera).
 * - No roll, ever (we only position + lookAt; up stays +Y).
 */
export function CameraRail() {
  const posCurve = useMemo(
    () =>
      new THREE.CatmullRomCurve3(
        RAIL_STATIONS.map((s) => new THREE.Vector3(...s.pos)),
        false,
        "centripetal",
      ),
    [],
  );
  const aimCurve = useMemo(
    () =>
      new THREE.CatmullRomCurve3(
        RAIL_STATIONS.map((s) => new THREE.Vector3(...s.aim)),
        false,
        "centripetal",
      ),
    [],
  );

  const damped = useRef(0);
  const pos = useRef(new THREE.Vector3());
  const aim = useRef(new THREE.Vector3());
  const focusAim = useRef(new THREE.Vector3());

  useFrame(({ camera }, dt) => {
    const { reducedMotion, focusedNode, quality, tier } =
      useHeroStore.getState();

    let target = scrollProgressRef.current;
    if (reducedMotion) {
      // Stations model: nearest composed keyframe, no glide.
      target = RM_STATIONS.reduce((nearest, s) =>
        Math.abs(s - target) < Math.abs(nearest - target) ? s : nearest,
      );
      damped.current = target;
    } else {
      // Exponential damping toward scroll truth (≤150ms constant).
      const k = 1 - Math.exp(-dt / CAMERA_DAMPING);
      damped.current += (target - damped.current) * k;
    }
    railPositionRef.current = damped.current;

    posCurve.getPoint(damped.current, pos.current);
    aimCurve.getPoint(damped.current, aim.current);

    // Focus drives camera (docs/22 §12): aim eases to the focused node.
    if (focusedNode) {
      const node = PLACEHOLDER_NODES.find((n) => n.id === focusedNode);
      if (node) {
        focusAim.current.set(...node.position);
        aim.current.lerp(focusAim.current, 0.85);
      }
    }

    camera.position.copy(pos.current);

    // Parallax head: ≤2°, damped by the frame lerp above, Tier 2 only.
    if (quality.parallax && tier === 2 && !reducedMotion) {
      const p = pointerRef.current;
      camera.position.x += p.x * 0.08;
      camera.position.y += -p.y * 0.05;
    }

    camera.lookAt(aim.current);
    // Belt-and-braces roll lock (vestibular law): up is always +Y.
    camera.up.set(0, 1, 0);
    void PARALLAX_MAX; // rotational variant reserved for look-dev
  });

  return null;
}
