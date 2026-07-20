"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq, desc, and } from "drizzle-orm";
import { getDb } from "@/db/index";
import {
  contentItems,
  projectsTable,
  abandonedBranches,
  contentVersions,
  contentMedia,
} from "@/db/schema";

export interface ProjectFormState {
  error: string | null;
  fieldErrors?: Partial<Record<string, string>>;
}

// ── Snapshot helpers ──────────────────────────────────────────────────────────

type Snapshot = {
  base: Record<string, unknown>;
  project: Record<string, unknown>;
  abandonedBranches: Record<string, unknown>[];
  contentMedia: Record<string, unknown>[];
};

async function buildSnapshot(db: ReturnType<typeof getDb>, itemId: string): Promise<Snapshot> {
  const [base] = await db.select().from(contentItems).where(eq(contentItems.id, itemId)).limit(1);
  const [project] = await db.select().from(projectsTable).where(eq(projectsTable.id, itemId)).limit(1);
  const branches = await db.select().from(abandonedBranches).where(eq(abandonedBranches.itemId, itemId));
  const cm = await db
    .select()
    .from(contentMedia)
    .where(eq(contentMedia.itemId, itemId))
    .orderBy(contentMedia.role, contentMedia.sortOrder);
  return {
    base: base as Record<string, unknown>,
    project: project as Record<string, unknown>,
    abandonedBranches: branches as Record<string, unknown>[],
    contentMedia: cm as Record<string, unknown>[],
  };
}

function diffFields(prev: Snapshot | null, next: Snapshot): string[] {
  if (!prev) return [];
  const changed: string[] = [];
  const b1 = prev.base; const b2 = next.base;
  for (const k of Object.keys(b2)) {
    if (JSON.stringify(b1[k]) !== JSON.stringify(b2[k])) changed.push(k);
  }
  const p1 = prev.project; const p2 = next.project;
  for (const k of Object.keys(p2)) {
    if (JSON.stringify(p1[k]) !== JSON.stringify(p2[k])) changed.push(k);
  }
  if (JSON.stringify(prev.abandonedBranches) !== JSON.stringify(next.abandonedBranches)) {
    changed.push("abandonedBranches");
  }
  if (JSON.stringify(prev.contentMedia) !== JSON.stringify(next.contentMedia)) {
    changed.push("media");
  }
  return changed;
}

// ── Media selection helpers ────────────────────────────────────────────────────

interface MediaSelection {
  cover: string | null;
  gallery: string[];
  attachments: string[];
}

function parseMediaSelection(raw: string | null): MediaSelection {
  if (!raw) return { cover: null, gallery: [], attachments: [] };
  try {
    const v = JSON.parse(raw) as Partial<MediaSelection>;
    return {
      cover: v.cover ?? null,
      gallery: Array.isArray(v.gallery) ? v.gallery : [],
      attachments: Array.isArray(v.attachments) ? v.attachments : [],
    };
  } catch {
    return { cover: null, gallery: [], attachments: [] };
  }
}

/** Replace an item's content_media rows from a selection (typed roles/order). */
async function writeContentMedia(
  tx: Parameters<Parameters<ReturnType<typeof getDb>["transaction"]>[0]>[0],
  itemId: string,
  sel: MediaSelection,
) {
  await tx.delete(contentMedia).where(eq(contentMedia.itemId, itemId));
  const rows: {
    itemId: string;
    mediaId: string;
    role: string;
    sortOrder: number;
  }[] = [];
  if (sel.cover) rows.push({ itemId, mediaId: sel.cover, role: "cover", sortOrder: 0 });
  sel.gallery.forEach((mediaId, i) =>
    rows.push({ itemId, mediaId, role: "gallery", sortOrder: i }),
  );
  sel.attachments.forEach((mediaId, i) =>
    rows.push({ itemId, mediaId, role: "attachment", sortOrder: i }),
  );
  if (rows.length > 0) await tx.insert(contentMedia).values(rows);
}

function parseStringArray(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const v = JSON.parse(raw);
    return Array.isArray(v) ? v.map((s) => String(s).trim()).filter(Boolean) : [];
  } catch {
    return [];
  }
}

async function writeVersion(
  db: ReturnType<typeof getDb>,
  itemId: string,
  snapshot: Snapshot,
  changedFields: string[],
  origin: string,
) {
  const [latest] = await db
    .select({ versionNum: contentVersions.versionNum })
    .from(contentVersions)
    .where(eq(contentVersions.itemId, itemId))
    .orderBy(desc(contentVersions.versionNum))
    .limit(1);

  await db.insert(contentVersions).values({
    itemId,
    versionNum: (latest?.versionNum ?? 0) + 1,
    snapshot: snapshot as Record<string, unknown>,
    changedFields,
    origin,
  });
}

// ── Slug helpers ──────────────────────────────────────────────────────────────

function slugify(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

// ── Create ────────────────────────────────────────────────────────────────────

export async function createProject(
  _prev: ProjectFormState,
  formData: FormData,
): Promise<ProjectFormState> {
  const title = (formData.get("title") as string)?.trim();
  const year = parseInt(formData.get("year") as string, 10);

  if (!title) return { error: null, fieldErrors: { title: "Title is required." } };
  if (isNaN(year)) return { error: null, fieldErrors: { year: "Year is required." } };

  const db = getDb();
  const slug = slugify(title);

  const existing = await db.select({ id: contentItems.id }).from(contentItems).where(eq(contentItems.slug, slug)).limit(1);
  if (existing.length > 0) return { error: `Slug "${slug}" is already in use. Edit the title.`, fieldErrors: {} };

  const [item] = await db.insert(contentItems).values({
    slug,
    title,
    contentType: "project",
    status: "draft",
    question: "",
  }).returning({ id: contentItems.id });

  if (!item) return { error: "Failed to create project.", fieldErrors: {} };

  await db.insert(projectsTable).values({
    id: item.id,
    year,
    projectStatus: "active",
    problem: "",
    tags: [],
    featured: false,
  });

  const snapshot = await buildSnapshot(db, item.id);
  await writeVersion(db, item.id, snapshot, [], "manual_save");

  redirect(`/admin/projects/${slug}`);
}

// ── Save draft ────────────────────────────────────────────────────────────────

export async function saveProject(
  _prev: ProjectFormState,
  formData: FormData,
): Promise<ProjectFormState> {
  const id = formData.get("id") as string;
  if (!id) return { error: "Missing project ID." };

  const db = getDb();
  const prevSnapshot = await buildSnapshot(db, id);

  const title = (formData.get("title") as string)?.trim() ?? "";
  const slug = (formData.get("slug") as string)?.trim() ?? "";
  const question = (formData.get("question") as string)?.trim() ?? "";
  const problem = (formData.get("problem") as string)?.trim() ?? "";
  const year = parseInt(formData.get("year") as string, 10);
  const projectStatus = (formData.get("projectStatus") as string) === "active" ? "active" : "archived";
  const featured = formData.get("featured") === "true";
  const verified = formData.get("verified") === "true";
  const repoUrl = (formData.get("repoUrl") as string)?.trim() || null;
  const tags = ((formData.get("tags") as string) ?? "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  const branchesRaw = formData.get("abandonedBranches") as string;
  const branches: { tried: string; whyAbandoned: string; learned: string }[] = branchesRaw
    ? JSON.parse(branchesRaw)
    : [];

  // ── Rich metadata (D-048) ────────────────────────────────────────────────
  const overview = (formData.get("overview") as string) ?? "";
  const startDate = (formData.get("startDate") as string)?.trim() || null;
  const endDate = (formData.get("endDate") as string)?.trim() || null;
  const context = (formData.get("context") as string)?.trim() ?? "";
  const role = (formData.get("role") as string)?.trim() ?? "";
  const collaborators = parseStringArray(formData.get("collaborators") as string);
  const liveUrl = (formData.get("liveUrl") as string)?.trim() || null;
  const videoUrl = (formData.get("videoUrl") as string)?.trim() || null;
  const outcomes = parseStringArray(formData.get("outcomes") as string);
  const skillsLearned = parseStringArray(formData.get("skillsLearned") as string);
  const mediaSel = parseMediaSelection(formData.get("media") as string);

  if (!title) return { error: null, fieldErrors: { title: "Title is required." } };

  // Slug uniqueness check (only if slug changed)
  if (slug !== prevSnapshot.base.slug) {
    const existing = await db.select({ id: contentItems.id }).from(contentItems).where(and(eq(contentItems.slug, slug))).limit(1);
    if (existing.length > 0) return { error: `Slug "${slug}" is already in use.` };
  }

  await db.transaction(async (tx) => {
    await tx.update(contentItems).set({
      title, slug, question, verified,
      updatedAt: new Date(),
    }).where(eq(contentItems.id, id));

    await tx.update(projectsTable).set({
      problem, year: isNaN(year) ? 0 : year, projectStatus, featured, repoUrl, tags,
      overview, startDate, endDate, context, role, collaborators,
      liveUrl, videoUrl, outcomes, skillsLearned,
    }).where(eq(projectsTable.id, id));

    await tx.delete(abandonedBranches).where(eq(abandonedBranches.itemId, id));

    if (branches.length > 0) {
      await tx.insert(abandonedBranches).values(
        branches.map((b, i) => ({
          itemId: id,
          tried: b.tried,
          whyAbandoned: b.whyAbandoned,
          learned: b.learned,
          sortOrder: i,
        })),
      );
    }

    await writeContentMedia(tx, id, mediaSel);
  });

  const nextSnapshot = await buildSnapshot(db, id);
  const changedFields = diffFields(prevSnapshot, nextSnapshot);
  await writeVersion(db, id, nextSnapshot, changedFields, "manual_save");

  revalidatePath(`/admin/projects/${slug}`);
  revalidatePath("/projects");
  revalidatePath(`/projects/${slug}`);

  return { error: null };
}

// ── Publish ───────────────────────────────────────────────────────────────────

export async function publishProject(
  _prev: ProjectFormState,
  formData: FormData,
): Promise<ProjectFormState> {
  const id = formData.get("id") as string;
  const question = (formData.get("question") as string)?.trim();

  if (!question) {
    return {
      error: "A published project must answer its origin question. Fill in the question above before publishing.",
    };
  }

  const db = getDb();

  await db.update(contentItems).set({
    status: "published",
    publishedAt: new Date(),
    scheduledFor: null,
    updatedAt: new Date(),
  }).where(eq(contentItems.id, id));

  const snapshot = await buildSnapshot(db, id);
  await writeVersion(db, id, snapshot, ["status", "publishedAt"], "publish");

  const [item] = await db.select({ slug: contentItems.slug }).from(contentItems).where(eq(contentItems.id, id)).limit(1);
  revalidatePath("/projects");
  if (item) revalidatePath(`/projects/${item.slug}`);

  return { error: null };
}

// ── Unpublish (→ draft) ───────────────────────────────────────────────────────

export async function unpublishProject(id: string): Promise<void> {
  const db = getDb();

  await db.update(contentItems).set({
    status: "draft",
    publishedAt: null,
    updatedAt: new Date(),
  }).where(eq(contentItems.id, id));

  const snapshot = await buildSnapshot(db, id);
  await writeVersion(db, id, snapshot, ["status"], "unpublish");

  const [item] = await db.select({ slug: contentItems.slug }).from(contentItems).where(eq(contentItems.id, id)).limit(1);
  revalidatePath("/projects");
  if (item) revalidatePath(`/projects/${item.slug}`);
}

// ── Schedule ──────────────────────────────────────────────────────────────────

export async function scheduleProject(
  _prev: ProjectFormState,
  formData: FormData,
): Promise<ProjectFormState> {
  const id = formData.get("id") as string;
  const scheduledForRaw = formData.get("scheduledFor") as string;
  const question = (formData.get("question") as string)?.trim();

  if (!question) {
    return { error: "Fill in the origin question before scheduling." };
  }

  const scheduledFor = new Date(scheduledForRaw);
  if (isNaN(scheduledFor.getTime()) || scheduledFor <= new Date()) {
    return { error: "Scheduled time must be in the future." };
  }

  const db = getDb();

  await db.update(contentItems).set({
    status: "scheduled",
    scheduledFor,
    updatedAt: new Date(),
  }).where(eq(contentItems.id, id));

  const snapshot = await buildSnapshot(db, id);
  await writeVersion(db, id, snapshot, ["status", "scheduledFor"], "schedule");

  return { error: null };
}

// ── Cancel schedule ───────────────────────────────────────────────────────────

export async function cancelSchedule(id: string): Promise<void> {
  const db = getDb();
  await db.update(contentItems).set({ status: "draft", scheduledFor: null, updatedAt: new Date() }).where(eq(contentItems.id, id));
  const snapshot = await buildSnapshot(db, id);
  await writeVersion(db, id, snapshot, ["status", "scheduledFor"], "unpublish");
}

// ── Archive ───────────────────────────────────────────────────────────────────

export async function archiveProject(id: string): Promise<void> {
  const db = getDb();
  await db.update(contentItems).set({ status: "archived", updatedAt: new Date() }).where(eq(contentItems.id, id));
  const snapshot = await buildSnapshot(db, id);
  await writeVersion(db, id, snapshot, ["status"], "unpublish");
  const [item] = await db.select({ slug: contentItems.slug }).from(contentItems).where(eq(contentItems.id, id)).limit(1);
  revalidatePath("/projects");
  if (item) revalidatePath(`/projects/${item.slug}`);
}

// ── Restore version ───────────────────────────────────────────────────────────

export async function restoreVersion(
  itemId: string,
  versionId: string,
): Promise<void> {
  const db = getDb();

  const [ver] = await db
    .select({ snapshot: contentVersions.snapshot })
    .from(contentVersions)
    .where(and(eq(contentVersions.id, versionId), eq(contentVersions.itemId, itemId)))
    .limit(1);

  if (!ver) return;

  const snap = ver.snapshot as Snapshot;
  const base = snap.base as typeof contentItems.$inferInsert;
  const project = snap.project as typeof projectsTable.$inferInsert;
  const branches = (snap.abandonedBranches ?? []) as {
    tried: string; whyAbandoned: string; learned: string; sortOrder?: number;
  }[];
  const mediaRows = (snap.contentMedia ?? []) as {
    mediaId: string; role: string; sortOrder?: number;
  }[];

  await db.transaction(async (tx) => {
    await tx.update(contentItems).set({
      title: base.title ?? "",
      slug: base.slug ?? "",
      question: base.question ?? "",
      verified: base.verified ?? false,
      status: "draft", // always restore to draft
      publishedAt: null,
      scheduledFor: null,
      updatedAt: new Date(),
    }).where(eq(contentItems.id, itemId));

    await tx.update(projectsTable).set({
      problem: project.problem ?? "",
      year: (project.year as number) ?? 0,
      projectStatus: project.projectStatus ?? "archived",
      featured: project.featured ?? false,
      repoUrl: project.repoUrl ?? null,
      tags: (project.tags as string[]) ?? [],
      // Rich metadata (D-048)
      overview: project.overview ?? "",
      startDate: project.startDate ?? null,
      endDate: project.endDate ?? null,
      context: project.context ?? "",
      role: project.role ?? "",
      collaborators: (project.collaborators as string[]) ?? [],
      liveUrl: project.liveUrl ?? null,
      videoUrl: project.videoUrl ?? null,
      outcomes: (project.outcomes as string[]) ?? [],
      skillsLearned: (project.skillsLearned as string[]) ?? [],
    }).where(eq(projectsTable.id, itemId));

    await tx.delete(abandonedBranches).where(eq(abandonedBranches.itemId, itemId));
    if (branches.length > 0) {
      await tx.insert(abandonedBranches).values(
        branches.map((b, i) => ({
          itemId,
          tried: b.tried,
          whyAbandoned: b.whyAbandoned,
          learned: b.learned,
          sortOrder: b.sortOrder ?? i,
        })),
      );
    }

    // Restore media attachments (references only — the media rows are intact).
    await tx.delete(contentMedia).where(eq(contentMedia.itemId, itemId));
    if (mediaRows.length > 0) {
      await tx.insert(contentMedia).values(
        mediaRows.map((m, i) => ({
          itemId,
          mediaId: m.mediaId,
          role: m.role,
          sortOrder: m.sortOrder ?? i,
        })),
      );
    }
  });

  const nextSnapshot = await buildSnapshot(db, itemId);
  const [current] = await db.select({ slug: contentItems.slug }).from(contentItems).where(eq(contentItems.id, itemId)).limit(1);
  const prevSnapshot = snap;
  const changedFields = diffFields(prevSnapshot, nextSnapshot);
  await writeVersion(db, itemId, nextSnapshot, changedFields, "restore");

  if (current) revalidatePath(`/admin/projects/${current.slug}`);
}
