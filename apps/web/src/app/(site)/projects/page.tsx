import type { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { ProjectCard } from "@/components/content/project-card";
import { EmptyState } from "@/components/content/empty-state";
import { ProjectFilter } from "@/features/projects/project-filter";
import { contentService } from "@/services";
import type { Project } from "@/types/content";

/**
 * /projects — the Work index (Index archetype, docs/24 Part 10; D-021
 * lane "Work"). Reads real content through the ContentService. Zero
 * projects is a legitimate state (LAW-008): the grid is replaced by an
 * honest, designed empty state — never a dummy project or a fake count.
 */
export const metadata: Metadata = {
  title: "Work — Projects",
  description:
    "Systems where the reasoning became real — each with the question that created it and the branches abandoned along the way.",
};

/** The <ul> the filter reaches for by id. */
const LIST_ID = "work-index";

/**
 * A tag earns a chip only if it actually partitions the work.
 *
 * Two bounds, and the upper one is the interesting half. A tag used once is a
 * link to a single project wearing the wrong control, and a row of them buries
 * the tags that matter. A tag on nearly every project is worse: measured
 * against the real corpus, "Python" covers 8 of 9, so a Python chip hides one
 * card and looks broken.
 *
 * That is the same reasoning D-054 applied to Dex's matcher, where terms
 * ubiquitous across a corpus about one person were excluded from scoring
 * because they carry no discriminating signal. A filter is a search with
 * buttons; the rule holds.
 */
const MIN_TAG_USES = 2;
const MAX_TAG_COVERAGE = 0.6;

function buildFilterTags(projects: Project[]): string[] {
  const counts = new Map<string, number>();
  for (const project of projects) {
    for (const tag of project.tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }
  const ceiling = projects.length * MAX_TAG_COVERAGE;
  return [...counts.entries()]
    .filter(([, count]) => count >= MIN_TAG_USES && count <= ceiling)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([tag]) => tag);
}

export default async function WorkIndexPage() {
  const projects = await contentService.getProjects();
  const filterTags = buildFilterTags(projects);

  return (
    <Section>
      <Container width="content">
        <header className="max-w-[46ch]">
          <p className="font-mono text-micro uppercase tracking-[0.2em] text-faint">
            Work
          </p>
          <h1 className="mt-4 text-section font-display font-semibold text-ink">
            Projects
          </h1>
          <p className="mt-4 text-lead text-muted">
            Shipped systems — where reasoning became real. Each carries the
            question that created it and the branches abandoned along the way.
          </p>
        </header>

        {projects.length > 0 ? (
          <>
            <ProjectFilter tags={filterTags} listId={LIST_ID} />
            {/* Each item carries its own tags so the filter can hide it
                without any project data crossing the server/client boundary —
                see ProjectFilter for why that matters at paragraph length. */}
            <ul
              id={LIST_ID}
              className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2"
            >
              {projects.map((project) => (
                <li
                  key={project.slug}
                  data-project-tags={project.tags.join("|")}
                >
                  <ProjectCard project={project} />
                </li>
              ))}
            </ul>
          </>
        ) : (
          <EmptyState
            className="mt-12"
            title="No projects are documented here yet."
            body="This shelf is honestly empty. When a system is ready to be reconstructed — question, build, and abandoned branches included — it will appear here."
          />
        )}
      </Container>
    </Section>
  );
}
