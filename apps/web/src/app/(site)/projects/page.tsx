import type { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { ProjectCard } from "@/components/content/project-card";
import { EmptyState } from "@/components/content/empty-state";
import { contentService } from "@/services";

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

export default async function WorkIndexPage() {
  const projects = await contentService.getProjects();

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
          <ul className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2">
            {projects.map((project) => (
              <li key={project.slug}>
                <ProjectCard project={project} />
              </li>
            ))}
          </ul>
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
