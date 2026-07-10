/**
 * The Living Memory — data model (docs/26). Content is MEMORY: a node in
 * semantic memory, reconstructed on recall. These types are the contract
 * the future ContentService/graph fills; the vertical slice fills them
 * from a typed content file (content/asmos.ts).
 */

/** What kind of memory a node is (docs/26 §3 ontology). */
export type MemoryKind =
  | "crystallized" // a published/settled idea
  | "conclusion" // a shipped system
  | "hypothesis" // an open question under test
  | "reflection"; // a worked-through thought

/** Consolidation state — drives brightness/warmth and honest gaps. */
export type MemoryState =
  | "active" // being worked now — bright, warm, near
  | "consolidating" // moving into long-term
  | "crystallized" // settled, permanent
  | "unformed"; // real, but not yet documented (honesty, docs/26 §9)

export interface MemoryNode {
  id: string;
  label: string;
  kind: MemoryKind;
  state: MemoryState;
  /** Normalised map position 0–1 (recency ≈ proximity to centre). */
  x: number;
  y: number;
  /** 0–1 brightness = recency of recall (luminance-not-hue). */
  luminance: number;
  /** True when a full reconstruction exists (only ASMOS, in the slice). */
  reconstructable: boolean;
}

export interface MemoryEdge {
  from: string;
  to: string;
  /** The association label ("led to", "reminded me of"). */
  relation: string;
}

/** The lifecycle stages of a thought (docs/26 §3 spine). */
export type StageKind =
  | "question"
  | "hypothesis"
  | "research"
  | "experiments"
  | "failures"
  | "iterations"
  | "architecture"
  | "results"
  | "publication"
  | "future";

/** Honesty state of a fragment — never fabricate a settled result. */
export type FragmentState = "settled" | "in-progress" | "unformed";

export interface StageItem {
  title: string;
  note: string;
  outcome?: "worked" | "failed" | "partial";
}

export interface ReconstructionStage {
  kind: StageKind;
  label: string;
  state: FragmentState;
  body: string[];
  items?: StageItem[];
}

/** A grounded Dex recall — every answer cites the fragment it came from. */
export interface DexRecall {
  cue: string;
  answer: string;
  source: StageKind;
}

export interface GistLink {
  label: string;
  href: string;
}

/** The 90-second consolidated summary (the fast path / the gist). */
export interface Gist {
  problem: string;
  approach: string;
  status: string;
  role: string;
  formed: string;
  links: GistLink[];
}

export interface Memory {
  id: string;
  title: string;
  kind: string; // "Memory · Research"
  oneLine: string;
  gist: Gist;
  stages: ReconstructionStage[];
  dex: DexRecall[];
  /** Owner-verification flag — true until real content replaces the scaffold. */
  draft: boolean;
}

export const STAGE_ORDER: readonly StageKind[] = [
  "question",
  "hypothesis",
  "research",
  "experiments",
  "failures",
  "iterations",
  "architecture",
  "results",
  "publication",
  "future",
];
