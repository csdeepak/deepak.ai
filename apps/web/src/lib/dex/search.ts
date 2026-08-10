import {
  dexFaqCache,
  dexKnowledgeCards,
  dexSuggestedQuestions,
  resolveDexSources,
} from "./content";
import type { DexAnswer, DexFaq, DexKnowledgeCard } from "./types";

const MAX_QUESTION_LENGTH = 360;

const STOPWORDS = new Set([
  "a",
  "an",
  "and",
  "are",
  "as",
  "at",
  "be",
  "by",
  "can",
  "did",
  "do",
  "does",
  "for",
  "from",
  "has",
  "have",
  "he",
  "her",
  "him",
  "his",
  "how",
  "i",
  "in",
  "is",
  "it",
  "me",
  "of",
  "on",
  "or",
  "should",
  "that",
  "the",
  "this",
  "to",
  "was",
  "what",
  "when",
  "where",
  "who",
  "why",
  "with",
  "you",
  "your",
]);

const DEEPAK_TOPIC_TERMS = new Set([
  "agent",
  "agents",
  "age",
  "agentic",
  "ai",
  "android",
  "asmos",
  "audience",
  "automation",
  "automate",
  "beginners",
  "bengaluru",
  "born",
  "background",
  "billing",
  "boundaries",
  "companies",
  "company",
  "contact",
  "content",
  "course",
  "courses",
  "coursework",
  "checkpoint",
  "checkpoints",
  "computer",
  "compare",
  "comparison",
  "context",
  "contribution",
  "cv",
  "deepak",
  "debug",
  "debugging",
  "dental",
  "developer",
  "docksmith",
  "docker",
  "education",
  "employee",
  "engineer",
  "engineering",
  "email",
  "excel",
  "experience",
  "failure",
  "failures",
  "form",
  "github",
  "gmail",
  "growth",
  "heygen",
  "hire",
  "hiring",
  "helpdesk",
  "improving",
  "inspiration",
  "inspires",
  "infrastructure",
  "internship",
  "instagram",
  "intake",
  "lab",
  "labs",
  "linkedin",
  "llm",
  "memory",
  "ml",
  "osmos",
  "owner",
  "owners",
  "ownership",
  "pes",
  "privacy",
  "prototype",
  "product",
  "project",
  "projects",
  "pytorch",
  "recruit",
  "recruiter",
  "research",
  "resume",
  "school",
  "marks",
  "motivates",
  "motivation",
  "startup",
  "startups",
  "team",
  "teams",
  "route",
  "routed",
  "routing",
  "sahayai",
  "shipping",
  "shortcutscore",
  "score",
  "scoring",
  "stackoverflow",
  "statistical",
  "skill",
  "skills",
  "suno",
  "student",
  "style",
  "test",
  "tests",
  "tools",
  "token",
  "tokens",
  "trust",
  "turb",
  "vision",
  "work",
  "workflow",
  "workflows",
  "xai",
]);

const REFUSAL =
  "I can't help with that. I only answer questions about Deepak's projects, skills, experience, research direction, and work.";

/**
 * Shown when a question is clearly about Deepak but no approved memory covers it.
 *
 * Owner decision (2026-08-04): never dead-end a visitor with "I don't know".
 * A recruiter who hits a gap should leave with a way to reach Deepak, not with
 * nothing. The wording deliberately avoids drawing attention to the missing
 * memory and hands over to him instead.
 */
const UNKNOWN = [
  "Reach out to Deepak for this answer — he'll be glad to take it directly.",
  "",
  "Email — csdeepak2005@gmail.com",
  "LinkedIn — linkedin.com/in/c-s-deepak-b1b41228b",
  "Instagram — instagram.com/deep_in.ai",
].join("\n");

const OFF_TOPIC_TASK_TERMS = new Set([
  "assignment",
  "caption",
  "code",
  "content",
  "email",
  "essay",
  "homework",
  "linkedin",
  "post",
  "presentation",
  "report",
  "video",
]);

const TASK_VERBS = new Set([
  "build",
  "create",
  "draft",
  "generate",
  "make",
  "prepare",
  "schedule",
  "write",
]);

function normalize(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9+#.]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(value: string): string[] {
  return normalize(value)
    .split(" ")
    .filter((token) => token.length > 1 && !STOPWORDS.has(token));
}

/**
 * Terms carrying no discriminating signal because the whole corpus is about
 * them. Excluded from relevance scoring only.
 *
 * Found 2026-07-31 via the D-054 question log: "What is Deepak's expected
 * salary?" scored exactly the 8-point threshold against "Who is Deepak?" on
 * the shared name alone, and returned a confident answer about his background
 * instead of an honest "I don't have that memory yet". Any question naming
 * Deepak plus words Dex has never seen could match an unrelated FAQ.
 *
 * These stay in DEEPAK_TOPIC_TERMS — that gate still needs them to recognise
 * a question as being about Deepak at all. Short queries like "Deepak" also
 * still match, via the substring rule in scoreFaq, before tokens are scored.
 */
const SCORING_NOISE = new Set(["deepak", "deepaks"]);

function scoringTokens(value: string): string[] {
  return tokenize(value).filter((token) => !SCORING_NOISE.has(token));
}

function overlapScore(queryTokens: string[], haystack: string): number {
  const normalizedHaystack = normalize(haystack);
  const hayTokens = new Set(tokenize(haystack));
  return queryTokens.reduce((score, token) => {
    if (hayTokens.has(token)) return score + 2;
    if (normalizedHaystack.includes(token)) return score + 1;
    return score;
  }, 0);
}

function scoreFaq(query: string, faq: DexFaq): number {
  const q = normalize(query);
  const options = [faq.question, ...faq.aliases];
  if (options.some((option) => normalize(option) === q)) return 100;
  if (options.some((option) => normalize(option).includes(q) || q.includes(normalize(option)))) {
    return 40;
  }
  const queryTokens = scoringTokens(query);
  return (
    overlapScore(queryTokens, faq.question) * 2 +
    overlapScore(queryTokens, faq.aliases.join(" ")) +
    overlapScore(queryTokens, faq.answer)
  );
}

function scoreCard(query: string, card: DexKnowledgeCard): number {
  const queryTokens = scoringTokens(query);
  return (
    overlapScore(queryTokens, card.title) * 3 +
    overlapScore(queryTokens, card.tags.join(" ")) * 2 +
    overlapScore(queryTokens, card.summary)
  );
}

function bestByScore<T>(
  items: T[],
  scorer: (item: T) => number,
): { item: T; score: number } | null {
  return items.reduce<{ item: T; score: number } | null>((best, item) => {
    const score = scorer(item);
    if (!best || score > best.score) return { item, score };
    return best;
  }, null);
}

function probablyAboutDeepak(question: string): boolean {
  const tokens = tokenize(question);
  return tokens.some((token) => DEEPAK_TOPIC_TERMS.has(token));
}

function looksLikeVisitorTaskRequest(question: string): boolean {
  const tokens = tokenize(question);
  const hasTaskVerb = tokens.some((token) => TASK_VERBS.has(token));
  const hasTaskObject = tokens.some((token) => OFF_TOPIC_TASK_TERMS.has(token));
  const asksForVisitor = tokens.some((token) => token === "my" || token === "me");
  const asksAboutDeepak = tokens.some((token) => token === "deepak" || token === "asmos");

  return hasTaskVerb && hasTaskObject && asksForVisitor && !asksAboutDeepak;
}

function cachedAnswer(faq: DexFaq): DexAnswer {
  return {
    kind: "cached",
    answer: faq.answer,
    matchedQuestion: faq.question,
    sources: resolveDexSources(faq.sourceIds),
    relatedCardIds: faq.relatedCardIds,
  };
}

function cardAnswer(card: DexKnowledgeCard): DexAnswer {
  return {
    kind: "knowledge",
    answer: `${card.title}: ${card.summary}`,
    matchedQuestion: card.title,
    sources: resolveDexSources(card.sourceIds),
    relatedCardIds: [card.id],
  };
}

export function getDexSuggestedQuestions() {
  return dexSuggestedQuestions;
}

export function answerDexQuestion(question: string): DexAnswer {
  const trimmed = question.trim();
  if (!trimmed || trimmed.length > MAX_QUESTION_LENGTH) {
    return {
      kind: "refusal",
      answer:
        trimmed.length > MAX_QUESTION_LENGTH
          ? "That question is too long for Dex v1. Ask one focused question about Deepak."
          : REFUSAL,
      sources: [],
      relatedCardIds: [],
    };
  }

  if (looksLikeVisitorTaskRequest(trimmed)) {
    return {
      kind: "refusal",
      answer: REFUSAL,
      sources: [],
      relatedCardIds: [],
    };
  }

  const faqMatch = bestByScore(dexFaqCache, (faq) => scoreFaq(trimmed, faq));
  if (faqMatch && faqMatch.score >= 8) {
    return cachedAnswer(faqMatch.item);
  }

  const publicCards = dexKnowledgeCards.filter((card) => card.visibility === "public");
  const cardMatch = bestByScore(publicCards, (card) => scoreCard(trimmed, card));
  if (cardMatch && cardMatch.score >= 7) {
    return cardAnswer(cardMatch.item);
  }

  if (probablyAboutDeepak(trimmed)) {
    return {
      kind: "unknown",
      answer: UNKNOWN,
      sources: [],
      relatedCardIds: [],
    };
  }

  return {
    kind: "refusal",
    answer: REFUSAL,
    sources: [],
    relatedCardIds: [],
  };
}
