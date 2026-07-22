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
/** Slow-in / steady-middle / slow-out easing (5th-order) for the flight speed. */
function smootherstep(x: number) {
  const t = clamp01(x);
  return t * t * t * (t * (t * 6 - 15) + 10);
}

interface SceneProps {
  data: HeroFace3D;
  tier: 0 | 1 | 2;
  offsetRef: MutableRefObject<number>;
  onLost?: () => void;
  /** Up to 3 DOM label slots (from the client) the scene positions from 3D. */
  labelSlots?: MutableRefObject<(HTMLElement | null)[]>;
}

export default function NeuralFace3DScene({
  data,
  tier,
  offsetRef,
  onLost,
  labelSlots,
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
      <SceneContent
        data={data}
        isMobile={isMobile}
        offsetRef={offsetRef}
        labelSlots={labelSlots}
      />
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
/** One bulb-node layer — an InstancedMesh of camera-facing billboarded quads
 *  (D-052.6: gl.POINTS size is driver-capped on real Windows GPUs, so we no
 *  longer depend on gl_PointSize). Sized in WORLD units → real fly-through
 *  parallax; a per-node iBright attribute enables proximity brightening. */
interface BulbLayer {
  mat: THREE.ShaderMaterial;
  /** Relative opacity multiplier vs the master inner opacity. */
  opa: number;
  /** Per-node dynamic brightness (proximity). Null for ambient (never brightens). */
  iBright: THREE.InstancedBufferAttribute | null;
}

/** A project/skill node eligible for a proximity label during the flight. */
interface LabelNode {
  name: string;
  kind: "project" | "skill";
  /** Node position in the inner-graph (pre-group-offset) space. */
  pos: THREE.Vector3;
  /** The layer whose iBright is brightened when this node is near. */
  bright: THREE.InstancedBufferAttribute;
  /** Instance index within that layer. */
  index: number;
}

interface InnerScene {
  group: THREE.Group;
  /** Bulb layers, each animated (uOpacity + uTime + uViewScale) every frame. */
  bulbs: BulbLayer[];
  /** Project + skill nodes with names, for proximity labels + brightening. */
  labelNodes: LabelNode[];
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
 *  `spread` compresses (<1) or fills (=1) the layer's gradient range;
 *  `sat` (0..1) mixes toward luminance — project full, ambient reduced so it
 *  reads as atmosphere, not focus (D-052.5). */
function gradientColors(
  positions: Float32Array,
  range: { min: number; max: number },
  bias: number,
  spread: number,
  sat: number,
): Float32Array {
  const n = positions.length / 3;
  const out = new Float32Array(n * 3);
  const span = Math.max(1e-4, range.max - range.min);
  for (let i = 0; i < n; i++) {
    const o = i * 3;
    const px = positions[o]! * GRAD_DIR_X + positions[o + 1]! * GRAD_DIR_Y;
    const base = (px - range.min) / span; // 0..1 along the axis
    accentGradientRGB(0.5 + (base - 0.5) * spread + bias, out, o);
    if (sat < 1) {
      const r = out[o]!, g = out[o + 1]!, b = out[o + 2]!;
      const l = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      out[o] = l + (r - l) * sat;
      out[o + 1] = l + (g - l) * sat;
      out[o + 2] = l + (b - l) * sat;
    }
  }
  return out;
}

// ── Bulb-node billboards (D-052.6) ──────────────────────────────────────────────
// Each inner node is a camera-facing WORLD-SIZED quad (an InstancedBufferGeometry
// of unit planes billboarded in the vertex shader), NOT a gl.POINTS sprite —
// point size is capped by the driver on real Windows GPUs (ANGLE/D3D), which is
// why nodes rendered as sub-3px pinpoints. World-sized quads have no size cap and
// give true fly-through parallax: near nodes grow into orbs, far ones recede.
//
// Apparent size is normalised to a REFERENCE viewport height (uViewScale =
// REF_H / actualHeight) so the CSS-px target holds across viewports while
// distance-parallax is preserved. The fragment is a bright bulb BODY (core
// occupies ~half the sprite, radius 0.5) inside a soft halo ring — a lit bulb,
// not a pinpoint with a faint glow. Colour is per-node (accent gradient by
// position). iBright is a per-node uniform-ish attribute for proximity boosts.
const REF_VIEW_H = 900; // reference viewport height the world sizes are tuned to

const bulbVertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uWorld;      // layer base world diameter (@ REF_H)
  uniform float uViewScale;  // REF_H / actual viewport height
  attribute vec3 iPos;
  attribute vec3 iColor;
  attribute float iScale;    // per-node size variation (~0.85..1.15)
  attribute float iPhase;
  attribute float iBright;   // dynamic per-node brightness (proximity)
  varying vec2 vUv;
  varying vec3 vColor;
  varying float vB;
  void main() {
    vUv = uv;
    vColor = iColor;
    float breath = 1.0 + 0.12 * sin(uTime * 0.62 + iPhase);
    vB = breath * iBright;
    vec4 mv = modelViewMatrix * vec4(iPos, 1.0);
    // Billboard: offset the unit-quad corner (position.xy ∈ ±0.5) in view space.
    float s = uWorld * iScale * uViewScale;
    mv.xy += position.xy * s;
    gl_Position = projectionMatrix * mv;
  }
`;

const bulbFragmentShader = /* glsl */ `
  precision mediump float;
  uniform float uCore;     // core emissive intensity (>1.2 → blooms)
  uniform float uHalo;     // halo ring intensity
  uniform float uCoreR;    // core radius as a fraction of the sprite (>=0.45)
  uniform float uOpacity;
  varying vec2 vUv;
  varying vec3 vColor;
  varying float vB;
  void main() {
    vec2 c = vUv - 0.5;
    float dist = length(c) * 2.0;                       // 0 center → 1 edge
    if (dist > 1.0) discard;                            // circular mask
    // Bright bulb BODY out to uCoreR, then a soft halo ring to the edge.
    float core = 1.0 - smoothstep(0.0, uCoreR, dist);
    float halo = 1.0 - smoothstep(uCoreR, 1.0, dist);
    halo *= halo;                                       // fresnel-ish falloff
    float b = vB * uOpacity;
    vec3 col = vColor * (uCore * core + uHalo * halo) * b;
    gl_FragColor = vec4(col, 1.0);
  }
`;

interface BulbOpts {
  core: number;
  halo: number;
  /** Core radius as fraction of sprite (≥0.45 → real bright body). */
  coreR: number;
  /** Base world diameter at the reference viewport height. */
  world: number;
}

interface BulbLayerBuild {
  mesh: THREE.Mesh;
  mat: THREE.ShaderMaterial;
  geo: THREE.InstancedBufferGeometry;
  iBright: THREE.InstancedBufferAttribute;
}

/** Build one bulb layer: an instanced billboard quad per node. */
function makeBulbLayer(
  positions: Float32Array,
  colors: Float32Array,
  scales: Float32Array,
  phases: Float32Array,
  opts: BulbOpts,
): BulbLayerBuild {
  const n = positions.length / 3;
  const geo = new THREE.InstancedBufferGeometry();
  // Fresh unit quad (centered, ±0.5) per layer so disposal is independent.
  geo.setAttribute(
    "position",
    new THREE.BufferAttribute(
      new Float32Array([-0.5, -0.5, 0, 0.5, -0.5, 0, 0.5, 0.5, 0, -0.5, 0.5, 0]),
      3,
    ),
  );
  geo.setAttribute(
    "uv",
    new THREE.BufferAttribute(new Float32Array([0, 0, 1, 0, 1, 1, 0, 1]), 2),
  );
  geo.setIndex(new THREE.BufferAttribute(new Uint16Array([0, 1, 2, 0, 2, 3]), 1));
  geo.setAttribute("iPos", new THREE.InstancedBufferAttribute(positions, 3));
  geo.setAttribute("iColor", new THREE.InstancedBufferAttribute(colors, 3));
  geo.setAttribute("iScale", new THREE.InstancedBufferAttribute(scales, 1));
  geo.setAttribute("iPhase", new THREE.InstancedBufferAttribute(phases, 1));
  const iBright = new THREE.InstancedBufferAttribute(
    new Float32Array(n).fill(1),
    1,
  );
  iBright.setUsage(THREE.DynamicDrawUsage);
  geo.setAttribute("iBright", iBright);
  geo.instanceCount = n;

  const mat = new THREE.ShaderMaterial({
    uniforms: {
      uCore: { value: opts.core },
      uHalo: { value: opts.halo },
      uCoreR: { value: opts.coreR },
      uWorld: { value: opts.world },
      uViewScale: { value: 1 },
      uTime: { value: 0 },
      uOpacity: { value: 0 },
    },
    vertexShader: bulbVertexShader,
    fragmentShader: bulbFragmentShader,
    transparent: true,
    depthWrite: false,
    depthTest: true,
    toneMapped: false,
    blending: THREE.AdditiveBlending,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.frustumCulled = false; // custom instanced bounds; keep it simple
  mesh.raycast = () => null;
  return { mesh, mat, geo, iBright };
}

// Per-layer base world diameters (@ REF_VIEW_H = 900). Tuned so that at the
// resting flight camera a project node reads ~34–48 CSS px, skill ~20–28,
// ambient ~9–14; near fly-through passes render much larger (real parallax).
const WORLD_PROJECT = 0.0125;
const WORLD_SKILL = 0.0066;
const WORLD_AMBIENT = 0.0038;
const WORLD_HOMOGENEOUS = 0.0072;
const CORE_R = 0.5; // core body radius (≥0.45 → bright bulb, not a pinpoint)

/** Proximity brightness boost (+40%) applied to the nearest labelled nodes. */
const PROX_BOOST = 1.4;

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

  // ── Project bulbs: brightest, blue-biased, FULL saturation, large orbs ──
  const projPos = gatherPositions(pos, network.projectNodes.map((p) => p.posIndex));
  const projAttr = bulbAttribs(network.projectNodes.length, rng);
  const project = makeBulbLayer(
    projPos,
    gradientColors(projPos, axis, -0.12, 0.7, 1.0), // lean blue, full sat
    projAttr.scales, projAttr.phases,
    { core: 2.8, halo: 0.45, coreR: CORE_R, world: WORLD_PROJECT },
  );

  // ── Skill bulbs: violet-biased, medium brightness + saturation ─────────
  const skillPos = gatherPositions(pos, network.skillNodes.map((s) => s.posIndex));
  const skillAttr = bulbAttribs(network.skillNodes.length, rng);
  const skill = makeBulbLayer(
    skillPos,
    gradientColors(skillPos, axis, 0.05, 0.9, 0.85), // lean violet, med sat
    skillAttr.scales, skillAttr.phases,
    { core: 1.9, halo: 0.34, coreR: CORE_R, world: WORLD_SKILL },
  );

  // ── Ambient bulbs: dimmer, REDUCED saturation — atmosphere ─────────────
  const ambPos = gatherPositions(pos, network.ambientNodes.map((a) => a.posIndex));
  const ambAttr = bulbAttribs(network.ambientNodes.length, rng);
  const ambient = makeBulbLayer(
    ambPos,
    gradientColors(ambPos, axis, 0.0, 1.0, 0.62), // full spread, reduced sat
    ambAttr.scales, ambAttr.phases,
    { core: 1.0, halo: 0.22, coreR: CORE_R, world: WORLD_AMBIENT },
  );

  // ── Label nodes: project + skill, with names from the graph data (LAW-005) ──
  const labelNodes: LabelNode[] = [];
  network.projectNodes.forEach((p, i) => {
    labelNodes.push({
      name: p.projectSlug ?? p.id,
      kind: "project",
      pos: new THREE.Vector3(pos[p.posIndex * 3]!, pos[p.posIndex * 3 + 1]!, pos[p.posIndex * 3 + 2]!),
      bright: project.iBright,
      index: i,
    });
  });
  network.skillNodes.forEach((s, i) => {
    labelNodes.push({
      name: s.skillName ?? s.id,
      kind: "skill",
      pos: new THREE.Vector3(pos[s.posIndex * 3]!, pos[s.posIndex * 3 + 1]!, pos[s.posIndex * 3 + 2]!),
      bright: skill.iBright,
      index: i,
    });
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

  group.add(project.mesh, skill.mesh, ambient.mesh, edges);

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
      { mat: project.mat, opa: 1.0, iBright: project.iBright },
      { mat: skill.mat, opa: 0.85, iBright: skill.iBright },
      { mat: ambient.mat, opa: 0.55, iBright: null },
    ],
    labelNodes,
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
  // gradient by position, billboarded quads for clear visibility (D-052.6).
  const nq = bulbAttribs(n, rng);
  const bulb = makeBulbLayer(
    pos,
    gradientColors(pos, gradientAxisRange(pos), 0.0, 1.0, 0.9),
    nq.scales, nq.phases,
    { core: 2.1, halo: 0.34, coreR: CORE_R, world: WORLD_HOMOGENEOUS },
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

  group.add(bulb.mesh, edges);

  // Three bright slots, all drawing from the single (homogeneous) path pool.
  const pool = makePulsePool(
    group,
    Array.from({ length: PULSE_CONCURRENT }, () => ({ paths, bright: true })),
    rng,
  );

  return {
    group,
    bulbs: [{ mat: bulb.mat, opa: 1.0, iBright: null }],
    labelNodes: [], // homogeneous fallback carries no named nodes
    edgeMat,
    pool,
    dispose: () => {
      bulb.geo.dispose(); bulb.mat.dispose();
      edgeGeo.dispose(); edgeMat.dispose();
      for (const p of pool) { p.geo.dispose(); p.mat.dispose(); }
    },
  };
}

// ── Flight rail (D-052.6 Phase 3) ───────────────────────────────────────────────
// A scroll-driven path that flies INTO and THROUGH the node field for off∈
// [FLIGHT_START, 1]. Control points are DERIVED FROM THE GENERATED GRAPH DATA
// (LAW-005), not hand-placed: waypoints sit at the xy-centroid of nodes in a set
// of depth bands, offset to alternating sides so the camera weaves between nodes,
// then nudged away from any node it would clip. deepFocus is the deep-cluster
// centroid the camera settles looking at.
const FLIGHT_START = 0.6; // = BEAT.diveEnd

function buildFlightRail(pos: Float32Array): {
  rail: THREE.CatmullRomCurve3;
  deepFocus: THREE.Vector3;
} {
  const N = pos.length / 3;
  let zmin = Infinity;
  let zmax = -Infinity;
  let cx = 0;
  let cy = 0;
  for (let i = 0; i < N; i++) {
    cx += pos[i * 3]! / N;
    cy += pos[i * 3 + 1]! / N;
    const z = pos[i * 3 + 2]!;
    if (z < zmin) zmin = z;
    if (z > zmax) zmax = z;
  }
  const zspan = Math.max(1e-3, zmax - zmin);

  // xy-centroid of nodes near a depth slice (Gaussian-ish weight on |z−zt|).
  const bandCentroid = (zt: number): [number, number] => {
    let sx = 0;
    let sy = 0;
    let w = 0;
    for (let i = 0; i < N; i++) {
      const dz = pos[i * 3 + 2]! - zt;
      const ww = 1 / (1 + 900 * dz * dz);
      sx += pos[i * 3]! * ww;
      sy += pos[i * 3 + 1]! * ww;
      w += ww;
    }
    return [sx / w, sy / w];
  };
  // Push a waypoint away from its nearest node so the flight never clips inside one.
  const avoidNodes = (p: THREE.Vector3, minD: number) => {
    let nd = Infinity;
    let nx = 0;
    let ny = 0;
    let nz = 0;
    for (let i = 0; i < N; i++) {
      const dx = p.x - pos[i * 3]!;
      const dy = p.y - pos[i * 3 + 1]!;
      const dz = p.z - pos[i * 3 + 2]!;
      const d = Math.hypot(dx, dy, dz);
      if (d < nd) {
        nd = d;
        nx = dx;
        ny = dy;
        nz = dz;
      }
    }
    if (nd < minD && nd > 1e-5) {
      const k = (minD - nd) / nd;
      p.x += nx * k;
      p.y += ny * k;
      p.z += nz * k;
    }
  };

  const pts: THREE.Vector3[] = [];
  // Start: outside the front face, framing the field (continuous with approach end).
  pts.push(new THREE.Vector3(cx * 0.3, cy * 0.5, zmax + 0.18));
  // Weave through interior depth bands, alternating sides.
  const bands = [0.28, 0.58, 0.86];
  bands.forEach((f, k) => {
    const zt = zmax - f * zspan;
    const [ccx, ccy] = bandCentroid(zt);
    const side = k % 2 === 0 ? -1 : 1;
    const wp = new THREE.Vector3(ccx + side * 0.075, ccy + side * 0.03, zt);
    avoidNodes(wp, 0.045);
    pts.push(wp);
  });
  // Settle: inside the field, just in front of the deep cluster, looking in.
  const settleZ = zmin + 0.06;
  const [scx, scy] = bandCentroid(settleZ + 0.02);
  const settle = new THREE.Vector3(scx * 0.5, scy, settleZ);
  avoidNodes(settle, 0.05);
  pts.push(settle);

  const rail = new THREE.CatmullRomCurve3(pts, false, "catmullrom", 0.5);

  // Deep focus = centroid of the deepest ~40% of nodes.
  const zThresh = zmin + 0.4 * zspan;
  let dfx = 0;
  let dfy = 0;
  let dfz = 0;
  let dw = 0;
  for (let i = 0; i < N; i++) {
    const z = pos[i * 3 + 2]!;
    if (z <= zThresh) {
      dfx += pos[i * 3]!;
      dfy += pos[i * 3 + 1]!;
      dfz += z;
      dw++;
    }
  }
  const deepFocus =
    dw > 0
      ? new THREE.Vector3(dfx / dw, dfy / dw, dfz / dw)
      : new THREE.Vector3(cx, cy, zmin);

  return { rail, deepFocus };
}

// ── SceneContent ──────────────────────────────────────────────────────────────

function SceneContent({
  data,
  isMobile,
  offsetRef,
  labelSlots,
}: {
  data: HeroFace3D;
  isMobile: boolean;
  offsetRef: MutableRefObject<number>;
  labelSlots?: MutableRefObject<(HTMLElement | null)[]>;
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
  // ── Flight rail (D-052.6 Phase 3): the through-the-network journey ─────
  const flight = useMemo(
    () => buildFlightRail(decodeInnerPositions(data)),
    [data],
  );

  const camPos = useMemo(() => new THREE.Vector3(), []);
  const lookTarget = useMemo(() => new THREE.Vector3(), []);
  // Reusable temporaries (allocation-free per frame).
  const tmp = useMemo(
    () => ({
      v: new THREE.Vector3(),
      world: new THREE.Vector3(),
      mat: new THREE.Matrix4(),
      quat: new THREE.Quaternion(),
      up: new THREE.Vector3(0, 1, 0),
    }),
    [],
  );

  // Next scheduled pulse-launch time (clock seconds); 0 → launch immediately.
  const pulseNext = useRef(0);
  // Stable slot→node assignment for the ≤3 proximity labels (no flicker).
  const slotNodes = useRef<(LabelNode | null)[]>([null, null, null]);

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

    // Bulb layers: uOpacity (graduated) + uTime (breathing) + uViewScale
    // (normalises apparent size to the reference viewport height).
    const viewScale = REF_VIEW_H / Math.max(1, state.size.height);
    for (const b of inner.bulbs) {
      b.mat.uniforms.uOpacity!.value = innerOpacity * b.opa;
      b.mat.uniforms.uTime!.value = t;
      b.mat.uniforms.uViewScale!.value = viewScale;
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

    // ── Camera: approach (→0.60) then the flight THROUGH the field (0.60→1) ─
    const fog = state.scene.fog as THREE.Fog | null;
    if (off <= FLIGHT_START) {
      // Approach: unchanged framing (face right-of-centre — headline reads left).
      const u = FLIGHT_START > 0 ? off / FLIGHT_START : 1;
      rail.getPointAt(clamp01(u), camPos);
      rail.getPointAt(clamp01(u + 0.02), lookTarget);
      camera.position.lerp(camPos, 0.2);
      camera.lookAt(lookTarget);
      if (fog) {
        const k = smoothstep(BEAT.faceEnd, BEAT.diveEnd, off);
        fog.near = lerp(20, 0.9, k);
        fog.far = lerp(30, 4.0, k);
      }
    } else {
      // Flight: slow-in / steady / slow-out; camera path is offset into node
      // world-space (+sceneXOffset) so it truly weaves through the nodes.
      const raw = (off - FLIGHT_START) / (1 - FLIGHT_START);
      const u = smootherstep(raw);
      // Ease the world-X shift in over the first slice so there's no lurch as
      // we cross from the approach (face right-of-centre) into the node field.
      const xShift = sceneXOffset * smoothstep(FLIGHT_START, FLIGHT_START + 0.08, off);
      flight.rail.getPointAt(clamp01(u), camPos);
      camPos.x += xShift;
      // Look-ahead along the rail (t+0.006); at the very end follow the tangent.
      const la = Math.min(u + 0.006, 1);
      flight.rail.getPointAt(la, lookTarget);
      lookTarget.x += xShift;
      if (la >= 1) {
        flight.rail.getTangentAt(1, tmp.v);
        lookTarget.copy(camPos).addScaledVector(tmp.v, 0.12);
      }
      // Settle framing: bias toward the deep-cluster focus near the end.
      const settle = smoothstep(0.82, 1, raw);
      tmp.world.copy(flight.deepFocus);
      tmp.world.x += xShift;
      lookTarget.lerp(tmp.world, 0.35 * settle);

      camera.position.lerp(camPos, 0.14);
      // Damped orientation (slerp ~0.08) → smooth, never jerky.
      tmp.mat.lookAt(camera.position, lookTarget, tmp.up);
      tmp.quat.setFromRotationMatrix(tmp.mat);
      camera.quaternion.slerp(tmp.quat, 0.08);

      // Fog tracks the camera (view-relative), tuned so field depth reads.
      if (fog) {
        fog.near = 0.04;
        fog.far = 0.6;
      }
    }

    // ── Proximity labels + brightening (flight only) ─────────────────────
    updateLabels(off, innerOpacity);
  });

  // Project/skill proximity: brighten the nearest ≤3 nodes and drive their DOM
  // labels (projected from 3D). Stable slot assignment avoids label flicker.
  function updateLabels(off: number, innerOpacity: number) {
    const nodes = inner.labelNodes;
    const slots = slotNodes.current;
    const els = labelSlots?.current;

    const active = off > FLIGHT_START && innerOpacity > 0.5 && nodes.length > 0;

    // Reset all per-node brightness to 1.0 each frame; boost the near ones below.
    for (const n of nodes) n.bright.setX(n.index, 1);

    if (!active) {
      for (let i = 0; i < slots.length; i++) {
        slots[i] = null;
        const el = els?.[i];
        if (el) el.style.opacity = "0";
      }
      inner.bulbs.forEach((b) => b.iBright && (b.iBright.needsUpdate = true));
      return;
    }

    // Rank nodes by camera distance; the nearest 3 within PROX are candidates.
    const PROX = 0.14;
    const ranked = nodes
      .map((n) => {
        tmp.world.copy(n.pos);
        tmp.world.x += sceneXOffset;
        return { n, dist: camera.position.distanceTo(tmp.world) };
      })
      .filter((c) => c.dist < PROX)
      .sort((a, b) => a.dist - b.dist)
      .slice(0, 3);

    const chosen = new Set(ranked.map((c) => c.n));
    // Free slots whose node dropped out.
    for (let i = 0; i < slots.length; i++) {
      if (slots[i] && !chosen.has(slots[i]!)) {
        slots[i] = null;
        const el = els?.[i];
        if (el) el.style.opacity = "0";
      }
    }
    // Assign new candidates to free slots (keep existing ones in place).
    for (const c of ranked) {
      if (slots.includes(c.n)) continue;
      const free = slots.indexOf(null);
      if (free >= 0) slots[free] = c.n;
    }

    // Update each occupied slot: brighten node + place/label + fade by proximity.
    for (let i = 0; i < slots.length; i++) {
      const n = slots[i];
      const el = els?.[i];
      if (!n) continue;
      tmp.world.copy(n.pos);
      tmp.world.x += sceneXOffset;
      const dist = camera.position.distanceTo(tmp.world);
      const prox = smoothstep(PROX, PROX * 0.45, dist); // 1 near → 0 at threshold
      n.bright.setX(n.index, 1 + (PROX_BOOST - 1) * prox);
      if (!el) continue;
      tmp.v.copy(tmp.world).project(camera);
      if (tmp.v.z < 1) {
        const sx = (tmp.v.x * 0.5 + 0.5) * size.width;
        const sy = (-tmp.v.y * 0.5 + 0.5) * size.height;
        el.style.transform = `translate(${(sx + 14).toFixed(1)}px, ${(sy - 8).toFixed(1)}px)`;
        el.style.opacity = prox.toFixed(3);
        if (el.dataset.name !== n.name) {
          el.textContent = n.name;
          el.dataset.name = n.name;
          el.style.color = n.kind === "project" ? "#8fb4ff" : "#c3b0ff";
        }
      } else {
        el.style.opacity = "0";
      }
    }

    inner.bulbs.forEach((b) => b.iBright && (b.iBright.needsUpdate = true));
  }

  return (
    // FIX 4: shift entire scene right on desktop, centered on mobile
    <group position={[sceneXOffset, 0, 0]}>
      <primitive object={glow.mesh} />
      <primitive object={surface.points} />
      <primitive object={inner.group} />
    </group>
  );
}
