import "server-only";
import { resolveDexSources } from "../content";
import type { DexAnswer } from "../types";
import { getDexLlmConfig, type DexLlmConfig } from "./config";
import { completeJson } from "./provider";
import { checkIpRateLimit, consumeDailyBudget } from "./guard";
import { verifyTurnstileToken } from "./turnstile";
import {
  DEX_SYSTEM_PROMPT,
  buildDexContext,
  knownCardIds,
  publicKnowledgeCards,
} from "./prompt";

/**
 * Dex v2 generation, validation, and assembly (D-059, guardrails hardened
 * D-060).
 *
 * The model returns *content*; this file decides what the visitor actually
 * sees, and — as of D-060 — whether the model gets called at all. Everything
 * below the parse is a guardrail that holds even if the system prompt is
 * ignored, because a public endpoint has to assume the instruction layer can
 * be talked around:
 *
 *   IP rate limit (durable)  — blocks volume spam before anything else runs
 *   Turnstile verification   — blocks scripted callers even under the IP cap
 *   Daily budget (durable)   — shared ceiling, only spent by requests that
 *                              already passed both gates above
 *   Shape validation         — anything that isn't the agreed JSON is discarded
 *   Grounding check          — an "answer" citing no real card becomes "unknown"
 *   Fabrication scrub        — invented emails/links are stripped, not trusted
 *   Length cap               — a safety net, not a formatting rule
 *   Fallback                 — any failure returns null, and the caller serves
 *                              the v1 cached matcher instead
 *
 * The last one is why this can ship on a free-tier quota: the worst case is
 * Dex behaving exactly as it does today, never an error.
 */

// A safety net, not a target — the prompt asks for a length that matches the
// question, this just guarantees no single answer can run away. ~1,100
// characters is roughly 170-190 words: room for a real multi-sentence answer,
// nowhere near unbounded.
const MAX_ANSWER_CHARS = 1100;
const MAX_SOURCES = 4;

/**
 * The only contact details Dex may ever emit. Anything else that looks like an
 * email or a link is a fabrication and is removed before display — a
 * hallucinated "recruiting@..." address on a portfolio site is a worse failure
 * than a missing answer (LAW-008).
 */
const ALLOWED_EMAILS = new Set(["csdeepak2005@gmail.com"]);
const ALLOWED_LINK_HOSTS = [
  "linkedin.com",
  "instagram.com",
  "github.com",
  "deepak.ai",
];

interface RawModelAnswer {
  scope?: unknown;
  answer?: unknown;
  cardIds?: unknown;
}

function parseModelJson(text: string): RawModelAnswer | null {
  // Providers occasionally wrap JSON mode output in a fence despite the
  // response_format request. Recover rather than discard a good answer.
  const cleaned = text
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "");

  try {
    const parsed: unknown = JSON.parse(cleaned);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return null;
    return parsed as RawModelAnswer;
  } catch {
    // Last resort: the first balanced-looking object in the string.
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start === -1 || end <= start) return null;
    try {
      const parsed: unknown = JSON.parse(cleaned.slice(start, end + 1));
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return null;
      return parsed as RawModelAnswer;
    } catch {
      return null;
    }
  }
}

/**
 * Removes contact details and links the model was not entitled to produce.
 * Deliberately a deny-by-default filter on a tiny allowlist: the knowledge
 * cards contain exactly one email and a handful of profile links, so anything
 * outside that set is invented by definition.
 *
 * Newline-safe on purpose (D-060): the free-form `answer` field can carry a
 * paragraph break or a short inline list the model chose deliberately, and
 * this must not flatten that back into one line while cleaning up whatever
 * gap a stripped email or link left behind.
 */
function scrubFabrications(value: string): string {
  let out = value.replace(/[\w.+-]+@[\w-]+\.[\w.]+/g, (match) =>
    ALLOWED_EMAILS.has(match.toLowerCase()) ? match : "",
  );

  out = out.replace(/https?:\/\/\S+/gi, (match) => {
    const host = match.replace(/^https?:\/\//i, "").split(/[/?#]/)[0]?.toLowerCase() ?? "";
    return ALLOWED_LINK_HOSTS.some((allowed) => host.endsWith(allowed)) ? match : "";
  });

  return out
    .replace(/[ \t]{2,}/g, " ")
    .replace(/ *\n */g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function cleanAnswer(value: unknown): string {
  if (typeof value !== "string") return "";
  const normalized = value.replace(/\r\n/g, "\n").trim();
  if (!normalized) return "";
  const scrubbed = scrubFabrications(normalized);
  return scrubbed.length > MAX_ANSWER_CHARS
    ? `${scrubbed.slice(0, MAX_ANSWER_CHARS - 1).trimEnd()}…`
    : scrubbed;
}

export interface DexGenerationOutcome {
  answer: DexAnswer | null;
  /** Why generation did not produce an answer — logged, never shown. */
  reason: string | null;
}

/**
 * Public entry point — the only one the production route calls. Runs the
 * full guardrail chain (rate limit → human check → budget) before spending a
 * model call. See `guard.ts`'s file comment for why the two Redis-backed
 * checks are ordered the way they are, and why each guardrail fails closed.
 */
export async function generateDexAnswer(
  question: string,
  visitorRole: string,
  ip: string,
  turnstileToken: string,
): Promise<DexGenerationOutcome> {
  const config = getDexLlmConfig();
  if (!config) return { answer: null, reason: "disabled" };

  const ipCheck = await checkIpRateLimit(ip);
  if (!ipCheck.allowed) return { answer: null, reason: ipCheck.reason ?? "ip_rate_limited" };

  if (!turnstileToken) return { answer: null, reason: "turnstile_missing" };
  const humanVerified = await verifyTurnstileToken(turnstileToken, ip);
  if (!humanVerified) return { answer: null, reason: "turnstile_failed" };

  const budget = await consumeDailyBudget(config.dailyLimit);
  if (!budget.allowed) return { answer: null, reason: budget.reason ?? "daily_budget_exceeded" };

  return generateGroundedAnswer(question, visitorRole, config);
}

/**
 * The model call and validation, with no guardrail gate in front. Exported
 * separately so `scripts/check-dex-v2.ts`'s live battery can exercise real
 * grounding and generation behaviour directly — testing "does the model
 * answer well" shouldn't require a browser-completed Turnstile token or
 * spend a unit of the shared production daily budget on test traffic. The
 * production route never calls this directly; only `generateDexAnswer`,
 * above, which always runs the full gate first.
 */
export async function generateGroundedAnswer(
  question: string,
  visitorRole: string,
  config: DexLlmConfig,
): Promise<DexGenerationOutcome> {
  const trimmed = question.trim();
  if (!trimmed) return { answer: null, reason: "empty_question" };

  const context = buildDexContext(trimmed, visitorRole);
  const result = await completeJson(
    config,
    DEX_SYSTEM_PROMPT,
    `${context}\n\n---\n\nVisitor question: ${trimmed}`,
  );

  if (!result.text) return { answer: null, reason: result.failure ?? "no_text" };

  return interpretModelResponse(result.text);
}

/**
 * Everything between "the provider returned a string" and "the visitor sees
 * an answer". Exported separately so the offline half of `check-dex-v2.ts`
 * can exercise every guardrail — malformed JSON, fabricated card ids,
 * invented contact details, oversized output — against synthetic model
 * responses, with no API key, no Redis, and no network call.
 */
export function interpretModelResponse(text: string): DexGenerationOutcome {
  const raw = parseModelJson(text);
  if (!raw) return { answer: null, reason: "unparseable_json" };

  const scope = typeof raw.scope === "string" ? raw.scope.toLowerCase() : "";

  if (scope === "refuse") {
    return {
      answer: {
        kind: "refusal",
        answer: REFUSAL_TEXT,
        sources: [],
        relatedCardIds: [],
      },
      reason: null,
    };
  }

  if (scope === "unknown") {
    return { answer: unknownAnswer(), reason: null };
  }

  if (scope !== "answer") return { answer: null, reason: "bad_scope" };

  const answerText = cleanAnswer(raw.answer);
  if (!answerText) return { answer: null, reason: "empty_answer" };

  const valid = knownCardIds();
  const citedIds = Array.isArray(raw.cardIds)
    ? raw.cardIds.filter((id): id is string => typeof id === "string" && valid.has(id))
    : [];

  // Grounding gate. A confident-sounding answer that cites nothing real is
  // precisely the failure mode this rebuild exists to remove, so it is
  // downgraded to the honest hand-off rather than shown.
  if (citedIds.length === 0) {
    return { answer: unknownAnswer(), reason: "ungrounded" };
  }

  const cards = publicKnowledgeCards();
  const sourceIds = Array.from(
    new Set(
      citedIds.flatMap((id) => cards.find((card) => card.id === id)?.sourceIds ?? []),
    ),
  );

  return {
    answer: {
      kind: "generated",
      answer: answerText,
      sources: resolveDexSources(sourceIds).slice(0, MAX_SOURCES),
      relatedCardIds: citedIds,
    },
    reason: null,
  };
}

const REFUSAL_TEXT =
  "I can't help with that. I only answer questions about Deepak's projects, skills, experience, research direction, and work.";

/**
 * Unchanged from v1 (owner decision 2026-08-04): a visitor who hits a gap
 * leaves with a way to reach Deepak, never with a dead end.
 */
const UNKNOWN_TEXT = [
  "Reach out to Deepak for this answer — he'll be glad to take it directly.",
  "",
  "Email — csdeepak2005@gmail.com",
  "LinkedIn — linkedin.com/in/c-s-deepak-b1b41228b",
  "Instagram — instagram.com/deep_in.ai",
].join("\n");

function unknownAnswer(): DexAnswer {
  return { kind: "unknown", answer: UNKNOWN_TEXT, sources: [], relatedCardIds: [] };
}
