/**
 * Site content — the landing's editable copy and data seeds.
 * Temporary home until the CMS/data layer lands (docs/09); shape
 * mirrors what the admin will manage.
 *
 * NO FAKE DATA: collection arrays start empty and their landing
 * sections self-hide (graceful absence). Copy fields below are
 * structural drafts — every TODO(copy) must pass the R4 release
 * protocol (10-second + read-aloud tests, specs/landing.md §6.5).
 */
import type {
  Post,
  Project,
  Publication,
  Skill,
  TimelineEntry,
} from "@/types/content";

export const siteContent = {
  /** TODO(copy): final identity sentence — R4 protocol before release. */
  name: "Deepak",
  identitySentence:
    "Researcher-engineer — building AI systems and publishing the research behind them.",

  /**
   * Current focus line (hero item 3). Sourced from Skills(current)
   * once the CMS lands; null hides the line entirely (spec §2.1).
   * Stamp renders only while fresh ≤30d (R5) — enforced in the Hero.
   */
  currentFocus: null as { phrase: string; updatedAt: string } | null,

  /** TODO(asset): real CV file in /public; null hides the CTA. */
  cvUrl: null as string | null,

  /** TODO(copy): real contact email; null hides the direct block. */
  contactEmail: null as string | null,

  /** TODO(copy): what's-welcome sentence for S7. */
  contactSentence:
    "Open to research collaboration, engineering problems worth solving, and conversations about both.",

  outbound: {
    github: null as string | null, // TODO: profile URL
    scholar: null as string | null,
    linkedin: null as string | null,
  },
} as const;

/**
 * Mission (landing Screen 2). Honest, owner-editable narrative — NOT
 * fabricated evidence. The identity/mission copy still passes the R4
 * read-aloud + 10-second tests before public launch (specs/landing.md).
 */
export const mission = {
  kicker: "The mission",
  statement:
    "The strongest AI engineers won't just ship models — they'll understand them. I'm building toward both: production systems that work, and the research that explains why.",
  pillars: [
    { label: "Build", body: "Production AI systems — agentic, multimodal, real." },
    { label: "Research", body: "The work behind the work, written down and published." },
    { label: "Explain", body: "Models you can inspect, trust, and reason about." },
  ],
} as const;

/**
 * Domains (landing Screen 3 — Evidence). These are real focus areas,
 * not projects: the territory the work lives in. Each note describes
 * the field, never a fabricated result.
 */
export const domains: ReadonlyArray<{ name: string; note: string }> = [
  { name: "Agentic AI", note: "systems that plan, act, and use tools" },
  { name: "Multi-Agent Systems", note: "many models coordinating toward a goal" },
  { name: "Large Language Models", note: "language as a reasoning surface" },
  { name: "Deep Learning", note: "the architectures underneath" },
  { name: "Computer Vision", note: "teaching systems to see" },
  { name: "Explainable AI", note: "making models legible and trustworthy" },
];

/** Research highlight (S3). Null hides the section. */
export const researchHighlight = null as {
  themeName: string;
  question: string;
  publicationCount: number;
  venueCount: number;
  yearSpan: string;
} | null;

/** Collections — empty until real content exists (no fake data). */
export const projects: Project[] = [];
export const publications: Publication[] = [];
export const posts: Post[] = [];
export const timeline: TimelineEntry[] = [];
export const skills: Skill[] = [];
