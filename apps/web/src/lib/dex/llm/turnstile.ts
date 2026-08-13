import "server-only";

/**
 * Cloudflare Turnstile server-side verification (D-060).
 *
 * The client widget (`dex-panel.tsx`) proves a visitor is probably human and
 * hands back a token; this is the mandatory other half. Per Cloudflare's own
 * security requirements, a token is meaningless until verified here — it can
 * be forged, replayed, or simply omitted by a script that skips the widget
 * entirely and POSTs straight to `/api/dex/answer`. Skipping this call would
 * make the widget decorative.
 *
 * Fails closed on every error path (empty token, network failure, timeout,
 * malformed response): all return `false`, never throw. `generate.ts` treats
 * `false` the same way it treats a Redis outage — deny the LLM call, let the
 * visitor fall back to v1. See `guard.ts`'s file comment for why this
 * guardrail specifically fails closed rather than open.
 */

const SITEVERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
const VERIFY_TIMEOUT_MS = 5_000;

// Cloudflare's documented token bound (docs, 2026-08-14): tokens are never
// longer than 2048 characters. Anything past that is malformed input, not a
// real token, and isn't worth a network round trip to reject.
const MAX_TOKEN_LENGTH = 2048;

interface SiteverifyResponse {
  success?: boolean;
  "error-codes"?: string[];
  hostname?: string;
}

export async function verifyTurnstileToken(token: string, ip: string): Promise<boolean> {
  const secret = (process.env.TURNSTILE_SECRET_KEY ?? "").trim();
  if (!secret) return false; // not configured — no bot check, no LLM call.

  if (!token || typeof token !== "string" || token.length > MAX_TOKEN_LENGTH) {
    return false;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), VERIFY_TIMEOUT_MS);

  try {
    const response = await fetch(SITEVERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        secret,
        response: token,
        // Optional per Cloudflare's spec, but it strengthens the check —
        // Cloudflare can flag a token replayed from a different IP.
        ...(ip ? { remoteip: ip } : {}),
      }),
    });

    if (!response.ok) {
      console.warn("Dex Turnstile siteverify returned", response.status);
      return false;
    }

    const result = (await response.json()) as SiteverifyResponse;
    if (!result.success) {
      // Logged, not surfaced — an expired or replayed token is routine
      // (5-minute single-use tokens), not worth alarming on, but worth being
      // able to see in production logs if the rate climbs.
      console.warn("Dex Turnstile verification failed:", result["error-codes"]);
    }
    return result.success === true;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      console.warn(`Dex Turnstile verification timed out after ${VERIFY_TIMEOUT_MS}ms`);
    } else {
      console.error("Dex Turnstile verification error:", error);
    }
    return false;
  } finally {
    clearTimeout(timer);
  }
}
