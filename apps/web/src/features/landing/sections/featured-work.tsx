import Link from "next/link";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { Grid } from "@/components/layout/grid";
import { ProjectCard } from "@/components/content/project-card";
import { ScrollReveal } from "@/animations/scroll-reveal";
import { ROUTES } from "@/constants/routes";
import type { Project } from "@/types/content";

/**
 * S2 — Featured Work (specs/landing.md §2.2). Self-hides when no
 * featured projects exist (data-driven graceful absence — no fake
 * data, no empty-state on a landing preview). No card stagger (spec).
 */
export function FeaturedWork({ projects }: { projects: Project[] }) {
  if (projects.length === 0) return null;

  return (
    <Section aria-labelledby="featured-work-heading">
      <Container width="content">
        <ScrollReveal>
          <h2 id="featured-work-heading" className="text-h2 font-semibold">
            Featured work
          </h2>
          <p className="mt-2 text-body text-muted">
            Systems, with the reasoning behind them.
          </p>
          <Grid cols={2} className="mt-8">
            {projects.slice(0, 2).map((project) => (
              <ProjectCard key={project.slug} project={project} />
            ))}
          </Grid>
          <p className="mt-6">
            <Link
              href={ROUTES.projects}
              className="text-small text-muted hover:text-ink"
            >
              All projects →
            </Link>
          </p>
        </ScrollReveal>
      </Container>
    </Section>
  );
}
