/** Hero scene shared types (docs/22 contracts). */

/** Tier ladder (docs/17 §10). 0 = 2D fallback (no 3D bytes). */
export type Tier = 0 | 1 | 2;

export interface TierDecision {
  tier: Tier;
  reducedMotion: boolean;
}

/** Acts derived from scroll thresholds (docs/18 §11). */
export type ActIndex = 0 | 1 | 2 | 3 | 4;

/** Feature flags the PerfGovernor sheds in order (docs/18 §12). */
export interface QualityFlags {
  particles: boolean;
  lightingDrift: boolean;
  nodeDrift: boolean;
  parallax: boolean;
}

/**
 * Content group a node belongs to — drives act-based illumination
 * (bible §6.2: Act III work orbits, Act IV research glows). Maps to
 * ContentType families when real data feeds the graph.
 */
export type NodeGroup = "work" | "research" | "post";

/** Placeholder graph node datum — replaced by real ContentService data. */
export interface GraphNodeDatum {
  id: string;
  position: [number, number, number];
  /** 0–1; luminance = recency (bible §6.4). Placeholder values for now. */
  luminance: number;
  /** Content family — which act illuminates this node. */
  group: NodeGroup;
  /** Draw-in order 0–1 for the staggered boot reveal (bible §6.2). */
  birth: number;
  label: string;
}

/** Screen-space anchor for DOM focus proxies (docs/22 §12). */
export interface NodeAnchor {
  x: number;
  y: number;
  visible: boolean;
}

export type DexState = "resting" | "curious" | "introducing" | "active";

export type Frameloop = "always" | "demand" | "never";
