"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq, desc } from "drizzle-orm";
import { getDb } from "@/db/index";
import { contentItems, skillsTable, contentVersions } from "@/db/schema";
import { ROUTES } from "@/constants/routes";

/**
 * Skills CRUD — D-065.
 *
 * `/admin/skills` has been a 13-line stub since D-043.
 *
 * ## How this relates to `content/skills.ts`
 *
 * D-063 built `/skills` from the owner's hand-authored taxonomy, which until
 * then existed only inside the hero's build script. That taxonomy is still the
 * floor: it is derived from real project tags and the owner's own self-report,
 * and it needs no database.
 *
 * These rows *enrich* it rather than replace it. A skill entered here carries
 * what the taxonomy cannot — a one-line context ("currently using it for X"), a
 * category, a since-year, and a Currently/Previously split. The page merges
 * them by name: a DB row upgrades a taxonomy entry, and anything not entered
 * here still appears from the taxonomy, evidence links intact.
 *
 * That ordering matters. Making the DB authoritative would have meant the
 * skills page went blank until the owner re-entered 22 items by hand, trading
 * a working page for an empty one.
 */

export interface SkillFormState {
  error: string | null;
  fieldErrors?: Partial<Record<string, string>>;
}

type Snapshot = {
  base: Record<string, unknown>;
  skill: Record<string, unknown>;
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
  const [skill] = await db
    .select()
    .from(skillsTable)
    .where(eq(skillsTable.id, itemId))
    .limit(1);
  return {
    base: base as Record<string, unknown>,
    skill: skill as Record<string, unknown>,
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
  for (const key of Object.keys(next.skill)) {
    if (JSON.stringify(prev.skill[key]) !== JSON.stringify(next.skill[key])) {
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
    .replace(/[^a-z0-9\s+#-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function revalidatePublic(slug?: string): void {
  revalidatePath("/admin/skills");
  if (slug) revalidatePath(`/admin/skills/${slug}`);
  revalidatePath(ROUTES.skills);
}

// ── Create ────────────────────────────────────────────────────────────────────

export async function createSkill(
  _prev: SkillFormState,
  formData: FormData,
): Promise<SkillFormState> {
  const title = (formData.get("title") as string)?.trim();
  if (!title) return { error: null, fieldErrors: { title: "Skill name is required." } };

  const db = getDb();
  const slug = slugify(title);

  const existing = await db
    .select({ id: contentItems.id })
    .from(contentItems)
    .where(eq(contentItems.slug, slug))
    .limit(1);
  if (existing.length > 0) {
    return {
      error: `Slug "${slug}" is already in use. This skill may already exist.`,
      fieldErrors: {},
    };
  }

  const [item] = await db
    .insert(contentItems)
    .values({ slug, title, contentType: "skill", status: "draft", question: "" })
    .returning({ id: contentItems.id });

  if (!item) return { error: "Failed to create skill.", fieldErrors: {} };

  await db.insert(skillsTable).values({
    id: item.id,
    context: "",
    current: true,
    category: "",
  });

  const snapshot = await buildSnapshot(db, item.id);
  await writeVersion(db, item.id, snapshot, [], "manual_save");

  redirect(`/admin/skills/${slug}`);
}

// ── Save draft ────────────────────────────────────────────────────────────────

export async function saveSkill(
  _prev: SkillFormState,
  formData: FormData,
): Promise<SkillFormState> {
  const id = formData.get("id") as string;
  if (!id) return { error: "Missing skill ID." };

  const db = getDb();
  const prevSnapshot = await buildSnapshot(db, id);

  const title = (formData.get("title") as string)?.trim() ?? "";
  const slug = (formData.get("slug") as string)?.trim() ?? "";
  const question = (formData.get("question") as string)?.trim() ?? "";
  const verified = formData.get("verified") === "true";
  const context = (formData.get("context") as string)?.trim() ?? "";
  const category = (formData.get("category") as string)?.trim() ?? "";
  const current = formData.get("current") === "true";
  const sinceYearRaw = (formData.get("sinceYear") as string)?.trim();
  const sinceYearParsed = sinceYearRaw ? parseInt(sinceYearRaw, 10) : NaN;
  const sinceYear = Number.isNaN(sinceYearParsed) ? null : sinceYearParsed;

  if (!title) return { error: null, fieldErrors: { title: "Skill name is required." } };

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
      .update(skillsTable)
      .set({ context, category, current, sinceYear })
      .where(eq(skillsTable.id, id));
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

export async function publishSkill(
  _prev: SkillFormState,
  formData: FormData,
): Promise<SkillFormState> {
  const id = formData.get("id") as string;
  const question = (formData.get("question") as string)?.trim();

  if (!question) {
    return {
      error:
        "A published skill must answer its origin question. What did learning this let you build?",
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

export async function unpublishSkill(id: string): Promise<void> {
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

export async function archiveSkill(id: string): Promise<void> {
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
