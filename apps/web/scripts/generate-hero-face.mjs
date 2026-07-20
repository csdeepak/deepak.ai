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
const LUM_WEIGHT = 0.45; // score = LUM_WEIGHT·luminance + ·edge
const EDGE_WEIGHT = 0.55; // edge-biased so eyes/nose/mouth/jaw win
const FORMAT_VERSION = 2;

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
    score[i] = LUM_WEIGHT * nl + EDGE_WEIGHT * ne;
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
}

main().catch((e) => die(e.stack || String(e)));
