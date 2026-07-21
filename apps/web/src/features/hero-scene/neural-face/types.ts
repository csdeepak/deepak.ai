/**
 * Runtime shape of `public/hero-face-3d.json` (D-052 Track 2), produced by
 * `scripts/generate-hero-face.mjs`. Positions are signed ints quantized to
 * `meta.quant`; decode by dividing. Fetched at runtime — NEVER imported, so
 * three.js + this dataset stay out of the First Load JS of `/`.
 */
export interface HeroFace3D {
  meta: {
    version: number;
    format: string;
    surfaceNodes: number;
    /** First N surface nodes (by score) = the mobile tier. */
    mobileCount: number;
    innerNodes: number;
    innerEdges: number;
    innerPulses: number;
    quant: number;
    relief: number;
    aspect: number;
    sourceHash: string;
    generatedAt: string;
  };
  surface: { x: number[]; y: number[]; z: number[]; b: number[] };
  inner: { x: number[]; y: number[]; z: number[]; edges: number[]; pulses: number[][] };
}

/** Minimal structural validation before we build GPU buffers. */
export function isHeroFace3D(v: unknown): v is HeroFace3D {
  if (!v || typeof v !== "object") return false;
  const d = v as Record<string, unknown>;
  const meta = d.meta as Record<string, unknown> | undefined;
  const s = d.surface as Record<string, unknown> | undefined;
  const inner = d.inner as Record<string, unknown> | undefined;
  return (
    !!meta &&
    typeof meta.quant === "number" &&
    !!s &&
    Array.isArray(s.x) &&
    Array.isArray(s.y) &&
    Array.isArray(s.z) &&
    Array.isArray(s.b) &&
    s.x.length === s.y.length &&
    s.x.length === s.z.length &&
    !!inner &&
    Array.isArray(inner.x) &&
    Array.isArray(inner.edges) &&
    Array.isArray(inner.pulses)
  );
}

/** Decoded, GPU-ready buffers (Float32) for a node set. */
export interface DecodedLayer {
  /** Interleaved xyz, length = count × 3. */
  positions: Float32Array;
  /** Per-node brightness 0..1, length = count. */
  brightness: Float32Array;
  count: number;
}

/**
 * Decode the surface layer to Float32 buffers. `limit` caps the node count
 * (the dataset is score-ordered, so the first `limit` are the strongest) —
 * used to serve the 2500-node mobile tier from the same file.
 */
export function decodeSurface(data: HeroFace3D, limit?: number): DecodedLayer {
  const q = data.meta.quant;
  const total = data.surface.x.length;
  const count = limit ? Math.min(limit, total) : total;
  const positions = new Float32Array(count * 3);
  const brightness = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    positions[i * 3] = data.surface.x[i]! / q;
    positions[i * 3 + 1] = data.surface.y[i]! / q;
    positions[i * 3 + 2] = data.surface.z[i]! / q;
    brightness[i] = data.surface.b[i]! / 255;
  }
  return { positions, brightness, count };
}

/** Decode inner-network node positions to a Float32 xyz buffer. */
export function decodeInnerPositions(data: HeroFace3D): Float32Array {
  const q = data.meta.quant;
  const n = data.inner.x.length;
  const out = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    out[i * 3] = data.inner.x[i]! / q;
    out[i * 3 + 1] = data.inner.y[i]! / q;
    out[i * 3 + 2] = data.inner.z[i]! / q;
  }
  return out;
}
