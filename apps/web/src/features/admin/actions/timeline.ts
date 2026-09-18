"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq, desc } from "drizzle-orm";
import { getDb } from "@/db/index";
import { contentItems, timelineEntriesTable, contentVersions } from "@/db/schema";
import { ROUTES } from "@/constants/routes";

/**
 * Timeline (experience) CRUD — D-064.
 *
 * Why this exists: `timeline_entries` has had a full schema since the D-043
 * database sprint, and `/admin/timeline` has been a 13-line stub ever since.
 * The owner had no way to record work experience at all, which is why
 * `docs/31` §7.2 lists internships and work history as absent from Dex's
 * corpus entirely — and names it "the single most common recruiter screen".
 * The public page could not be built because the data could not be created.
 *
 * Mirrors `actions/posts.ts` deliberately, including the snapshot → diff →
 * version write on every mutation, so version history and restore behave
 * identically across content types rather than each one inventing its own
 * rules. The shapes differ; the lifecycle does not.
 *
 * Note this is the *career* timeline (`timeline_entries`), which is a
 * different thing from the landing page's Timeline section — that one walks
 * projects by `timelineOrder` and is unaffected by anything here.
 */

export interface TimelineFormState {
  error: string | null;
  fieldErrors?: Partial<Record<string, string>>;
}

// ── Snapshot helpers ──────────────────────────────────────────────────────────

type Snapshot = {
  base: Record<string, unknown>;
  entry: Record<string, unknown>;
};

async function buildSnapshot(
  db: ReturnType<typeof getDb>,
  itemId: string,
): Promise<Snapshot> {
  const [base] = await db
    .select()
    .from(contentItems)
    .where(eq(contentItems.id, itemId))
    .limit(1);
  const [entry] = await db
    .select()
    .from(timelineEntriesTable)
    .where(eq(timelineEntriesTable.id, itemId))
    .limit(1);
  return {
    base: base as Record<string, unknown>,
    entry: entry as Record<string, unknown>,
  };
}

function diffFields(prev: Snapshot | null, next: Snapshot): string[] {
  if (!prev) return [];
  const changed: string[] = [];
  for (const key of Object.keys(next.base)) {
    if (JSON.stringify(prev.base[key]) !== JSON.stringify(next.base[key])) {
      changed.push(key);
    }
  }
  for (const key of Object.keys(next.entry)) {
    if (JSON.stringify(prev.entry[key]) !== JSON.stringify(next.entry[key])) {
      changed.push(key);
    }
  }
  return changed;
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

function slugify(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

/** Every public surface an entry can appear on. */
function revalidatePublic(slug?: string): void {
  revalidatePath("/admin/timeline");
  if (slug) revalidatePath(`/admin/timeline/${slug}`);
  revalidatePath(ROUTES.timeline);
  revalidatePath(ROUTES.about); // the About page carries a short Experience list
}

// ── Create ────────────────────────────────────────────────────────────────────

export async function createTimelineEntry(
  _prev: TimelineFormState,
  formData: FormData,
): Promise<TimelineFormState> {
  const role = (formData.get("role") as string)?.trim();
  const organization = (formData.get("organization") as string)?.trim();
  const startDate = (formData.get("startDate") as string)?.trim();

  if (!role) return { error: null, fieldErrors: { role: "Role is required." } };
  if (!organization) {
    return { error: null, fieldErrors: { organization: "Organization is required." } };
  }
  // NOT NULL in the schema, and the whole point of a timeline is ordering —
  // an entry without a start date cannot be placed.
  if (!startDate) {
    return { error: null, fieldErrors: { startDate: "Start date is required." } };
  }

  const db = getDb();
  // "Agentic AI Researcher at CCBD" reads correctly in a list of entries and
  // makes a stable, meaningful slug.
  const title = `${role} at ${organization}`;
  const slug = slugify(title);

  const existing = await db
    .select({ id: contentItems.id })
    .from(contentItems)
    .where(eq(contentItems.slug, slug))
    .limit(1);
  if (existing.length > 0) {
    return {
      error: `Slug "${slug}" is already in use. Adjust the role or organization.`,
      fieldErrors: {},
    };
  }

  const [item] = await db
    .insert(contentItems)
    .values({
      slug,
      title,
      contentType: "timeline_entry",
      status: "draft",
      question: "",
    })
    .returning({ id: contentItems.id });

  if (!item) return { error: "Failed to create entry.", fieldErrors: {} };

  await db.insert(timelineEntriesTable).values({
    id: item.id,
    organization,
    role,
    startDate,
    summary: "",
    place: "",
    highlights: [],
  });

  const snapshot = await buildSnapshot(db, item.id);
  await writeVersion(db, item.id, snapshot, [], "manual_save");

  redirect(`/admin/timeline/${slug}`);
}

// ── Save draft ────────────────────────────────────────────────────────────────

export async function saveTimelineEntry(
  _prev: TimelineFormState,
  formData: FormData,
): Promise<TimelineFormState> {
  const id = formData.get("id") as string;
  if (!id) return { error: "Missing entry ID." };

  const db = getDb();
  const prevSnapshot = await buildSnapshot(db, id);

  const title = (formData.get("title") as string)?.trim() ?? "";
  const slug = (formData.get("slug") as string)?.trim() ?? "";
  const question = (formData.get("question") as string)?.trim() ?? "";
  const verified = formData.get("verified") === "true";
  const organization = (formData.get("organization") as string)?.trim() ?? "";
  const role = (formData.get("role") as string)?.trim() ?? "";
  const startDate = (formData.get("startDate") as string)?.trim() ?? "";
  // Absent end date means "current" — a real state, not a missing value.
  const endDateRaw = (formData.get("endDate") as string)?.trim();
  const endDate = endDateRaw ? endDateRaw : null;
  const summary = (formData.get("summary") as string)?.trim() ?? "";
  const place = (formData.get("place") as string)?.trim() ?? "";
  const highlights = ((formData.get("highlights") as string) ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (!title) return { error: null, fieldErrors: { title: "Title is required." } };
  if (!role) return { error: null, fieldErrors: { role: "Role is required." } };
  if (!organization) {
    return { error: null, fieldErrors: { organization: "Organization is required." } };
  }
  if (!startDate) {
    return { error: null, fieldErrors: { startDate: "Start date is required." } };
  }
  if (endDate && endDate < startDate) {
    return {
      error: null,
      fieldErrors: { endDate: "End date cannot be before the start date." },
    };
  }

  if (slug !== prevSnapshot.base.slug) {
    const existing = await db
      .select({ id: contentItems.id })
      .from(contentItems)
      .where(eq(contentItems.slug, slug))
      .limit(1);
    if (existing.length > 0) return { error: `Slug "${slug}" is already in use.` };
  }

  await db.transaction(async (tx) => {
    await tx
      .update(contentItems)
      .set({ title, slug, question, verified, updatedAt: new Date() })
      .where(eq(contentItems.id, id));

    await tx
      .update(timelineEntriesTable)
      .set({ organization, role, startDate, endDate, summary, place, highlights })
      .where(eq(timelineEntriesTable.id, id));
  });

  const nextSnapshot = await buildSnapshot(db, id);
  await writeVersion(
    db,
    id,
    nextSnapshot,
    diffFields(prevSnapshot, nextSnapshot),
    "manual_save",
  );

  revalidatePublic(slug);
  return { error: null };
}

// ── Publish ───────────────────────────────────────────────────────────────────

export async function publishTimelineEntry(
  _prev: TimelineFormState,
  formData: FormData,
): Promise<TimelineFormState> {
  const id = formData.get("id") as string;
  const question = (formData.get("question") as string)?.trim();

  // LAW-003 applies to every content type, not just projects: an entry has to
  // say what question it answers before it is published.
  if (!question) {
    return {
      error:
        "A published entry must answer its origin question. Fill in the question above before publishing.",
    };
  }

  const db = getDb();

  await db
    .update(contentItems)
    .set({
      status: "published",
      publishedAt: new Date(),
      scheduledFor: null,
      question,
      updatedAt: new Date(),
    })
    .where(eq(contentItems.id, id));

  const snapshot = await buildSnapshot(db, id);
  await writeVersion(
    db,
    id,
    snapshot,
    ["status", "publishedAt", "question"],
    "publish",
  );

  const [item] = await db
    .select({ slug: contentItems.slug })
    .from(contentItems)
    .where(eq(contentItems.id, id))
    .limit(1);
  revalidatePublic(item?.slug);

  return { error: null };
}

// ── Unpublish (→ draft) ───────────────────────────────────────────────────────

export async function unpublishTimelineEntry(id: string): Promise<void> {
  const db = getDb();

  await db
    .update(contentItems)
    .set({ status: "draft", publishedAt: null, updatedAt: new Date() })
    .where(eq(contentItems.id, id));

  const snapshot = await buildSnapshot(db, id);
  await writeVersion(db, id, snapshot, ["status"], "unpublish");

  const [item] = await db
    .select({ slug: contentItems.slug })
    .from(contentItems)
    .where(eq(contentItems.id, id))
    .limit(1);
  revalidatePublic(item?.slug);
}

// ── Archive (soft delete) ─────────────────────────────────────────────────────

export async function archiveTimelineEntry(id: string): Promise<void> {
  const db = getDb();
  await db
    .update(contentItems)
    .set({ status: "archived", updatedAt: new Date() })
    .where(eq(contentItems.id, id));

  const snapshot = await buildSnapshot(db, id);
  await writeVersion(db, id, snapshot, ["status"], "unpublish");

  const [item] = await db
    .select({ slug: contentItems.slug })
    .from(contentItems)
    .where(eq(contentItems.id, id))
    .limit(1);
  revalidatePublic(item?.slug);
}
