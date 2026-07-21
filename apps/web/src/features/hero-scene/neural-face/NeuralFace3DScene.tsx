"use client";

/**
 * NeuralFace3DScene — the R3F canvas (D-052 Track 2). Dynamically imported
 * with `{ ssr:false }` so three.js + drei + postprocessing + meshline live in
 * a lazy client chunk and NEVER enter the First Load JS of `/`.
 *
 * Scroll integration: driven by `offsetRef` (0..1), a native-scroll progress
 * value written by the client wrapper. This is a deliberate substitute for
 * drei <ScrollControls> — ScrollControls owns its own scroll container, which
 * fights the document flow of the sections below the hero. Native scroll wins
 * literally, and the sections below keep flowing (docs/DESIGN_SYSTEM §4).
 *
 * Three beats over the offset:
 *   1) 0.00–0.32  the face — particle relief, idle drift, pointer parallax
 *   2) 0.32–0.60  the dive — camera on a CatmullRom rail into the eyes; the
 *                  surface cross-fades out while the inner network fades in
 *   3) 0.60–1.00  inside the network — glowing nodes, faint edges, travelling
 *                  pulses (meshline dashOffset), selective bloom
 */

import { useEffect, useMemo, type MutableRefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { MeshLineGeometry, MeshLineMaterial } from "meshline";
import * as THREE from "three";
import {
  BEAT,
  CAM_END_Z,
  CAM_START_Z,
  DPR_DESKTOP,
  DPR_MOBILE,
  GRAD_1,
  GRAD_2,
  PULSE_CONCURRENT,
  STAGE_COLOR,
  SURFACE_TINT,
} from "./constants";
import { surfaceFragmentShader, surfaceVertexShader } from "./shaders";
import {
  decodeInnerPositions,
  decodeSurface,
  type HeroFace3D,
} from "./types";

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
function smoothstep(a: number, b: number, x: number) {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
}
function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

interface SceneProps {
  data: HeroFace3D;
  tier: 0 | 1 | 2;
  offsetRef: MutableRefObject<number>;
  /** Called on WebGL context loss — the wrapper tears down to the poster. */
  onLost?: () => void;
}

export default function NeuralFace3DScene({
  data,
  tier,
  offsetRef,
  onLost,
}: SceneProps) {
  const isMobile = tier <= 1;
  const bloom = !isMobile;

  return (
    <Canvas
      className="!absolute inset-0"
      dpr={[1, isMobile ? DPR_MOBILE : DPR_DESKTOP]}
      gl={{ antialias: false, alpha: false, powerPreference: "high-performance" }}
      camera={{ fov: 55, near: 0.01, far: 50, position: [0, 0.02, CAM_START_Z] }}
      onCreated={({ gl }) => {
        gl.setClearColor(STAGE_COLOR, 1);
        gl.domElement.addEventListener(
          "webglcontextlost",
          (e) => {
            e.preventDefault();
            onLost?.();
          },
          { once: true },
        );
      }}
    >
      <color attach="background" args={[STAGE_COLOR]} />
      <fog attach="fog" args={[STAGE_COLOR, 8, 24]} />
      <SceneContent data={data} isMobile={isMobile} offsetRef={offsetRef} />
      {bloom && (
        <EffectComposer>
          <Bloom luminanceThreshold={1} intensity={0.6} mipmapBlur />
        </EffectComposer>
      )}
      <PerfGuard />
    </Canvas>
  );
}

/** Degrade DPR before frames drop (drei PerformanceMonitor). */
function PerfGuard() {
  const setDpr = useThree((s) => s.setDpr);
  return <PerformanceMonitor onDecline={() => setDpr(1)} flipflops={3} />;
}

function SceneContent({
  data,
  isMobile,
  offsetRef,
}: {
  data: HeroFace3D;
  isMobile: boolean;
  offsetRef: MutableRefObject<number>;
}) {
  const { camera } = useThree();

  // ── Surface particle portrait ───────────────────────────────────────
  const surface = useMemo(() => {
    const limit = isMobile ? data.meta.mobileCount : undefined;
    const { positions, brightness } = decodeSurface(data, limit);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("aBright", new THREE.BufferAttribute(brightness, 1));
    const pr =
      typeof window !== "undefined"
        ? Math.min(window.devicePixelRatio, isMobile ? DPR_MOBILE : DPR_DESKTOP)
        : 1;
    const uniforms = {
      uTime: { value: 0 },
      uPointer: { value: new THREE.Vector2() },
      uSize: { value: isMobile ? 3.2 : 4.2 },
      uOpacity: { value: 1 },
      uPixelRatio: { value: pr },
      uTint: { value: new THREE.Vector3(...SURFACE_TINT) },
    };
    const mat = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: surfaceVertexShader,
      fragmentShader: surfaceFragmentShader,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    return { points: new THREE.Points(geo, mat), geo, mat, uniforms };
  }, [data, isMobile]);

  // ── Inner network: nodes + edges + travelling pulses ────────────────
  const inner = useMemo(() => {
    const pos = decodeInnerPositions(data);
    const n = data.meta.innerNodes;

    const nodeGeo = new THREE.SphereGeometry(0.007, 8, 8);
    const nodeMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(GRAD_2[0], GRAD_2[1], GRAD_2[2]).multiplyScalar(1.7),
      transparent: true,
      opacity: 0,
      depthWrite: false,
      toneMapped: false,
    });
    const nodes = new THREE.InstancedMesh(nodeGeo, nodeMat, n);
    const dummy = new THREE.Object3D();
    for (let i = 0; i < n; i++) {
      dummy.position.set(pos[i * 3]!, pos[i * 3 + 1]!, pos[i * 3 + 2]!);
      dummy.scale.setScalar(0.6 + 0.8 * Math.random());
      dummy.updateMatrix();
      nodes.setMatrixAt(i, dummy.matrix);
    }
    nodes.instanceMatrix.needsUpdate = true;

    const edgeArr = data.inner.edges;
    const ePos = new Float32Array(edgeArr.length * 3);
    for (let e = 0; e < edgeArr.length; e++) {
      const ni = edgeArr[e]!;
      ePos[e * 3] = pos[ni * 3]!;
      ePos[e * 3 + 1] = pos[ni * 3 + 1]!;
      ePos[e * 3 + 2] = pos[ni * 3 + 2]!;
    }
    const edgeGeo = new THREE.BufferGeometry();
    edgeGeo.setAttribute("position", new THREE.BufferAttribute(ePos, 3));
    const edgeMat = new THREE.LineBasicMaterial({
      color: new THREE.Color(GRAD_2[0], GRAD_2[1], GRAD_2[2]),
      transparent: true,
      opacity: 0,
      depthWrite: false,
    });
    const edges = new THREE.LineSegments(edgeGeo, edgeMat);

    // Pulse paths (precomputed) → a small meshline pool with animated dash.
    const paths = data.inner.pulses.map((path) => {
      const f = new Float32Array(path.length * 3);
      path.forEach((ni, k) => {
        f[k * 3] = pos[ni * 3]!;
        f[k * 3 + 1] = pos[ni * 3 + 1]!;
        f[k * 3 + 2] = pos[ni * 3 + 2]!;
      });
      return f;
    });
    const pool: Array<{
      geo: MeshLineGeometry;
      mat: MeshLineMaterial;
      mesh: THREE.Mesh;
      pathIndex: number;
      speed: number;
    }> = [];
    const group = new THREE.Group();
    group.add(nodes, edges);
    for (let i = 0; i < PULSE_CONCURRENT && paths.length > 0; i++) {
      const pathIndex = i % paths.length;
      const geo = new MeshLineGeometry();
      geo.setPoints(paths[pathIndex]!);
      const mat = new MeshLineMaterial({
        color: new THREE.Color(GRAD_1[0], GRAD_1[1], GRAD_1[2]).multiplyScalar(1.9),
        lineWidth: 0.012,
        transparent: true,
        depthWrite: false,
        dashArray: 0.4,
        dashRatio: 0.72,
        resolution: new THREE.Vector2(1, 1),
        sizeAttenuation: 1,
        toneMapped: false,
      } as ConstructorParameters<typeof MeshLineMaterial>[0]);
      mat.opacity = 0;
      const mesh = new THREE.Mesh(geo, mat);
      mesh.raycast = () => null;
      pool.push({ geo, mat, mesh, pathIndex, speed: 0.5 + Math.random() * 0.35 });
      group.add(mesh);
    }

    return { group, nodeMat, edgeMat, pool, paths, nodeGeo, edgeGeo };
  }, [data]);

  // ── Ambient stage glow (D-052.1 FIX 4) ──────────────────────────────
  const glow = useMemo(() => {
    const geo = new THREE.PlaneGeometry(2.0, 2.5);
    const uniforms = {
      uOpacity: { value: 1 as number },
      uBreath: { value: 0.5 as number },
    };
    const mat = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uOpacity;
        uniform float uBreath;
        varying vec2 vUv;
        void main() {
          vec2 c = vUv - vec2(0.5, 0.54);
          float d = length(c * vec2(0.9, 1.1));
          float r = max(0.0, 1.0 - d * 2.1);
          r = r * r;
          float t = vUv.x;
          vec3 blue   = vec3(0.31, 0.55, 1.0);
          vec3 violet = vec3(0.71, 0.61, 1.0);
          vec3 pink   = vec3(1.0,  0.61, 0.69);
          vec3 col = t < 0.5
            ? mix(blue, violet, t * 2.0)
            : mix(violet, pink, (t - 0.5) * 2.0);
          float a = r * (0.06 + uBreath * 0.02) * uOpacity;
          gl_FragColor = vec4(col, a);
        }
      `,
      transparent: true,
      depthWrite: false,
      depthTest: false,
      blending: THREE.AdditiveBlending,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(0, 0.08, -0.3);
    mesh.renderOrder = -1;
    return { mesh, geo, mat, uniforms };
  }, []);

  // ── Camera rail: back → between the eyes → inside the network ────────
  const rail = useMemo(
    () =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0.02, CAM_START_Z),
        new THREE.Vector3(0.03, 0.05, 0.8),
        new THREE.Vector3(-0.02, 0.07, 0.5),
        new THREE.Vector3(0.0, 0.07, 0.22),
        new THREE.Vector3(0.0, 0.05, 0.02),
        new THREE.Vector3(0.01, 0.0, -0.16),
        new THREE.Vector3(-0.02, -0.02, -0.3),
        new THREE.Vector3(0.0, 0.0, CAM_END_Z),
      ]),
    [],
  );
  const camPos = useMemo(() => new THREE.Vector3(), []);
  const lookTarget = useMemo(() => new THREE.Vector3(), []);

  // Dispose everything we built (primitives are user-owned; R3F won't).
  useEffect(() => {
    return () => {
      surface.geo.dispose();
      surface.mat.dispose();
      glow.geo.dispose();
      glow.mat.dispose();
      inner.nodeGeo.dispose();
      inner.edgeGeo.dispose();
      inner.nodeMat.dispose();
      inner.edgeMat.dispose();
      for (const p of inner.pool) {
        p.geo.dispose();
        p.mat.dispose();
      }
    };
  }, [surface, glow, inner]);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const off = clamp01(offsetRef.current);
    const d = Math.min(delta, 0.05); // clamp huge frames (tab refocus)

    // Surface: idle life + pointer parallax + cross-fade out during the dive.
    surface.uniforms.uTime.value = t;
    surface.uniforms.uPointer.value.lerp(state.pointer, 0.05);
    const surfaceOpacity =
      1 - smoothstep(BEAT.surfaceFadeStart, BEAT.surfaceFadeEnd, off);
    surface.uniforms.uOpacity.value = surfaceOpacity;
    surface.points.visible = surfaceOpacity > 0.001;

    // Ambient glow: breathes on 10-second cycle, tied to surface opacity.
    glow.uniforms.uBreath.value = (Math.sin((t * Math.PI * 2) / 10) + 1) * 0.5;
    glow.uniforms.uOpacity.value = surfaceOpacity;
    glow.mesh.visible = surfaceOpacity > 0.001;

    // Inner network fades in over the same window.
    const innerOpacity = smoothstep(BEAT.surfaceFadeStart, BEAT.surfaceFadeEnd, off);
    inner.nodeMat.opacity = innerOpacity;
    inner.edgeMat.opacity = 0.22 * innerOpacity;
    inner.group.visible = innerOpacity > 0.001;
    for (const p of inner.pool) {
      p.mat.dashOffset -= d * p.speed;
      p.mat.opacity = innerOpacity;
      (p.mat.resolution as THREE.Vector2).set(state.size.width, state.size.height);
      if (p.mat.dashOffset < -1) {
        p.mat.dashOffset += 1;
        p.pathIndex = (p.pathIndex + 1) % inner.paths.length;
        p.geo.setPoints(inner.paths[p.pathIndex]!);
      }
    }

    // Camera rail with look-ahead. Ambient figure-8 drift once inside.
    rail.getPointAt(off, camPos);
    if (off > BEAT.diveEnd) {
      const a = (off - BEAT.diveEnd) * 6.0;
      camPos.x += Math.sin(a) * 0.02;
      camPos.y += Math.sin(a * 2) * 0.012;
    }
    camera.position.lerp(camPos, 0.2);
    rail.getPointAt(Math.min(off + 0.02, 1), lookTarget);
    camera.lookAt(lookTarget);

    // Fog closes in during the dive.
    const fog = state.scene.fog as THREE.Fog | null;
    if (fog) {
      const k = smoothstep(BEAT.faceEnd, BEAT.diveEnd, off);
      fog.near = lerp(8, 0.6, k);
      fog.far = lerp(24, 3.5, k);
    }
  });

  return (
    <>
      <primitive object={glow.mesh} />
      <primitive object={surface.points} />
      <primitive object={inner.group} />
    </>
  );
}
