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
}

export interface Post extends ContentBase {
  type: "post";
  dek: string;
  readingMinutes: number;
  tags: string[];
}

export interface TimelineEntry extends ContentBase {
  type: "timeline_entry";
  organization: string;
  role: string;
  startDate: string;
  endDate?: string; // absent = current
  summary: string; // one-line what-it-produced
}

export interface Skill extends ContentBase {
  type: "skill";
  context: string; // one-line context ("currently using for …")
  current: boolean; // Currently working on vs Previously
}
