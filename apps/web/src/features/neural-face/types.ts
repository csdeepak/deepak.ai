/**
 * The runtime shape of `public/hero-face.json` (D-050 Track 1).
 *
 * Produced by `scripts/generate-hero-face.mjs`. Quantized + flat by
 * design: positions are integer grid coords, depth/brightness are 0-255,
 * edges are flat index pairs. The component NEVER imports this file — it
 * is fetched at runtime so it never enters the JS bundle.
 */
export interface HeroFaceData {
  meta: {
    version: number;
    /** Working-grid dimensions [width, height] the positions live in. */
    grid: [number, number];
    nodes: number;
    edges: number;
    pulses: number;
    sourceHash: string;
    generatedAt: string;
  };
  /** Flat integer grid coords: [x0, y0, x1, y1, …] (length = nodes × 2). */
  pos: number[];
  /** Per-node pseudo-depth, 0-255 (length = nodes). */
  depth: number[];
  /** Per-node render brightness, 0-255 (length = nodes). */
  bright: number[];
  /** Flat node-index pairs: [a0, b0, a1, b1, …] (length = edges × 2). */
  edges: number[];
  /** Random-walk paths as node-index arrays. */
  pulses: number[][];
}

/** Minimal structural validation of fetched data before we render it. */
export function isHeroFaceData(v: unknown): v is HeroFaceData {
  if (!v || typeof v !== "object") return false;
  const d = v as Record<string, unknown>;
  const meta = d.meta as Record<string, unknown> | undefined;
  return (
    Array.isArray(d.pos) &&
    Array.isArray(d.depth) &&
    Array.isArray(d.bright) &&
    Array.isArray(d.edges) &&
    Array.isArray(d.pulses) &&
    !!meta &&
    Array.isArray(meta.grid) &&
    d.pos.length === d.depth.length * 2 &&
    d.bright.length === d.depth.length
  );
}
