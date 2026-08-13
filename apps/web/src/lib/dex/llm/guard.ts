import "server-only";
import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

/**
 * Durable abuse protection for the Dex LLM path (D-060).
 *
 * ## Why this exists — the gap Phase 1 shipped with
 *
 * `src/lib/rate-limit.ts`'s limiter is an in-memory `Map`. On Vercel that
 * state is per serverless instance: it resets on every deploy and, more
 * importantly, does **not** hold across the multiple instances Vercel spins
 * up under load. A scripted visitor hitting `/api/dex/answer` repeatedly can
 * land on a fresh instance with a fresh Map and get far more than the
 * intended cap — exactly the "someone bypasses it and drains the free quota"
 * risk the owner asked to close. Everything in this file is stateful in
 * Upstash Redis instead, so the limit is real regardless of which instance a
 * request lands on.
 *
 * ## Two independent gates, checked in a specific order
 *
 * `checkIpRateLimit` and `consumeDailyBudget` are separate functions, not one
 * combined check, and the caller (`generate.ts`) is required to call the IP
 * gate *before* the daily gate. That ordering is load-bearing: the daily
 * counter is a single shared value across every visitor, so if it were
 * incremented before the per-IP gate ran, one abusive IP spamming past its
 * own limit would still burn through the shared daily budget on every
 * rejected attempt — silently locking out every other visitor for the rest
 * of the day. Checking IP first means only requests that already cleared
 * their own limit ever touch the shared counter.
 *
 * ## Fail-closed, not fail-open
 *
 * If Redis is unreachable or unconfigured, both gates deny rather than allow.
 * This is the opposite instinct from `llm/provider.ts` (which fails open to
 * the v1 cached matcher on any LLM error) — and deliberately so. A provider
 * outage degrading Dex to v1 costs the visitor nothing. A rate-limiter outage
 * failing *open* would mean the one moment the abuse gate can't be verified
 * is the one moment an attacker gets unlimited access — the opposite of what
 * "strong guardrails" was asked for. `generate.ts` still falls back to v1
 * when these gates deny, so the visitor always gets an answer either way.
 */

/**
 * Deliberately uncached — constructed fresh on every call rather than memoized
 * at module scope. `new Redis(...)` only stores a URL/token pair; it makes no
 * network call, so there is no real cost to skipping the cache. What that
 * buys back: every call re-reads the current env vars instead of trusting
 * whatever was true the first time this ran in the process. A cached version
 * of this bit `scripts/check-dex-v2.ts` during development — one check that
 * temporarily cleared the env vars to prove fail-closed behaviour left the
 * cache poisoned as `null` for every later check in the same run, and a
 * production Vercel cold start with env vars genuinely available would have
 * hit the same class of staleness. Not worth the theoretical micro-saving.
 */
function getRedis(): Redis | null {
  const url = (process.env.UPSTASH_REDIS_REST_URL ?? "").trim();
  const token = (process.env.UPSTASH_REDIS_REST_TOKEN ?? "").trim();
  return url && token ? new Redis({ url, token }) : null;
}

function getIpLimiter(): Ratelimit | null {
  const redis = getRedis();
  if (!redis) return null;
  return new Ratelimit({
    redis,
    // 8 LLM-backed questions per 10 minutes per IP. Tighter than the
    // existing route-level 20/5min (which still runs first and covers the
    // whole endpoint, including the free v1 path) — this one gates only the
    // path that actually spends a token-costing model call.
    limiter: Ratelimit.slidingWindow(8, "10 m"),
    prefix: "dex:llm:ip",
  });
}

export type DexGuardReason = "redis_unavailable" | "ip_rate_limited" | "daily_budget_exceeded";

interface GuardResult {
  allowed: boolean;
  reason?: DexGuardReason;
}

export async function checkIpRateLimit(ip: string): Promise<GuardResult> {
  const limiter = getIpLimiter();
  if (!limiter) return { allowed: false, reason: "redis_unavailable" };

  try {
    const { success } = await limiter.limit(ip || "unknown");
    return success ? { allowed: true } : { allowed: false, reason: "ip_rate_limited" };
  } catch (error) {
    console.error("Dex IP rate limit check failed:", error);
    return { allowed: false, reason: "redis_unavailable" };
  }
}

// Longer than 24h on purpose — a small margin so a slow key-eviction race
// around midnight UTC can never let the counter reset early and grant a
// second day's budget within the same day.
const DAILY_TTL_SECONDS = 60 * 60 * 26;

/**
 * Increments and checks the shared daily ceiling in one round trip. "Consume"
 * in the name is intentional: calling this counts the attempt whether or not
 * it turns out to be within budget, which is correct exactly because callers
 * are required to have already cleared `checkIpRateLimit` first (see the
 * file-level comment) — every call reaching here is a real, individually
 * rate-limited visitor, not spam.
 */
export async function consumeDailyBudget(limit: number): Promise<GuardResult> {
  const redis = getRedis();
  if (!redis) return { allowed: false, reason: "redis_unavailable" };

  try {
    const key = `dex:llm:daily:${new Date().toISOString().slice(0, 10)}`;
    const count = await redis.incr(key);
    if (count === 1) {
      await redis.expire(key, DAILY_TTL_SECONDS);
    }
    return count <= limit
      ? { allowed: true }
      : { allowed: false, reason: "daily_budget_exceeded" };
  } catch (error) {
    console.error("Dex daily budget check failed:", error);
    return { allowed: false, reason: "redis_unavailable" };
  }
}

/** True only when both Upstash env vars are present — used by config.ts to
 *  decide whether Dex v2 is allowed to run at all. Guardrails being
 *  configured is a precondition for the LLM path existing, not an add-on. */
export function isDurableGuardConfigured(): boolean {
  return getRedis() !== null;
}
