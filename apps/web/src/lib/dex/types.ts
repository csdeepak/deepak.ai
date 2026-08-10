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

export type DexAnswerKind = "cached" | "knowledge" | "unknown" | "refusal";

export interface DexAnswer {
  kind: DexAnswerKind;
  answer: string;
  matchedQuestion?: string;
  sources: DexSource[];
  relatedCardIds: string[];
}
