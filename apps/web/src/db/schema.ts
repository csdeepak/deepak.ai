/**
 * Drizzle ORM schema — the TypeScript mirror of the CTI relational model
 * from docs/09-DATABASE.md (D-043).
 *
 * Tables defined here back the ContentService interface directly.
 * Additional tables (content_stages, content_versions, embeddings, users,
 * sessions, github_cache, gallery_items) are deferred to their respective
 * feature sprints; their SQL shapes are documented in docs/09.
 *
 * NOT in this file (handled via raw migration SQL):
 *   - search_vector GENERATED column + GIN index (deferred to search sprint)
 *   - pgvector embeddings column (deferred to Dex sprint)
 *   - DB-level CHECK constraints (enforced at application boundary)
 */

import { sql } from "drizzle-orm";
import {
  pgTable,
  uuid,
  text,
  boolean,
  integer,
  real,
  timestamp,
  date,
  jsonb,
} from "drizzle-orm/pg-core";

// ── Base spine ────────────────────────────────────────────────────────────────

export const contentItems = pgTable("content_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  contentType: text("content_type").notNull(),

  // Lifecycle (D-043, §6)
  status: text("status").notNull().default("draft"),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  scheduledFor: timestamp("scheduled_for", { withTimezone: true }),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),

  // Cognitive spine (LAW-003)
  question: text("question").notNull().default(""),

  // Honesty flag (LAW-008)
  verified: boolean("verified").notNull().default(false),
});

// ── Abandoned branches (LAW-004) ──────────────────────────────────────────────

export const abandonedBranches = pgTable("abandoned_branches", {
  id: uuid("id").defaultRandom().primaryKey(),
  itemId: uuid("item_id")
    .notNull()
    .references(() => contentItems.id, { onDelete: "cascade" }),
  tried: text("tried").notNull(),
  whyAbandoned: text("why_abandoned").notNull(),
  learned: text("learned").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ── Relations (LAW-005) — the graph as constrained data ───────────────────────
//
// The closed kind set is enforced at application boundary (ContentService write
// path) and mirrored in types/content.ts RelationKind. Adding a new kind requires
// a D-entry (D-043 binding condition 3). Unique (fromId, toId, kind) and
// self-relation rejection are enforced via migration SQL.

export const relationsTable = pgTable("relations", {
  id: uuid("id").defaultRandom().primaryKey(),
  fromId: uuid("from_id")
    .notNull()
    .references(() => contentItems.id, { onDelete: "cascade" }),
  toId: uuid("to_id")
    .notNull()
    .references(() => contentItems.id, { onDelete: "cascade" }),
  kind: text("kind").notNull(),
  toType: text("to_type").notNull(),
  toSlug: text("to_slug").notNull(),
  toTitle: text("to_title").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ── Type-specific child tables ────────────────────────────────────────────────

export const projectsTable = pgTable("projects", {
  id: uuid("id")
    .primaryKey()
    .references(() => contentItems.id, { onDelete: "cascade" }),
  problem: text("problem").notNull().default(""),
  year: integer("year").notNull(),
  projectStatus: text("project_status").notNull().default("archived"),
  tags: text("tags")
    .array()
    .notNull()
    .default(sql`'{}'::text[]`),
  featured: boolean("featured").notNull().default(false),
  repoUrl: text("repo_url"),

  // ── Rich metadata (D-048) — all optional, all self-hiding ────────────────
  // Long-form "Decisions & trade-offs" body (markdown). Renders as the
  // reading column on the detail page (docs/24 §10.2).
  overview: text("overview").notNull().default(""),
  // Dates & context. year is kept for sort/back-compat; dates drive display.
  startDate: date("start_date"),
  endDate: date("end_date"), // null = ongoing ("present")
  context: text("context").notNull().default(""), // "PES coursework" / "Personal" / org
  role: text("role").notNull().default(""), // "Solo" / "Lead, team of 4"
  collaborators: text("collaborators")
    .array()
    .notNull()
    .default(sql`'{}'::text[]`),
  // Links (URL only — no upload for video, D-048/§scope).
  liveUrl: text("live_url"),
  videoUrl: text("video_url"),
  // Outcomes/results bullets + "What I learned" takeaways (D-048 amendment:
  // skillsLearned is distinct from tags — tags = tech/topics used;
  // skillsLearned = what building it taught the owner).
  outcomes: text("outcomes")
    .array()
    .notNull()
    .default(sql`'{}'::text[]`),
  skillsLearned: text("skills_learned")
    .array()
    .notNull()
    .default(sql`'{}'::text[]`),
});

export const publicationsTable = pgTable("publications", {
  id: uuid("id")
    .primaryKey()
    .references(() => contentItems.id, { onDelete: "cascade" }),
  authors: text("authors")
    .array()
    .notNull()
    .default(sql`'{}'::text[]`),
  venue: text("venue").notNull().default(""),
  year: integer("year").notNull(),
  abstract: text("abstract").notNull().default(""),
  plainSummary: text("plain_summary").notNull().default(""),
  pdfUrl: text("pdf_url"),
  bibtex: text("bibtex"),
  doi: text("doi"),
  // ── Rich metadata (D-048) ────────────────────────────────────────────────
  pubDate: date("pub_date"), // precise date; overrides year display when set
  pubStatus: text("pub_status").notNull().default("published"), // preprint|published|under-review
  arxivUrl: text("arxiv_url"),
});

export const postsTable = pgTable("posts", {
  id: uuid("id")
    .primaryKey()
    .references(() => contentItems.id, { onDelete: "cascade" }),
  dek: text("dek").notNull().default(""),
  bodyMarkdown: text("body_markdown").notNull().default(""),
  readingMinutes: integer("reading_minutes"),
  tags: text("tags")
    .array()
    .notNull()
    .default(sql`'{}'::text[]`),
  featured: boolean("featured").notNull().default(false),
});

export const timelineEntriesTable = pgTable("timeline_entries", {
  id: uuid("id")
    .primaryKey()
    .references(() => contentItems.id, { onDelete: "cascade" }),
  organization: text("organization").notNull().default(""),
  role: text("role").notNull().default(""),
  startDate: date("start_date").notNull(),
  endDate: date("end_date"),
  summary: text("summary").notNull().default(""),
  // ── Rich metadata (D-048) ────────────────────────────────────────────────
  place: text("place").notNull().default(""),
  highlights: text("highlights")
    .array()
    .notNull()
    .default(sql`'{}'::text[]`),
});

export const skillsTable = pgTable("skills", {
  id: uuid("id")
    .primaryKey()
    .references(() => contentItems.id, { onDelete: "cascade" }),
  context: text("context").notNull().default(""),
  current: boolean("current").notNull().default(false),
  // ── Rich metadata (D-048) ────────────────────────────────────────────────
  category: text("category").notNull().default(""),
  sinceYear: integer("since_year"),
});

// ── Site settings (outbound links, contact, cvUrl, etc.) ──────────────────────

export const siteSettings = pgTable("site_settings", {
  key: text("key").primaryKey(),
  value: jsonb("value").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ── Version history (admin CMS sprint — docs/27 §9) ───────────────────────────
//
// origin values: manual_save | publish | unpublish | schedule | restore |
//                scheduled_publish
// Snapshot is self-contained (full item + type row + abandoned_branches).
// No cap — keep every version. Amendment (owner 2026-07-12): origin is
// non-negotiable provenance; cannot be backfilled after the fact.

export const contentVersions = pgTable("content_versions", {
  id: uuid("id").defaultRandom().primaryKey(),
  itemId: uuid("item_id")
    .notNull()
    .references(() => contentItems.id, { onDelete: "cascade" }),
  versionNum: integer("version_num").notNull(),
  snapshot: jsonb("snapshot").notNull(),
  changedFields: text("changed_fields")
    .array()
    .notNull()
    .default(sql`'{}'::text[]`),
  origin: text("origin").notNull().default("manual_save"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const siteSettingsVersions = pgTable("site_settings_versions", {
  id: uuid("id").defaultRandom().primaryKey(),
  key: text("key").notNull(),
  snapshot: jsonb("snapshot").notNull(),
  origin: text("origin").notNull().default("manual_save"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ── Media (D-049) — the asset registry ────────────────────────────────────────
//
// Originals live in Cloudflare R2 (S3-compatible); only the reference + metadata
// live here (D-013 — no DB blobs). The public URL is derived at read time from
// storageKey + the storage base URL (env), never stored — so the bucket/CDN can
// move without a data migration. alt_text is REQUIRED for images (accessibility
// is honesty) — enforced at the application boundary + a CHECK in migration SQL.

export const media = pgTable("media", {
  id: uuid("id").defaultRandom().primaryKey(),
  kind: text("kind").notNull(), // 'image' | 'pdf'
  storageKey: text("storage_key").notNull().unique(),
  mimeType: text("mime_type").notNull(),
  byteSize: integer("byte_size").notNull(),
  altText: text("alt_text"), // required for images (CHECK ck_image_has_alt)
  caption: text("caption").notNull().default(""),
  width: integer("width"), // images only
  height: integer("height"), // images only
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ── content_media — ordered attach of media to content (cover/gallery/attachment)
//
// media_id uses ON DELETE RESTRICT: the DB refuses to drop a media row still
// attached to any content (the reference-checked delete). At most one cover per
// item (partial unique index in migration SQL).

export const contentMedia = pgTable("content_media", {
  id: uuid("id").defaultRandom().primaryKey(),
  itemId: uuid("item_id")
    .notNull()
    .references(() => contentItems.id, { onDelete: "cascade" }),
  mediaId: uuid("media_id")
    .notNull()
    .references(() => media.id, { onDelete: "restrict" }),
  role: text("role").notNull(), // 'cover' | 'gallery' | 'attachment'
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ── content_links — labeled EXTERNAL links (internal cross-links are relations) ─

export const contentLinks = pgTable("content_links", {
  id: uuid("id").defaultRandom().primaryKey(),
  itemId: uuid("item_id")
    .notNull()
    .references(() => contentItems.id, { onDelete: "cascade" }),
  label: text("label").notNull(),
  url: text("url").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
});

// ── Dex visitor intake (D-053.2) — visitor analytics, not CTI content ─────────
//
// Standalone table (no content_items link): who is visiting Deepak.ai through
// Dex, self-reported. Skippable at the UI layer — rows only exist for visitors
// who chose to answer. Owner-only read access (no public read path).

export const dexVisitorIntake = pgTable("dex_visitor_intake", {
  id: uuid("id").defaultRandom().primaryKey(),
  role: text("role").notNull(),
  name: text("name").notNull(),
  company: text("company").notNull().default(""),
  contact: text("contact").notNull().default(""),
  reason: text("reason").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ── Dex question log (D-054) — what visitors ask, and whether Dex could answer ─
//
// Deliberately NOT linked to dex_visitor_intake: no foreign key, no name, no
// contact. Owner decision 2026-07-31 — capture the question, the outcome, and
// the audience segment, but never build a per-person dossier of what an
// identifiable visitor asked.
//
// answer_kind mirrors DexAnswerKind: cached | knowledge | unknown | refusal.
// 'unknown' rows are the actionable signal: questions about Deepak that the
// approved knowledge base cannot yet answer.

export const dexQuestionLog = pgTable("dex_question_log", {
  id: uuid("id").defaultRandom().primaryKey(),
  question: text("question").notNull(),
  answerKind: text("answer_kind").notNull(),
  matchedQuestion: text("matched_question").notNull().default(""),
  visitorRole: text("visitor_role").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ── gallery_items — photo gallery (D-056, docs/29) ─────────────────────────────
//
// Standalone table (not CTI): the gallery is a distinct domain from the content
// spine. Binaries live in Cloudflare R2 (D-049); only two storage keys (grid
// tile + full rendition), metadata, and layout knobs live here.
//
// Public URL is derived at read time via mediaPublicUrl(gridKey) — never stored,
// so the bucket/CDN can move with a single env change (D-013).
//
// alt_text starts empty (awaiting owner copy pass before publishing).
// published: false = self-hides in production (LAW-008). Ordered by sort_order.

export const galleryItems = pgTable("gallery_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: text("slug").notNull().unique(),
  gridKey: text("grid_key").notNull(),
  fullKey: text("full_key").notNull(),
  altText: text("alt_text").notNull().default(""),
  caption: text("caption").notNull().default(""),
  info: text("info").notNull().default(""),
  place: text("place").notNull().default(""),
  date: text("date").notNull().default(""),
  time: text("time").notNull().default(""),
  width: integer("width").notNull(),
  height: integer("height").notNull(),
  orientation: text("orientation").notNull(),
  blurData: text("blur_data").notNull(),
  size: real("size").notNull().default(1.0),
  tilt: real("tilt").notNull().default(0.0),
  depth: real("depth").notNull().default(0.8),
  sortOrder: integer("sort_order").notNull().default(0),
  featured: boolean("featured").notNull().default(false),
  published: boolean("published").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
