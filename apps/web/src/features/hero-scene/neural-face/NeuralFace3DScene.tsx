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

import { useEffect, useMemo, useRef, type MutableRefObject } from "react";
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
  GRAD_3,
  PULSE_CONCURRENT,
  PULSE_INTERVAL_MAX,
  PULSE_INTERVAL_MIN,
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
// Each slot is a traveling signal pulse. It is LAUNCHED on a cadence (a new
// pulse every 1.8–2.4 s, D-052.4 FIX 2) rather than glowing continuously: it
// spends most of its life idle (invisible), then lights, travels one path via
// animated dashOffset, fades, and returns to idle. `paths` is the slot's own
// pool (project-connection routes for bright slots, ambient routes for the dim
// slot) so a launch always picks "a different path".
interface PulseItem {
  geo: MeshLineGeometry;
  mat: MeshLineMaterial;
  mesh: THREE.Mesh;
  speed: number;
  /** -1 = idle (invisible); 0..1 = active-lifetime progress. */
  phase: number;
  /** This slot's path pool (project-connection or ambient). */
  paths: Float32Array[];
  /** Last path index launched (so the next launch differs). */
  last: number;
}

/** Seconds a launched pulse stays alive. Tuned with the 1.8–2.4 s launch
 *  cadence so 2–3 pulses are concurrently traveling (lifetime ÷ interval ≈ 2). */
const PULSE_LIFETIME = 4.5;

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

/** Build a pool of idle pulse slots (invisible until launched on cadence). */
function makePulsePool(
  group: THREE.Group,
  specs: { paths: Float32Array[]; bright: boolean }[],
  rng: () => number,
): PulseItem[] {
  const pool: PulseItem[] = [];
  for (const spec of specs) {
    if (spec.paths.length === 0) continue;
    const { geo, mat, mesh } = makePulseMesh(spec.paths[0]!, spec.bright);
    pool.push({
      geo,
      mat,
      mesh,
      speed: 0.45 + rng() * 0.35,
      phase: -1, // start idle; the launcher lights it on cadence
      paths: spec.paths,
      last: -1,
    });
    group.add(mesh);
  }
  return pool;
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

// ── Accent-gradient node colouring (D-052.4 FIX 1) ──────────────────────────────
// The inner network must read as a colour constellation, NOT a field of uniform
// grey dots. Every node is biased to a point along the D-052 accent gradient
// (blue → violet → warm pink) by its POSITION, projected onto the ~10° gradient
// axis and normalised across the whole cloud. Layer identity (project/skill/
// ambient) is carried by BRIGHTNESS + bloom, not by a flat hue — so the 267
// ambient nodes span the gradient instead of all rendering cool grey.
const GRAD_DIR_X = 0.985; // cos(~10°) — matches --accent-gradient's 100deg sweep
const GRAD_DIR_Y = 0.174; // sin(~10°)

function accentGradientRGB(t: number, out: Float32Array, o: number) {
  const x = t < 0 ? 0 : t > 1 ? 1 : t;
  if (x < 0.5) {
    const k = x * 2;
    out[o] = GRAD_1[0] + (GRAD_2[0] - GRAD_1[0]) * k;
    out[o + 1] = GRAD_1[1] + (GRAD_2[1] - GRAD_1[1]) * k;
    out[o + 2] = GRAD_1[2] + (GRAD_2[2] - GRAD_1[2]) * k;
  } else {
    const k = (x - 0.5) * 2;
    out[o] = GRAD_2[0] + (GRAD_3[0] - GRAD_2[0]) * k;
    out[o + 1] = GRAD_2[1] + (GRAD_3[1] - GRAD_2[1]) * k;
    out[o + 2] = GRAD_2[2] + (GRAD_3[2] - GRAD_2[2]) * k;
  }
}

/** Projection range of an interleaved xyz buffer onto the gradient axis. */
function gradientAxisRange(pos: Float32Array): { min: number; max: number } {
  let min = Infinity;
  let max = -Infinity;
  for (let i = 0; i < pos.length; i += 3) {
    const p = pos[i]! * GRAD_DIR_X + pos[i + 1]! * GRAD_DIR_Y;
    if (p < min) min = p;
    if (p > max) max = p;
  }
  return { min, max };
}

/** Per-node RGB (length n×3) along the accent gradient by position.
 *  `bias` shifts a layer along the gradient (project → blue, skill → violet);
 *  `spread` compresses (<1) or fills (=1) the layer's gradient range. */
function gradientColors(
  positions: Float32Array,
  range: { min: number; max: number },
  bias: number,
  spread: number,
): Float32Array {
  const n = positions.length / 3;
  const out = new Float32Array(n * 3);
  const span = Math.max(1e-4, range.max - range.min);
  for (let i = 0; i < n; i++) {
    const px = positions[i * 3]! * GRAD_DIR_X + positions[i * 3 + 1]! * GRAD_DIR_Y;
    const base = (px - range.min) / span; // 0..1 along the axis
    accentGradientRGB(0.5 + (base - 0.5) * spread + bias, out, i * 3);
  }
  return out;
}

// ── Bulb-node shader (D-052.3 Pillar 3 · D-052.4 per-node colour) ───────────────
// Each inner node renders as a small LIT BULB via a Points sprite, not a flat
// sphere: a bright emissive pinpoint CORE inside a soft radial HALO (fresnel-
// style falloff). The core exceeds the bloom threshold (1.2) so a tiny spark
// blooms; the halo body stays dim (~0.2) so 4+ overlapping halos sum well under
// 0.9 luminance (density guard — never a wall of white). Size is clamped to
// 4–8 device px at the resting Beat 3 camera. Per-node phase → gentle breathing.
// Colour is per-node (aColor) — the accent gradient biased by node position.
const BULB_SIZE = 1.05; // base world→px size factor (tuned to ~5px at rest)

const bulbVertexShader = /* glsl */ `
  uniform float uSize;
  uniform float uScale;
  uniform float uPixelRatio;
  uniform float uTime;
  attribute float aScale;
  attribute float aPhase;
  attribute vec3 aColor;
  varying float vBreath;
  varying vec3 vColor;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    // Per-node ambient breathing, ±15%, unique phase, ~10s period.
    vBreath = 1.0 + 0.15 * sin(uTime * 0.62 + aPhase);
    vColor = aColor;
    float px = uSize * uScale * aScale / max(0.0001, -mv.z);
    // Enforce the 4–8 px bulb size regardless of exact node depth.
    gl_PointSize = clamp(px, 4.0, 8.0) * uPixelRatio;
    gl_Position = projectionMatrix * mv;
  }
`;

const bulbFragmentShader = /* glsl */ `
  precision mediump float;
  uniform float uCore;    // core emissive intensity (>1.2 → blooms)
  uniform float uHalo;    // halo body intensity (dim, density-safe)
  uniform float uOpacity;
  varying float vBreath;
  varying vec3 vColor;
  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float dist = length(uv) * 2.0;      // 0 center → 1 edge
    if (dist > 1.0) discard;            // circular smoothstep mask
    float core = 1.0 - smoothstep(0.0, 0.28, dist);   // ~1px pinpoint
    float halo = 1.0 - smoothstep(0.0, 1.0, dist);    // soft wide body
    halo *= halo;
    float b = vBreath * uOpacity;
    // Emissive: additive blending adds col directly (srcAlpha=1).
    vec3 col = vColor * (uCore * core + uHalo * halo) * b;
    gl_FragColor = vec4(col, 1.0);
  }
`;

interface BulbOpts {
  core: number;
  halo: number;
  scale: number;
}

/** Build one bulb Points layer from per-node positions + per-node colours. */
function makeBulbLayer(
  positions: Float32Array,
  colors: Float32Array,
  scales: Float32Array,
  phases: Float32Array,
  pixelRatio: number,
  opts: BulbOpts,
): { points: THREE.Points; mat: THREE.ShaderMaterial; geo: THREE.BufferGeometry } {
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geo.setAttribute("aColor", new THREE.BufferAttribute(colors, 3));
  geo.setAttribute("aScale", new THREE.BufferAttribute(scales, 1));
  geo.setAttribute("aPhase", new THREE.BufferAttribute(phases, 1));
  const mat = new THREE.ShaderMaterial({
    uniforms: {
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
    toneMapped: false,
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
  // Shared gradient axis across the whole cloud so all layers read one sweep.
  const axis = gradientAxisRange(pos);

  // Build nodeId → position lookup
  const idToXYZ = new Map<string, [number, number, number]>();
  const registerPos = (id: string, idx: number) => {
    idToXYZ.set(id, [pos[idx * 3]!, pos[idx * 3 + 1]!, pos[idx * 3 + 2]!]);
  };
  for (const p of network.projectNodes) registerPos(p.id, p.posIndex);
  for (const s of network.skillNodes) registerPos(s.id, s.posIndex);
  for (const a of network.ambientNodes) registerPos(a.id, a.posIndex);

  // ── Project bulbs: brightest, blue-biased along the gradient — cores bloom ──
  const projPos = gatherPositions(pos, network.projectNodes.map((p) => p.posIndex));
  const projAttr = bulbAttribs(network.projectNodes.length, rng);
  const project = makeBulbLayer(
    projPos,
    gradientColors(projPos, axis, -0.12, 0.7), // lean blue leading edge
    projAttr.scales, projAttr.phases, px,
    {
      core: 1.6,   // > 1.2 bloom threshold → tiny pinpoint core blooms
      halo: 0.24,  // dim body (density guard: 4 overlaps ≈ 0.8 < 0.9)
      scale: 1.4,
    },
  );

  // ── Skill bulbs: violet-biased, mid brightness ─────────────────────────
  const skillPos = gatherPositions(pos, network.skillNodes.map((s) => s.posIndex));
  const skillAttr = bulbAttribs(network.skillNodes.length, rng);
  const skill = makeBulbLayer(
    skillPos,
    gradientColors(skillPos, axis, 0.05, 0.9), // lean violet
    skillAttr.scales, skillAttr.phases, px,
    { core: 1.25, halo: 0.20, scale: 1.0 },
  );

  // ── Ambient bulbs: dim, but coloured across the FULL gradient by position ──
  //    (D-052.4 FIX 1 — no longer flat cool grey; cores stay below bloom).
  const ambPos = gatherPositions(pos, network.ambientNodes.map((a) => a.posIndex));
  const ambAttr = bulbAttribs(network.ambientNodes.length, rng);
  const ambient = makeBulbLayer(
    ambPos,
    gradientColors(ambPos, axis, 0.0, 1.0), // full blue→violet→pink spread
    ambAttr.scales, ambAttr.phases, px,
    {
      core: 0.7,   // < 1.2 → never blooms; pure atmosphere
      halo: 0.16,
      scale: 0.6,
    },
  );

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

  // ── Semantic pulse paths, split by kind ─────────────────────────────────
  const projectPaths: Float32Array[] = [];
  const ambientPaths: Float32Array[] = [];

  for (const pp of network.pulsePaths) {
    const f = new Float32Array(pp.nodeIdSequence.length * 3);
    let valid = true;
    pp.nodeIdSequence.forEach((id, k) => {
      const xyz = idToXYZ.get(id);
      if (!xyz) { valid = false; return; }
      f[k * 3] = xyz[0]; f[k * 3 + 1] = xyz[1]; f[k * 3 + 2] = xyz[2];
    });
    if (valid && pp.nodeIdSequence.length >= 3) {
      (pp.kind === "project-connection" ? projectPaths : ambientPaths).push(f);
    }
  }

  // Fallback: derive paths from inner.pulses if the semantic set is empty.
  if (projectPaths.length === 0 && ambientPaths.length === 0) {
    for (const path of data.inner.pulses) {
      const f = new Float32Array(path.length * 3);
      path.forEach((ni, k) => {
        f[k * 3] = pos[ni * 3]!; f[k * 3 + 1] = pos[ni * 3 + 1]!; f[k * 3 + 2] = pos[ni * 3 + 2]!;
      });
      ambientPaths.push(f);
    }
  }

  const brightPool = projectPaths.length > 0 ? projectPaths : ambientPaths;
  const dimPool = ambientPaths.length > 0 ? ambientPaths : projectPaths;

  // Three slots: two bright (project-connection) + one dim (ambient). Each is
  // launched on a cadence (see useFrame) — never a constant glow.
  const pool = makePulsePool(
    group,
    [
      { paths: brightPool, bright: true },
      { paths: brightPool, bright: true },
      { paths: dimPool, bright: false },
    ],
    rng,
  );

  return {
    group,
    bulbs: [
      { mat: project.mat, opa: 1.0 },
      { mat: skill.mat, opa: 0.85 },
      { mat: ambient.mat, opa: 0.55 },
    ],
    edgeMat,
    pool,
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
  const n = pos.length / 3;
  const group = new THREE.Group();
  const rng = rngFactory(0x2fa81c01);

  // Single bulb layer (no semantic split) — coloured across the full accent
  // gradient by position (D-052.4), cores just above bloom.
  const nq = bulbAttribs(n, rng);
  const bulb = makeBulbLayer(
    pos,
    gradientColors(pos, gradientAxisRange(pos), 0.0, 1.0),
    nq.scales, nq.phases, bulbPixelRatio(),
    { core: 1.3, halo: 0.22, scale: 1.0 },
  );

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

  const paths = data.inner.pulses
    .filter((path) => path.length >= 3)
    .map((path) => {
      const f = new Float32Array(path.length * 3);
      path.forEach((ni, k) => {
        f[k * 3] = pos[ni * 3]!;
        f[k * 3 + 1] = pos[ni * 3 + 1]!;
        f[k * 3 + 2] = pos[ni * 3 + 2]!;
      });
      return f;
    });

  group.add(bulb.points, edges);

  // Three bright slots, all drawing from the single (homogeneous) path pool.
  const pool = makePulsePool(
    group,
    Array.from({ length: PULSE_CONCURRENT }, () => ({ paths, bright: true })),
    rng,
  );

  return {
    group,
    bulbs: [{ mat: bulb.mat, opa: 1.0 }],
    edgeMat,
    pool,
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

  // Next scheduled pulse-launch time (clock seconds); 0 → launch immediately.
  const pulseNext = useRef(0);

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
    // Static structural edges stay very dim (0.14) so traveling pulses read as
    // events, not constant glow (D-052.4 FIX 2).
    inner.edgeMat.opacity = 0.14 * innerOpacity;

    // ── Pulse cadence: launch a new pulse every 1.8–2.4 s on a fresh path ──
    // Only while the network is visible. Idle slots are invisible; an active
    // slot lights (envelope), travels its path via dashOffset, then idles.
    if (innerOpacity > 0.02 && t >= pulseNext.current) {
      const idle = inner.pool.find((p) => p.phase < 0);
      if (idle && idle.paths.length > 0) {
        let idx = Math.floor(Math.random() * idle.paths.length);
        if (idle.paths.length > 1 && idx === idle.last) {
          idx = (idx + 1) % idle.paths.length;
        }
        idle.last = idx;
        idle.geo.setPoints(idle.paths[idx]!);
        idle.mat.dashOffset = 0;
        idle.phase = 0;
      }
      pulseNext.current =
        t + PULSE_INTERVAL_MIN + Math.random() * (PULSE_INTERVAL_MAX - PULSE_INTERVAL_MIN);
    }

    for (const p of inner.pool) {
      if (p.phase < 0) {
        p.mat.opacity = 0;
        continue;
      }
      p.phase += d / PULSE_LIFETIME;
      p.mat.dashOffset -= d * p.speed;
      (p.mat.resolution as THREE.Vector2).set(state.size.width, state.size.height);
      // Fade in fast, hold, diffuse out → the pulse reads as a discrete event.
      const env = smoothstep(0, 0.1, p.phase) * (1 - smoothstep(0.82, 1, p.phase));
      p.mat.opacity = env * innerOpacity;
      if (p.phase >= 1) {
        p.phase = -1;
        p.mat.opacity = 0;
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
