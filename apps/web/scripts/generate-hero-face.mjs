/*
 * generate-hero-face.mjs — D-050 Track 1 "Neural Face Lite" asset pipeline.
 *
 * BUILD-TIME ONLY. Never runs in the browser. Turns a personal source
 * portrait into a compact, quantized particle-constellation dataset that
 * the <NeuralFaceHero /> Canvas2D component fetches at runtime.
 *
 * Run from apps/web:   npm run hero:generate
 *
 * ── Inputs / outputs ──────────────────────────────────────────────────
 *   IN : apps/web/scripts/assets/portrait-source.{jpg,jpeg,png}
 *        (the personal source photo — NOT committed; see gitignore note)
 *   OUT: apps/web/public/hero-face.json   (committed — the derived asset)
 *
 * ── Gitignore note (acknowledged anti-pattern) ────────────────────────
 *   `apps/web/scripts/assets/` is gitignored. The repo has a known
 *   "code/assets stranded on gitignored paths" anti-pattern; gitignoring
 *   is nonetheless CORRECT here because the input is a personal source
 *   photograph (LAW-008 / photography ethics — no likeness source in the
 *   repo). What IS committed is the DERIVED artifact (hero-face.json),
 *   which carries no recoverable photograph. A README.md is kept in that
 *   folder (git-tracked) so the drop location is always discoverable.
 *
 * ── Laws honored ──────────────────────────────────────────────────────
 *   LAW-008 (honesty over completeness): a missing source photo fails the
 *   script LOUDLY with a one-line instruction. It NEVER fabricates a
 *   placeholder face — no fake data, ever.
 *
 * Dependencies: `sharp` (already a dependency for next/image + media).
 *   Used here only at build time to read raw pixel luminance. No
 *   node-canvas, no TensorFlow, no MediaPipe. Pseudo-depth is luminance,
 *   not ML.
 */

import { createHash } from "node:crypto";
import { gzipSync } from "node:zlib";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ASSETS_DIR = join(__dirname, "assets");
const OUT_PATH = join(__dirname, "..", "public", "hero-face.json");

// ── Tunables (hard caps trace to the D-050 brief) ─────────────────────
const GRID_MAX_W = 220; // working-grid width cap (px)
const MAX_NODES_DEFAULT = 3000; // hard node cap
const MAX_NODES_RETRY = 2000; // lower cap for the one auto-retry
const MIN_NODES = 300; // dark-image floor (guarantees a face survives)
const MAX_EDGES = 6000; // edge cap
const KNN = 3; // k-nearest-neighbour edges
const EDGE_PRUNE_FACTOR = 2.5; // drop edges longer than 2.5× median
const PULSE_MIN = 4;
const PULSE_MAX = 6;
const PULSE_LEN_MIN = 25;
const PULSE_LEN_MAX = 60;
const GZIP_BUDGET_BYTES = 60 * 1024; // ≤ 60 KB gzipped
const LUM_WEIGHT = 0.4; // score = LUM_WEIGHT·luminance + ·edge
const EDGE_WEIGHT = 0.6; // edge-biased so eyes/nose/mouth/jaw win
// Portrait prior — a soft gaussian over the upper-centre (the face), so the
// node budget concentrates on identity-carrying features (eyes/nose/mouth/
// jaw) instead of the high-contrast suit lapels + bright shirt. Assumes a
// roughly-centred headshot (documented in scripts/assets/README.md). The
// FLOOR keeps the silhouette/shoulders faintly present.
const FACE_CX = 0.5; // face centre, x (fraction of grid width)
const FACE_CY = 0.4; // face centre, y (upper portion of a headshot)
const FACE_SX = 0.3; // gaussian spread, x
// D-052.3 Pillar 1: tightened vertical spread + lower floor so more of the
// 8k budget lands in the eye-line→mouth band (identity features) while the
// FLOOR still keeps the silhouette/shoulders faintly lit under the glow.
const FACE_SY = 0.32; // gaussian spread, y (was 0.34)
const FACE_FLOOR = 0.4; // periphery share (was 0.45)
const FORMAT_VERSION = 2;

// ── 3D pipeline v2 (D-052 Track 2) ────────────────────────────────────
// Emits hero-face-3d.json (surface relief + inner network) and a static
// poster webp at two sizes. The 2D output above is left untouched.
const OUT_3D_PATH = join(__dirname, "..", "public", "hero-face-3d.json");
const POSTER_PATH = join(__dirname, "..", "public", "hero-face-poster.webp");
const POSTER_SM_PATH = join(__dirname, "..", "public", "hero-face-poster-sm.webp");
const SURFACE_MAX = 8000; // desktop tier node cap
const SURFACE_MOBILE = 2500; // mobile tier (first N by score)
const SURFACE_RELIEF = 0.16; // z relief depth in normalized units (subtle)
const INNER_NODES = 280; // "inside the head" network
const INNER_KNN = 3;
const INNER_Z_MIN = -0.3; // pushed behind the surface
const INNER_Z_MAX = -0.06;
const INNER_PULSE_MIN = 10;
const INNER_PULSE_MAX = 14;
const INNER_PULSE_LEN_MIN = 25;
const INNER_PULSE_LEN_MAX = 50;
const POS_QUANT = 2048; // positions quantized to signed ints /POS_QUANT
const JSON3D_GZIP_BUDGET = 140 * 1024; // ≤ 140 KB gzipped
const POSTER_BUDGET = 90 * 1024; // ≤ 90 KB combined
const POSTER_W = 1440;
const POSTER_SM_W = 720;
const FORMAT_3D_VERSION = 1;

// Deterministic PRNG (mulberry32) — seeded from the image hash so a given
// photo always yields the same constellation (reproducible builds).
function makeRng(seed) {
  let a = seed >>> 0;
  return function rng() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function die(msg) {
  console.error(`\n✗ ${msg}\n`);
  process.exit(1);
}

function findSource() {
  for (const name of [
    "portrait-source.jpg",
    "portrait-source.jpeg",
    "portrait-source.png",
  ]) {
    const p = join(ASSETS_DIR, name);
    if (existsSync(p)) return p;
  }
  return null;
}

/**
 * Core generation for a given node cap. Returns the JSON-ready object.
 * Pure aside from reading the (already-loaded) pixel buffer.
 */
function build({ lum, edge, gw, gh, seed, sourceHash, nodeCap }) {
  const total = gw * gh;
  const rng = makeRng(seed);

  // ── Per-pixel score: luminance + edge weight (edge-biased) ──────────
  // Normalize luminance and edge magnitude to 0..1 first.
  let maxEdge = 1;
  for (let i = 0; i < total; i++) if (edge[i] > maxEdge) maxEdge = edge[i];
  const score = new Float32Array(total);
  for (let i = 0; i < total; i++) {
    const nl = lum[i] / 255;
    const ne = edge[i] / maxEdge;
    const x = i % gw;
    const y = (i / gw) | 0;
    // Portrait prior: gaussian over the upper-centre face region.
    const dx = (x - gw * FACE_CX) / (gw * FACE_SX);
    const dy = (y - gh * FACE_CY) / (gh * FACE_SY);
    const prior = FACE_FLOOR + (1 - FACE_FLOOR) * Math.exp(-(dx * dx + dy * dy));
    score[i] = (LUM_WEIGHT * nl + EDGE_WEIGHT * ne) * prior;
  }

  // Adaptive threshold: mean + 0.4·std of the score field. Then take the
  // top-scoring pixels. Rank-then-clamp GUARANTEES nodes even for a very
  // dark image (we always keep the brightest/edgiest MIN_NODES).
  let mean = 0;
  for (let i = 0; i < total; i++) mean += score[i];
  mean /= total;
  let variance = 0;
  for (let i = 0; i < total; i++) {
    const d = score[i] - mean;
    variance += d * d;
  }
  const std = Math.sqrt(variance / total);
  const threshold = mean + 0.4 * std;

  // Order all pixel indices by score descending.
  const order = new Int32Array(total);
  for (let i = 0; i < total; i++) order[i] = i;
  // Simple, fast: sort a typed array via Array (total ≤ ~60k — trivial).
  const orderArr = Array.from(order).sort((a, b) => score[b] - score[a]);

  let aboveThreshold = 0;
  for (let i = 0; i < total; i++) if (score[i] >= threshold) aboveThreshold++;

  const nodeCount = Math.min(
    nodeCap,
    Math.max(MIN_NODES, aboveThreshold, 0) || Math.min(nodeCap, total),
  );
  const keep = orderArr.slice(0, Math.min(nodeCount, total));

  // ── Node arrays (flat, integer / 0-255 quantized) ───────────────────
  const N = keep.length;
  const pos = new Array(N * 2);
  const depth = new Array(N); // pseudo-depth from luminance, 0-255
  const bright = new Array(N); // render brightness from luminance, 0-255
  const nx = new Float64Array(N); // working copies for KNN
  const ny = new Float64Array(N);
  for (let k = 0; k < N; k++) {
    const idx = keep[k];
    const x = idx % gw;
    const y = (idx / gw) | 0;
    pos[k * 2] = x;
    pos[k * 2 + 1] = y;
    nx[k] = x;
    ny[k] = y;
    const q = lum[idx]; // already 0-255
    depth[k] = q;
    bright[k] = q;
  }

  // ── KNN edges via a spatial bucket index (no O(n²) sweep) ────────────
  // Bucket size ≈ expected node spacing so neighbour queries touch a
  // small, bounded set of buckets.
  const cell = Math.max(2, Math.round(Math.sqrt((gw * gh) / Math.max(1, N))));
  const cols = Math.ceil(gw / cell);
  const rows = Math.ceil(gh / cell);
  const buckets = new Map(); // key = cy*cols+cx → number[] of node indices
  const cellOf = (k) => {
    const cx = Math.min(cols - 1, (nx[k] / cell) | 0);
    const cy = Math.min(rows - 1, (ny[k] / cell) | 0);
    return cy * cols + cx;
  };
  for (let k = 0; k < N; k++) {
    const key = cellOf(k);
    const b = buckets.get(key);
    if (b) b.push(k);
    else buckets.set(key, [k]);
  }

  const edgeSet = new Set(); // "min-max" dedupe of undirected edges
  const edgeA = [];
  const edgeB = [];
  const edgeLen = [];
  const nbrIdx = new Int32Array(KNN);
  const nbrDist = new Float64Array(KNN);

  for (let k = 0; k < N; k++) {
    // Reset the running KNN shortlist.
    for (let s = 0; s < KNN; s++) {
      nbrIdx[s] = -1;
      nbrDist[s] = Infinity;
    }
    const cx = Math.min(cols - 1, (nx[k] / cell) | 0);
    const cy = Math.min(rows - 1, (ny[k] / cell) | 0);
    // Expand the search ring until we have KNN candidates (bounded).
    let ring = 1;
    let found = 0;
    while (ring <= Math.max(cols, rows)) {
      for (let gyc = cy - ring; gyc <= cy + ring; gyc++) {
        if (gyc < 0 || gyc >= rows) continue;
        for (let gxc = cx - ring; gxc <= cx + ring; gxc++) {
          if (gxc < 0 || gxc >= cols) continue;
          // Only scan the fresh outer ring cells.
          const onRing =
            gxc === cx - ring ||
            gxc === cx + ring ||
            gyc === cy - ring ||
            gyc === cy + ring;
          if (ring > 1 && !onRing) continue;
          const b = buckets.get(gyc * cols + gxc);
          if (!b) continue;
          for (let bi = 0; bi < b.length; bi++) {
            const j = b[bi];
            if (j === k) continue;
            const dx = nx[k] - nx[j];
            const dy = ny[k] - ny[j];
            const d2 = dx * dx + dy * dy;
            // Insert into the KNN shortlist (insertion sort, size KNN).
            if (d2 < nbrDist[KNN - 1]) {
              let s = KNN - 1;
              while (s > 0 && nbrDist[s - 1] > d2) {
                nbrDist[s] = nbrDist[s - 1];
                nbrIdx[s] = nbrIdx[s - 1];
                s--;
              }
              nbrDist[s] = d2;
              nbrIdx[s] = j;
              found++;
            }
          }
        }
      }
      // One extra ring past first-fill catches nearer neighbours that
      // live diagonally in an outer cell.
      if (found >= KNN && ring >= 2) break;
      ring++;
    }
    for (let s = 0; s < KNN; s++) {
      const j = nbrIdx[s];
      if (j < 0) continue;
      const a = k < j ? k : j;
      const bb = k < j ? j : k;
      const key = a * N + bb;
      if (edgeSet.has(key)) continue;
      edgeSet.add(key);
      edgeA.push(a);
      edgeB.push(bb);
      edgeLen.push(Math.sqrt(nbrDist[s]));
    }
  }

  // Prune edges longer than EDGE_PRUNE_FACTOR × median length.
  const sortedLen = [...edgeLen].sort((a, b) => a - b);
  const median = sortedLen.length
    ? sortedLen[sortedLen.length >> 1]
    : 0;
  const maxLen = median * EDGE_PRUNE_FACTOR;

  let kept = [];
  for (let e = 0; e < edgeA.length; e++) {
    if (maxLen === 0 || edgeLen[e] <= maxLen) {
      kept.push(e);
    }
  }
  // Cap edge count: if still over budget, keep the SHORTEST edges (the
  // structural, face-hugging ones read best; long spans are noise).
  if (kept.length > MAX_EDGES) {
    kept.sort((a, b) => edgeLen[a] - edgeLen[b]);
    kept = kept.slice(0, MAX_EDGES);
  }

  const edges = new Array(kept.length * 2);
  const adj = Array.from({ length: N }, () => []);
  for (let i = 0; i < kept.length; i++) {
    const e = kept[i];
    edges[i * 2] = edgeA[e];
    edges[i * 2 + 1] = edgeB[e];
    adj[edgeA[e]].push(edgeB[e]);
    adj[edgeB[e]].push(edgeA[e]);
  }

  // ── Pulse paths: random walks along edges, spanning face regions ────
  // Seed one walk per region (quadrants) so pulses cross different areas.
  const pulseCount = PULSE_MIN + Math.floor(rng() * (PULSE_MAX - PULSE_MIN + 1));
  const pulses = [];
  const regionSeed = (qx, qy) => {
    // Pick the highest-degree node whose grid position lands in quadrant.
    let best = -1;
    let bestDeg = -1;
    for (let k = 0; k < N; k++) {
      const inX = qx === 0 ? nx[k] < gw / 2 : nx[k] >= gw / 2;
      const inY = qy === 0 ? ny[k] < gh / 2 : ny[k] >= gh / 2;
      if (inX && inY && adj[k].length > bestDeg) {
        bestDeg = adj[k].length;
        best = k;
      }
    }
    return best;
  };
  const quadrants = [
    [0, 0],
    [1, 0],
    [0, 1],
    [1, 1],
    [0, 0],
    [1, 1],
  ];
  for (let p = 0; p < pulseCount; p++) {
    const [qx, qy] = quadrants[p % quadrants.length];
    let start = regionSeed(qx, qy);
    if (start < 0) {
      // Fallback: any node with neighbours.
      start = adj.findIndex((a) => a.length > 0);
    }
    if (start < 0) break;
    const targetLen =
      PULSE_LEN_MIN + Math.floor(rng() * (PULSE_LEN_MAX - PULSE_LEN_MIN + 1));
    const path = [start];
    let prev = -1;
    let cur = start;
    for (let step = 0; step < targetLen; step++) {
      const nbrs = adj[cur];
      if (!nbrs.length) break;
      // Prefer a neighbour that isn't the one we just came from.
      let choices = nbrs.filter((n) => n !== prev);
      if (!choices.length) choices = nbrs;
      const next = choices[Math.floor(rng() * choices.length)];
      path.push(next);
      prev = cur;
      cur = next;
    }
    if (path.length >= 3) pulses.push(path);
  }

  return {
    meta: {
      version: FORMAT_VERSION,
      grid: [gw, gh],
      nodes: N,
      edges: kept.length,
      pulses: pulses.length,
      sourceHash,
      generatedAt: new Date().toISOString(),
    },
    pos, // flat [x0,y0,x1,y1,...] integer grid coords
    depth, // flat [0-255] per node (pseudo-depth = luminance)
    bright, // flat [0-255] per node (render brightness = luminance)
    edges, // flat [a0,b0,a1,b1,...] node-index pairs
    pulses, // array of node-index arrays
  };
}

/**
 * Compute the per-pixel identity score field (luminance + edge, biased by
 * the face prior). Shared shape with build()'s inline scorer; kept separate
 * so the 2D path stays byte-for-byte unchanged.
 */
function scoreField(lum, edge, gw, gh) {
  const total = gw * gh;
  let maxEdge = 1;
  for (let i = 0; i < total; i++) if (edge[i] > maxEdge) maxEdge = edge[i];
  const score = new Float32Array(total);
  for (let i = 0; i < total; i++) {
    const nl = lum[i] / 255;
    const ne = edge[i] / maxEdge;
    const x = i % gw;
    const y = (i / gw) | 0;
    const dx = (x - gw * FACE_CX) / (gw * FACE_SX);
    const dy = (y - gh * FACE_CY) / (gh * FACE_SY);
    const prior = FACE_FLOOR + (1 - FACE_FLOOR) * Math.exp(-(dx * dx + dy * dy));
    score[i] = (LUM_WEIGHT * nl + EDGE_WEIGHT * ne) * prior;
  }
  return score;
}

/**
 * build3D — the Track-2 dataset. Surface layer = the portrait as a 3D
 * particle relief (z from luminance OR an optional depth map); nodes are
 * ordered by score so the first SURFACE_MOBILE are the mobile tier. Inner
 * layer = ~INNER_NODES sampled inside the head volume, kNN-connected, with
 * precomputed pulse paths (directed energy). All positions quantized.
 */
function build3D({ lum, edge, depthArr, gw, gh, seed, sourceHash }) {
  const total = gw * gh;
  const rng = makeRng(seed ^ 0x9e3779b9);
  const score = scoreField(lum, edge, gw, gh);

  // Order pixels by score desc; keep the top SURFACE_MAX (MIN_NODES floor).
  const orderArr = Array.from({ length: total }, (_, i) => i).sort(
    (a, b) => score[b] - score[a],
  );
  const N = Math.min(SURFACE_MAX, Math.max(MIN_NODES, orderArr.length));
  const keep = orderArr.slice(0, N);

  const aspect = gw / gh;
  const q = (v) => Math.round(v * POS_QUANT);
  const sx = new Array(N);
  const sy = new Array(N);
  const sz = new Array(N);
  const sb = new Array(N); // brightness 0-255
  const gpx = new Array(N); // grid px (poster)
  const gpy = new Array(N);
  for (let k = 0; k < N; k++) {
    const idx = keep[k];
    const px = idx % gw;
    const py = (idx / gw) | 0;
    gpx[k] = px;
    gpy[k] = py;
    // Centered, aspect-correct, y-up normalized coords.
    const nx = (px / gw - 0.5) * aspect;
    const ny = 0.5 - py / gh;
    const zd = depthArr[idx] / 255; // 0..1 (bright/near = 1)
    const nz = (zd - 0.5) * SURFACE_RELIEF;
    sx[k] = q(nx);
    sy[k] = q(ny);
    sz[k] = q(nz);
    sb[k] = lum[idx];
  }

  // ── Inner network: sample inside the face ellipse, pushed behind ──────
  // Ellipse from the face prior (normalized, aspect-correct), inset so the
  // points sit inside the head volume rather than on the silhouette.
  const ecx = (FACE_CX - 0.5) * aspect;
  const ecy = 0.5 - FACE_CY;
  const erx = FACE_SX * aspect * 0.85;
  const ery = FACE_SY * 0.95;
  const ix = new Array(INNER_NODES);
  const iy = new Array(INNER_NODES);
  const iz = new Array(INNER_NODES);
  const inx = new Float64Array(INNER_NODES);
  const iny = new Float64Array(INNER_NODES);
  const inz = new Float64Array(INNER_NODES);
  for (let k = 0; k < INNER_NODES; k++) {
    // Rejection-sample within the unit disk, then map to the inset ellipse.
    let ux, uy;
    do {
      ux = rng() * 2 - 1;
      uy = rng() * 2 - 1;
    } while (ux * ux + uy * uy > 1);
    const nx = ecx + ux * erx * 0.72;
    const ny = ecy + uy * ery * 0.72;
    const nz = INNER_Z_MIN + rng() * (INNER_Z_MAX - INNER_Z_MIN);
    inx[k] = nx;
    iny[k] = ny;
    inz[k] = nz;
    ix[k] = q(nx);
    iy[k] = q(ny);
    iz[k] = q(nz);
  }

  // kNN (k=3) among inner nodes — O(n²) is trivial at 280.
  const innerEdgeSet = new Set();
  const innerEdges = [];
  const adj = Array.from({ length: INNER_NODES }, () => []);
  for (let k = 0; k < INNER_NODES; k++) {
    const best = [];
    for (let j = 0; j < INNER_NODES; j++) {
      if (j === k) continue;
      const dx = inx[k] - inx[j];
      const dy = iny[k] - iny[j];
      const dz = inz[k] - inz[j];
      const d2 = dx * dx + dy * dy + dz * dz;
      best.push([d2, j]);
    }
    best.sort((a, b) => a[0] - b[0]);
    for (let s = 0; s < INNER_KNN; s++) {
      const j = best[s][1];
      const a = k < j ? k : j;
      const b = k < j ? j : k;
      const key = a * INNER_NODES + b;
      if (innerEdgeSet.has(key)) continue;
      innerEdgeSet.add(key);
      innerEdges.push(a, b);
      adj[a].push(b);
      adj[b].push(a);
    }
  }

  // Pulse paths: random walks along inner edges spanning the volume.
  const pulseCount =
    INNER_PULSE_MIN + Math.floor(rng() * (INNER_PULSE_MAX - INNER_PULSE_MIN + 1));
  const innerPulses = [];
  for (let p = 0; p < pulseCount; p++) {
    let cur = Math.floor(rng() * INNER_NODES);
    if (!adj[cur].length) {
      cur = adj.findIndex((a) => a.length > 0);
      if (cur < 0) break;
    }
    const targetLen =
      INNER_PULSE_LEN_MIN +
      Math.floor(rng() * (INNER_PULSE_LEN_MAX - INNER_PULSE_LEN_MIN + 1));
    const path = [cur];
    let prev = -1;
    for (let step = 0; step < targetLen; step++) {
      const nbrs = adj[cur];
      if (!nbrs.length) break;
      let choices = nbrs.filter((n) => n !== prev);
      if (!choices.length) choices = nbrs;
      const next = choices[Math.floor(rng() * choices.length)];
      path.push(next);
      prev = cur;
      cur = next;
    }
    if (path.length >= 3) innerPulses.push(path);
  }

  const json = {
    meta: {
      version: FORMAT_3D_VERSION,
      format: "3d",
      surfaceNodes: N,
      mobileCount: Math.min(SURFACE_MOBILE, N),
      innerNodes: INNER_NODES,
      innerEdges: innerEdges.length / 2,
      innerPulses: innerPulses.length,
      quant: POS_QUANT,
      relief: SURFACE_RELIEF,
      aspect,
      sourceHash,
      generatedAt: new Date().toISOString(),
    },
    surface: { x: sx, y: sy, z: sz, b: sb },
    inner: { x: ix, y: iy, z: iz, edges: innerEdges, pulses: innerPulses },
  };
  return { json, gpx, gpy, sb, N };
}

/**
 * renderPoster — a real matte render of the real surface data (T5/LAW-008:
 * a render of the data, never a mockup). Splats a soft cool dot per node
 * onto the dark stage, additively, then encodes to webp. No motion.
 */
async function renderPoster(width, gpx, gpy, sb, N, gw, gh) {
  const height = Math.max(1, Math.round((width * gh) / gw));
  const buf = Buffer.alloc(width * height * 3);
  // Stage color #0A0B0D.
  for (let i = 0; i < width * height; i++) {
    buf[i * 3] = 0x0a;
    buf[i * 3 + 1] = 0x0b;
    buf[i * 3 + 2] = 0x0d;
  }
  // Cool node tint (blue-white leading edge of the gradient).
  const TINT = [188, 205, 245];
  const r = Math.max(1, Math.round(width / 900)); // splat radius (px)
  const splat = (cx, cy, a) => {
    for (let dy = -r; dy <= r; dy++) {
      const y = cy + dy;
      if (y < 0 || y >= height) continue;
      for (let dx = -r; dx <= r; dx++) {
        const x = cx + dx;
        if (x < 0 || x >= width) continue;
        const d2 = dx * dx + dy * dy;
        const fall = Math.exp(-d2 / (r * r + 0.0001));
        const alpha = a * fall;
        if (alpha <= 0.003) continue;
        const o = (y * width + x) * 3;
        buf[o] = Math.min(255, buf[o] + TINT[0] * alpha);
        buf[o + 1] = Math.min(255, buf[o + 1] + TINT[1] * alpha);
        buf[o + 2] = Math.min(255, buf[o + 2] + TINT[2] * alpha);
      }
    }
  };
  for (let k = 0; k < N; k++) {
    const x = Math.round((gpx[k] / gw) * width);
    const y = Math.round((gpy[k] / gh) * height);
    const a = 0.18 + 0.55 * (sb[k] / 255); // brightness-weighted
    splat(x, y, a);
  }
  return sharp(buf, { raw: { width, height, channels: 3 } })
    .webp({ quality: 58, effort: 6 })
    .toBuffer();
}

async function main() {
  const src = findSource();
  if (!src) {
    // LAW-008: fail loudly with the exact drop location. No fake face.
    die(
      `No source portrait found. Drop your photo at: apps/web/scripts/assets/portrait-source.jpg (or .png), then run: npm run hero:generate`,
    );
  }

  const inputBuffer = readFileSync(src);
  const sourceHash = createHash("sha256")
    .update(inputBuffer)
    .digest("hex")
    .slice(0, 16);
  const seed = parseInt(sourceHash.slice(0, 8), 16) >>> 0;

  // Memory-safe: downscale FIRST (sharp streams the decode; we never hold
  // a huge raw buffer). Preserve aspect; cap the working width.
  const meta = await sharp(inputBuffer, { limitInputPixels: 512 * 1024 * 1024 })
    .metadata()
    .catch((e) => die(`Could not read image metadata: ${e.message}`));

  const srcW = meta.width || GRID_MAX_W;
  const gw = Math.min(GRID_MAX_W, srcW);

  const { data, info } = await sharp(inputBuffer, {
    limitInputPixels: 512 * 1024 * 1024,
  })
    .rotate() // respect EXIF orientation before we sample pixels
    .resize({ width: gw, withoutEnlargement: false })
    .greyscale()
    .raw()
    .toBuffer({ resolveWithObject: true })
    .catch((e) => die(`Could not decode image pixels: ${e.message}`));

  const W = info.width;
  const H = info.height;
  const lum = data; // 1 channel, length W*H, 0-255

  // ── Sobel edge magnitude (neighbour-difference weight) ──────────────
  const edge = new Float32Array(W * H);
  for (let y = 1; y < H - 1; y++) {
    for (let x = 1; x < W - 1; x++) {
      const i = y * W + x;
      const tl = lum[i - W - 1];
      const t = lum[i - W];
      const tr = lum[i - W + 1];
      const l = lum[i - 1];
      const r = lum[i + 1];
      const bl = lum[i + W - 1];
      const b = lum[i + W];
      const br = lum[i + W + 1];
      const gx = tl + 2 * l + bl - (tr + 2 * r + br);
      const gy = tl + 2 * t + tr - (bl + 2 * b + br);
      edge[i] = Math.abs(gx) + Math.abs(gy);
    }
  }

  // Generate, size-check, auto-retry once at a lower node cap if over.
  let nodeCap = MAX_NODES_DEFAULT;
  let attempt = 0;
  let json;
  let jsonStr;
  let gz;
  while (true) {
    json = build({ lum, edge, gw: W, gh: H, seed, sourceHash, nodeCap });
    jsonStr = JSON.stringify(json);
    gz = gzipSync(jsonStr);
    if (gz.length <= GZIP_BUDGET_BYTES || attempt >= 1) break;
    attempt++;
    console.warn(
      `⚠ gzipped size ${(gz.length / 1024).toFixed(1)} KB > 60 KB budget — retrying at ${MAX_NODES_RETRY} node cap…`,
    );
    nodeCap = MAX_NODES_RETRY;
  }

  const rawKb = (Buffer.byteLength(jsonStr) / 1024).toFixed(1);
  const gzKb = (gz.length / 1024).toFixed(1);

  if (gz.length > GZIP_BUDGET_BYTES) {
    die(
      `hero-face.json is ${gzKb} KB gzipped — over the 60 KB budget even after retry. Lower GRID_MAX_W or MAX_NODES and regenerate.`,
    );
  }

  writeFileSync(OUT_PATH, jsonStr);

  console.log(`\n✓ hero-face.json written → apps/web/public/hero-face.json`);
  console.log(`  source            : ${src.replace(/\\/g, "/")}`);
  console.log(`  source hash       : ${sourceHash}`);
  console.log(`  working grid      : ${W} × ${H}`);
  console.log(`  nodes             : ${json.meta.nodes} (cap ${nodeCap})`);
  console.log(`  edges             : ${json.meta.edges}`);
  console.log(`  pulse paths       : ${json.meta.pulses}`);
  console.log(`  raw size          : ${rawKb} KB`);
  console.log(`  gzipped size      : ${gzKb} KB  (budget 60 KB)\n`);

  // ── Track 2 (D-052): 3D dataset + static poster ─────────────────────
  // Optional --depth-map <path>: a grayscale depth image (e.g. MiDaS /
  // ARPortraitDepth) used for the surface z instead of luminance.
  const dmFlag = process.argv.indexOf("--depth-map");
  let depthArr = lum; // default: luminance-based pseudo-depth
  if (dmFlag !== -1 && process.argv[dmFlag + 1]) {
    const dmPath = process.argv[dmFlag + 1];
    if (!existsSync(dmPath)) die(`--depth-map file not found: ${dmPath}`);
    const dm = await sharp(readFileSync(dmPath))
      .rotate()
      .resize({ width: W, height: H, fit: "fill" })
      .greyscale()
      .raw()
      .toBuffer()
      .catch((e) => die(`Could not read depth map: ${e.message}`));
    depthArr = dm;
    console.log(`  depth source      : ${dmPath.replace(/\\/g, "/")} (--depth-map)`);
  }

  const { json: json3d, gpx, gpy, sb, N: n3d } = build3D({
    lum,
    edge,
    depthArr,
    gw: W,
    gh: H,
    seed,
    sourceHash,
  });
  const json3dStr = JSON.stringify(json3d);
  const gz3d = gzipSync(json3dStr);
  const gz3dKb = (gz3d.length / 1024).toFixed(1);
  if (gz3d.length > JSON3D_GZIP_BUDGET) {
    die(
      `hero-face-3d.json is ${gz3dKb} KB gzipped — over the 140 KB budget. Lower SURFACE_MAX or POS_QUANT and regenerate.`,
    );
  }
  writeFileSync(OUT_3D_PATH, json3dStr);

  const posterLg = await renderPoster(POSTER_W, gpx, gpy, sb, n3d, W, H);
  const posterSm = await renderPoster(POSTER_SM_W, gpx, gpy, sb, n3d, W, H);
  const posterTotal = posterLg.length + posterSm.length;
  const posterKb = (posterTotal / 1024).toFixed(1);
  if (posterTotal > POSTER_BUDGET) {
    die(
      `posters total ${posterKb} KB — over the 90 KB budget. Lower webp quality or poster width and regenerate.`,
    );
  }
  writeFileSync(POSTER_PATH, posterLg);
  writeFileSync(POSTER_SM_PATH, posterSm);

  console.log(`✓ hero-face-3d.json → apps/web/public/hero-face-3d.json`);
  console.log(`  surface nodes     : ${json3d.meta.surfaceNodes} (mobile ${json3d.meta.mobileCount})`);
  console.log(`  inner nodes/edges : ${json3d.meta.innerNodes} / ${json3d.meta.innerEdges}`);
  console.log(`  inner pulses      : ${json3d.meta.innerPulses}`);
  console.log(`  gzipped size      : ${gz3dKb} KB  (budget 140 KB)`);
  console.log(`✓ posters → hero-face-poster.webp (${(posterLg.length / 1024).toFixed(1)} KB) + -sm (${(posterSm.length / 1024).toFixed(1)} KB)`);
  console.log(`  posters total     : ${posterKb} KB  (budget 90 KB)\n`);
}

main().catch((e) => die(e.stack || String(e)));
