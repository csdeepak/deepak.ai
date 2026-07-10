/**
 * Route map per docs/04 §1. URLs are permanent (IA law).
 * The nav carries exactly four lanes (D-021); everything else is reached
 * via lane tabs, footer, and the command palette.
 */
export const ROUTES = {
  home: "/",
  about: "/about",
  projects: "/projects",
  research: "/research",
  publications: "/publications",
  posts: "/posts",
  timeline: "/timeline",
  skills: "/skills",
  github: "/github",
  gallery: "/gallery", // v1.5
  ai: "/ai", // v1.5
  news: "/news", // v2
  contact: "/contact",
  search: "/search",
} as const;

export const NAV_LANES = [
  { label: "Work", href: ROUTES.projects },
  { label: "Research", href: ROUTES.research },
  { label: "Posts", href: ROUTES.posts },
  { label: "About", href: ROUTES.about },
] as const;

/**
 * Built-route registry — the single source of truth for graceful absence
 * in global navigation (nav + footer). A route appears in the nav/footer
 * only once its page actually exists; every other lane and footer link
 * self-hides until then. This is data, not dead code: shipping a page =
 * adding its path here, and its link returns automatically.
 *
 * Why this exists (LAW-008, Honesty over completeness): a nav lane or a
 * "sitemap of record" footer link that 404s is a fabricated affordance.
 * An empty shelf beats a broken one — no "coming soon" placeholders.
 *
 * Current: `/` and `/projects` (the Work lane) are built. `/memory` is an
 * immersive route, not a lane. Every other lane/footer link self-hides
 * until its page ships.
 */
export const BUILT_ROUTES: ReadonlySet<string> = new Set<string>([
  ROUTES.home,
  ROUTES.projects, // the "Work" lane (D-021 label, D-024 vocabulary)
]);

/** True when `href` points at a page that actually exists. */
export function isRouteBuilt(href: string): boolean {
  return BUILT_ROUTES.has(href);
}
