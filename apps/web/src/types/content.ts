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

export interface Project extends ContentBase {
  type: "project";
  problem: string; // the one-line problem (card + hero of detail)
  year: number;
  projectStatus: "active" | "archived";
  tags: string[];
  featured: boolean;
  repoUrl?: string;
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
