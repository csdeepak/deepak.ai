import type { GraphNodeDatum } from "./types";

/**
 * Hero scene constants — the single source for budgets, thresholds,
 * and stand-in layout (docs/22 appendix: "constants imported from a
 * single module"). Values trace to docs/17–18; placeholder layout is
 * replaced when real content data feeds the graph.
 */

/** Scroll region length (the rail occupies ~200vh — docs/18 §11). */
export const RAIL_REGION_VH = 200;

/** Act thresholds over scroll progress 0–1 (docs/18 §11 condensed). */
export const ACT_THRESHOLDS = [0, 0.1, 0.4, 0.6, 0.8] as const;

/** Camera damping time constant, seconds (docs/17 §4: ≤150ms). */
export const CAMERA_DAMPING = 0.15;

/** Pointer parallax cap, radians (~2°, docs/17 §4). */
export const PARALLAX_MAX = 0.035;

/** Dex breath period, seconds — the one permitted loop (docs/15). */
export const DEX_BREATH_PERIOD = 2.4;

/**
 * Boot sequence (bible §6.2, Act I — "the workspace comes online").
 * ≤1.2s, once per session, skippable, reduced-motion = instant.
 */
export const BOOT = {
  durationMs: 1100,
  /** Fraction of the boot over which node reveals are staggered. */
  nodeRevealWindow: 0.55,
  /** Per-node reveal ramp width (soft edge on the draw-in). */
  nodeRevealSoftness: 0.35,
  sessionKey: "dl-hero-booted",
} as const;

/**
 * Which act first illuminates each content group (bible §6.2):
 * Act II the engineer's current work, Act III the wider work orbit,
 * Act IV the research cluster. Posts ride with the work orbit.
 */
export const GROUP_ACT: Record<"work" | "research" | "post", number> = {
  work: 1,
  post: 2,
  research: 3,
};

/** PerfGovernor tuning (docs/22 §9, D-036). */
export const PERF = {
  sampleFrames: 60,
  degradeBelowFps: 45,
  recoverAboveFps: 57,
  recoverAfterMs: 5000,
  minDprScale: 0.75,
  dprStep: 0.25,
} as const;

/**
 * Reduced-motion stations: the five composed keyframes (docs/17 §4).
 * Indices into the rail parameter space.
 */
export const RM_STATIONS = [0, 0.25, 0.5, 0.65, 0.9] as const;

/**
 * Camera rail stand-in — hand-authored spline stations approximating
 * the five acts (Establishing → Constellation → Workbench → Audience
 * → Departure). SWAP TARGET: replaced by `cam_rail.glb` samples
 * (docs/21 §13) via the asset manifest when authored.
 */
export const RAIL_STATIONS: ReadonlyArray<{
  pos: [number, number, number];
  aim: [number, number, number];
}> = [
  { pos: [0, 1.6, 7.5], aim: [0.4, 1.0, 0] }, // I  — establishing
  { pos: [-1.6, 1.7, 4.4], aim: [-1.2, 1.4, 0] }, // II — constellation
  { pos: [1.2, 1.35, 2.6], aim: [1.9, 0.95, -0.4] }, // III — workbench
  { pos: [0.2, 1.45, 3.2], aim: [-0.3, 1.3, 0.6] }, // IV — audience (Dex)
  { pos: [-0.6, 3.2, 8.4], aim: [0.4, 0.9, -0.5] }, // V  — departure
];

/** Bench / Twin / Dex placeholder positions (docs/18 spatial thesis). */
export const BENCH_POS: [number, number, number] = [1.9, 0, -0.4];
export const TWIN_POS: [number, number, number] = [1.9, 0.55, -0.9];
export const DEX_PERCH: [number, number, number] = [-0.7, 1.5, 0.4];

/**
 * Placeholder knowledge graph — 24 asymmetric nodes (R2 guardrail:
 * no radial/grid symmetry) + typed edge pairs. SWAP TARGET: generated
 * from real ContentService data (docs/22 §4 content domain).
 *
 * Grouping (bible §6.4): nodes nearer the Twin are "work" (current,
 * warm); the far cool field is "research"; the mid-field is "post".
 * `birth` = normalized distance from the Twin, so the room assembles
 * OUTWARD from the engineer during boot (recency-as-proximity).
 */
const RAW_NODE_POSITIONS: ReadonlyArray<[number, number, number]> = [
  [-2.4, 1.9, -0.6], [-1.7, 2.4, 0.3], [-1.1, 1.6, -1.1], [-2.0, 1.1, 0.6],
  [-0.6, 2.1, 0.8], [-1.4, 0.8, -0.3], [-0.2, 1.4, -0.8], [-2.7, 1.5, 0.9],
  [-0.9, 2.7, -0.4], [0.3, 2.2, 0.2], [-1.9, 2.0, 1.2], [-0.4, 0.9, 0.9],
  [0.8, 1.8, -1.2], [-2.2, 2.6, 0.1], [0.1, 2.9, -0.9], [-1.2, 1.2, 1.5],
  [0.6, 0.7, 0.1], [-0.1, 1.9, 1.6], [-2.9, 2.1, -0.9], [0.9, 2.5, 0.9],
  [-1.6, 3.0, -1.0], [0.4, 1.1, -1.6], [-0.8, 0.6, -1.4], [1.1, 1.5, 1.3],
];

const distToTwin = (p: readonly [number, number, number]) =>
  Math.hypot(p[0] - TWIN_POS[0], p[1] - TWIN_POS[1], p[2] - TWIN_POS[2]);

const _dists = RAW_NODE_POSITIONS.map(distToTwin);
const _minD = Math.min(..._dists);
const _maxD = Math.max(..._dists);

export const PLACEHOLDER_NODES: readonly GraphNodeDatum[] =
  RAW_NODE_POSITIONS.map((p, i) => {
    const d = _dists[i] ?? _maxD;
    const birth = (d - _minD) / (_maxD - _minD || 1);
    // Nearer the Twin ⇒ current "work"; far cool field ⇒ "research".
    const group: GraphNodeDatum["group"] =
      birth < 0.34 ? "work" : birth < 0.68 ? "post" : "research";
    return {
      id: `node-${i}`,
      position: p,
      // Luminance = recency: nearer/newer reads brighter.
      luminance: 0.35 + (1 - birth) * 0.6,
      group,
      birth,
      label: `${group} node ${i + 1}`,
    };
  });

export const PLACEHOLDER_EDGES: ReadonlyArray<[number, number]> = [
  [0, 2], [1, 4], [2, 5], [3, 7], [4, 9], [5, 6], [6, 12], [8, 14],
  [9, 19], [10, 13], [11, 15], [12, 21], [1, 8], [4, 17], [7, 18],
  [16, 23], [0, 13], [15, 17], [20, 8], [22, 6],
];

/** Node visual params (stand-in). */
export const NODE_RADIUS = 0.055;
export const NODE_HOVER_SCALE = 1.6;
