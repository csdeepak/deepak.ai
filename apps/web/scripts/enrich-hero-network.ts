/**
 * enrich-hero-network.ts — hero inner-network generator (D-052.2 → D-052.7).
 *
 * Reads the EXISTING hero-face-3d.json (the real FACE surface is UNCHANGED —
 * LAW-008) and REBUILDS the `inner` graph + `network` layer from the real
 * project↔skill topology using a force-directed layout (D-052.7 FIX 4), so that
 * projects sharing a skill cluster near that skill. The face portrait is never
 * touched; only `inner.*`, `network`, and `meta.innerNodes/innerEdges` change.
 *
 * LAW-003: only PUBLISHED projects appear in a public/production build. A dev
 *   override (HERO_GRAPH_INCLUDE_DRAFTS=true) includes drafts for LOCAL preview
 *   only — never run it for a committed/public artifact.
 * LAW-005: every node position + edge derives from data (the project↔skill graph
 *   + a seeded force layout). Ambient nodes are procedural atmosphere around it.
 * LAW-008: the face surface data is UNCHANGED.
 *
 * Content precedence (file vs DB):
 *   1. CONTENT_SOURCE=db + reachable Postgres → content_items + projects
 *      (published only, unless the draft override is set). Untested in CI.
 *   2. File mode (default): content/site.ts `projects`, filtered to published.
 *
 * Run:            npm run hero:enrich
 * With drafts:    HERO_GRAPH_INCLUDE_DRAFTS=true npm run hero:enrich   (dev only)
 */

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";

const __dirname = dirname(fileURLToPath(import.meta.url));
const JSON3D_PATH = join(__dirname, "..", "public", "hero-face-3d.json");
const JSON3D_BUDGET = 160 * 1024; // 160 KB gz (D-052.2)

// The inner graph lives in this box (matches the pre-D-052.7 inner bbox so the
// approach/dive framing is preserved). Centre + half-extents in world units.
const BOX_CENTRE = [0, 0.095, -0.18] as const;
const BOX_HALF = [0.17, 0.19, 0.11] as const;

// ── Types mirroring the JSON structure ───────────────────────────────────────

interface HeroFace3D {
  meta: {
    version: number;
    innerNodes: number;
    innerEdges: number;
    innerPulses?: number;
    quant: number;
    [k: string]: unknown;
  };
  surface: { x: number[]; y: number[]; z: number[]; b: number[] };
  inner: { x: number[]; y: number[]; z: number[]; edges: number[]; pulses: number[][] };
  network?: HeroNetwork;
  [k: string]: unknown;
}

interface HeroNetwork {
  projectNodes: Array<{ id: string; projectSlug: string; title: string; posIndex: number; size: number; glowIntensity: number }>;
  skillNodes: Array<{ id: string; skillName: string; posIndex: number; connectedProjectIds: string[] }>;
  ambientNodes: Array<{ id: string; posIndex: number }>;
  edges: Array<{ fromId: string; toId: string; kind: string }>;
  pulsePaths: Array<{ pathId: string; nodeIdSequence: string[]; kind: string }>;
}

interface ProjectRecord {
  slug: string;
  title: string;
  tags: string[];
}

// ── Deterministic PRNG ───────────────────────────────────────────────────────

function makeRng(seed: number) {
  let a = seed >>> 0;
  return function rng(): number {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ── Load projects (published, or drafts under the dev override) ───────────────

async function loadProjects(): Promise<{ list: ProjectRecord[]; total: number; published: number; includeDrafts: boolean }> {
  const includeDrafts = process.env.HERO_GRAPH_INCLUDE_DRAFTS === "true";

  if (process.env.CONTENT_SOURCE === "db") {
    try {
      const { getDb } = await import("../src/db/index.js");
      const db = getDb();
      const { contentItems, projectsTable } = await import("../src/db/schema.js");
      const { eq, and } = await import("drizzle-orm");
      const where = includeDrafts
        ? eq(contentItems.contentType, "project")
        : and(eq(contentItems.contentType, "project"), eq(contentItems.status, "published"));
      const rows = await db
        .select({ slug: contentItems.slug, title: contentItems.title, tags: projectsTable.tags, status: contentItems.status })
        .from(contentItems)
        .innerJoin(projectsTable, eq(contentItems.id, projectsTable.id))
        .where(where);
      if (rows.length > 0) {
        const totalRows = await db.select({ id: contentItems.id }).from(contentItems).where(eq(contentItems.contentType, "project"));
        const publishedRows = await db.select({ id: contentItems.id }).from(contentItems).where(and(eq(contentItems.contentType, "project"), eq(contentItems.status, "published")));
        console.log(`  source: DB (${rows.length} ${includeDrafts ? "projects incl. drafts" : "published"})`);
        return {
          list: rows.map((r: { slug: string; title: string; tags: unknown }) => ({ slug: r.slug, title: r.title, tags: Array.isArray(r.tags) ? (r.tags as string[]) : [] })),
          total: totalRows.length,
          published: publishedRows.length,
          includeDrafts,
        };
      }
    } catch {
      console.warn("  ⚠ DB unavailable — falling back to file mode");
    }
  }

  const { projects } = await import("../content/site.js");
  const all = projects as Array<{ slug: string; title: string; status: string; tags?: string[] }>;
  const published = all.filter((p) => p.status === "published");
  const chosen = includeDrafts ? all : published;
  console.log(`  source: content/site.ts (${chosen.length} ${includeDrafts ? "projects incl. drafts" : "published"})`);
  return {
    list: chosen.map((p) => ({ slug: p.slug, title: p.title, tags: p.tags ?? [] })),
    total: all.length,
    published: published.length,
    includeDrafts,
  };
}

// ── Force-directed layout of the project↔skill graph (LAW-005) ────────────────

type Vec3 = [number, number, number];
const sub = (a: Vec3, b: Vec3): Vec3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const len = (a: Vec3) => Math.hypot(a[0], a[1], a[2]) || 1e-6;

/** Points on a Fibonacci sphere (even angular spread). */
function fib(i: number, n: number): Vec3 {
  const golden = Math.PI * (3 - Math.sqrt(5));
  const y = n > 1 ? 1 - (i / (n - 1)) * 2 : 0;
  const r = Math.sqrt(Math.max(0, 1 - y * y));
  const th = golden * i;
  return [Math.cos(th) * r, y, Math.sin(th) * r];
}

/**
 * Build the inner graph geometry + typed network from the real project↔skill
 * topology. Returns fresh inner arrays (quantised) + the network layer.
 */
function buildGraph(
  N: number,
  quant: number,
  projects: ProjectRecord[],
) {
  const rng = makeRng(0xd052_7000 ^ (projects.length * 0x1337));
  const P = projects.length;

  // Unique skills across the chosen projects (source = project tags — D-048
  // skillsLearned is empty everywhere; reported to the owner).
  const skillList = Array.from(new Set(projects.flatMap((p) => p.tags)));
  const S = skillList.length;
  const A = Math.max(0, N - P - S);

  // Node order: [projects…, skills…, ambient…]. Positions in a working space,
  // normalised to BOX at the end.
  const pos: Vec3[] = new Array(N);

  // 1. Skills spread on a sphere.
  for (let i = 0; i < S; i++) {
    const f = fib(i, S);
    pos[P + i] = [f[0] * 1.0, f[1] * 1.0, f[2] * 1.0];
  }
  // 2. Projects at the centroid of their skills (→ shared-skill clustering).
  const skillIdx = (name: string) => skillList.indexOf(name);
  for (let i = 0; i < P; i++) {
    const sk = projects[i]!.tags.map(skillIdx).filter((k) => k >= 0);
    let c: Vec3 = [0, 0, 0];
    if (sk.length) {
      for (const si of sk) { const s = pos[P + si]!; c = [c[0] + s[0], c[1] + s[1], c[2] + s[2]]; }
      c = [(c[0] / sk.length) * 0.6, (c[1] / sk.length) * 0.6, (c[2] / sk.length) * 0.6];
    } else {
      c = [(rng() - 0.5), (rng() - 0.5), (rng() - 0.5)];
    }
    pos[i] = [c[0] + (rng() - 0.5) * 0.12, c[1] + (rng() - 0.5) * 0.12, c[2] + (rng() - 0.5) * 0.12];
  }

  // 3. Light force relaxation on the semantic nodes (springs + repulsion).
  const semN = P + S;
  const edgePairs: Array<[number, number]> = [];
  for (let i = 0; i < P; i++) {
    for (const si of projects[i]!.tags.map(skillIdx).filter((k) => k >= 0)) edgePairs.push([i, P + si]);
  }
  const SPRING = 0.6, K_REP = 0.02, GRAV = 0.03;
  for (let iter = 0; iter < 160; iter++) {
    const force: Vec3[] = Array.from({ length: semN }, () => [0, 0, 0]);
    for (let a = 0; a < semN; a++) {
      for (let b = a + 1; b < semN; b++) {
        const d = sub(pos[a]!, pos[b]!); const L = len(d); const f = K_REP / (L * L);
        const fx = (d[0] / L) * f, fy = (d[1] / L) * f, fz = (d[2] / L) * f;
        force[a] = [force[a]![0] + fx, force[a]![1] + fy, force[a]![2] + fz];
        force[b] = [force[b]![0] - fx, force[b]![1] - fy, force[b]![2] - fz];
      }
    }
    for (const [u, v] of edgePairs) {
      const d = sub(pos[v]!, pos[u]!); const L = len(d); const f = SPRING * (L - 0.5);
      const fx = (d[0] / L) * f, fy = (d[1] / L) * f, fz = (d[2] / L) * f;
      force[u] = [force[u]![0] + fx, force[u]![1] + fy, force[u]![2] + fz];
      force[v] = [force[v]![0] - fx, force[v]![1] - fy, force[v]![2] - fz];
    }
    const cool = 0.08 * (1 - iter / 160);
    for (let i = 0; i < semN; i++) {
      force[i] = [force[i]![0] - GRAV * pos[i]![0], force[i]![1] - GRAV * pos[i]![1], force[i]![2] - GRAV * pos[i]![2]];
      pos[i] = [pos[i]![0] + force[i]![0] * cool, pos[i]![1] + force[i]![1] * cool, pos[i]![2] + force[i]![2] * cool];
    }
  }

  // 4. Ambient filler around the semantic graph (procedural atmosphere).
  for (let i = 0; i < A; i++) {
    const anchor = pos[Math.floor(rng() * Math.max(1, semN))] ?? [0, 0, 0];
    const dir = fib(i * 7 + 3, Math.max(8, A));
    const r = 0.2 + rng() * 0.8;
    pos[P + S + i] = [anchor[0] + dir[0] * r, anchor[1] + dir[1] * r, anchor[2] + dir[2] * r];
  }

  // 5. Centre the SEMANTIC cluster (projects+skills) at the box centre so it
  //    aligns with the approach camera (small flight seam), scale it to ~55% of
  //    the box, let ambient spread toward the edges, then clamp + quantise.
  const semCount = Math.max(1, P + S);
  const cs: Vec3 = [0, 0, 0];
  for (let i = 0; i < semCount; i++) {
    const p = pos[i]!;
    cs[0] += p[0] / semCount; cs[1] += p[1] / semCount; cs[2] += p[2] / semCount;
  }
  const semHalf: Vec3 = [1e-4, 1e-4, 1e-4];
  for (let i = 0; i < semCount; i++) {
    const p = pos[i]!;
    semHalf[0] = Math.max(semHalf[0], Math.abs(p[0] - cs[0]));
    semHalf[1] = Math.max(semHalf[1], Math.abs(p[1] - cs[1]));
    semHalf[2] = Math.max(semHalf[2], Math.abs(p[2] - cs[2]));
  }
  const scale: Vec3 = [
    (0.55 * BOX_HALF[0]) / semHalf[0],
    (0.55 * BOX_HALF[1]) / semHalf[1],
    (0.55 * BOX_HALF[2]) / semHalf[2],
  ];
  const clamp = (v: number, c: number, h: number) => Math.max(c - h, Math.min(c + h, v));
  const ix = new Array<number>(N), iy = new Array<number>(N), iz = new Array<number>(N);
  const outPos: Vec3[] = new Array(N);
  for (let i = 0; i < N; i++) {
    const p = pos[i]!;
    const nx: Vec3 = [
      clamp(BOX_CENTRE[0] + (p[0] - cs[0]) * scale[0], BOX_CENTRE[0], BOX_HALF[0]),
      clamp(BOX_CENTRE[1] + (p[1] - cs[1]) * scale[1], BOX_CENTRE[1], BOX_HALF[1]),
      clamp(BOX_CENTRE[2] + (p[2] - cs[2]) * scale[2], BOX_CENTRE[2], BOX_HALF[2]),
    ];
    outPos[i] = nx;
    ix[i] = Math.round(nx[0] * quant);
    iy[i] = Math.round(nx[1] * quant);
    iz[i] = Math.round(nx[2] * quant);
  }

  // 6. Typed network + wireframe edges (flat index pairs) + pulse paths.
  const projectNodes = projects.map((proj, i) => ({ id: `pn-${i}`, projectSlug: proj.slug, title: proj.title, posIndex: i, size: 1.4, glowIntensity: 1.0 }));
  const skillNodes = skillList.map((skill, i) => ({
    id: `sn-${i}`,
    skillName: skill,
    posIndex: P + i,
    connectedProjectIds: projects.filter((p) => p.tags.includes(skill)).map((p) => p.slug),
  }));
  const ambientNodes = Array.from({ length: A }, (_, i) => ({ id: `an-${i}`, posIndex: P + S + i }));

  const networkEdges: HeroNetwork["edges"] = [];
  const innerEdges: number[] = [];
  const edgeSet = new Set<string>();
  const addWire = (a: number, b: number) => { const key = a < b ? `${a}|${b}` : `${b}|${a}`; if (edgeSet.has(key) || a === b) return; edgeSet.add(key); innerEdges.push(a, b); };

  // project-skill (typed + wireframe)
  for (let i = 0; i < P; i++) {
    for (const si of projects[i]!.tags.map(skillIdx).filter((k) => k >= 0)) {
      networkEdges.push({ fromId: `pn-${i}`, toId: `sn-${si}`, kind: "project-skill" });
      addWire(i, P + si);
    }
  }
  // skill-skill co-occurrence
  for (let i = 0; i < S; i++) for (let j = i + 1; j < S; j++) {
    const co = projects.some((p) => p.tags.includes(skillList[i]!) && p.tags.includes(skillList[j]!));
    if (co) { networkEdges.push({ fromId: `sn-${i}`, toId: `sn-${j}`, kind: "skill-skill" }); addWire(P + i, P + j); }
  }
  // ambient kNN backbone: connect each ambient to its 2 nearest nodes.
  for (let i = 0; i < A; i++) {
    const ai = P + S + i; const p = outPos[ai]!;
    const near: Array<[number, number]> = [];
    for (let j = 0; j < N; j++) { if (j === ai) continue; near.push([j, len(sub(p, outPos[j]!))]); }
    near.sort((x, y) => x[1] - y[1]);
    for (let k = 0; k < 2 && k < near.length; k++) addWire(ai, near[k]![0]);
  }

  // Pulse paths: project → its skills → another project; + ambient walks.
  const pulsePaths: HeroNetwork["pulsePaths"] = [];
  for (let i = 0; i < P; i++) {
    const sk = projects[i]!.tags.map(skillIdx).filter((k) => k >= 0);
    if (!sk.length) continue;
    const seq = [`pn-${i}`, `sn-${sk[Math.floor(rng() * sk.length)]!}`];
    const other = P > 1 ? (i + 1) % P : i;
    seq.push(`pn-${other}`);
    if (seq.length >= 3) pulsePaths.push({ pathId: `pp-project-${i}`, nodeIdSequence: seq, kind: "project-connection" });
  }
  // ambient random-walk pulses (for atmosphere) via the wireframe adjacency
  const adj = new Map<number, number[]>();
  for (let e = 0; e < innerEdges.length; e += 2) {
    const a = innerEdges[e]!, b = innerEdges[e + 1]!;
    (adj.get(a) ?? adj.set(a, []).get(a)!).push(b);
    (adj.get(b) ?? adj.set(b, []).get(b)!).push(a);
  }
  const ambCount = Math.min(6, Math.max(3, Math.floor(A / 50)));
  for (let p = 0; p < ambCount; p++) {
    let cur = P + S + Math.floor(rng() * Math.max(1, A));
    const seq: number[] = [cur];
    for (let step = 0; step < 16; step++) {
      const nb = adj.get(cur) ?? []; if (!nb.length) break;
      cur = nb[Math.floor(rng() * nb.length)]!;
      if (!seq.includes(cur)) seq.push(cur);
    }
    if (seq.length >= 3) {
      const idToNode = (idx: number) => idx < P ? `pn-${idx}` : idx < P + S ? `sn-${idx - P}` : `an-${idx - P - S}`;
      pulsePaths.push({ pathId: `pp-ambient-${p}`, nodeIdSequence: seq.map(idToNode), kind: "ambient" });
    }
  }

  // inner.pulses (homogeneous fallback): a few index walks.
  const innerPulses: number[][] = pulsePaths.slice(0, 8).map((pp) =>
    pp.nodeIdSequence.map((id) => {
      const [t, k] = [id.slice(0, 2), Number(id.slice(3))];
      return t === "pn" ? k : t === "sn" ? P + k : P + S + k;
    }),
  );

  return {
    inner: { x: ix, y: iy, z: iz, edges: innerEdges, pulses: innerPulses },
    network: { projectNodes, skillNodes, ambientNodes, edges: networkEdges, pulsePaths },
    counts: { P, S, A, wire: innerEdges.length / 2 },
    skillList,
  };
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  if (!existsSync(JSON3D_PATH)) {
    console.error(`\n✗ hero-face-3d.json not found at ${JSON3D_PATH}`);
    console.error("  Run `npm run hero:generate` first (requires portrait-source).\n");
    process.exit(1);
  }

  const face = JSON.parse(readFileSync(JSON3D_PATH, "utf8")) as HeroFace3D;
  const N = face.meta.innerNodes;
  const quant = face.meta.quant;
  if (N < 1) { console.error("✗ hero-face-3d.json has no inner nodes — regenerate first."); process.exit(1); }

  console.log("\n▶ hero:enrich — rebuilding the inner semantic graph (face surface untouched)");

  const { list: projects, total, published, includeDrafts } = await loadProjects();
  console.log(`  projects: total ${total}, published ${published}, in-graph ${projects.length}${includeDrafts ? "  [DRAFT OVERRIDE — dev only]" : ""}`);
  if (includeDrafts) console.warn("  ⚠ HERO_GRAPH_INCLUDE_DRAFTS is set — do NOT commit this artifact (LAW-003).");
  if (projects.length === 0) console.warn("  ⚠ No projects to graph — publish at least one in content/site.ts.");

  const S = new Set(projects.flatMap((p) => p.tags)).size;
  if (projects.length + S >= N) { console.error(`✗ P(${projects.length}) + S(${S}) ≥ inner nodes (${N}).`); process.exit(1); }

  const built = buildGraph(N, quant, projects);
  face.inner = built.inner;
  face.network = built.network;
  face.meta.innerNodes = N;
  face.meta.innerEdges = built.counts.wire;
  face.meta.innerPulses = built.network.pulsePaths.length;

  const json = JSON.stringify(face);
  const gz = gzipSync(json);
  const gzKb = (gz.length / 1024).toFixed(1);
  if (gz.length > JSON3D_BUDGET) { console.error(`✗ hero-face-3d.json is ${gzKb} KB gz — over 160 KB budget.`); process.exit(1); }
  writeFileSync(JSON3D_PATH, json);

  console.log(`\n✓ hero-face-3d.json enriched → public/hero-face-3d.json`);
  console.log(`  project nodes: ${built.counts.P}  (skill source: project tags — skillsLearned is empty)`);
  console.log(`  skill nodes:   ${built.counts.S}  (${built.skillList.join(", ")})`);
  console.log(`  ambient nodes: ${built.counts.A}`);
  console.log(`  wire edges:    ${built.counts.wire}`);
  console.log(`  pulse paths:   ${built.network.pulsePaths.length}`);
  console.log(`  gzipped size:  ${gzKb} KB  (budget 160 KB)\n`);
}

main().catch((e: unknown) => { console.error(e instanceof Error ? e.stack : String(e)); process.exit(1); });
