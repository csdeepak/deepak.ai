"use client";

import { useCallback, useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { useHeroStore } from "../../shared/hero-store";
import { useCssColor } from "../../shared/use-css-color";
import { bootProgressRef } from "../../shared/refs";
import { nodeReveal, smoothstep } from "../../shared/ease";
import {
  BOOT,
  GROUP_ACT,
  NODE_HOVER_SCALE,
  NODE_RADIUS,
  PLACEHOLDER_EDGES,
  PLACEHOLDER_NODES,
} from "../../shared/constants";

/**
 * Knowledge graph (docs/22 §8 · bible §6.4): ONE InstancedMesh for all
 * nodes + ONE merged line geometry for edges — the 2-draw-call target.
 * SWAP TARGET: node data becomes real ContentService output; the
 * material becomes the drafted-line shader pass.
 *
 * Visual law — LUMINANCE, NOT HUE (bible §3.2, §6.4): nodes are UNLIT
 * (they emit their own brightness, like data in a dark room). Recency =
 * brightness. The accent appears ONLY on the active (hovered/focused)
 * node. Groups illuminate as their act is reached (bible §6.2). During
 * boot each node draws in, staggered outward from the Twin (§6.2).
 *
 * Cost: instances are rewritten only while booting OR when
 * hover/focus/act changes — otherwise the graph is still (calm at rest).
 */
export function GraphPlaceholder() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const edgeMatRef = useRef<THREE.LineBasicMaterial>(null);
  const setHoveredNode = useHeroStore((s) => s.setHoveredNode);

  const dimHex = useCssColor("--scene-node-dim", "#2b3038");
  const brightHex = useCssColor("--scene-node-bright", "#eef3fb");
  const accentHex = useCssColor("--interactive-default", "#3e8eff");

  // Scratch objects — allocated once, reused every write (no GC churn).
  const scratch = useMemo(
    () => ({
      m: new THREE.Matrix4(),
      dim: new THREE.Color(),
      bright: new THREE.Color(),
      accent: new THREE.Color(),
      out: new THREE.Color(),
    }),
    [],
  );
  const lastKey = useRef("");

  const write = useCallback(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const { m, dim, bright, accent, out } = scratch;
    dim.set(dimHex);
    bright.set(brightHex);
    accent.set(accentHex);

    const { hoveredNode, focusedNode, act } = useHeroStore.getState();
    const b = bootProgressRef.current;

    PLACEHOLDER_NODES.forEach((node, i) => {
      const reveal = nodeReveal(
        node.birth,
        b,
        BOOT.nodeRevealWindow,
        BOOT.nodeRevealSoftness,
      );
      const active = node.id === hoveredNode || node.id === focusedNode;
      const scale = reveal * NODE_RADIUS * (active ? NODE_HOVER_SCALE : 1);
      m.makeScale(scale, scale, scale);
      m.setPosition(node.position[0], node.position[1], node.position[2]);
      mesh.setMatrixAt(i, m);

      // Group illuminates once its act is reached (bible §6.2).
      const actReached = act >= GROUP_ACT[node.group];
      const brightness = node.luminance * (actReached ? 1 : 0.4);
      out.copy(dim).lerp(bright, brightness);
      if (active) out.copy(accent);
      // Draw-in glow: unborn nodes read black (scale is also 0).
      out.multiplyScalar(reveal);
      mesh.setColorAt(i, out);
    });

    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    mesh.computeBoundingSphere();

    if (edgeMatRef.current) {
      edgeMatRef.current.opacity = 0.3 * smoothstep(0.25, 1, b);
    }
  }, [scratch, dimHex, brightHex, accentHex]);

  // Initial paint: hidden (animated boot) or full (instant/RM) — never a
  // one-frame cluster at the origin.
  useLayoutEffect(() => {
    write();
  }, [write]);

  useFrame(() => {
    const { hoveredNode, focusedNode, act } = useHeroStore.getState();
    const b = bootProgressRef.current;
    const key = `${hoveredNode}|${focusedNode}|${act}`;
    // Rewrite while booting, or when interaction/act changed. Else idle.
    if (b < 1) {
      write();
      lastKey.current = key;
      return;
    }
    if (key !== lastKey.current) {
      write();
      lastKey.current = key;
    }
  });

  const onMove = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    const id =
      e.instanceId !== undefined
        ? (PLACEHOLDER_NODES[e.instanceId]?.id ?? null)
        : null;
    setHoveredNode(id);
    document.body.style.cursor = id ? "pointer" : "";
  };
  const onOut = () => {
    setHoveredNode(null);
    document.body.style.cursor = "";
  };

  // Edges: one merged geometry (single draw call).
  const edgeGeometry = useMemo(() => {
    const positions = new Float32Array(PLACEHOLDER_EDGES.length * 6);
    PLACEHOLDER_EDGES.forEach(([a, b], i) => {
      const pa = PLACEHOLDER_NODES[a]?.position ?? [0, 0, 0];
      const pb = PLACEHOLDER_NODES[b]?.position ?? [0, 0, 0];
      positions.set([...pa, ...pb], i * 6);
    });
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return geometry;
  }, []);
  useLayoutEffect(() => () => edgeGeometry.dispose(), [edgeGeometry]);

  return (
    <group>
      <instancedMesh
        ref={meshRef}
        args={[undefined, undefined, PLACEHOLDER_NODES.length]}
        onPointerMove={onMove}
        onPointerOut={onOut}
      >
        <sphereGeometry args={[1, 16, 16]} />
        {/* Unlit: brightness IS the datum (luminance, not hue).
            Per-instance colour comes from setColorAt → instanceColor. */}
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>
      <lineSegments geometry={edgeGeometry}>
        <lineBasicMaterial
          ref={edgeMatRef}
          color={dimHex}
          transparent
          opacity={0}
          toneMapped={false}
        />
      </lineSegments>
    </group>
  );
}
