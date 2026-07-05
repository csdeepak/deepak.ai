"use client";

import { useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { PLACEHOLDER_NODES } from "../../shared/constants";
import { railPositionRef, scrollProgressRef } from "../../shared/refs";
import { useHeroStore } from "../../shared/hero-store";
import type { NodeAnchor } from "../../shared/types";

const REST_EPSILON = 0.002;

/**
 * Anchor Projector (docs/22 §12): projects node world positions to
 * screen space for the DOM FocusProxies — recomputed at rail
 * REST-POINTS ONLY, never per frame. Keyboard users travel by focus,
 * not by scroll; anchors updating mid-travel would be wasted work.
 */
export function AnchorProjector() {
  const { camera, size } = useThree();
  const dirty = useRef(true);
  const lastRail = useRef(-1);
  const v = useRef(new THREE.Vector3());

  useFrame(() => {
    const rail = railPositionRef.current;
    if (Math.abs(rail - lastRail.current) > REST_EPSILON) {
      dirty.current = true;
      lastRail.current = rail;
      return;
    }
    // At rest (rail caught up with scroll) and something moved since.
    const atRest = Math.abs(scrollProgressRef.current - rail) < REST_EPSILON;
    if (!atRest || !dirty.current) return;
    dirty.current = false;

    const anchors: Record<string, NodeAnchor> = {};
    for (const node of PLACEHOLDER_NODES) {
      v.current.set(...node.position).project(camera);
      const visible = v.current.z < 1 && Math.abs(v.current.x) <= 1.05;
      anchors[node.id] = {
        x: ((v.current.x + 1) / 2) * size.width,
        y: ((1 - v.current.y) / 2) * size.height,
        visible,
      };
    }
    useHeroStore.getState().setAnchors(anchors);
  });

  return null;
}
