/**
 * enrich-hero-network.ts — D-052.2 FIX 3: semantic network enrichment.
 *
 * Reads the EXISTING hero-face-3d.json (real face data, unchanged) and
 * annotates inner nodes with semantic categories (project / skill / ambient)
 * based on content data + a degree-centrality algorithm. The face surface
 * is NOT modified — only the `network` section is added / replaced.
 *
 * LAW-005: every node category is derived from content data + graph topology
 * (degree centrality of the kNN inner graph). Positions are never hand-authored.
 * LAW-008: face surface data is UNCHANGED. No fake positions, no mock projects.
 *
 * Content precedence (file vs DB):
 *   1. If CONTENT_SOURCE=db AND the DB is reachable: read from content_items +
 *      projects table (published only). CURRENTLY UNTESTED — the build env has
 *      no local Postgres. Falls through to file-mode on connection error.
 *   2. File mode (default): read from content/site.ts exported `projects` array,
 *      filtering to status="published".
 *
 * Run:        npm run hero:enrich
 * DB mode:    CONTENT_SOURCE=db npm run hero:enrich
 */

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";

const __dirname = dirname(fileURLToPath(import.meta.url));
const JSON3D_PATH = join(__dirname, "..", "public", "hero-face-3d.json");
const JSON3D_BUDGET = 160 * 1024; // raised to 160 KB gz (D-052.2)

// ── Types mirroring the JSON structure ───────────────────────────────────────

interface HeroFace3D {
  meta: {
    version: number;
    innerNodes: number;
    innerEdges: number;
    quant: number;
    [k: string]: unknown;
  };
  surface: { x: number[]; y: number[]; z: number[]; b: number[] };
  inner: { x: number[]; y: number[]; z: number[]; edges: number[]; pulses: number[][] };
  network?: HeroNetwork;
  [k: string]: unknown;
}

interface HeroNetwork {
  projectNodes: Array<{ id: string; projectSlug: string; posIndex: number; size: number; glowIntensity: number }>;
  skillNodes: Array<{ id: string; skillName: string; posIndex: number; connectedProjectIds: string[] }>;
  ambientNodes: Array<{ id: string; posIndex: number }>;
  edges: Array<{ fromId: string; toId: string; kind: string }>;
  pulsePaths: Array<{ pathId: string; nodeIdSequence: string[]; kind: string }>;
}

interface ProjectRecord {
  slug: string;
  tags: string[];
}

// ── Deterministic PRNG (same mulberry32 as generate-hero-face.mjs) ───────────

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

// ── Load published projects ───────────────────────────────────────────────────

async function loadProjects(): Promise<ProjectRecord[]> {
  // DB path (requires CONTENT_SOURCE=db and live Postgres)
  if (process.env.CONTENT_SOURCE === "db") {
    try {
      const { getDb } = await import("../src/db/index.js");
      const db = getDb();
      const { contentItems, projectsTable } = await import("../src/db/schema.js");
      const { eq, and } = await import("drizzle-orm");
      const rows = await db
        .select({ slug: contentItems.slug, tags: projectsTable.tags })
        .from(contentItems)
        .innerJoin(projectsTable, eq(contentItems.id, projectsTable.id))
        .where(and(eq(contentItems.contentType, "project"), eq(contentItems.status, "published")));
      if (rows.length > 0) {
        console.log(`  source: DB (${rows.length} published projects)`);
        return rows.map((r: { slug: string; tags: unknown }) => ({
          slug: r.slug,
          tags: Array.isArray(r.tags) ? (r.tags as string[]) : [],
        }));
      }
    } catch {
      console.warn("  ⚠ DB unavailable — falling back to file mode");
    }
  }

  // File mode: import from content/site.ts
  const { projects } = await import("../content/site.js");
  const published = (projects as Array<{ slug: string; status: string; tags?: string[] }>)
    .filter((p) => p.status === "published")
    .map((p) => ({ slug: p.slug, tags: p.tags ?? [] }));
  console.log(`  source: content/site.ts (${published.length} published projects)`);
  return published;
}

// ── Core semantic assignment (LAW-005: from data + algorithm) ─────────────────

function buildNetwork(face: HeroFace3D, projects: ProjectRecord[]): HeroNetwork {
  const n = face.meta.innerNodes;
  const edges = face.inner.edges;
  const rng = makeRng(0xd052_2000 ^ (projects.length * 0x1337));

  // 1. Compute degree for each inner node from the kNN edge list
  const degree = new Int32Array(n);
  for (let i = 0; i < edges.length; i++) {
    const idx = edges[i]!;
    degree[idx] = (degree[idx] ?? 0) + 1;
  }

  // 2. Sort node indices by degree descending (most-central = most connected)
  const order = Array.from({ length: n }, (_, i) => i).sort(
    (a, b) => degree[b]! - degree[a]!,
  );

  // 3. Collect unique skills deduped across all published projects
  const skillSet = new Set<string>();
  for (const p of projects) {
    for (const tag of p.tags) skillSet.add(tag);
  }
  const uniqueSkills = Array.from(skillSet);

  const P = projects.length;
  const S = uniqueSkills.length;

  console.log(`  project nodes: ${P}`);
  console.log(`  skill nodes:   ${S} (deduped from ${Array.from(skillSet).join(", ")})`);
  console.log(`  ambient nodes: ${n - P - S}`);

  // 4. Assign node categories
  const projectNodes = projects.map((proj, i) => ({
    id: `pn-${i}`,
    projectSlug: proj.slug,
    posIndex: order[i]!,
    size: 1.4,
    glowIntensity: 1.0,
  }));

  const skillNodes = uniqueSkills.map((skill, i) => {
    const connected = projects
      .filter((p) => p.tags.includes(skill))
      .map((p) => p.slug);
    return {
      id: `sn-${i}`,
      skillName: skill,
      posIndex: order[P + i]!,
      connectedProjectIds: connected,
    };
  });

  const ambientNodes = Array.from({ length: n - P - S }, (_, i) => ({
    id: `an-${i}`,
    posIndex: order[P + S + i]!,
  }));

  // 5. Build ID→posIndex lookup
  const idToPos = new Map<string, number>();
  for (const p of projectNodes) idToPos.set(p.id, p.posIndex);
  for (const s of skillNodes) idToPos.set(s.id, s.posIndex);
  for (const a of ambientNodes) idToPos.set(a.id, a.posIndex);

  // 6. Edges
  const networkEdges: HeroNetwork["edges"] = [];
  const edgeSet = new Set<string>();
  const addEdge = (fromId: string, toId: string, kind: string) => {
    const key = [fromId, toId].sort().join("|");
    if (edgeSet.has(key)) return;
    edgeSet.add(key);
    networkEdges.push({ fromId, toId, kind });
  };

  // project-skill edges
  for (const pn of projectNodes) {
    const proj = projects.find((p) => p.slug === pn.projectSlug)!;
    for (const sn of skillNodes) {
      if (proj.tags.includes(sn.skillName)) {
        addEdge(pn.id, sn.id, "project-skill");
      }
    }
  }

  // skill-skill co-occurrence edges
  for (let i = 0; i < skillNodes.length; i++) {
    for (let j = i + 1; j < skillNodes.length; j++) {
      const si = skillNodes[i]!;
      const sj = skillNodes[j]!;
      const coOccur = projects.some(
        (p) => p.tags.includes(si.skillName) && p.tags.includes(sj.skillName),
      );
      if (coOccur) addEdge(si.id, sj.id, "skill-skill");
    }
  }

  // ambient kNN edges: sample from inner.edges where both endpoints are ambient
  const ambientPosSet = new Set(ambientNodes.map((a) => a.posIndex));
  const posToAmbientId = new Map<number, string>();
  for (const a of ambientNodes) posToAmbientId.set(a.posIndex, a.id);

  for (let e = 0; e < edges.length; e += 2) {
    const a = edges[e]!, b = edges[e + 1]!;
    if (ambientPosSet.has(a) && ambientPosSet.has(b)) {
      const idA = posToAmbientId.get(a)!;
      const idB = posToAmbientId.get(b)!;
      addEdge(idA, idB, "ambient");
    }
  }

  // 7. Pulse paths
  const pulsePaths: HeroNetwork["pulsePaths"] = [];

  // Project-connection paths: route from a project node through its skills to another project
  // (or loop back if only one project). Target 6-10 total.
  const buildProjectPath = (startPn: typeof projectNodes[0]): string[] | null => {
    const proj = projects.find((p) => p.slug === startPn.projectSlug)!;
    const connectedSkills = skillNodes.filter((sn) => proj.tags.includes(sn.skillName));
    if (connectedSkills.length === 0) return null;
    const path: string[] = [startPn.id];
    let cur = connectedSkills[Math.floor(rng() * connectedSkills.length)]!;
    path.push(cur.id);
    // Extend through co-occurring skills
    for (let step = 0; step < 4; step++) {
      const neighbors = skillNodes.filter(
        (sn) => sn.id !== cur.id &&
          projects.some((p) => p.tags.includes(sn.skillName) && p.tags.includes(cur.skillName)),
      );
      if (neighbors.length === 0) break;
      cur = neighbors[Math.floor(rng() * neighbors.length)]!;
      if (!path.includes(cur.id)) path.push(cur.id);
    }
    // End at another project if possible
    const otherProjects = projectNodes.filter((p) => p.id !== startPn.id);
    if (otherProjects.length > 0) {
      path.push(otherProjects[Math.floor(rng() * otherProjects.length)]!.id);
    } else {
      path.push(startPn.id); // loop if only 1 project
    }
    return path.length >= 3 ? path : null;
  };

  for (const pn of projectNodes) {
    const seq = buildProjectPath(pn);
    if (seq) {
      pulsePaths.push({
        pathId: `pp-project-${pn.id}`,
        nodeIdSequence: seq,
        kind: "project-connection",
      });
    }
  }

  // Ambient pulse paths: random walks through ambient nodes using inner.pulses
  const ambientPosArray = ambientNodes.map((a) => a.posIndex);
  const ambientAdjMap = new Map<number, number[]>();
  for (let e = 0; e < edges.length; e += 2) {
    const a = edges[e]!, b = edges[e + 1]!;
    if (ambientPosSet.has(a) && ambientPosSet.has(b)) {
      if (!ambientAdjMap.has(a)) ambientAdjMap.set(a, []);
      if (!ambientAdjMap.has(b)) ambientAdjMap.set(b, []);
      ambientAdjMap.get(a)!.push(b);
      ambientAdjMap.get(b)!.push(a);
    }
  }

  const ambientPulseCount = Math.min(6, Math.max(4, ambientNodes.length > 50 ? 5 : 4));
  for (let p = 0; p < ambientPulseCount; p++) {
    const startIdx = Math.floor(rng() * ambientPosArray.length);
    let curPos = ambientPosArray[startIdx]!;
    const nodeIds: string[] = [posToAmbientId.get(curPos)!];
    for (let step = 0; step < 20; step++) {
      const nbrs = ambientAdjMap.get(curPos) ?? [];
      if (nbrs.length === 0) break;
      curPos = nbrs[Math.floor(rng() * nbrs.length)]!;
      const id = posToAmbientId.get(curPos);
      if (id && !nodeIds.includes(id)) nodeIds.push(id);
    }
    if (nodeIds.length >= 3) {
      pulsePaths.push({
        pathId: `pp-ambient-${p}`,
        nodeIdSequence: nodeIds,
        kind: "ambient",
      });
    }
  }

  return { projectNodes, skillNodes, ambientNodes, edges: networkEdges, pulsePaths };
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  if (!existsSync(JSON3D_PATH)) {
    console.error(`\n✗ hero-face-3d.json not found at ${JSON3D_PATH}`);
    console.error("  Run `npm run hero:generate` first (requires portrait-source.jpg).\n");
    process.exit(1);
  }

  const raw = readFileSync(JSON3D_PATH, "utf8");
  const face = JSON.parse(raw) as HeroFace3D;
  const n = face.meta.innerNodes;

  if (n < 1) {
    console.error("✗ hero-face-3d.json has no inner nodes — regenerate first.");
    process.exit(1);
  }

  console.log("\n▶ hero:enrich — adding semantic network layer to hero-face-3d.json");
  console.log(`  inner nodes: ${n}, inner edges: ${face.meta.innerEdges}`);

  const projects = await loadProjects();

  if (projects.length === 0) {
    console.warn("  ⚠ No published projects found — no project or skill nodes will be added.");
    console.warn("    Publish at least one project in content/site.ts and re-run.");
  }

  // Validate budget: P+S must not exceed available inner nodes
  const uniqueSkills = new Set(projects.flatMap((p) => p.tags));
  const P = projects.length;
  const S = uniqueSkills.size;
  if (P + S >= n) {
    console.error(`✗ P(${P}) + S(${S}) = ${P + S} ≥ inner nodes (${n}). Increase INNER_NODES.`);
    process.exit(1);
  }

  face.network = buildNetwork(face, projects);

  const json = JSON.stringify(face);
  const gz = gzipSync(json);
  const gzKb = (gz.length / 1024).toFixed(1);

  if (gz.length > JSON3D_BUDGET) {
    console.error(`✗ hero-face-3d.json is ${gzKb} KB gzipped — over 160 KB budget.`);
    process.exit(1);
  }

  writeFileSync(JSON3D_PATH, json);

  const projectPulses = face.network.pulsePaths.filter((p) => p.kind === "project-connection").length;
  const ambientPulses = face.network.pulsePaths.filter((p) => p.kind === "ambient").length;

  console.log(`\n✓ hero-face-3d.json enriched → public/hero-face-3d.json`);
  console.log(`  project nodes: ${face.network.projectNodes.length}`);
  console.log(`  skill nodes:   ${face.network.skillNodes.length}`);
  console.log(`  ambient nodes: ${face.network.ambientNodes.length}`);
  console.log(`  edges:         ${face.network.edges.length} (project-skill + skill-skill + ambient)`);
  console.log(`  pulse paths:   ${projectPulses} project-connection + ${ambientPulses} ambient`);
  console.log(`  gzipped size:  ${gzKb} KB  (budget 160 KB)\n`);
}

main().catch((e: unknown) => {
  console.error((e instanceof Error ? e.stack : String(e)));
  process.exit(1);
});
