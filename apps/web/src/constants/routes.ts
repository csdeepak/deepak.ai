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
  gallery: "/gallery",
  memory: "/memory", // immersive route, outside the (site) chrome group
  ai: "/ai", // v1.5
  news: "/news", // v2
  contact: "/contact",
  search: "/search",
} as const;

/**
 * The nav lanes, in priority order (D-021 caps the bar at five).
 *
 * Skills sits between Work and Posts deliberately: for the site's stated
 * primary audience — evaluators — "what can he do" and "what has he built"
 * are the same question asked two ways, and they belong next to each other.
 * Research stays listed but unbuilt, so it self-hides via BUILT_ROUTES.
 */
export const NAV_LANES = [
  { label: "Work", href: ROUTES.projects },
  { label: "Skills", href: ROUTES.skills },
  { label: "Posts", href: ROUTES.posts },
  { label: "Research", href: ROUTES.research },
  { label: "About", href: ROUTES.about },
] as const;

/**
 * `/timeline` is deliberately NOT a nav lane yet, even though D-064 built it
 * and registered it below.
 *
 * BUILT_ROUTES is a build-time constant, so a lane cannot appear only when the
 * table has rows — and there are no published entries yet, because the admin
 * CRUD to create them did not exist until D-064. A nav lane that sends a
 * recruiter to an honest empty shelf is worse than no lane: LAW-008 permits
 * the empty shelf, it does not ask us to advertise it.
 *
 * It is reachable from the footer, the sitemap, and the Experience section on
 * /about, all of which self-hide or degrade gracefully when empty. Promoting
 * it to a lane is a one-line change once there is something to show.
 */

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
  ROUTES.skills, // D-063 — the owner's real taxonomy, finally rendered
  ROUTES.posts, // D-058 Phase D
  ROUTES.about, // D-063 — the page an evaluator looks for by name
  ROUTES.timeline, // D-064 — the career record, now that admin CRUD exists
  ROUTES.gallery, // D-058 Phase F
  // D-063 — /memory is IMMERSIVE, not a lane: it renders outside the (site)
  // chrome group. Listing it here gets it into the footer and the sitemap;
  // the nav deliberately does not carry it (five-lane cap, and the hero is a
  // better doorway). Before this it was in no registry at all — live and
  // working, but reachable only by typing the URL.
  ROUTES.memory,
]);

/** True when `href` points at a page that actually exists. */
export function isRouteBuilt(href: string): boolean {
  return BUILT_ROUTES.has(href);
}
