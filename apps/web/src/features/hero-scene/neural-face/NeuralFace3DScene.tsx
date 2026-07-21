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
 * Three beats over the offset (D-052.2 updated):
 *   1) 0.00–0.32  the face — particle relief, idle drift, pointer parallax
 *   2) 0.32–0.60  the dive — camera approaches face surface; surface fades
 *                  0.32→0.60, inner network fades in 0.37→0.60 (+0.05 offset
 *                  so they never overlap at high mutual opacity)
 *   3) 0.60–1.00  inside the network — camera settled just in front (z≈+0.05)
 *                  looking into the glowing constellation; semantic node layers
 *                  (project / skill / ambient) visually distinct (D-052.2 FIX 3)
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
  FACE_X_BREAKPOINT,
  FACE_X_OFFSET,
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
      {/* Fog opens wide (near=20, far=30) then closes during Beat 2 dive */}
      <fog attach="fog" args={[STAGE_COLOR, 20, 30]} />
      <SceneContent data={data} isMobile={isMobile} offsetRef={offsetRef} />
      {bloom && (
        <EffectComposer>
          {/* D-052.2 FIX 2: intensity 0.35, threshold 1.2 so only pulse cores
              bloom; ambient nodes (luminance ≈ 0.6) stay crisp. */}
          <Bloom luminanceThreshold={1.2} intensity={0.35} mipmapBlur />
        </EffectComposer>
      )}
      <PerfGuard />
    </Canvas>
  );
}

function PerfGuard() {
  const setDpr = useThree((s) => s.setDpr);
  return <PerformanceMonitor onDecline={() => setDpr(1)} flipflops={3} />;
}

// ── Pulse item type ────────────────────────────────────────────────────────────
interface PulseItem {
  geo: MeshLineGeometry;
  mat: MeshLineMaterial;
  mesh: THREE.Mesh;
  pathIndex: number;
  speed: number;
}

// ── Inner-network scene data ───────────────────────────────────────────────────
/** One bulb-node layer (project / skill / ambient, or the single fallback). */
interface BulbLayer {
  mat: THREE.ShaderMaterial;
  /** Relative opacity multiplier vs the master inner opacity. */
  opa: number;
}
interface InnerScene {
  group: THREE.Group;
  /** Bulb layers, each animated (uOpacity + uTime) every frame. */
  bulbs: BulbLayer[];
  edgeMat: THREE.LineBasicMaterial;
  pool: PulseItem[];
  paths: Float32Array[];
  dispose: () => void;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function makePulseColor(bright: boolean): THREE.Color {
  // Project-connection pulses: GRAD_1 * 2.4 → luminance ≈ 1.33 > bloom threshold ✓
  // Ambient pulses: GRAD_2 * 0.9 → luminance ≈ 0.60 < bloom threshold ✓
  return bright
    ? new THREE.Color(GRAD_1[0] * 2.4, GRAD_1[1] * 2.4, GRAD_1[2] * 2.4)
    : new THREE.Color(GRAD_2[0] * 0.9, GRAD_2[1] * 0.9, GRAD_2[2] * 0.9);
}

function makePulseMesh(
  pathPoints: Float32Array,
  bright: boolean,
): { geo: MeshLineGeometry; mat: MeshLineMaterial; mesh: THREE.Mesh } {
  const geo = new MeshLineGeometry();
  geo.setPoints(pathPoints);
  const mat = new MeshLineMaterial({
    color: makePulseColor(bright),
    lineWidth: bright ? 0.010 : 0.007,
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
  return { geo, mat, mesh };
}

function rngFactory(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ── Bulb-node shader (D-052.3 Pillar 3) ─────────────────────────────────────────
// Each inner node renders as a small LIT BULB via a Points sprite, not a flat
// sphere: a bright emissive pinpoint CORE inside a soft radial HALO (fresnel-
// style falloff). The core exceeds the bloom threshold (1.2) so a tiny spark
// blooms; the halo body stays dim (~0.2) so 4+ overlapping halos sum well under
// 0.9 luminance (density guard — never a wall of white). Size is clamped to
// 4–8 device px at the resting Beat 3 camera. Per-node phase → gentle breathing.
const BULB_SIZE = 1.05; // base world→px size factor (tuned to ~5px at rest)

const bulbVertexShader = /* glsl */ `
  uniform float uSize;
  uniform float uScale;
  uniform float uPixelRatio;
  uniform float uTime;
  attribute float aScale;
  attribute float aPhase;
  varying float vBreath;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    // Per-node ambient breathing, ±15%, unique phase, ~10s period.
    vBreath = 1.0 + 0.15 * sin(uTime * 0.62 + aPhase);
    float px = uSize * uScale * aScale / max(0.0001, -mv.z);
    // Enforce the 4–8 px bulb size regardless of exact node depth.
    gl_PointSize = clamp(px, 4.0, 8.0) * uPixelRatio;
    gl_Position = projectionMatrix * mv;
  }
`;

const bulbFragmentShader = /* glsl */ `
  precision mediump float;
  uniform vec3 uColor;
  uniform float uCore;    // core emissive intensity (>1.2 → blooms)
  uniform float uHalo;    // halo body intensity (dim, density-safe)
  uniform float uOpacity;
  varying float vBreath;
  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float dist = length(uv) * 2.0;      // 0 center → 1 edge
    if (dist > 1.0) discard;            // circular smoothstep mask
    float core = 1.0 - smoothstep(0.0, 0.28, dist);   // ~1px pinpoint
    float halo = 1.0 - smoothstep(0.0, 1.0, dist);    // soft wide body
    halo *= halo;
    float b = vBreath * uOpacity;
    // Emissive: additive blending adds col directly (srcAlpha=1).
    vec3 col = uColor * (uCore * core + uHalo * halo) * b;
    gl_FragColor = vec4(col, 1.0);
  }
`;

interface BulbOpts {
  color: THREE.Color;
  core: number;
  halo: number;
  scale: number;
}

/** Build one bulb Points layer from per-node positions. */
function makeBulbLayer(
  positions: Float32Array,
  scales: Float32Array,
  phases: Float32Array,
  pixelRatio: number,
  opts: BulbOpts,
): { points: THREE.Points; mat: THREE.ShaderMaterial; geo: THREE.BufferGeometry } {
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geo.setAttribute("aScale", new THREE.BufferAttribute(scales, 1));
  geo.setAttribute("aPhase", new THREE.BufferAttribute(phases, 1));
  const mat = new THREE.ShaderMaterial({
    uniforms: {
      uColor: { value: opts.color },
      uCore: { value: opts.core },
      uHalo: { value: opts.halo },
      uScale: { value: opts.scale },
      uSize: { value: BULB_SIZE },
      uPixelRatio: { value: pixelRatio },
      uOpacity: { value: 0 },
      uTime: { value: 0 },
    },
    vertexShader: bulbVertexShader,
    fragmentShader: bulbFragmentShader,
    transparent: true,
    depthWrite: false,
    depthTest: true,
    blending: THREE.AdditiveBlending,
  });
  const points = new THREE.Points(geo, mat);
  points.frustumCulled = false;
  points.raycast = () => null;
  return { points, mat, geo };
}

/** Runtime device-pixel-ratio (capped), used to size bulbs crisply. */
function bulbPixelRatio(): number {
  return typeof window !== "undefined"
    ? Math.min(window.devicePixelRatio || 1, DPR_DESKTOP)
    : 1;
}

/** Collect per-node positions (into a fresh Float32Array) for a posIndex list. */
function gatherPositions(pos: Float32Array, indices: number[]): Float32Array {
  const out = new Float32Array(indices.length * 3);
  for (let i = 0; i < indices.length; i++) {
    const idx = indices[i]!;
    out[i * 3] = pos[idx * 3]!;
    out[i * 3 + 1] = pos[idx * 3 + 1]!;
    out[i * 3 + 2] = pos[idx * 3 + 2]!;
  }
  return out;
}

/** Per-node random scale + breathing phase buffers. */
function bulbAttribs(n: number, rng: () => number): { scales: Float32Array; phases: Float32Array } {
  const scales = new Float32Array(n);
  const phases = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    scales[i] = 0.85 + 0.30 * rng();
    phases[i] = rng() * Math.PI * 2;
  }
  return { scales, phases };
}

// ── Build semantic inner scene (when data.network is present) ─────────────────
function buildSemanticInner(data: HeroFace3D, pos: Float32Array): InnerScene {
  const network = data.network!;
  const group = new THREE.Group();
  const rng = rngFactory(0x52a71c00);
  const px = bulbPixelRatio();

  // Build nodeId → position lookup
  const idToXYZ = new Map<string, [number, number, number]>();
  const registerPos = (id: string, idx: number) => {
    idToXYZ.set(id, [pos[idx * 3]!, pos[idx * 3 + 1]!, pos[idx * 3 + 2]!]);
  };
  for (const p of network.projectNodes) registerPos(p.id, p.posIndex);
  for (const s of network.skillNodes) registerPos(s.id, s.posIndex);
  for (const a of network.ambientNodes) registerPos(a.id, a.posIndex);

  // ── Project bulbs: brightest, blue leading edge — cores bloom ──────────
  const projPos = gatherPositions(pos, network.projectNodes.map((p) => p.posIndex));
  const projAttr = bulbAttribs(network.projectNodes.length, rng);
  const project = makeBulbLayer(projPos, projAttr.scales, projAttr.phases, px, {
    color: new THREE.Color(GRAD_1[0], GRAD_1[1], GRAD_1[2]),
    core: 1.6,   // > 1.2 bloom threshold → tiny pinpoint core blooms
    halo: 0.24,  // dim body (density guard: 4 overlaps ≈ 0.8 < 0.9)
    scale: 1.4,
  });

  // ── Skill bulbs: cool violet, mid brightness ───────────────────────────
  const skillPos = gatherPositions(pos, network.skillNodes.map((s) => s.posIndex));
  const skillAttr = bulbAttribs(network.skillNodes.length, rng);
  const skill = makeBulbLayer(skillPos, skillAttr.scales, skillAttr.phases, px, {
    color: new THREE.Color(GRAD_2[0], GRAD_2[1], GRAD_2[2]),
    core: 1.25,
    halo: 0.20,
    scale: 1.0,
  });

  // ── Ambient bulbs: dim cool atmosphere — cores stay below bloom ────────
  const ambPos = gatherPositions(pos, network.ambientNodes.map((a) => a.posIndex));
  const ambAttr = bulbAttribs(network.ambientNodes.length, rng);
  const ambient = makeBulbLayer(ambPos, ambAttr.scales, ambAttr.phases, px, {
    color: new THREE.Color(0.55, 0.62, 0.85),
    core: 0.7,   // < 1.2 → never blooms; pure atmosphere
    halo: 0.16,
    scale: 0.6,
  });

  // ── Edges from inner.edges (structural graph, unchanged) ───────────────
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

  group.add(project.points, skill.points, ambient.points, edges);

  // ── Semantic pulse pool ─────────────────────────────────────────────────
  const paths: Float32Array[] = [];
  const isProjectPulse: boolean[] = [];

  for (const pp of network.pulsePaths) {
    const f = new Float32Array(pp.nodeIdSequence.length * 3);
    let valid = true;
    pp.nodeIdSequence.forEach((id, k) => {
      const xyz = idToXYZ.get(id);
      if (!xyz) { valid = false; return; }
      f[k * 3] = xyz[0]; f[k * 3 + 1] = xyz[1]; f[k * 3 + 2] = xyz[2];
    });
    if (valid && pp.nodeIdSequence.length >= 3) {
      paths.push(f);
      isProjectPulse.push(pp.kind === "project-connection");
    }
  }

  // Fallback: use inner.pulses as ambient paths if no semantic paths
  if (paths.length === 0) {
    for (const path of data.inner.pulses) {
      const f = new Float32Array(path.length * 3);
      path.forEach((ni, k) => {
        f[k * 3] = pos[ni * 3]!; f[k * 3 + 1] = pos[ni * 3 + 1]!; f[k * 3 + 2] = pos[ni * 3 + 2]!;
      });
      paths.push(f);
      isProjectPulse.push(false);
    }
  }

  const pool: PulseItem[] = [];
  const count = Math.min(PULSE_CONCURRENT, paths.length);
  for (let i = 0; i < count; i++) {
    const pathIndex = i % paths.length;
    const { geo, mat, mesh } = makePulseMesh(paths[pathIndex]!, isProjectPulse[pathIndex] ?? false);
    pool.push({ geo, mat, mesh, pathIndex, speed: 0.45 + rng() * 0.35 });
    group.add(mesh);
  }

  return {
    group,
    bulbs: [
      { mat: project.mat, opa: 1.0 },
      { mat: skill.mat, opa: 0.85 },
      { mat: ambient.mat, opa: 0.55 },
    ],
    edgeMat,
    pool,
    paths,
    dispose: () => {
      project.geo.dispose(); project.mat.dispose();
      skill.geo.dispose(); skill.mat.dispose();
      ambient.geo.dispose(); ambient.mat.dispose();
      edgeGeo.dispose(); edgeMat.dispose();
      for (const p of pool) { p.geo.dispose(); p.mat.dispose(); }
    },
  };
}

// ── Build homogeneous inner scene (fallback when data.network absent) ─────────
function buildHomogeneousInner(data: HeroFace3D, pos: Float32Array): InnerScene {
  const n = data.meta.innerNodes;
  const group = new THREE.Group();
  const rng = rngFactory(0x2fa81c01);

  // Single bulb layer (no semantic split) — violet, cores just above bloom.
  const nq = bulbAttribs(n, rng);
  const bulb = makeBulbLayer(pos, nq.scales, nq.phases, bulbPixelRatio(), {
    color: new THREE.Color(GRAD_2[0], GRAD_2[1], GRAD_2[2]),
    core: 1.3,
    halo: 0.22,
    scale: 1.0,
  });

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

  const paths = data.inner.pulses.map((path) => {
    const f = new Float32Array(path.length * 3);
    path.forEach((ni, k) => {
      f[k * 3] = pos[ni * 3]!;
      f[k * 3 + 1] = pos[ni * 3 + 1]!;
      f[k * 3 + 2] = pos[ni * 3 + 2]!;
    });
    return f;
  });

  const pool: PulseItem[] = [];
  group.add(bulb.points, edges);

  const count = Math.min(PULSE_CONCURRENT, paths.length > 0 ? PULSE_CONCURRENT : 0);
  for (let i = 0; i < count; i++) {
    const pathIndex = i % Math.max(1, paths.length);
    // bright=true → GRAD_1*2.4 accent pulses for homogeneous fallback
    const { geo, mat, mesh } = makePulseMesh(paths[pathIndex]!, true);
    pool.push({ geo, mat, mesh, pathIndex, speed: 0.50 + rng() * 0.35 });
    group.add(mesh);
  }

  return {
    group,
    bulbs: [{ mat: bulb.mat, opa: 1.0 }],
    edgeMat,
    pool,
    paths,
    dispose: () => {
      bulb.geo.dispose(); bulb.mat.dispose();
      edgeGeo.dispose(); edgeMat.dispose();
      for (const p of pool) { p.geo.dispose(); p.mat.dispose(); }
    },
  };
}

// ── SceneContent ──────────────────────────────────────────────────────────────

function SceneContent({
  data,
  isMobile,
  offsetRef,
}: {
  data: HeroFace3D;
  isMobile: boolean;
  offsetRef: MutableRefObject<number>;
}) {
  const { camera, size } = useThree();

  // FIX 4: face shifts right on desktop so headline reads on the left
  const sceneXOffset = size.width >= FACE_X_BREAKPOINT ? FACE_X_OFFSET : 0;

  // ── Surface particle portrait ─────────────────────────────────────────
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

  // ── Ambient background glow — the "bulb behind the face" (D-052.3 P2) ──
  // A large, heavily-blurred accent-gradient radial: a light source that
  // illuminates the whole body, ~12–15% peak, breathing on a 10s cycle.
  const glow = useMemo(() => {
    const geo = new THREE.PlaneGeometry(2.6, 3.2);
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
          // Wide, soft radial centred behind the head (upper-centre).
          vec2 c = vUv - vec2(0.5, 0.56);
          float d = length(c * vec2(0.95, 1.05));
          float r = max(0.0, 1.0 - d * 1.55);
          r = pow(r, 1.7);                 // heavy blur — soft shoulder
          float t = vUv.x;
          vec3 blue   = vec3(0.31, 0.55, 1.0);
          vec3 violet = vec3(0.71, 0.61, 1.0);
          vec3 pink   = vec3(1.0,  0.61, 0.69);
          vec3 col = t < 0.5
            ? mix(blue, violet, t * 2.0)
            : mix(violet, pink, (t - 0.5) * 2.0);
          // Peak ~12–15%, breathing ±1.5% over the cycle.
          float a = r * (0.12 + uBreath * 0.03) * uOpacity;
          gl_FragColor = vec4(col, a);
        }
      `,
      transparent: true,
      depthWrite: false,
      depthTest: false,
      blending: THREE.AdditiveBlending,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(0, 0.06, -0.32);
    mesh.renderOrder = -1;
    return { mesh, geo, mat, uniforms };
  }, []);

  // ── Inner network (semantic or homogeneous) ───────────────────────────
  const inner = useMemo((): InnerScene => {
    const pos = decodeInnerPositions(data);
    return data.network
      ? buildSemanticInner(data, pos)
      : buildHomogeneousInner(data, pos);
  }, [data]);

  // ── Camera rail (D-052.2 FIX 2): settles at z=+CAM_END_Z just in front
  //    of the face surface so Beat 3 network is seen as a field at depth.
  const rail = useMemo(
    () =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0.02, CAM_START_Z),
        new THREE.Vector3(0.03, 0.05, 0.8),
        new THREE.Vector3(-0.02, 0.07, 0.5),
        new THREE.Vector3(0.0, 0.07, 0.34),   // approaching face surface
        new THREE.Vector3(0.0, 0.05, 0.26),
        new THREE.Vector3(0.01, 0.03, 0.20),
        new THREE.Vector3(-0.01, 0.02, 0.15),
        new THREE.Vector3(0.0, 0.0, CAM_END_Z), // settle back — network as a depth field
      ]),
    [],
  );
  const camPos = useMemo(() => new THREE.Vector3(), []);
  const lookTarget = useMemo(() => new THREE.Vector3(), []);
  // Beat 3 fixed look-into-network target (inner nodes at z=-0.06 → -0.30)
  const beat3Look = useMemo(() => new THREE.Vector3(0, 0, -0.18), []);

  useEffect(() => {
    return () => {
      surface.geo.dispose();
      surface.mat.dispose();
      glow.geo.dispose();
      glow.mat.dispose();
      inner.dispose();
    };
  }, [surface, glow, inner]);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const off = clamp01(offsetRef.current);
    const d = Math.min(delta, 0.05);

    // ── Surface: cross-fades out over full Beat 2 (0.32 → 0.60) ────────
    surface.uniforms.uTime.value = t;
    surface.uniforms.uPointer.value.lerp(state.pointer, 0.05);
    const surfaceOpacity =
      1 - smoothstep(BEAT.surfaceFadeStart, BEAT.surfaceFadeEnd, off);
    surface.uniforms.uOpacity.value = surfaceOpacity;
    surface.points.visible = surfaceOpacity > 0.001;

    // ── Ambient glow: breathes on 10-second cycle, tied to surface ──────
    glow.uniforms.uBreath.value = (Math.sin((t * Math.PI * 2) / 10) + 1) * 0.5;
    glow.uniforms.uOpacity.value = surfaceOpacity;
    glow.mesh.visible = surfaceOpacity > 0.001;

    // ── Inner network: fades in 0.37 → 0.60 (+0.05 lag vs surface) ─────
    // Verified: max combined opacity ≈ 0.88 at mid-dive → well below 1.4× max
    const innerOpacity = smoothstep(BEAT.networkFadeStart, BEAT.surfaceFadeEnd, off);
    inner.group.visible = innerOpacity > 0.001;

    // Bulb layers: each holds its own uOpacity (graduated) + uTime (breathing).
    for (const b of inner.bulbs) {
      b.mat.uniforms.uOpacity!.value = innerOpacity * b.opa;
      b.mat.uniforms.uTime!.value = t;
    }
    inner.edgeMat.opacity = 0.18 * innerOpacity;

    for (const p of inner.pool) {
      p.mat.dashOffset -= d * p.speed;
      p.mat.opacity = innerOpacity;
      (p.mat.resolution as THREE.Vector2).set(state.size.width, state.size.height);
      if (p.mat.dashOffset < -1) {
        p.mat.dashOffset += 1;
        if (inner.paths.length > 0) {
          p.pathIndex = (p.pathIndex + 1) % inner.paths.length;
          p.geo.setPoints(inner.paths[p.pathIndex]!);
        }
      }
    }

    // ── Camera rail + Beat 3 look-into-network ───────────────────────────
    rail.getPointAt(off, camPos);
    if (off > BEAT.diveEnd) {
      // Gentle figure-8 drift in Beat 3
      const a = (off - BEAT.diveEnd) * 6.0;
      camPos.x += Math.sin(a) * 0.018;
      camPos.y += Math.sin(a * 2) * 0.010;
      // Look toward inner-network center with slow oscillation
      beat3Look.x = Math.sin(a * 0.7) * 0.05;
      beat3Look.y = Math.cos(a * 0.5) * 0.025;
      camera.position.lerp(camPos, 0.2);
      camera.lookAt(beat3Look);
    } else {
      rail.getPointAt(Math.min(off + 0.02, 1), lookTarget);
      camera.position.lerp(camPos, 0.2);
      camera.lookAt(lookTarget);
    }

    // ── Fog closes during Beat 2 dive (0.32 → 0.60) ─────────────────────
    const fog = state.scene.fog as THREE.Fog | null;
    if (fog) {
      const k = smoothstep(BEAT.faceEnd, BEAT.diveEnd, off);
      fog.near = lerp(20, 1.5, k);
      fog.far = lerp(30, 5.0, k);
    }
  });

  return (
    // FIX 4: shift entire scene right on desktop, centered on mobile
    <group position={[sceneXOffset, 0, 0]}>
      <primitive object={glow.mesh} />
      <primitive object={surface.points} />
      <primitive object={inner.group} />
    </group>
  );
}
