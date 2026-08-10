/**
 * Minimal in-memory, per-key, sliding-window rate limiter shared by every
 * public write/auth endpoint (admin login, Dex answer, Dex intake).
 *
 * Known gap (documented in docs/27 §13): each limiter's state lives in a
 * plain in-memory Map, so it resets on deploy/restart and is per-instance
 * only — it does not share state across multiple server instances. Future
 * fix: a Postgres-backed limiter, if that ever becomes a real problem.
 */

export function createRateLimiter(opts: { max: number; windowMs: number }) {
  const { max, windowMs } = opts;
  const attempts = new Map<string, { count: number; resetAt: number }>();

  function isRateLimited(key: string): boolean {
    const now = Date.now();
    const rec = attempts.get(key);
    if (!rec || rec.resetAt <= now) {
      attempts.set(key, { count: 1, resetAt: now + windowMs });
      return false;
    }
    rec.count += 1;
    return rec.count > max;
  }

  function reset(key: string): void {
    attempts.delete(key);
  }

  return { isRateLimited, reset };
}

export function getClientIp(headers: Headers): string {
  return (
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headers.get("x-real-ip") ??
    "unknown"
  );
}
