/**
 * DB-backed ContentService — reads through Drizzle from PostgreSQL.
 *
 * Implements the same ContentService interface as local-content.ts; the
 * backing store is fully opaque to callers. Swap between implementations
 * via CONTENT_SOURCE env var in src/services/index.ts (docs/09 §11).
 *
 * CTI query pattern (D-043):
 *   content_items (base spine: question, status, publishedAt, ...)
 *   JOIN type-specific table (projects, publications, etc.)
 *   + one additional query per result set for abandoned_branches / relations
 *   → mapped back to the TypeScript content types
 *
 * Three DB reads per collection call (no N+1):
 *   1. content_items JOIN type table WHERE status='published'
 *   2. abandoned_branches WHERE item_id IN (ids)   -- projects only
 *   3. relations WHERE from_id IN (ids)
 */

import { eq, and, desc, inArray, asc } from "drizzle-orm";
import { getDb } from "@/db/index";
import {
  contentItems,
  abandonedBranches,
  relationsTable,
  projectsTable,
  publicationsTable,
  postsTable,
  timelineEntriesTable,
  skillsTable,
  media,
  contentMedia,
} from "@/db/schema";
import { mediaPublicUrl } from "@/lib/media/url";
import type { ContentService } from "./content";
import type {
  Project,
  Publication,
  Post,
  TimelineEntry,
  Skill,
  ContentStatus,
  RelationKind,
  ContentType,
  Relation,
  AbandonedBranch,
  MediaAsset,
} from "@/types/content";

// ── Helpers ───────────────────────────────────────────────────────────────────

function toIso(d: Date | null | undefined): string {
  return d ? d.toISOString() : "";
}

/** Empty string → undefined (so absent fields self-hide, matching file mode). */
function orUndef(s: string | null | undefined): string | undefined {
  return s && s.length > 0 ? s : undefined;
}

/** Empty array → undefined. */
function arrOrUndef(a: readonly string[] | null | undefined): string[] | undefined {
  return a && a.length > 0 ? [...a] : undefined;
}

type MediaRow = typeof media.$inferSelect;

function toMediaAsset(row: MediaRow): MediaAsset {
  return {
    kind: row.kind === "pdf" ? "pdf" : "image",
    url: mediaPublicUrl(row.storageKey),
    alt: row.altText ?? "",
    caption: row.caption ?? "",
    width: row.width ?? undefined,
    height: row.height ?? undefined,
  };
}

/**
 * Load a content item's attached media (cover / gallery / attachment) in one
 * query, split by role and ordered. Detail-path only — cards don't need it.
 */
async function loadItemMedia(
  db: ReturnType<typeof getDb>,
  itemId: string,
): Promise<{ cover?: MediaAsset; gallery: MediaAsset[]; attachments: MediaAsset[] }> {
  const rows = await db
    .select({
      role: contentMedia.role,
      sortOrder: contentMedia.sortOrder,
      media,
    })
    .from(contentMedia)
    .innerJoin(media, eq(contentMedia.mediaId, media.id))
    .where(eq(contentMedia.itemId, itemId))
    .orderBy(asc(contentMedia.role), asc(contentMedia.sortOrder));

  let cover: MediaAsset | undefined;
  const gallery: MediaAsset[] = [];
  const attachments: MediaAsset[] = [];
  for (const r of rows) {
    const asset = toMediaAsset(r.media);
    if (r.role === "cover") cover = asset;
    else if (r.role === "gallery") gallery.push(asset);
    else if (r.role === "attachment") attachments.push(asset);
  }
  return { cover, gallery, attachments };
}

function mapRelations(
  rows: Array<{
    kind: string;
    toType: string;
    toSlug: string;
    toTitle: string;
  }>
): Relation[] {
  return rows.map((r) => ({
    kind: r.kind as RelationKind,
    toType: r.toType as ContentType,
    toSlug: r.toSlug,
    toTitle: r.toTitle,
  }));
}

function mapBranches(
  rows: Array<{
    tried: string;
    whyAbandoned: string;
    learned: string;
  }>
): AbandonedBranch[] {
  return rows.map((b) => ({
    tried: b.tried,
    whyAbandoned: b.whyAbandoned,
    learned: b.learned,
  }));
}

/** The rich Project scalar columns, selected on every project read. */
const projectRichCols = {
  overview: projectsTable.overview,
  startDate: projectsTable.startDate,
  endDate: projectsTable.endDate,
  context: projectsTable.context,
  role: projectsTable.role,
  collaborators: projectsTable.collaborators,
  liveUrl: projectsTable.liveUrl,
  videoUrl: projectsTable.videoUrl,
  outcomes: projectsTable.outcomes,
  skillsLearned: projectsTable.skillsLearned,
} as const;

/** Map the rich scalar columns → optional Project fields (empties self-hide). */
function mapProjectRich(row: {
  overview: string;
  startDate: string | null;
  endDate: string | null;
  context: string;
  role: string;
  collaborators: string[];
  liveUrl: string | null;
  videoUrl: string | null;
  outcomes: string[];
  skillsLearned: string[];
}) {
  return {
    overview: orUndef(row.overview),
    startDate: row.startDate ?? undefined,
    endDate: row.endDate ?? undefined,
    context: orUndef(row.context),
    role: orUndef(row.role),
    collaborators: arrOrUndef(row.collaborators),
    liveUrl: row.liveUrl ?? undefined,
    videoUrl: row.videoUrl ?? undefined,
    outcomes: arrOrUndef(row.outcomes),
    skillsLearned: arrOrUndef(row.skillsLearned),
  };
}

// ── ContentService implementation ─────────────────────────────────────────────

export const dbContent: ContentService = {
  // ── Projects ──────────────────────────────────────────────────────────────

  async getProjects(): Promise<Project[]> {
    const db = getDb();

    const rows = await db
      .select({
        id: contentItems.id,
        slug: contentItems.slug,
        title: contentItems.title,
        status: contentItems.status,
        publishedAt: contentItems.publishedAt,
        updatedAt: contentItems.updatedAt,
        question: contentItems.question,
        problem: projectsTable.problem,
        year: projectsTable.year,
        projectStatus: projectsTable.projectStatus,
        tags: projectsTable.tags,
        featured: projectsTable.featured,
        repoUrl: projectsTable.repoUrl,
        ...projectRichCols,
      })
      .from(contentItems)
      .innerJoin(projectsTable, eq(contentItems.id, projectsTable.id))
      .where(
        and(
          eq(contentItems.contentType, "project"),
          eq(contentItems.status, "published")
        )
      )
      .orderBy(desc(contentItems.publishedAt));

    if (rows.length === 0) return [];

    const ids = rows.map((r) => r.id);

    const [branches, rels] = await Promise.all([
      db
        .select()
        .from(abandonedBranches)
        .where(inArray(abandonedBranches.itemId, ids))
        .orderBy(abandonedBranches.itemId, abandonedBranches.sortOrder),
      db
        .select()
        .from(relationsTable)
        .where(inArray(relationsTable.fromId, ids)),
    ]);

    return rows.map((row) => ({
      type: "project" as const,
      slug: row.slug,
      title: row.title,
      status: row.status as ContentStatus,
      publishedAt: toIso(row.publishedAt),
      updatedAt: toIso(row.updatedAt),
      question: row.question,
      problem: row.problem,
      year: row.year,
      projectStatus: row.projectStatus as "active" | "archived",
      tags: row.tags ?? [],
      featured: row.featured,
      repoUrl: row.repoUrl ?? undefined,
      ...mapProjectRich(row),
      abandonedBranches: mapBranches(
        branches.filter((b) => b.itemId === row.id)
      ),
      relations: mapRelations(rels.filter((r) => r.fromId === row.id)),
    }));
  },

  async getFeaturedProjects(limit = 2): Promise<Project[]> {
    const db = getDb();

    const rows = await db
      .select({
        id: contentItems.id,
        slug: contentItems.slug,
        title: contentItems.title,
        status: contentItems.status,
        publishedAt: contentItems.publishedAt,
        updatedAt: contentItems.updatedAt,
        question: contentItems.question,
        problem: projectsTable.problem,
        year: projectsTable.year,
        projectStatus: projectsTable.projectStatus,
        tags: projectsTable.tags,
        featured: projectsTable.featured,
        repoUrl: projectsTable.repoUrl,
        ...projectRichCols,
      })
      .from(contentItems)
      .innerJoin(projectsTable, eq(contentItems.id, projectsTable.id))
      .where(
        and(
          eq(contentItems.contentType, "project"),
          eq(contentItems.status, "published"),
          eq(projectsTable.featured, true)
        )
      )
      .orderBy(desc(contentItems.publishedAt))
      .limit(limit);

    if (rows.length === 0) return [];

    const ids = rows.map((r) => r.id);

    const [branches, rels] = await Promise.all([
      db
        .select()
        .from(abandonedBranches)
        .where(inArray(abandonedBranches.itemId, ids))
        .orderBy(abandonedBranches.itemId, abandonedBranches.sortOrder),
      db
        .select()
        .from(relationsTable)
        .where(inArray(relationsTable.fromId, ids)),
    ]);

    return rows.map((row) => ({
      type: "project" as const,
      slug: row.slug,
      title: row.title,
      status: row.status as ContentStatus,
      publishedAt: toIso(row.publishedAt),
      updatedAt: toIso(row.updatedAt),
      question: row.question,
      problem: row.problem,
      year: row.year,
      projectStatus: row.projectStatus as "active" | "archived",
      tags: row.tags ?? [],
      featured: row.featured,
      repoUrl: row.repoUrl ?? undefined,
      ...mapProjectRich(row),
      abandonedBranches: mapBranches(
        branches.filter((b) => b.itemId === row.id)
      ),
      relations: mapRelations(rels.filter((r) => r.fromId === row.id)),
    }));
  },

  async getProject(slug: string): Promise<Project | null> {
    const db = getDb();

    const [row] = await db
      .select({
        id: contentItems.id,
        slug: contentItems.slug,
        title: contentItems.title,
        status: contentItems.status,
        publishedAt: contentItems.publishedAt,
        updatedAt: contentItems.updatedAt,
        question: contentItems.question,
        problem: projectsTable.problem,
        year: projectsTable.year,
        projectStatus: projectsTable.projectStatus,
        tags: projectsTable.tags,
        featured: projectsTable.featured,
        repoUrl: projectsTable.repoUrl,
        ...projectRichCols,
      })
      .from(contentItems)
      .innerJoin(projectsTable, eq(contentItems.id, projectsTable.id))
      .where(eq(contentItems.slug, slug))
      .limit(1);

    if (!row) return null;

    const [branches, rels, mediaAssets] = await Promise.all([
      db
        .select()
        .from(abandonedBranches)
        .where(eq(abandonedBranches.itemId, row.id))
        .orderBy(abandonedBranches.sortOrder),
      db
        .select()
        .from(relationsTable)
        .where(eq(relationsTable.fromId, row.id)),
      loadItemMedia(db, row.id),
    ]);

    return {
      type: "project" as const,
      slug: row.slug,
      title: row.title,
      status: row.status as ContentStatus,
      publishedAt: toIso(row.publishedAt),
      updatedAt: toIso(row.updatedAt),
      question: row.question,
      problem: row.problem,
      year: row.year,
      projectStatus: row.projectStatus as "active" | "archived",
      tags: row.tags ?? [],
      featured: row.featured,
      repoUrl: row.repoUrl ?? undefined,
      ...mapProjectRich(row),
      coverImage: mediaAssets.cover,
      gallery: mediaAssets.gallery.length > 0 ? mediaAssets.gallery : undefined,
      attachments:
        mediaAssets.attachments.length > 0 ? mediaAssets.attachments : undefined,
      abandonedBranches: mapBranches(branches),
      relations: mapRelations(rels),
    };
  },

  // ── Publications ──────────────────────────────────────────────────────────

  async getPublications(): Promise<Publication[]> {
    const db = getDb();

    const rows = await db
      .select({
        id: contentItems.id,
        slug: contentItems.slug,
        title: contentItems.title,
        status: contentItems.status,
        publishedAt: contentItems.publishedAt,
        updatedAt: contentItems.updatedAt,
        question: contentItems.question,
        authors: publicationsTable.authors,
        venue: publicationsTable.venue,
        year: publicationsTable.year,
        abstract: publicationsTable.abstract,
        plainSummary: publicationsTable.plainSummary,
        pdfUrl: publicationsTable.pdfUrl,
        bibtex: publicationsTable.bibtex,
      })
      .from(contentItems)
      .innerJoin(publicationsTable, eq(contentItems.id, publicationsTable.id))
      .where(
        and(
          eq(contentItems.contentType, "publication"),
          eq(contentItems.status, "published")
        )
      )
      .orderBy(desc(publicationsTable.year));

    if (rows.length === 0) return [];
    const ids = rows.map((r) => r.id);
    const rels = await db
      .select()
      .from(relationsTable)
      .where(inArray(relationsTable.fromId, ids));

    return rows.map((row) => ({
      type: "publication" as const,
      slug: row.slug,
      title: row.title,
      status: row.status as ContentStatus,
      publishedAt: toIso(row.publishedAt),
      updatedAt: toIso(row.updatedAt),
      relations: mapRelations(rels.filter((r) => r.fromId === row.id)),
      authors: row.authors ?? [],
      venue: row.venue,
      year: row.year,
      abstract: row.abstract,
      plainSummary: row.plainSummary,
      pdfUrl: row.pdfUrl ?? undefined,
      bibtex: row.bibtex ?? undefined,
    }));
  },

  async getPublication(slug: string): Promise<Publication | null> {
    const db = getDb();

    const [row] = await db
      .select({
        id: contentItems.id,
        slug: contentItems.slug,
        title: contentItems.title,
        status: contentItems.status,
        publishedAt: contentItems.publishedAt,
        updatedAt: contentItems.updatedAt,
        question: contentItems.question,
        authors: publicationsTable.authors,
        venue: publicationsTable.venue,
        year: publicationsTable.year,
        abstract: publicationsTable.abstract,
        plainSummary: publicationsTable.plainSummary,
        pdfUrl: publicationsTable.pdfUrl,
        bibtex: publicationsTable.bibtex,
      })
      .from(contentItems)
      .innerJoin(publicationsTable, eq(contentItems.id, publicationsTable.id))
      .where(eq(contentItems.slug, slug))
      .limit(1);

    if (!row) return null;
    const rels = await db
      .select()
      .from(relationsTable)
      .where(eq(relationsTable.fromId, row.id));

    return {
      type: "publication" as const,
      slug: row.slug,
      title: row.title,
      status: row.status as ContentStatus,
      publishedAt: toIso(row.publishedAt),
      updatedAt: toIso(row.updatedAt),
      relations: mapRelations(rels),
      authors: row.authors ?? [],
      venue: row.venue,
      year: row.year,
      abstract: row.abstract,
      plainSummary: row.plainSummary,
      pdfUrl: row.pdfUrl ?? undefined,
      bibtex: row.bibtex ?? undefined,
    };
  },

  // ── Posts ─────────────────────────────────────────────────────────────────

  async getLatestPosts(limit = 3): Promise<Post[]> {
    const db = getDb();

    const rows = await db
      .select({
        id: contentItems.id,
        slug: contentItems.slug,
        title: contentItems.title,
        status: contentItems.status,
        publishedAt: contentItems.publishedAt,
        updatedAt: contentItems.updatedAt,
        question: contentItems.question,
        dek: postsTable.dek,
        readingMinutes: postsTable.readingMinutes,
        tags: postsTable.tags,
      })
      .from(contentItems)
      .innerJoin(postsTable, eq(contentItems.id, postsTable.id))
      .where(
        and(
          eq(contentItems.contentType, "post"),
          eq(contentItems.status, "published")
        )
      )
      .orderBy(desc(contentItems.publishedAt))
      .limit(limit);

    if (rows.length === 0) return [];
    const ids = rows.map((r) => r.id);
    const rels = await db
      .select()
      .from(relationsTable)
      .where(inArray(relationsTable.fromId, ids));

    return rows.map((row) => ({
      type: "post" as const,
      slug: row.slug,
      title: row.title,
      status: row.status as ContentStatus,
      publishedAt: toIso(row.publishedAt),
      updatedAt: toIso(row.updatedAt),
      relations: mapRelations(rels.filter((r) => r.fromId === row.id)),
      dek: row.dek,
      readingMinutes: row.readingMinutes ?? 0,
      tags: row.tags ?? [],
    }));
  },

  async getPost(slug: string): Promise<Post | null> {
    const db = getDb();

    const [row] = await db
      .select({
        id: contentItems.id,
        slug: contentItems.slug,
        title: contentItems.title,
        status: contentItems.status,
        publishedAt: contentItems.publishedAt,
        updatedAt: contentItems.updatedAt,
        question: contentItems.question,
        dek: postsTable.dek,
        readingMinutes: postsTable.readingMinutes,
        tags: postsTable.tags,
      })
      .from(contentItems)
      .innerJoin(postsTable, eq(contentItems.id, postsTable.id))
      .where(eq(contentItems.slug, slug))
      .limit(1);

    if (!row) return null;
    const rels = await db
      .select()
      .from(relationsTable)
      .where(eq(relationsTable.fromId, row.id));

    return {
      type: "post" as const,
      slug: row.slug,
      title: row.title,
      status: row.status as ContentStatus,
      publishedAt: toIso(row.publishedAt),
      updatedAt: toIso(row.updatedAt),
      relations: mapRelations(rels),
      dek: row.dek,
      readingMinutes: row.readingMinutes ?? 0,
      tags: row.tags ?? [],
    };
  },

  // ── Timeline ──────────────────────────────────────────────────────────────

  async getTimeline(): Promise<TimelineEntry[]> {
    const db = getDb();

    const rows = await db
      .select({
        id: contentItems.id,
        slug: contentItems.slug,
        title: contentItems.title,
        status: contentItems.status,
        publishedAt: contentItems.publishedAt,
        updatedAt: contentItems.updatedAt,
        question: contentItems.question,
        organization: timelineEntriesTable.organization,
        role: timelineEntriesTable.role,
        startDate: timelineEntriesTable.startDate,
        endDate: timelineEntriesTable.endDate,
        summary: timelineEntriesTable.summary,
      })
      .from(contentItems)
      .innerJoin(
        timelineEntriesTable,
        eq(contentItems.id, timelineEntriesTable.id)
      )
      .where(
        and(
          eq(contentItems.contentType, "timeline_entry"),
          eq(contentItems.status, "published")
        )
      )
      .orderBy(desc(timelineEntriesTable.startDate));

    if (rows.length === 0) return [];
    const ids = rows.map((r) => r.id);
    const rels = await db
      .select()
      .from(relationsTable)
      .where(inArray(relationsTable.fromId, ids));

    return rows.map((row) => ({
      type: "timeline_entry" as const,
      slug: row.slug,
      title: row.title,
      status: row.status as ContentStatus,
      publishedAt: toIso(row.publishedAt),
      updatedAt: toIso(row.updatedAt),
      relations: mapRelations(rels.filter((r) => r.fromId === row.id)),
      organization: row.organization,
      role: row.role,
      startDate: row.startDate,
      endDate: row.endDate ?? undefined,
      summary: row.summary,
    }));
  },

  // ── Skills ────────────────────────────────────────────────────────────────

  async getCurrentSkills(): Promise<Skill[]> {
    const db = getDb();

    const rows = await db
      .select({
        id: contentItems.id,
        slug: contentItems.slug,
        title: contentItems.title,
        status: contentItems.status,
        publishedAt: contentItems.publishedAt,
        updatedAt: contentItems.updatedAt,
        question: contentItems.question,
        context: skillsTable.context,
        current: skillsTable.current,
      })
      .from(contentItems)
      .innerJoin(skillsTable, eq(contentItems.id, skillsTable.id))
      .where(
        and(
          eq(contentItems.contentType, "skill"),
          eq(contentItems.status, "published"),
          eq(skillsTable.current, true)
        )
      )
      .orderBy(desc(contentItems.publishedAt));

    if (rows.length === 0) return [];
    const ids = rows.map((r) => r.id);
    const rels = await db
      .select()
      .from(relationsTable)
      .where(inArray(relationsTable.fromId, ids));

    return rows.map((row) => ({
      type: "skill" as const,
      slug: row.slug,
      title: row.title,
      status: row.status as ContentStatus,
      publishedAt: toIso(row.publishedAt),
      updatedAt: toIso(row.updatedAt),
      relations: mapRelations(rels.filter((r) => r.fromId === row.id)),
      context: row.context,
      current: row.current,
    }));
  },
};
