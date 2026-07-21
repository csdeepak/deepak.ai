/*
 * check-bundle-budget.mjs — public-bundle guardrails (D-050 → D-052).
 *
 * Extends the CI isolation guard. Run AFTER `next build`, from apps/web:
 *   node scripts/check-bundle-budget.mjs
 *
 * Fails (exit 1) if any of these regress:
 *   1. `/` First Load JS exceeds the D-052 ceiling of 170 kB (amended once
 *      from D-050's 164 kB to admit the 3D hero's tiny client wrapper).
 *   2. A banned heavy dep (three / gsap / lenis / sharp) appears in ANY
 *      chunk that is part of `/`'s First Load JS. The 3D hero's three/R3F/
 *      drei/postprocessing/meshline must live ONLY in the lazy chunk.
 *   3. The hero-face dataset leaked into a client chunk (fetch-only).
 *   4. D-052: the lazy 3D chunk (three+R3F+drei+post+meshline+scene) total
 *      gzipped size exceeds 500 kB.
 *   5. D-052: the 3D dataset + posters exist and stay within budget
 *      (hero-face-3d.json ≤ 140 kB gz; posters combined ≤ 90 kB).
 *
 * Uses only Node fs — no grep dependency, so it runs identically on the
 * Linux CI runner and on Windows dev.
 */
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { gzipSync } from "node:zlib";
import { join } from "node:path";

const NEXT = ".next";
const CHUNKS_DIR = join(NEXT, "static", "chunks");
const PUBLIC = "public";
const BUDGET_KB = 170; // D-052 (was 164 under D-050)
const LAZY_3D_BUDGET_KB = 500; // D-052: whole 3D stack, lazy
const JSON3D_BUDGET_KB = 140; // D-052: hero-face-3d.json gz
const POSTER_BUDGET_KB = 90; // D-052: posters combined

function fail(msg) {
  console.error(`\n✗ bundle guard: ${msg}\n`);
  process.exit(1);
}

if (!existsSync(join(NEXT, "app-build-manifest.json"))) {
  fail("no .next/app-build-manifest.json — run `next build` first");
}

const appManifest = JSON.parse(
  readFileSync(join(NEXT, "app-build-manifest.json"), "utf8"),
);
const buildManifest = JSON.parse(
  readFileSync(join(NEXT, "build-manifest.json"), "utf8"),
);

// ── `/` First Load JS = home page chunks ∪ shared root main files ──────
const homeChunks = appManifest.pages?.["/(site)/page"] ?? [];
if (homeChunks.length === 0) fail("could not resolve `/` first-load chunks");
const rootMain = buildManifest.rootMainFiles ?? [];

const firstLoad = new Set();
for (const f of [...homeChunks, ...rootMain]) {
  if (f.endsWith(".js")) firstLoad.add(f.replace(/^\/+/, ""));
}

let firstLoadBytes = 0;
for (const f of firstLoad) {
  const p = join(NEXT, f);
  if (existsSync(p)) firstLoadBytes += gzipSync(readFileSync(p)).length;
}
const firstLoadKb = firstLoadBytes / 1024;

// ── Recursively list every emitted client chunk ───────────────────────
function walk(dir) {
  const out = [];
  if (!existsSync(dir)) return out;
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else if (name.endsWith(".js")) out.push(p);
  }
  return out;
}
const allChunks = walk(CHUNKS_DIR);

const contents = new Map();
const readChunk = (p) => {
  let c = contents.get(p);
  if (c === undefined) {
    c = readFileSync(p, "utf8");
    contents.set(p, c);
  }
  return c;
};

// ── Guard 1: banned heavy deps in `/`'s First Load set ────────────────
const BANNED = {
  three: ["WebGLRenderer"],
  gsap: ["gsapWithCSS", "registerPlugin", "_gsap"],
  lenis: ["class Lenis", "lenis"],
  sharp: ["libvips", "require('sharp')", 'require("sharp")'],
};

const firstLoadPaths = [...firstLoad]
  .map((f) => join(NEXT, f))
  .filter((p) => existsSync(p));

for (const [lib, markers] of Object.entries(BANNED)) {
  for (const p of firstLoadPaths) {
    const c = readChunk(p);
    if (markers.some((m) => c.includes(m))) {
      fail(`'${lib}' leaked into / First Load JS via ${p.replace(/\\/g, "/")}`);
    }
  }
}

// ── Guard 2: hero-face dataset must not be bundled (fetch-only) ────────
const LEAK_MARKERS = ["generatedAt", "sourceHash"];
for (const p of allChunks) {
  const c = readChunk(p);
  if (LEAK_MARKERS.every((m) => c.includes(m))) {
    fail(
      `hero-face dataset appears bundled in ${p.replace(/\\/g, "/")} — it must be fetched, not imported`,
    );
  }
}

// ── Guard 3: First Load JS budget ─────────────────────────────────────
if (firstLoadKb > BUDGET_KB) {
  fail(
    `/ First Load JS is ${firstLoadKb.toFixed(1)} kB — over the ${BUDGET_KB} kB ceiling (D-052)`,
  );
}

// ── Guard 4 (D-052): lazy 3D chunk total gzipped size ≤ 500 kB ─────────
const LIB_3D =
  /three\.module|WebGLRenderer|@react-three|MeshLineMaterial|EffectComposer|BloomEffect|react-postprocessing/;
let lazy3dBytes = 0;
const lazy3dChunks = [];
for (const p of allChunks) {
  const rel = p.replace(new RegExp(`^${NEXT}[\\\\/]`), "");
  if (firstLoad.has(rel.replace(/\\/g, "/"))) continue; // First Load handled above
  if (LIB_3D.test(readChunk(p))) {
    lazy3dBytes += gzipSync(readFileSync(p)).length;
    lazy3dChunks.push(rel);
  }
}
const lazy3dKb = lazy3dBytes / 1024;
if (lazy3dChunks.length === 0) {
  fail("no lazy 3D chunk found — the 3D hero scene did not build");
}
if (lazy3dKb > LAZY_3D_BUDGET_KB) {
  fail(
    `lazy 3D chunk is ${lazy3dKb.toFixed(1)} kB gz — over the ${LAZY_3D_BUDGET_KB} kB budget (D-052)`,
  );
}

// ── Guard 5 (D-052): 3D dataset + posters exist and stay within budget ─
const json3d = join(PUBLIC, "hero-face-3d.json");
if (!existsSync(json3d)) fail("public/hero-face-3d.json missing — run `npm run hero:generate`");
const json3dKb = gzipSync(readFileSync(json3d)).length / 1024;
if (json3dKb > JSON3D_BUDGET_KB) {
  fail(`hero-face-3d.json is ${json3dKb.toFixed(1)} kB gz — over ${JSON3D_BUDGET_KB} kB (D-052)`);
}
const posterLg = join(PUBLIC, "hero-face-poster.webp");
const posterSm = join(PUBLIC, "hero-face-poster-sm.webp");
if (!existsSync(posterLg) || !existsSync(posterSm)) {
  fail("poster webp(s) missing — run `npm run hero:generate` (poster is the LCP element)");
}
const posterKb =
  (statSync(posterLg).size + statSync(posterSm).size) / 1024;
if (posterKb > POSTER_BUDGET_KB) {
  fail(`posters total ${posterKb.toFixed(1)} kB — over ${POSTER_BUDGET_KB} kB (D-052)`);
}

console.log(
  `✓ bundle guard (D-052):\n` +
    `  / First Load JS ≈ ${firstLoadKb.toFixed(1)} kB (≤ ${BUDGET_KB} kB)\n` +
    `  three/gsap/lenis/sharp absent from / First Load JS; hero-face data not bundled\n` +
    `  lazy 3D chunk ≈ ${lazy3dKb.toFixed(1)} kB gz across ${lazy3dChunks.length} chunk(s) (≤ ${LAZY_3D_BUDGET_KB} kB)\n` +
    `  hero-face-3d.json ${json3dKb.toFixed(1)} kB gz (≤ ${JSON3D_BUDGET_KB} kB); posters ${posterKb.toFixed(1)} kB (≤ ${POSTER_BUDGET_KB} kB)`,
);
