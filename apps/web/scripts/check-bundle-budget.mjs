/*
 * check-bundle-budget.mjs — public-bundle guardrails (D-050).
 *
 * Extends the CI isolation guard. Run AFTER `next build`, from apps/web:
 *   node scripts/check-bundle-budget.mjs
 *
 * Fails (exit 1) if any of these regress:
 *   1. `/` First Load JS exceeds the D-050 ceiling of 164 kB.
 *   2. A banned heavy dep (three / gsap / lenis / sharp) appears in ANY
 *      chunk that is part of `/`'s First Load JS. (three + gsap are real
 *      deps used only in the lazy /dev/hero scene; lenis is not installed;
 *      sharp is server-only — all must stay out of the public client JS.)
 *   3. The hero-face dataset leaked into a client chunk (it must be
 *      fetched, never imported — so its unique meta keys must appear in
 *      NO client chunk).
 *
 * Uses only Node fs — no grep dependency, so it runs identically on the
 * Linux CI runner and on Windows dev.
 */
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { gzipSync } from "node:zlib";
import { join } from "node:path";

const NEXT = ".next";
const CHUNKS_DIR = join(NEXT, "static", "chunks");
const BUDGET_KB = 164;

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

// Next reports First Load JS as GZIPPED sizes, so we gzip each chunk to
// compare against the ceiling on the same terms.
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

// Cache chunk contents once.
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
// These meta keys exist ONLY in the JSON — never as string literals in the
// fetch-only client code — so their presence in any chunk means it was
// imported. (The fetch URL "/hero-face.json" is expected and not tested.)
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
    `/ First Load JS is ${firstLoadKb.toFixed(1)} kB — over the ${BUDGET_KB} kB ceiling (D-050)`,
  );
}

console.log(
  `✓ bundle guard: / First Load JS ≈ ${firstLoadKb.toFixed(1)} kB (≤ ${BUDGET_KB} kB); ` +
    `three/gsap/lenis/sharp absent from public First Load JS; hero-face data not bundled`,
);
