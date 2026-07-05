"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import type { ThreeEvent } from "@react-three/fiber";
import { useHeroStore } from "../../shared/hero-store";
import { useCssColor } from "../../shared/use-css-color";
import {
  NODE_HOVER_SCALE,
  NODE_RADIUS,
  PLACEHOLDER_EDGES,
  PLACEHOLDER_NODES,
} from "../../shared/constants";

/**
 * Knowledge graph placeholder (docs/22 §8): ONE InstancedMesh for all
 * nodes + ONE merged line geometry for edges — the 2-draw-call target,
 * proven with stand-in data. SWAP TARGET: node data becomes real
 * ContentService output; visuals become the drafted-line shader pass.
 *
 * Hover: raycast via R3F instanced events → instanceId → store
 * (discrete). Halo response here = scale + color step (stand-in for
 * the shader halo).
 */
export function GraphPlaceholder() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const hovered = useHeroStore((s) => s.hoveredNode);
  const focused = useHeroStore((s) => s.focusedNode);
  const setHoveredNode = useHeroStore((s) => s.setHoveredNode);

  const inkColor = useCssColor("--text-faint", "#9aa1ab");
  const accentColor = useCssColor("--interactive-default", "#2563eb");

  // Static instance transforms + luminance-tinted colors, set once.
  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const m = new THREE.Matrix4();
    const base = new THREE.Color(inkColor);
    const accent = new THREE.Color(accentColor);
    const tmp = new THREE.Color();

    PLACEHOLDER_NODES.forEach((node, i) => {
      const active = node.id === hovered || node.id === focused;
      const scale = active ? NODE_HOVER_SCALE : 1;
      m.makeScale(scale, scale, scale);
      m.setPosition(...node.position);
      mesh.setMatrixAt(i, m);
      // Luminance = recency (stand-in): lerp ink → accent by luminance,
      // full accent when active.
      tmp.copy(base).lerp(accent, active ? 1 : node.luminance * 0.5);
      mesh.setColorAt(i, tmp);
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    mesh.computeBoundingSphere();
  }, [hovered, focused, inkColor, accentColor]);

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
  useEffect(() => () => edgeGeometry.dispose(), [edgeGeometry]);

  return (
    <group>
      <instancedMesh
        ref={meshRef}
        args={[undefined, undefined, PLACEHOLDER_NODES.length]}
        onPointerMove={onMove}
        onPointerOut={onOut}
      >
        <sphereGeometry args={[NODE_RADIUS, 16, 16]} />
        <meshStandardMaterial roughness={0.9} metalness={0} />
      </instancedMesh>
      <lineSegments geometry={edgeGeometry}>
        <lineBasicMaterial color={inkColor} transparent opacity={0.35} />
      </lineSegments>
    </group>
  );
}
