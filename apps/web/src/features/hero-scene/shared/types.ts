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

/** Placeholder graph node datum — replaced by real ContentService data. */
export interface GraphNodeDatum {
  id: string;
  position: [number, number, number];
  /** 0–1; luminance = recency (docs/18 §6). Placeholder values for now. */
  luminance: number;
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
