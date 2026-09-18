import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { EmptyState } from "@/components/content/empty-state";
import { DexContextChip } from "@/features/dex/dex-context-chip";
import { contentService } from "@/services";
import {
  FOUNDATIONAL_SKILLS,
  GENERAL_AI_SKILLS,
  SKILL_GROUPS,
  effectiveProjectSkills,
  type SkillEvidenceKind,
} from "../../../../content/skills";
import type { Project, Skill } from "@/types/content";

/**
 * /skills — the skill vocabulary, with its evidence attached.
 *
 * Why this page exists: the owner authored a real 22-item skill taxonomy in
 * D-058 Phase B, and its only consumer was the hero's 3D graph, where each
 * skill became a glowing dot. A recruiter — the site's stated primary
 * audience — could not read a skills list anywhere, because no page rendered
 * one. The data was already there; only the page was missing.
 *
 * The design follows LAW-006 ("every claim links to its evidence") literally:
 * a skill evidenced by shipped work is listed *with the projects that prove
 * it*, each one a link. A skill the owner self-reports is listed in its own
 * group, labelled as such, with no implied project backing. The page never
 * blurs those two, because the whole value of a skills list on a portfolio is
 * whether you can check it.
 *
 * Fully static — it reads published projects at build time and derives
 * everything else from `content/skills.ts`.
 */
export const metadata: Metadata = {
  title: "Skills",
  description:
    "What Deepak can build with, and the shipped work that evidences each one.",
};

interface SkillEntry {
  name: string;
  kind: SkillEvidenceKind;
  /** Projects that actually use this skill — empty for self-reported ones. */
  evidence: Array<Pick<Project, "slug" | "title">>;
  /** Owner-authored enrichment from the skills table (D-065), when present. */
  context?: string;
  category?: string;
  current?: boolean;
}

function buildSkillIndex(projects: Project[], enrichment: Skill[]): SkillEntry[] {
  // Skill → the projects using it, from stored tags plus the audited additions.
  const byProject = new Map<string, Array<Pick<Project, "slug" | "title">>>();
  for (const project of projects) {
    for (const skill of effectiveProjectSkills(project.slug, project.tags)) {
      const list = byProject.get(skill) ?? [];
      list.push({ slug: project.slug, title: project.title });
      byProject.set(skill, list);
    }
  }

  const entries: SkillEntry[] = [...byProject.entries()]
    .map(([name, evidence]) => ({ name, kind: "project" as const, evidence }))
    // Most-evidenced first: a skill three projects rely on says more than one
    // used once. Alphabetical within a tier, so the order is stable and not
    // an implied ranking between equals.
    .sort(
      (a, b) =>
        b.evidence.length - a.evidence.length || a.name.localeCompare(b.name),
    );

  // Self-reported groups, minus anything a project already evidences — a skill
  // with real backing belongs in the evidenced group, not listed twice.
  const claimed = new Set(entries.map((entry) => entry.name));
  for (const [list, kind] of [
    [FOUNDATIONAL_SKILLS, "foundation"],
    [GENERAL_AI_SKILLS, "practice"],
  ] as const) {
    for (const name of list) {
      if (claimed.has(name)) continue;
      entries.push({ name, kind, evidence: [] });
      claimed.add(name);
    }
  }

  // D-065 — merge in owner-authored enrichment, matched by name.
  //
  // Enrichment ADDS to the derived list; it never replaces it. Making the
  // database authoritative would have blanked this page until 22 taxonomy
  // items were re-entered by hand — trading a working page for an empty one.
  // A skill entered in admin gains its context/category/current; a skill only
  // in the taxonomy is untouched; a skill only in admin is appended.
  const byName = new Map(entries.map((entry) => [entry.name.toLowerCase(), entry]));

  for (const skill of enrichment) {
    const existing = byName.get(skill.title.toLowerCase());
    if (existing) {
      existing.context = skill.context || undefined;
      existing.category = skill.category || undefined;
      existing.current = skill.current;
      continue;
    }
    const added: SkillEntry = {
      name: skill.title,
      // No project uses it, and it is not in the self-report lists — but the
      // owner published it deliberately, which is the same class of claim.
      kind: "practice",
      evidence: [],
      context: skill.context || undefined,
      category: skill.category || undefined,
      current: skill.current,
    };
    entries.push(added);
    byName.set(added.name.toLowerCase(), added);
  }

  return entries;
}

export default async function SkillsPage() {
  const [projects, enrichment] = await Promise.all([
    contentService.getProjects(),
    contentService.getSkills(),
  ]);
  const skills = buildSkillIndex(projects, enrichment);

  return (
    <Section>
      <Container width="content">
        <header className="max-w-[52ch]">
          <p className="font-mono text-micro uppercase tracking-[0.2em] text-faint">
            Skills
          </p>
          <h1 className="mt-4 text-section font-display font-semibold text-ink">
            What I build with
          </h1>
          <p className="mt-4 text-lead text-muted">
            Grouped by how each one is backed. Anything evidenced by shipped
            work links straight to the project that proves it.
          </p>
        </header>

        {skills.length === 0 ? (
          <EmptyState
            className="mt-12"
            title="No skills are documented here yet."
            body="This shelf is honestly empty. Skills appear here once there is published work to evidence them."
          />
        ) : (
          <div className="mt-14 space-y-16">
            {SKILL_GROUPS.map((group) => {
              const inGroup = skills.filter((skill) => skill.kind === group.id);
              // A group with nothing in it self-hides (LAW-008) — no empty
              // heading over a blank space.
              if (inGroup.length === 0) return null;

              return (
                <section key={group.id} aria-labelledby={`skills-${group.id}`}>
                  <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                    <h2
                      id={`skills-${group.id}`}
                      className="text-h4 font-display font-medium text-ink"
                    >
                      {group.heading}
                    </h2>
                    <span className="font-mono text-micro tabular text-faint">
                      {inGroup.length}
                    </span>
                  </div>
                  <p className="mt-2 max-w-[60ch] text-small text-muted">
                    {group.note}
                  </p>

                  <ul className="mt-6 grid grid-cols-1 gap-px overflow-hidden rounded-md border border-border bg-border sm:grid-cols-2">
                    {inGroup.map((skill) => (
                      <li key={skill.name} className="bg-canvas p-5">
                        <div className="flex flex-wrap items-baseline gap-x-3">
                          <h3 className="text-body font-medium text-ink">
                            {skill.name}
                          </h3>
                          {skill.category && (
                            <span className="font-mono text-micro uppercase tracking-[0.14em] text-faint">
                              {skill.category}
                            </span>
                          )}
                          {skill.current === false && (
                            <span className="font-mono text-micro uppercase tracking-[0.14em] text-faint">
                              previously
                            </span>
                          )}
                        </div>
                        {skill.context && (
                          <p className="mt-1.5 text-small text-muted">
                            {skill.context}
                          </p>
                        )}
                        {skill.evidence.length > 0 && (
                          <ul className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
                            {skill.evidence.map((project) => (
                              <li key={project.slug}>
                                <Link
                                  href={`/projects/${project.slug}`}
                                  className="text-small text-accent underline-offset-4 hover:underline"
                                >
                                  {project.title}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        )}
                      </li>
                    ))}
                  </ul>
                </section>
              );
            })}
          </div>
        )}

        <div className="mt-20 border-t border-border pt-8">
          <DexContextChip
            question="What are Deepak's strongest technical skills?"
            label="Ask Dex about these skills"
          />
        </div>
      </Container>
    </Section>
  );
}
