export type DexAudience =
  | "general"
  | "recruiter"
  | "technical"
  | "collaborator"
  | "student";

export type DexSourceKind = "site" | "project" | "resume" | "intake" | "interview";

export interface DexSource {
  id: string;
  label: string;
  kind: DexSourceKind;
  href?: string;
  note?: string;
}

export interface DexKnowledgeCard {
  id: string;
  title: string;
  summary: string;
  tags: string[];
  sourceIds: string[];
  visibility: "public" | "internal";
  updatedAt: string;
}

export interface DexFaq {
  id: string;
  audience: DexAudience;
  question: string;
  aliases: string[];
  answer: string;
  sourceIds: string[];
  relatedCardIds: string[];
  updatedAt: string;
}

export interface DexSuggestedQuestion {
  id: string;
  audience: DexAudience;
  question: string;
  faqId: string;
}

/**
 * `generated` is Dex v2 (D-059): grounded, model-written, cited back to public
 * knowledge cards. The other four are v1's cached-recall outcomes and remain
 * live — v2 falls back to them whenever the provider is unavailable, so both
 * generations of answer coexist in the log and in `/admin/dex`.
 */
export type DexAnswerKind =
  | "generated"
  | "cached"
  | "knowledge"
  | "unknown"
  | "refusal";

export interface DexAnswer {
  kind: DexAnswerKind;
  answer: string;
  matchedQuestion?: string;
  sources: DexSource[];
  relatedCardIds: string[];
}
