/**
 * ContentService source selector — CONTENT_SOURCE env var controls which
 * backing implementation is exported.
 *
 *   CONTENT_SOURCE=file (default) → local-content.ts (reads content/site.ts)
 *   CONTENT_SOURCE=db             → db-content.ts (reads PostgreSQL via Drizzle)
 *
 * Both implementations satisfy the same ContentService interface; all callers
 * import { contentService } from '@/services' and are never aware of the
 * backing store. The CTI schema is an implementation detail of db-content.ts
 * and must not surface in page components (D-043 binding condition 1).
 *
 * docs/09 §11 — Runtime posture: file mode is the permanent floor. The build
 * succeeds with no database present when CONTENT_SOURCE is unset or 'file'.
 */

import { localContent } from "./local-content";
import { dbContent } from "./db-content";
import type { ContentService } from "./content";

/**
 * True only while `next build` is collecting page data — not at runtime.
 */
const IS_PRODUCTION_BUILD = process.env.NEXT_PHASE === "phase-production-build";

/**
 * Wraps the DB service so a database that is unreachable AT BUILD TIME falls
 * back to file content instead of killing the deployment.
 *
 * Why this exists: `/projects/[slug]` calls contentService.getProjects() from
 * generateStaticParams, and `/projects` calls it while prerendering. In db mode
 * an unreachable database therefore failed the whole build with
 * "Failed to collect page data for /projects/[slug]" — observed against a
 * suspended/misconfigured Postgres. A managed Postgres that scales to zero
 * (Neon) can be cold or briefly unreachable exactly when a deploy runs, and a
 * transient database state should not be able to break a deploy of a site
 * whose content also exists in files.
 *
 * Scope is deliberately narrow:
 *   · Build only. At runtime the DB service is used unwrapped, so a real
 *     outage still surfaces as an error rather than silently serving stale
 *     content that looks fine.
 *   · Loud but readable. The actionable guidance prints once; each fallback
 *     then adds a single short line naming the method and the underlying
 *     cause. Drizzle puts the whole failed SQL statement in error.message, so
 *     that is deliberately reduced to a driver code — printing it per call
 *     buried the build log in a dozen copies of the same query.
 */

/** ECONNREFUSED / ETIMEDOUT etc., else a short slice of the message. */
function shortCause(error: unknown): string {
  const code = (error as { code?: unknown } | null)?.code;
  if (typeof code === "string" && code) return code;

  const cause = (error as { cause?: { code?: unknown } } | null)?.cause?.code;
  if (typeof cause === "string" && cause) return cause;

  const message = error instanceof Error ? error.message : String(error);
  return message.split("\n")[0]?.slice(0, 100) ?? "unknown error";
}
function withBuildTimeFallback(
  primary: ContentService,
  fallback: ContentService,
): ContentService {
  let warned = false;

  return new Proxy(primary, {
    get(target, prop, receiver) {
      const original = Reflect.get(target, prop, receiver) as unknown;
      if (typeof original !== "function") return original;

      return async (...args: unknown[]) => {
        try {
          return await (original as (...a: unknown[]) => Promise<unknown>).apply(
            target,
            args,
          );
        } catch (error) {
          if (!warned) {
            warned = true;
            console.warn(
              "\n[build] Database unreachable while collecting page data.\n" +
                "        Falling back to file content so the build can complete.\n" +
                "        The deployed site will serve content/site.ts, NOT the database.\n" +
                "        Check DATABASE_URL is set for the build environment and that\n" +
                "        the database is awake and reachable from it.\n",
            );
          }
          console.warn(
            `[build] contentService.${String(prop)} → file fallback (${shortCause(error)})`,
          );

          const fallbackMethod = Reflect.get(fallback, prop) as unknown;
          if (typeof fallbackMethod !== "function") {
            throw error;
          }
          return (fallbackMethod as (...a: unknown[]) => Promise<unknown>).apply(
            fallback,
            args,
          );
        }
      };
    },
  }) as ContentService;
}

function selectContentService(): ContentService {
  if (process.env.CONTENT_SOURCE !== "db") return localContent;
  return IS_PRODUCTION_BUILD
    ? withBuildTimeFallback(dbContent, localContent)
    : dbContent;
}

export const contentService: ContentService = selectContentService();
