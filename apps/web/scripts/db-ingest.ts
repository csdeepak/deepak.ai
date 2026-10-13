/**
 * DB ingest — loads content/site.ts into PostgreSQL via Drizzle.
 *
 * Only real content from site.ts (no seeds, no invented fields). Empty stays
 * empty: an absent optional field ingests as '' or null — EXCEPT `question` on
 * a published row; ck_published_has_question rejects that, for every content
 * type (D-070).
 *
 * D-073 — safe by default. It used to:
 *   1. overwrite every project with the file's version, including projects
 *      edited since in the admin. Filling the empty /timeline meant silently
 *      reverting any admin edit to any project.
 *   2. write row by row with no transaction, so D-070's constraint failure
 *      left 21 projects written and nothing after them.
 *   3. give no way to see what it was about to do.
 * Now it plans first — insert / update (naming the fields) / unchanged /
 * protected / conflict — then applies the plan in ONE transaction: all of it
 * or none of it. An item is PROTECTED when it has content_versions rows: every
 * admin save, publish and restore writes one, and this script never does, so
 * their existence means the database holds edits the file does not know about.
 *
 * Usage (from apps/web/):
 *   npm run db:ingest -- --dry-run                     plan only; writes nothing
 *   npm run db:ingest -- --only=timeline,publications  any of: projects,
 *                                                      publications, timeline, settings
 *   npm run db:ingest                                  everything; admin edits protected
 *   npm run db:ingest -- --force                       also overwrite admin-edited items
 *
 * Requires DATABASE_URL (apps/web/.env.local) and the DB to be running.
 * Start the local DB with: docker compose -f docker-compose.dev.yml up -d
 */

import { config } from "dotenv";
config({ path: ".env.local" });
config();

import { asc, eq, inArray } from "drizzle-orm";
import { getDb } from "../src/db/index";
import {
  contentItems,
  contentVersions,
  abandonedBranches,
  projectsTable,
  publicationsTable,
  timelineEntriesTable,
  siteSettings,
  siteSettingsVersions,
} from "../src/db/schema";
import { projects, publications, timeline, siteContent } from "../content/site";

// ── Arguments ────────────────────────────────────────────────────────────────

const KINDS = ["projects", "publications", "timeline", "settings"] as const;
type Kind = (typeof KINDS)[number];

const args = process.argv.slice(2);
const DRY_RUN = args.includes("--dry-run");
const FORCE = args.includes("--force");
const onlyArg = args.find((a) => a.startsWith("--only="))?.slice("--only=".length);
const requested = onlyArg ? onlyArg.split(",").map((s) => s.trim()) : [...KINDS];
const unknown = requested.filter((k) => !(KINDS as readonly string[]).includes(k));
if (unknown.length > 0) {
  console.error(`Unknown --only value(s): ${unknown.join(", ")}. Use any of: ${KINDS.join(", ")}.`);
  process.exit(1);
}
const ONLY = new Set(requested as Kind[]);

const db = getDb();
type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

// ── The plan ─────────────────────────────────────────────────────────────────

type Action = "insert" | "update" | "unchanged" | "protected" | "conflict";

interface Step {
  kind: Kind;
  key: string;
  action: Action;
  changed: string[];
  note?: string;
  apply?: (tx: Tx) => Promise<void>;
}

/** Comparable form of a stored or intended value. Dates compare by instant. */
function norm(value: unknown): string {
  if (value === undefined || value === null) return "null";
  if (value instanceof Date) return `date:${value.getTime()}`;
  return JSON.stringify(value);
}

function diff(want: Record<string, unknown>, have: object | undefined): string[] {
  if (!have) return Object.keys(want);
  const stored = have as Record<string, unknown>;
  return Object.keys(want).filter((k) => norm(want[k]) !== norm(stored[k]));
}

const toDate = (iso?: string | null) => (iso ? new Date(iso) : null);

interface Existing {
  id: string;
  contentType: string;
  title: string;
  status: string;
  question: string;
  publishedAt: Date | null;
  edited: boolean;
}

/** Base rows for these slugs, plus whether each has admin history. */
async function loadExisting(slugs: string[]): Promise<Map<string, Existing>> {
  if (slugs.length === 0) return new Map();
  const rows = await db
    .select({
      id: contentItems.id,
      slug: contentItems.slug,
      contentType: contentItems.contentType,
      title: contentItems.title,
      status: contentItems.status,
      question: contentItems.question,
      publishedAt: contentItems.publishedAt,
    })
    .from(contentItems)
    .where(inArray(contentItems.slug, slugs));
  const ids = rows.map((r) => r.id);
  const versioned = new Set(
    ids.length === 0
      ? []
      : (
          await db
            .selectDistinct({ itemId: contentVersions.itemId })
            .from(contentVersions)
            .where(inArray(contentVersions.itemId, ids))
        ).map((v) => v.itemId),
  );
  return new Map(rows.map((r) => [r.slug, { ...r, edited: versioned.has(r.id) }]));
}

/**
 * One content item: compare the base row and the child row with what is
 * stored, decide the action, and close over the write.
 */
function planItem(opts: {
  kind: Kind;
  slug: string;
  contentType: string;
  base: { title: string; status: string; question: string; publishedAt: Date | null };
  existing: Existing | undefined;
  childChanges: string[];
  writeChild: (tx: Tx, itemId: string) => Promise<void>;
}): Step {
  const { kind, slug, contentType, base, existing, childChanges, writeChild } = opts;

  if (existing && existing.contentType !== contentType) {
    return {
      kind,
      key: slug,
      action: "conflict",
      changed: [],
      note: `slug already used by a ${existing.contentType} — not touched`,
    };
  }

  const changed = [...diff(base, existing), ...childChanges];
  const action: Action = !existing
    ? "insert"
    : changed.length === 0
      ? "unchanged"
      : existing.edited
        ? "protected"
        : "update";

  const apply = async (tx: Tx) => {
    const [row] = await tx
      .insert(contentItems)
      .values({ slug, contentType, ...base })
      .onConflictDoUpdate({
        target: contentItems.slug,
        set: { ...base, updatedAt: new Date() },
      })
      .returning({ id: contentItems.id });
    if (!row) throw new Error(`Upsert returned no id for ${slug}`);
    await writeChild(tx, row.id);
  };

  return {
    kind,
    key: slug,
    action,
    changed: action === "insert" ? [] : changed,
    note: action === "protected" ? "edited in the admin" : undefined,
    apply,
  };
}

async function planProjects(): Promise<Step[]> {
  const existing = await loadExisting(projects.map((p) => p.slug));
  const ids = [...existing.values()].map((e) => e.id);
  const childRows = ids.length
    ? await db.select().from(projectsTable).where(inArray(projectsTable.id, ids))
    : [];
  const children = new Map(childRows.map((r) => [r.id, r as Record<string, unknown>]));
  const branchRows = ids.length
    ? await db
        .select()
        .from(abandonedBranches)
        .where(inArray(abandonedBranches.itemId, ids))
        .orderBy(asc(abandonedBranches.sortOrder))
    : [];

  return projects.map((project) => {
    const found = existing.get(project.slug);
    const child = {
      problem: project.problem ?? "",
      year: project.year,
      projectStatus: project.projectStatus ?? "archived",
      tags: project.tags ?? [],
      featured: project.featured ?? false,
      repoUrl: project.repoUrl ?? null,
      // Rich metadata (D-048) maps from the file when present; absent fields
      // default to empty — no invented values (LAW-008). Media attachments are
      // admin-managed only (there is no file representation), so they are
      // never touched by ingest.
      overview: project.overview ?? "",
      startDate: project.startDate ?? null,
      endDate: project.endDate ?? null,
      context: project.context ?? "",
      role: project.role ?? "",
      collaborators: project.collaborators ?? [],
      liveUrl: project.liveUrl ?? null,
      videoUrl: project.videoUrl ?? null,
      outcomes: project.outcomes ?? [],
      skillsLearned: project.skillsLearned ?? [],
      // In the schema since D-058 Phase E and once dropped by this script, so
      // the landing spine kept whatever the DB held. An ordering set in
      // site.ts that the ingest drops looks applied and is not.
      timelineOrder: project.timelineOrder ?? null,
    };
    const branches = (project.abandonedBranches ?? []).map((b) => ({
      tried: b.tried,
      whyAbandoned: b.whyAbandoned,
      learned: b.learned,
    }));
    const storedBranches = found
      ? branchRows
          .filter((b) => b.itemId === found.id)
          .map((b) => ({ tried: b.tried, whyAbandoned: b.whyAbandoned, learned: b.learned }))
      : [];
    const childChanges = found
      ? [
          ...diff(child, children.get(found.id)),
          ...(norm(branches) !== norm(storedBranches) ? ["abandonedBranches"] : []),
        ]
      : [];

    return planItem({
      kind: "projects",
      slug: project.slug,
      contentType: "project",
      base: {
        title: project.title,
        status: project.status,
        question: project.question ?? "",
        publishedAt: toDate(project.publishedAt),
      },
      existing: found,
      childChanges,
      writeChild: async (tx, id) => {
        await tx
          .insert(projectsTable)
          .values({ id, ...child })
          .onConflictDoUpdate({ target: projectsTable.id, set: child });
        // Replace abandoned branches (delete + re-insert keeps sort_order and
        // drops rows removed from the source file).
        await tx.delete(abandonedBranches).where(eq(abandonedBranches.itemId, id));
        if (branches.length > 0) {
          await tx
            .insert(abandonedBranches)
            .values(branches.map((b, i) => ({ itemId: id, ...b, sortOrder: i })));
        }
      },
    });
  });
}

/**
 * Publications — once never ingested at all (the array existed in site.ts and
 * this script only read `projects`, D-066).
 */
async function planPublications(): Promise<Step[]> {
  const existing = await loadExisting(publications.map((p) => p.slug));
  const ids = [...existing.values()].map((e) => e.id);
  const childRows = ids.length
    ? await db.select().from(publicationsTable).where(inArray(publicationsTable.id, ids))
    : [];
  const children = new Map(childRows.map((r) => [r.id, r as Record<string, unknown>]));

  return publications.map((publication) => {
    const found = existing.get(publication.slug);
    const child = {
      authors: publication.authors ?? [],
      venue: publication.venue ?? "",
      year: publication.year,
      abstract: publication.abstract ?? "",
      plainSummary: publication.plainSummary ?? "",
      pdfUrl: publication.pdfUrl ?? null,
      bibtex: publication.bibtex ?? null,
      doi: publication.doi ?? null,
      pubDate: publication.pubDate ?? null,
      pubStatus: publication.pubStatus ?? "published",
      arxivUrl: publication.arxivUrl ?? null,
    };
    return planItem({
      kind: "publications",
      slug: publication.slug,
      contentType: "publication",
      base: {
        title: publication.title,
        status: publication.status,
        // LAW-003 is enforced in the DATABASE for every content type; a
        // hardcoded "" here is what aborted the first real publication ingest.
        question: publication.question,
        publishedAt: toDate(publication.publishedAt),
      },
      existing: found,
      childChanges: found ? diff(child, children.get(found.id)) : [],
      writeChild: async (tx, id) => {
        await tx
          .insert(publicationsTable)
          .values({ id, ...child })
          .onConflictDoUpdate({ target: publicationsTable.id, set: child });
      },
    });
  });
}

/** Experience entries — the same gap publications had before D-066. */
async function planTimeline(): Promise<Step[]> {
  const existing = await loadExisting(timeline.map((t) => t.slug));
  const ids = [...existing.values()].map((e) => e.id);
  const childRows = ids.length
    ? await db.select().from(timelineEntriesTable).where(inArray(timelineEntriesTable.id, ids))
    : [];
  const children = new Map(childRows.map((r) => [r.id, r as Record<string, unknown>]));

  return timeline.map((entry) => {
    const found = existing.get(entry.slug);
    const child = {
      organization: entry.organization ?? "",
      role: entry.role ?? "",
      startDate: entry.startDate,
      endDate: entry.endDate ?? null,
      summary: entry.summary ?? "",
      place: entry.place ?? "",
      highlights: entry.highlights ?? [],
    };
    return planItem({
      kind: "timeline",
      slug: entry.slug,
      contentType: "timeline_entry",
      base: {
        title: entry.title,
        status: entry.status,
        question: entry.question,
        publishedAt: toDate(entry.publishedAt),
      },
      existing: found,
      childChanges: found ? diff(child, children.get(found.id)) : [],
      writeChild: async (tx, id) => {
        await tx
          .insert(timelineEntriesTable)
          .values({ id, ...child })
          .onConflictDoUpdate({ target: timelineEntriesTable.id, set: child });
      },
    });
  });
}

/** Site settings — protected the same way, by their own version table. */
async function planSettings(): Promise<Step[]> {
  const wanted: Array<{ key: string; value: unknown }> = [
    { key: "contactEmail", value: siteContent.contactEmail ?? null },
    {
      key: "contactSentence",
      value: (siteContent as Record<string, unknown>).contactSentence ?? null,
    },
    { key: "outbound", value: siteContent.outbound ?? {} },
  ];
  const keys = wanted.map((w) => w.key);
  const stored = new Map(
    (await db.select().from(siteSettings).where(inArray(siteSettings.key, keys))).map((r) => [
      r.key,
      r.value,
    ]),
  );
  const edited = new Set(
    (
      await db
        .selectDistinct({ key: siteSettingsVersions.key })
        .from(siteSettingsVersions)
        .where(inArray(siteSettingsVersions.key, keys))
    ).map((r) => r.key),
  );

  return wanted.map(({ key, value }) => {
    const has = stored.has(key);
    const same = has && norm(stored.get(key)) === norm(value);
    const action: Action = !has ? "insert" : same ? "unchanged" : edited.has(key) ? "protected" : "update";
    return {
      kind: "settings" as const,
      key: `settings/${key}`,
      action,
      changed: action === "update" || action === "protected" ? ["value"] : [],
      note: action === "protected" ? "edited in the admin" : undefined,
      apply: async (tx: Tx) => {
        await tx
          .insert(siteSettings)
          .values({ key, value })
          .onConflictDoUpdate({ target: siteSettings.key, set: { value, updatedAt: new Date() } });
      },
    };
  });
}

// ── Run ──────────────────────────────────────────────────────────────────────

const PLANNERS: Record<Kind, () => Promise<Step[]>> = {
  projects: planProjects,
  publications: planPublications,
  timeline: planTimeline,
  settings: planSettings,
};

function willWrite(step: Step): boolean {
  if (step.action === "insert" || step.action === "update") return true;
  return step.action === "protected" && FORCE;
}

async function main() {
  const mode = DRY_RUN ? "DRY RUN — nothing will be written" : FORCE ? "write, FORCE" : "write";
  console.log(`── DB ingest (${mode}) — ${[...ONLY].join(", ")} ──`);

  const steps: Step[] = [];
  for (const kind of KINDS) {
    if (!ONLY.has(kind)) continue;
    const planned = await PLANNERS[kind]();
    steps.push(...planned);
    console.log(`\n${kind} (${planned.length})`);
    if (planned.length === 0) console.log("  none in site.ts");
    for (const s of planned) {
      const label =
        s.action === "protected" && FORCE ? "OVERWRITE" : s.action.toUpperCase();
      const fields = s.changed.length ? `  [${s.changed.join(", ")}]` : "";
      const note = s.note ? `  — ${s.note}` : "";
      console.log(`  ${label.padEnd(10)} ${s.key}${fields}${note}`);
    }
  }

  const count = (a: Action) => steps.filter((s) => s.action === a).length;
  const writes = steps.filter(willWrite);
  console.log(
    `\nPlan: ${count("insert")} insert, ${count("update")} update, ${count("unchanged")} unchanged, ` +
      `${count("protected")} protected, ${count("conflict")} conflict → ${writes.length} write(s).`,
  );
  if (count("protected") > 0 && !FORCE) {
    console.log(
      "Protected items were edited in the admin; the file's version would overwrite those edits.\n" +
        "Bring the change across in the admin, or re-run with --force to overwrite them.",
    );
  }

  if (DRY_RUN) {
    console.log("\nDry run — nothing written.");
    process.exit(0);
  }
  if (writes.length === 0) {
    console.log("\nNothing to write.");
    process.exit(0);
  }

  // One transaction: a failure part-way (D-070's constraint abort) now leaves
  // the database exactly as it was, instead of half-ingested.
  await db.transaction(async (tx) => {
    for (const step of writes) await step.apply!(tx);
  });
  console.log(`\n── Wrote ${writes.length} item(s) in one transaction ──`);
  process.exit(0);
}

main().catch((err) => {
  console.error("\nIngest failed — the transaction rolled back, nothing was written:", err);
  process.exit(1);
});

