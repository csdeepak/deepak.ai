/**
 * The skill vocabulary — owner-provided, D-058 Phase B (docs/30 Open
 * Question 3, answered 2026-08-13 by the owner directly).
 *
 * ## Why this file exists
 *
 * Until now this lived inside `scripts/enrich-hero-network.ts` — a build
 * script — and its only consumer was the hero's 3D graph, where each skill
 * became a glowing dot. Real, owner-authored skill data was being used
 * exclusively as scene decoration: a recruiter could not read a skills list
 * anywhere on the site, because one did not exist in any rendered page.
 *
 * Moving it here makes it one source of truth for both consumers — the hero
 * geometry and the `/skills` page — so the graph and the page can never drift
 * apart and claim different things.
 *
 * ## The honesty boundary (LAW-008)
 *
 * Two different kinds of claim live here, and the distinction is deliberate:
 *
 *   · `PROJECT_SKILL_ADDITIONS` — skills a project *genuinely uses*, evidenced
 *     by the 2026-08-04 direct code audit (the same evidence behind the Dex
 *     knowledge cards), that never made it into `content/site.ts`'s own `tags`
 *     field. These are claims about code and are backed by it.
 *
 *   · `FOUNDATIONAL_SKILLS` / `GENERAL_AI_SKILLS` — general skills the owner
 *     self-reported, not tied to one project. This carries the same legitimacy
 *     as a resume's skills section: LAW-008 forbids *inventing* claims, not a
 *     person's own first-person self-report. The `/skills` page labels these
 *     separately rather than implying project evidence that does not exist.
 *
 * `PROJECT_SKILL_ADDITIONS` deliberately does NOT rewrite the stored project
 * `tags`, which also drive the `/projects` listing — a hero-originated
 * decision should not silently change what the Work index says.
 */

/** Skills a project genuinely uses, beyond its stored `tags`. */
export const PROJECT_SKILL_ADDITIONS: Readonly<Record<string, readonly string[]>> = {
  "pesu-vault": ["REST APIs"],
  "turb-detr": ["PyTorch", "Computer Vision", "Deep Learning", "Transformers"],
  "docksmith-engine": ["Systems Programming"],
  shortcutscore: ["Explainable AI", "Deep Learning"],
  "dental-ai-pipeline": ["Computer Vision", "Deep Learning"],
  asmos: ["Agentic AI", "Multi-Agent Systems", "AI Agents"],
};

/**
 * Bookend-eligible — kept small and specific, not the owner's full CS list.
 * `NeuralFace3DScene.tsx` looks these two up *by name* for the flight rail's
 * bookends, so renaming either one silently breaks that selection.
 */
export const FOUNDATIONAL_SKILLS = [
  "Data Structures & Algorithms",
  "Operating Systems",
] as const;

/** General AI/automation vocabulary the owner's original ask named directly. */
export const GENERAL_AI_SKILLS = [
  "Prompt Engineering",
  "RAG concepts",
  "AI Workflows",
  "GenAI Tools",
] as const;

/** A project's full skill set: its stored tags plus the audited additions. */
export function effectiveProjectSkills(
  slug: string,
  tags: readonly string[],
): string[] {
  return [...tags, ...(PROJECT_SKILL_ADDITIONS[slug] ?? [])];
}

/** How a skill is claimed — drives how `/skills` groups and labels it. */
export type SkillEvidenceKind = "project" | "foundation" | "practice";

export interface SkillGroup {
  readonly id: SkillEvidenceKind;
  readonly heading: string;
  /** Says plainly what kind of claim this group makes. */
  readonly note: string;
}

export const SKILL_GROUPS: readonly SkillGroup[] = [
  {
    id: "project",
    heading: "Evidenced by shipped work",
    note: "Each of these is used in a project on this site. The links go to the work itself.",
  },
  {
    id: "foundation",
    heading: "Foundations",
    note: "Core computer-science ground the projects above are built on.",
  },
  {
    id: "practice",
    heading: "Day-to-day AI practice",
    note: "Tools and techniques used regularly, not tied to one shipped project.",
  },
];
