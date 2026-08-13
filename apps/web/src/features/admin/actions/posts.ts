"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq, desc, ne, and } from "drizzle-orm";
import { getDb } from "@/db/index";
import { contentItems, postsTable, contentVersions, contentMedia } from "@/db/schema";

export interface PostFormState {
  error: string | null;
  fieldErrors?: Partial<Record<string, string>>;
}

// ── Snapshot helpers ──────────────────────────────────────────────────────────

type Snapshot = {
  base: Record<string, unknown>;
  post: Record<string, unknown>;
  contentMedia: Record<string, unknown>[];
};

async function buildSnapshot(db: ReturnType<typeof getDb>, itemId: string): Promise<Snapshot> {
  const [base] = await db.select().from(contentItems).where(eq(contentItems.id, itemId)).limit(1);
  const [post] = await db.select().from(postsTable).where(eq(postsTable.id, itemId)).limit(1);
  const cm = await db
    .select()
    .from(contentMedia)
    .where(eq(contentMedia.itemId, itemId))
    .orderBy(contentMedia.role, contentMedia.sortOrder);
  return {
    base: base as Record<string, unknown>,
    post: post as Record<string, unknown>,
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
  const p1 = prev.post; const p2 = next.post;
  for (const k of Object.keys(p2)) {
    if (JSON.stringify(p1[k]) !== JSON.stringify(p2[k])) changed.push(k);
  }
  if (JSON.stringify(prev.contentMedia) !== JSON.stringify(next.contentMedia)) {
    changed.push("media");
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

// ── Slug helper ───────────────────────────────────────────────────────────────

function slugify(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

/** Replace an item's cover contentMedia row (trivial reuse — one role only). */
async function writeCoverMedia(
  tx: Parameters<Parameters<ReturnType<typeof getDb>["transaction"]>[0]>[0],
  itemId: string,
  coverMediaId: string | null,
) {
  await tx.delete(contentMedia).where(and(eq(contentMedia.itemId, itemId), eq(contentMedia.role, "cover")));
  if (coverMediaId) {
    await tx.insert(contentMedia).values({ itemId, mediaId: coverMediaId, role: "cover", sortOrder: 0 });
  }
}

// ── Create ────────────────────────────────────────────────────────────────────

export async function createPost(
  _prev: PostFormState,
  formData: FormData,
): Promise<PostFormState> {
  const title = (formData.get("title") as string)?.trim();
  if (!title) return { error: null, fieldErrors: { title: "Title is required." } };

  const db = getDb();
  const slug = slugify(title);

  const existing = await db.select({ id: contentItems.id }).from(contentItems).where(eq(contentItems.slug, slug)).limit(1);
  if (existing.length > 0) return { error: `Slug "${slug}" is already in use. Edit the title.`, fieldErrors: {} };

  const [item] = await db.insert(contentItems).values({
    slug,
    title,
    contentType: "post",
    status: "draft",
    question: "",
  }).returning({ id: contentItems.id });

  if (!item) return { error: "Failed to create post.", fieldErrors: {} };

  await db.insert(postsTable).values({
    id: item.id,
    dek: "",
    bodyMarkdown: "",
    tags: [],
    featured: false,
  });

  const snapshot = await buildSnapshot(db, item.id);
  await writeVersion(db, item.id, snapshot, [], "manual_save");

  redirect(`/admin/posts/${slug}`);
}

// ── Save draft ────────────────────────────────────────────────────────────────

export async function savePost(
  _prev: PostFormState,
  formData: FormData,
): Promise<PostFormState> {
  const id = formData.get("id") as string;
  if (!id) return { error: "Missing post ID." };

  const db = getDb();
  const prevSnapshot = await buildSnapshot(db, id);

  const title = (formData.get("title") as string)?.trim() ?? "";
  const slug = (formData.get("slug") as string)?.trim() ?? "";
  const question = (formData.get("question") as string)?.trim() ?? "";
  const verified = formData.get("verified") === "true";
  const dek = (formData.get("dek") as string)?.trim() ?? "";
  const bodyMarkdown = (formData.get("bodyMarkdown") as string) ?? "";
  const readingMinutesRaw = (formData.get("readingMinutes") as string)?.trim();
  const readingMinutes = readingMinutesRaw ? parseInt(readingMinutesRaw, 10) : null;
  const featured = formData.get("featured") === "true";
  const tags = ((formData.get("tags") as string) ?? "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
  const coverMediaId = (formData.get("coverMediaId") as string)?.trim() || null;

  if (!title) return { error: null, fieldErrors: { title: "Title is required." } };

  if (slug !== prevSnapshot.base.slug) {
    const existing = await db.select({ id: contentItems.id }).from(contentItems).where(eq(contentItems.slug, slug)).limit(1);
    if (existing.length > 0) return { error: `Slug "${slug}" is already in use.` };
  }

  await db.transaction(async (tx) => {
    await tx.update(contentItems).set({
      title, slug, question, verified,
      updatedAt: new Date(),
    }).where(eq(contentItems.id, id));

    await tx.update(postsTable).set({
      dek,
      bodyMarkdown,
      readingMinutes: readingMinutes === null || isNaN(readingMinutes) ? null : readingMinutes,
      tags,
      featured,
    }).where(eq(postsTable.id, id));

    // Featured is single-boolean, one-at-a-time — unset every other post in
    // the same transaction so at most one post is ever featured.
    if (featured) {
      await tx.update(postsTable).set({ featured: false }).where(ne(postsTable.id, id));
    }

    await writeCoverMedia(tx, id, coverMediaId);
  });

  const nextSnapshot = await buildSnapshot(db, id);
  const changedFields = diffFields(prevSnapshot, nextSnapshot);
  await writeVersion(db, id, nextSnapshot, changedFields, "manual_save");

  revalidatePath(`/admin/posts/${slug}`);
  revalidatePath("/admin/posts");

  return { error: null };
}

// ── Publish ───────────────────────────────────────────────────────────────────

export async function publishPost(
  _prev: PostFormState,
  formData: FormData,
): Promise<PostFormState> {
  const id = formData.get("id") as string;
  const question = (formData.get("question") as string)?.trim();

  if (!question) {
    return {
      error: "A published post must answer its origin question. Fill in the question above before publishing.",
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

  revalidatePath("/admin/posts");
  const [item] = await db.select({ slug: contentItems.slug }).from(contentItems).where(eq(contentItems.id, id)).limit(1);
  if (item) revalidatePath(`/admin/posts/${item.slug}`);

  return { error: null };
}

// ── Unpublish (→ draft) ───────────────────────────────────────────────────────

export async function unpublishPost(id: string): Promise<void> {
  const db = getDb();

  await db.update(contentItems).set({
    status: "draft",
    publishedAt: null,
    updatedAt: new Date(),
  }).where(eq(contentItems.id, id));

  const snapshot = await buildSnapshot(db, id);
  await writeVersion(db, id, snapshot, ["status"], "unpublish");

  revalidatePath("/admin/posts");
  const [item] = await db.select({ slug: contentItems.slug }).from(contentItems).where(eq(contentItems.id, id)).limit(1);
  if (item) revalidatePath(`/admin/posts/${item.slug}`);
}

// ── Archive (soft delete) ──────────────────────────────────────────────────────

export async function archivePost(id: string): Promise<void> {
  const db = getDb();
  await db.update(contentItems).set({ status: "archived", updatedAt: new Date() }).where(eq(contentItems.id, id));
  const snapshot = await buildSnapshot(db, id);
  await writeVersion(db, id, snapshot, ["status"], "unpublish");
  revalidatePath("/admin/posts");
  const [item] = await db.select({ slug: contentItems.slug }).from(contentItems).where(eq(contentItems.id, id)).limit(1);
  if (item) revalidatePath(`/admin/posts/${item.slug}`);
}

// ── Restore version ───────────────────────────────────────────────────────────

export async function restorePostVersion(
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
  const post = snap.post as typeof postsTable.$inferInsert;
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

    await tx.update(postsTable).set({
      dek: post.dek ?? "",
      bodyMarkdown: post.bodyMarkdown ?? "",
      readingMinutes: (post.readingMinutes as number | null) ?? null,
      tags: (post.tags as string[]) ?? [],
      featured: post.featured ?? false,
    }).where(eq(postsTable.id, itemId));

    if (post.featured) {
      await tx.update(postsTable).set({ featured: false }).where(ne(postsTable.id, itemId));
    }

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
  const changedFields = diffFields(snap, nextSnapshot);
  await writeVersion(db, itemId, nextSnapshot, changedFields, "restore");

  if (current) revalidatePath(`/admin/posts/${current.slug}`);
}
