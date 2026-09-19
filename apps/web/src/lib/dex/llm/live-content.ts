import "server-only";
import { contentService } from "@/services";
import type { DexKnowledgeCard, DexSource } from "../types";

/**
 * Phase 4 (docs/31 §7.1) — published content, threaded into the Dex prompt.
 *
 * ## The problem this fixes
 *
 * Every hand-authored knowledge card carries an `updatedAt` between
 * 2026-07-27 and 2026-08-04. The owner has kept publishing since: posts, a
 * gallery, a timeline, more projects. So Dex could not discuss anything
 * shipped in the last six weeks, and fell further behind with every publish —
 * a gap that no amount of prompt tuning closes, because the facts simply were
 * not in the prompt.
 *
 * It got worse in D-061, which put Dex in the nav of every page. Prominence
 * went up; freshness did not.
 *
 * ## The approach
 *
 * Published projects and posts are rendered into the same `DexKnowledgeCard`
 * shape the curated corpus already uses, so everything downstream — the
 * grounding gate, citation resolution, the fabrication scrub — keeps working
 * unchanged. The model does not need to know some cards were hand-written and
 * others generated; it only needs facts with stable ids to cite.
 *
 * ## What this deliberately does NOT do
 *
 * It does not replace the curated cards. Those carry interpretation the raw
 * content does not: why a project matters, how Deepak works, what he is aiming
 * at. This adds the *record* — what exists, when, built with what — and leaves
 * the judgement to the owner-written cards.
 */

/**
 * Live ids are namespaced so they can never collide with a curated card id,
 * and so a glance at a citation says where the fact came from.
 */
const LIVE_PROJECT_PREFIX = "live-project-";
const LIVE_POST_PREFIX = "live-post-";

/**
 * Bounds. The prompt already carries ~8.2k tokens of curated corpus against a
 * 40k budget the guard script asserts, so there is real headroom — but it is
 * not unlimited, and posts accumulate forever. Projects are capped generously
 * because there is a finite number of them and each is high-value; posts are
 * capped at the most recent, because the twentieth-newest post is rarely what
 * a recruiter is asking about.
 */
const MAX_PROJECTS = 24;
const MAX_POSTS = 15;

/** Per-entry text cap. A long project overview would otherwise crowd out the
 *  curated cards, which carry more signal per token. */
const MAX_SUMMARY_CHARS = 420;

/** A card paired with the citation it resolves to, since live content has no
 *  entry in the static `sources.json`. */
export interface DexLiveCard extends DexKnowledgeCard {
  source: DexSource;
}

function truncate(value: string, limit = MAX_SUMMARY_CHARS): string {
  const clean = value.replace(/\s+/g, " ").trim();
  return clean.length > limit
    ? `${clean.slice(0, limit - 1).trimEnd()}…`
    : clean;
}

/** Joins the parts of a summary that are actually present, skipping the rest.
 *  An absent field is omitted, never rendered as an empty label — the same
 *  honesty rule the UI follows (LAW-008), applied to the model's input. */
function compose(parts: Array<string | null | undefined>): string {
  return parts.filter((part): part is string => Boolean(part && part.trim())).join(" ");
}

export async function buildLiveContentCards(): Promise<DexLiveCard[]> {
  const [projects, posts] = await Promise.all([
    contentService.getProjects(),
    contentService.getPosts(),
  ]);

  const projectCards: DexLiveCard[] = projects
    .slice(0, MAX_PROJECTS)
    .map((project) => ({
      id: `${LIVE_PROJECT_PREFIX}${project.slug}`,
      title: `${project.title} (project, ${project.year})`,
      summary: truncate(
        compose([
          project.problem,
          project.question ? `The question that created it: ${project.question}` : null,
          project.role ? `Role: ${project.role}.` : null,
          project.projectStatus === "active" ? "Status: active." : null,
          project.outcomes && project.outcomes.length > 0
            ? `Outcomes: ${project.outcomes.join("; ")}.`
            : null,
          project.repoUrl ? "Source code is public." : null,
        ]),
      ),
      tags: project.tags,
      sourceIds: [],
      visibility: "public" as const,
      updatedAt: project.updatedAt,
      source: {
        id: `${LIVE_PROJECT_PREFIX}${project.slug}`,
        label: project.title,
        kind: "project" as const,
        href: `/projects/${project.slug}`,
      },
    }));

  const postCards: DexLiveCard[] = posts.slice(0, MAX_POSTS).map((post) => ({
    id: `${LIVE_POST_PREFIX}${post.slug}`,
    title: `${post.title} (post, ${post.publishedAt.slice(0, 10)})`,
    summary: truncate(compose([post.dek])),
    tags: post.tags,
    sourceIds: [],
    visibility: "public" as const,
    updatedAt: post.updatedAt,
    source: {
      id: `${LIVE_POST_PREFIX}${post.slug}`,
      label: post.title,
      kind: "site" as const,
      href: `/posts/${post.slug}`,
    },
  }));

  // Drop anything that ended up with no usable text. A card whose summary is
  // empty is noise in the prompt and an id the model could cite to satisfy the
  // grounding gate without any fact behind it — which is exactly the failure
  // that gate exists to prevent.
  return [...projectCards, ...postCards].filter((card) => card.summary.length > 0);
}

/**
 * Never lets a content-layer failure take Dex down with it.
 *
 * `contentService` is used unwrapped at runtime by design (services/index.ts:
 * the build-time fallback is deliberately build-only, so a real outage
 * surfaces rather than silently serving stale content). That is right for a
 * page render, which should fail loudly. It is wrong here: an unreachable
 * database should cost Dex its freshest facts, not its ability to answer at
 * all. The curated corpus alone is exactly Dex's behaviour before Phase 4.
 */
export async function safeBuildLiveContentCards(): Promise<DexLiveCard[]> {
  try {
    return await buildLiveContentCards();
  } catch (error) {
    console.warn(
      "Dex: live content unavailable, answering from the curated corpus only —",
      error instanceof Error ? error.message.split("\n")[0] : String(error),
    );
    return [];
  }
}
