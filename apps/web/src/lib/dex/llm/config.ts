import "server-only";
import { isDurableGuardConfigured } from "./guard";

/**
 * Dex v2 LLM configuration (D-059, guardrails hardened D-060).
 *
 * Deliberately provider-agnostic and read through the *OpenAI-compatible*
 * chat-completions shape, not a vendor SDK. Google, OpenRouter, Groq, Cerebras
 * and Mistral all expose that shape, so switching providers is a base-URL +
 * model + key change in the environment — no code edit, no new dependency, no
 * redeploy of application logic. The `.env.example` placeholders `LLM_API_KEY`
 * / `EMBEDDING_API_KEY` were reserved for exactly this in docs/11 §11.
 *
 * Default target is Google's Gemini free tier via its OpenAI-compatibility
 * endpoint (owner decision 2026-08-13: strictly $0). Two consequences of that
 * choice are recorded here because they are policy, not preference:
 *
 *  1. On the Gemini **free** tier Google may use prompts and responses to
 *     improve its products, including human review. Everything Dex sends is
 *     already-public portfolio content plus the visitor's own question, so the
 *     exposure is the question text. Do not add private knowledge cards
 *     (`visibility: "internal"`) to the prompt while the free tier is in use —
 *     `buildDexContext` enforces that, but the reason lives here.
 *  2. Google's terms restrict free-tier ("Unpaid Services") API clients from
 *     serving EEA / Swiss / UK users. Moving to a paid key removes both this
 *     and the training clause; that is the single env change described in
 *     docs/31 §4.
 */

export interface DexLlmConfig {
  apiKey: string;
  baseUrl: string;
  model: string;
  /** Wall-clock ceiling for one completion. Kept well under Vercel's function
   *  timeout so a slow provider degrades to the cached matcher rather than to
   *  a 504 the visitor sees as a broken panel. */
  timeoutMs: number;
  maxOutputTokens: number;
  temperature: number;
  /** Shared ceiling on LLM-backed answers per UTC day, enforced durably in
   *  Redis by `guard.ts`. Exists so a distributed abuser (many IPs, each
   *  under its own rate limit) still can't exceed a bound the owner chose —
   *  see docs/31 §2 for why 300 was picked against Google's ~1,500/day. */
  dailyLimit: number;
}

const DEFAULT_DAILY_LIMIT = 300;

const DEFAULT_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/openai";

/**
 * `gemini-3.1-flash-lite` is a **stable** endpoint (verified against
 * ai.google.dev/gemini-api/docs/models, 2026-08-13), not a preview one.
 * Preview models carry tighter free-tier limits and a 2-week deprecation
 * notice; a public page a recruiter might open should not sit on that.
 */
const DEFAULT_MODEL = "gemini-3.1-flash-lite";

function readEnv(name: string): string {
  return (process.env[name] ?? "").trim();
}

/**
 * Returns null when Dex v2 should not run at all — no key configured, or the
 * kill switch is set. Every caller treats null as "use the v1 cached matcher",
 * which is why the flag needs no separate boolean elsewhere.
 *
 * `DEX_LLM_ENABLED=false` is an explicit off switch that works even with a
 * valid key present: it is the rollback lever if answers regress in
 * production, and it takes effect on the next request without a redeploy of
 * anything but the env var.
 */
export function getDexLlmConfig(): DexLlmConfig | null {
  if (readEnv("DEX_LLM_ENABLED").toLowerCase() === "false") return null;

  const apiKey = readEnv("LLM_API_KEY");
  if (!apiKey) return null;

  // D-060: the durable abuse guard is a precondition for v2 running at all,
  // not an optional add-on layered on top. Without Redis configured there is
  // no way to enforce the per-IP or daily ceiling durably (see guard.ts's
  // file comment on why it fails closed), so v2 stays off and the visitor
  // gets the v1 cached matcher — same as if no LLM_API_KEY were set.
  if (!isDurableGuardConfigured()) {
    console.warn(
      "Dex v2 disabled: LLM_API_KEY is set but UPSTASH_REDIS_REST_URL/TOKEN are not — " +
        "the abuse guard can't run, so the LLM path stays off.",
    );
    return null;
  }

  const dailyLimit = Number.parseInt(readEnv("DEX_LLM_DAILY_LIMIT"), 10);

  return {
    apiKey,
    baseUrl: readEnv("LLM_BASE_URL") || DEFAULT_BASE_URL,
    model: readEnv("LLM_MODEL") || DEFAULT_MODEL,
    timeoutMs: 12_000,
    maxOutputTokens: 700,
    // Low but not zero. Zero makes every rephrasing of the same question
    // produce a byte-identical answer, which reads like a lookup table — the
    // exact impression Dex v1 gave. This keeps wording natural while the
    // grounding, not the sampler, decides the facts.
    temperature: 0.3,
    dailyLimit: Number.isFinite(dailyLimit) && dailyLimit > 0 ? dailyLimit : DEFAULT_DAILY_LIMIT,
  };
}
