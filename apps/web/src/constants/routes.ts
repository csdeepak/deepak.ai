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
