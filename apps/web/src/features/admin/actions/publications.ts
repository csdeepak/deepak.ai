"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq, desc } from "drizzle-orm";
import { getDb } from "@/db/index";
import { contentItems, publicationsTable, contentVersions } from "@/db/schema";
import { ROUTES } from "@/constants/routes";

/**
 * Publications CRUD — D-065.
 *
 * `publications` has had a full schema since D-043 and `/admin/publications`
 * has been a 21-line stub reading "ships in the next sprint" ever since. For a
 * site whose whole thesis is the researcher–engineer dual identity (docs/01),
 * the research half had no way to be entered at all.
 *
 * Mirrors `actions/timeline.ts` and `actions/posts.ts`: snapshot → diff →
 * version write on every mutation, identical lifecycle verbs. Third
 * implementation of the same pattern, kept deliberately parallel rather than
 * abstracted — the shapes diverge enough (array fields, status enums, date
 * overrides) that a shared generic would cost more in indirection than it
 * saves, and version history behaving identically across types matters more
 * than DRY here.
 */

export interface PublicationFormState {
  error: string | null;
  fieldErrors?: Partial<Record<string, string>>;
}

/** Mirrors the schema's `pub_status` values. */
const PUB_STATUSES = ["preprint", "published", "under-review"] as const;
type PubStatus = (typeof PUB_STATUSES)[number];

function coercePubStatus(value: string): PubStatus {
  return (PUB_STATUSES as readonly string[]).includes(value)
    ? (value as PubStatus)
    : "published";
}

// ── Snapshot helpers ──────────────────────────────────────────────────────────

type Snapshot = {
  base: Record<string, unknown>;
  publication: Record<string, unknown>;
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
  const [publication] = await db
    .select()
    .from(publicationsTable)
    .where(eq(publicationsTable.id, itemId))
    .limit(1);
  return {
    base: base as Record<string, unknown>,
    publication: publication as Record<string, unknown>,
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
  for (const key of Object.keys(next.publication)) {
    if (
      JSON.stringify(prev.publication[key]) !==
      JSON.stringify(next.publication[key])
    ) {
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

function revalidatePublic(slug?: string): void {
  revalidatePath("/admin/publications");
  if (slug) revalidatePath(`/admin/publications/${slug}`);
  revalidatePath(ROUTES.publications);
  revalidatePath(ROUTES.about);
}

/** Comma-separated in the form; an array in the column. */
function parseAuthors(raw: string): string[] {
  return raw
    .split(",")
    .map((name) => name.trim())
    .filter(Boolean);
}

// ── Create ────────────────────────────────────────────────────────────────────

export async function createPublication(
  _prev: PublicationFormState,
  formData: FormData,
): Promise<PublicationFormState> {
  const title = (formData.get("title") as string)?.trim();
  const yearRaw = (formData.get("year") as string)?.trim();

  if (!title) return { error: null, fieldErrors: { title: "Title is required." } };

  // NOT NULL in the schema, and publications sort by it.
  const year = yearRaw ? parseInt(yearRaw, 10) : NaN;
  if (!yearRaw || Number.isNaN(year)) {
    return { error: null, fieldErrors: { year: "Year is required." } };
  }

  const db = getDb();
  const slug = slugify(title);

  const existing = await db
    .select({ id: contentItems.id })
    .from(contentItems)
    .where(eq(contentItems.slug, slug))
    .limit(1);
  if (existing.length > 0) {
    return { error: `Slug "${slug}" is already in use. Edit the title.`, fieldErrors: {} };
  }

  const [item] = await db
    .insert(contentItems)
    .values({
      slug,
      title,
      contentType: "publication",
      status: "draft",
      question: "",
    })
    .returning({ id: contentItems.id });

  if (!item) return { error: "Failed to create publication.", fieldErrors: {} };

  await db.insert(publicationsTable).values({
    id: item.id,
    authors: [],
    venue: "",
    year,
    abstract: "",
    plainSummary: "",
    pubStatus: "published",
  });

  const snapshot = await buildSnapshot(db, item.id);
  await writeVersion(db, item.id, snapshot, [], "manual_save");

  redirect(`/admin/publications/${slug}`);
}

// ── Save draft ────────────────────────────────────────────────────────────────

export async function savePublication(
  _prev: PublicationFormState,
  formData: FormData,
): Promise<PublicationFormState> {
  const id = formData.get("id") as string;
  if (!id) return { error: "Missing publication ID." };

  const db = getDb();
  const prevSnapshot = await buildSnapshot(db, id);

  const title = (formData.get("title") as string)?.trim() ?? "";
  const slug = (formData.get("slug") as string)?.trim() ?? "";
  const question = (formData.get("question") as string)?.trim() ?? "";
  const verified = formData.get("verified") === "true";
  const authors = parseAuthors((formData.get("authors") as string) ?? "");
  const venue = (formData.get("venue") as string)?.trim() ?? "";
  const yearRaw = (formData.get("year") as string)?.trim() ?? "";
  const year = parseInt(yearRaw, 10);
  const abstract = (formData.get("abstract") as string)?.trim() ?? "";
  const plainSummary = (formData.get("plainSummary") as string)?.trim() ?? "";
  const pubStatus = coercePubStatus((formData.get("pubStatus") as string) ?? "");
  // Optional link/identifier fields: empty string means "not set", which is
  // NULL in the column, not "".
  const pdfUrl = (formData.get("pdfUrl") as string)?.trim() || null;
  const arxivUrl = (formData.get("arxivUrl") as string)?.trim() || null;
  const doi = (formData.get("doi") as string)?.trim() || null;
  const bibtex = (formData.get("bibtex") as string)?.trim() || null;
  const pubDate = (formData.get("pubDate") as string)?.trim() || null;

  if (!title) return { error: null, fieldErrors: { title: "Title is required." } };
  if (!yearRaw || Number.isNaN(year)) {
    return { error: null, fieldErrors: { year: "Year is required." } };
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
      .update(publicationsTable)
      .set({
        authors,
        venue,
        year,
        abstract,
        plainSummary,
        pubStatus,
        pdfUrl,
        arxivUrl,
        doi,
        bibtex,
        pubDate,
      })
      .where(eq(publicationsTable.id, id));
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

export async function publishPublication(
  _prev: PublicationFormState,
  formData: FormData,
): Promise<PublicationFormState> {
  const id = formData.get("id") as string;
  const question = (formData.get("question") as string)?.trim();

  if (!question) {
    return {
      error:
        "A published paper must answer its origin question. Fill in the question above before publishing.",
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
  await writeVersion(db, id, snapshot, ["status", "publishedAt", "question"], "publish");

  const [item] = await db
    .select({ slug: contentItems.slug })
    .from(contentItems)
    .where(eq(contentItems.id, id))
    .limit(1);
  revalidatePublic(item?.slug);

  return { error: null };
}

// ── Unpublish / archive ───────────────────────────────────────────────────────

export async function unpublishPublication(id: string): Promise<void> {
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

export async function archivePublication(id: string): Promise<void> {
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
