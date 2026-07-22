/**
 * Content entities + relation taxonomy per docs/04 §2 (D-021).
 * These types are the frontend's contract with the content layer;
 * the database plan (docs/09) implements the same model server-side.
 */

export type ContentStatus = "draft" | "scheduled" | "published" | "archived";

/** The closed relation set — additions require a decision entry. */
export type RelationKind =
  | "implements" // project → publication
  | "writes-about" // post → project | publication
  | "produced" // timeline_entry → any artifact
  | "evidences" // skill → project | publication | post
  | "depicts" // gallery_item → any
  | "references"; // any → any (use sparingly)

export interface Relation {
  kind: RelationKind;
  toType: ContentType;
  toSlug: string;
  toTitle: string;
}

export type ContentType =
  | "project"
  | "publication"
  | "post"
  | "timeline_entry"
  | "skill"
  | "gallery_item"
  | "news_item"
  | "document"
  | "page";

interface ContentBase {
  slug: string;
  title: string;
  status: ContentStatus;
  publishedAt: string; // ISO 8601
  updatedAt: string;
  relations: Relation[];
}

/**
 * An abandoned branch — failure as a first-class entity (LAW-004).
 * A shipped system that hides its dead ends is dishonest and incomplete.
 */
export interface AbandonedBranch {
  tried: string; // what was attempted
  whyAbandoned: string; // why it was pruned
  learned: string; // what it taught (honesty over completeness)
}

/**
 * A media asset attached to content (D-049). The `url` is derived at read time
 * from the storage key + base URL — never persisted. `alt` is required for
 * images (accessibility is honesty); '' for PDFs.
 */
export interface MediaAsset {
  kind: "image" | "pdf";
  url: string;
  alt: string;
  caption: string;
  width?: number;
  height?: number;
}

/** A labeled EXTERNAL link (internal cross-links are Relations — LAW-005). */
export interface ExternalLink {
  label: string;
  url: string;
}

export interface Project extends ContentBase {
  type: "project";
  /**
   * The question that created it (required — LAW-003). Distinct from
   * `problem`: the problem is what it solves; the question is what caused
   * it to exist. A real project without a question is not publishable
   * (surfaced as a required owner field in OWNER_CONTENT_CHECKLIST.md).
   */
  question: string;
  problem: string; // the one-line problem (card + hero of detail)
  year: number;
  projectStatus: "active" | "archived";
  tags: string[];
  featured: boolean;
  repoUrl?: string;
  /**
   * Abandoned branches — pruned reasoning, honestly kept (LAW-004).
   * Empty/absent = the section self-hides (honest state, LAW-008); it is
   * never fabricated to look complete.
   *
   * NOTE: `question` + `abandonedBranches` are an additive extension of
   * the Project model (D-042). Full convergence of Project and the
   * Memory model (docs/26 ontology: projects = memories) is deliberately
   * deferred to the docs/09 database sprint, which designs the canonical
   * schema — it is an explicit open question docs/09 must answer.
   */
  abandonedBranches?: AbandonedBranch[];

  /**
   * Rich metadata (D-048) — every field optional and self-hiding (LAW-008).
   * A project with none of these renders exactly as it did before the sprint.
   */
  overview?: string; // long-form "Decisions & trade-offs" body (markdown)
  startDate?: string; // ISO date; drives the duration display
  endDate?: string; // ISO date; absent = ongoing ("present")
  context?: string; // "PES coursework" / "Personal" / an org
  role?: string; // "Solo" / "Lead, team of 4"
  collaborators?: string[];
  liveUrl?: string; // live demo
  videoUrl?: string; // demo video (URL only — no embed/upload)
  outcomes?: string[]; // results/impact bullets
  skillsLearned?: string[]; // "What I learned" takeaways (distinct from tags)
  coverImage?: MediaAsset;
  gallery?: MediaAsset[];
  attachments?: MediaAsset[]; // PDFs — report, paper, poster
}

export interface Publication extends ContentBase {
  type: "publication";
  authors: string[];
  venue: string;
  year: number;
  abstract: string;
  plainSummary: string; // the researcher→engineer bridge (docs/04)
  pdfUrl?: string;
  bibtex?: string;
  // Rich metadata (D-048) — all optional, self-hiding
  doi?: string;
  pubDate?: string; // precise date; overrides year display
  pubStatus?: "preprint" | "published" | "under-review";
  arxivUrl?: string;
  attachments?: MediaAsset[];
}

export interface Post extends ContentBase {
  type: "post";
  dek: string;
  readingMinutes: number;
  tags: string[];
  // Rich metadata (D-048)
  coverImage?: MediaAsset;
  attachments?: MediaAsset[];
  relatedLinks?: ExternalLink[]; // external — internal links are Relations
}

export interface TimelineEntry extends ContentBase {
  type: "timeline_entry";
  organization: string;
  role: string;
  startDate: string;
  endDate?: string; // absent = current
  summary: string; // one-line what-it-produced
  // Rich metadata (D-048)
  place?: string;
  highlights?: string[];
  logo?: MediaAsset;
  links?: ExternalLink[]; // e.g. a "Proof" link
}

export interface Skill extends ContentBase {
  type: "skill";
  context: string; // one-line context ("currently using for …")
  current: boolean; // Currently working on vs Previously
  // Rich metadata (D-048)
  category?: string;
  sinceYear?: number;
}
