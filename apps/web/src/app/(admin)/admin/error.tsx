"use client";

/**
 * Admin error boundary.
 *
 * Every admin page reads from Postgres via getDb(). When the database is not
 * running — the common case in local dev, where it lives in Docker
 * (docker-compose.dev.yml) and stops whenever Docker Desktop does — Next
 * surfaced a raw "Failed query: select ..." stack trace, which says nothing
 * about the actual cause or fix. This turns that into a legible message with
 * the command to run.
 *
 * Non-database errors fall through to a generic message rather than being
 * mislabelled.
 */

import { useEffect } from "react";

/** Connection-level failures, as opposed to a genuine SQL/schema bug. */
function isDatabaseUnreachable(error: Error): boolean {
  const text = `${error.message} ${error.stack ?? ""}`;
  return (
    /ECONNREFUSED|ENOTFOUND|ETIMEDOUT|EHOSTUNREACH/i.test(text) ||
    /Failed query/i.test(text) ||
    /connect|connection.*(refused|terminated|closed)/i.test(text) ||
    /DATABASE_URL is not set/i.test(text)
  );
}

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Admin page error:", error);
  }, [error]);

  const dbDown = isDatabaseUnreachable(error);

  return (
    <div className="px-6 py-10">
      <div className="mx-auto max-w-2xl rounded-md border border-border bg-surface p-6">
        {dbDown ? (
          process.env.NODE_ENV === "production" ? (
            <>
              <h1 className="text-h4 font-semibold text-ink">
                The database isn&apos;t reachable
              </h1>
              <p className="mt-3 text-small text-muted">
                The admin reads everything from Postgres, and this instance
                can&apos;t reach it. That&apos;s a configuration problem, not
                something Retry will fix on its own — check that the{" "}
                <code className="rounded bg-recessed px-1.5 py-0.5 font-mono text-micro text-ink">
                  DATABASE_URL
                </code>{" "}
                environment variable is set correctly for this project in
                Vercel (Settings → Environment Variables), and that the Neon
                database is awake and reachable from it.
              </p>

              <p className="mt-5 text-micro text-faint">
                The public site keeps serving: its pages were prerendered at
                build time, so visitors see the last good build. Newly published
                content won&apos;t appear until the database is reachable again.
              </p>
            </>
          ) : (
            <>
              <h1 className="text-h4 font-semibold text-ink">
                The database isn&apos;t running
              </h1>
              <p className="mt-3 text-small text-muted">
                The admin reads everything from Postgres, which runs in Docker for
                local development. Docker Desktop is most likely stopped.
              </p>

              <ol className="mt-5 space-y-3 text-small text-muted">
                <li>
                  <span className="font-medium text-ink">1.</span> Start Docker
                  Desktop and wait until it reports{" "}
                  <span className="text-ink">running</span>.
                </li>
                <li>
                  <span className="font-medium text-ink">2.</span> Start the
                  database from the repo root:
                  <code className="mt-1.5 block rounded bg-recessed px-3 py-2 font-mono text-micro text-ink">
                    docker compose -f docker-compose.dev.yml up -d
                  </code>
                </li>
                <li>
                  <span className="font-medium text-ink">3.</span> Press Retry
                  below. No need to restart the dev server.
                </li>
              </ol>

              <p className="mt-5 text-micro text-faint">
                The public site is unaffected — it reads content from files, so
                only the admin needs the database.
              </p>
            </>
          )
        ) : (
          <>
            <h1 className="text-h4 font-semibold text-ink">
              Something broke on this page
            </h1>
            <p className="mt-3 text-small text-muted">
              This is not a database connection problem. The full error is in
              the terminal running the dev server, and in the browser console.
            </p>
            <code className="mt-4 block overflow-x-auto rounded bg-recessed px-3 py-2 font-mono text-micro text-muted">
              {error.message || "Unknown error"}
            </code>
          </>
        )}

        <button
          type="button"
          onClick={reset}
          className="mt-6 inline-flex h-9 items-center rounded-md bg-accent px-4 text-small text-on-accent transition-colors duration-(--duration-fast) hover:bg-accent-hover"
        >
          Retry
        </button>
      </div>
    </div>
  );
}
