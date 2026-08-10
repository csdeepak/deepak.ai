/**
 * Next.js instrumentation hook — runs once when the server starts.
 * Used here to catch missing/dev-default auth env vars at boot in production,
 * before any request is served (replaces the old silent-failure mode where
 * SESSION_SECRET fell back to the dev string and ADMIN_PASSWORD_HASH just
 * caused every login to fail silently).
 */
export async function register() {
  // Skip during `next build` and in non-production environments.
  // The check is only meaningful when the server is actually serving traffic.
  if (
    process.env.NEXT_PHASE === "phase-production-build" ||
    process.env.NODE_ENV !== "production"
  )
    return;

  const DEV_SESSION_FALLBACK = "dev-secret-min-32-chars-change-me!";
  const problems: string[] = [];

  const secret = process.env.SESSION_SECRET;
  if (!secret || secret === DEV_SESSION_FALLBACK || secret.length < 32) {
    problems.push(
      "SESSION_SECRET — must be ≥ 32 random characters and not the dev fallback.\n" +
        '    node -e "console.log(require(\'crypto\').randomBytes(48).toString(\'base64\'))"',
    );
  }

  const hash = process.env.ADMIN_PASSWORD_HASH;
  if (!hash || !hash.startsWith("$2")) {
    problems.push(
      "ADMIN_PASSWORD_HASH — must be a valid bcrypt hash (starts with $2).\n" +
        "    node -e \"const b=require('bcryptjs'); b.hash('yourPassphrase',12).then(h=>console.log(h))\"",
    );
  }

  if (problems.length > 0) {
    throw new Error(
      `[startup] Auth env vars missing or using dev defaults — refusing to serve:\n` +
        problems.map((p) => `  • ${p}`).join("\n") +
        `\n\nSet these in your host's environment (Render → service → Environment → Add Secret File / Env Var).\n` +
        `See .env.example for format and generation instructions.`,
    );
  }
}
