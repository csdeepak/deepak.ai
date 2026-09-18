import Link from "next/link";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { ScrollReveal } from "@/animations/scroll-reveal";
import { ProjectCard } from "@/components/content/project-card";
import { ROUTES } from "@/constants/routes";
import { contentService } from "@/services";

/**
 * Selected work — the landing's evidence beat.
 *
 * Why this section exists: measured on the live landing page, the hero ran
 * 3072px (41.6% of the document), the two post carousels 1659px and twelve
 * cards, and the only representation of the actual projects was the Timeline's
 * six bare titles in 913px — no summary, no stack, no year. A portfolio whose
 * front page never shows a project is asking a recruiter to go looking for the
 * evidence, and most will not. This puts the work on the page.
 *
 * It sits directly after Mission, before the posts: the thesis, then the proof,
 * then the commentary. The Timeline keeps its own job further down — chronology
 * is a different question from "what has he actually built".
 */

/** Two rows of two on desktop — enough to establish range, few enough that
 *  "All projects" still means something. */
const LANDING_PROJECT_COUNT = 4;

export async function SelectedWork() {
  // Featured first (the owner's own ordering), but a project set where nobody
  // has touched the `featured` flag is not a reason to show an empty landing —
  // fall back to the most recent published work, which is equally honest.
  const featured = await contentService.getFeaturedProjects(
    LANDING_PROJECT_COUNT,
  );
  const projects =
    featured.length > 0
      ? featured
      : (await contentService.getProjects()).slice(0, LANDING_PROJECT_COUNT);

  // Zero published projects is a legitimate state (LAW-008) — the section
  // self-hides rather than rendering a heading over nothing.
  if (projects.length === 0) return null;

  return (
    <Section aria-labelledby="selected-work-heading" className="py-24 md:py-40">
      <Container width="content">
        <ScrollReveal>
          <div className="flex flex-wrap items-baseline justify-between gap-4">
            <div>
              <p className="font-mono text-micro uppercase tracking-[0.2em] text-faint">
                The work
              </p>
              <h2
                id="selected-work-heading"
                className="mt-3 text-h4 font-display font-medium text-ink"
              >
                Selected work
              </h2>
            </div>
            <Link
              href={ROUTES.projects}
              className="inline-flex items-center gap-1.5 py-2 text-small text-accent underline-offset-4 hover:underline"
            >
              All projects
              <span aria-hidden>→</span>
            </Link>
          </div>
        </ScrollReveal>

        {/* Grid items stretch by default, so the card's own `h-full` gives
            every card in a row the same height regardless of how long its
            summary is — no class needed on the <li>. */}
        <ul className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
          {projects.map((project) => (
            <li key={project.slug}>
              <ProjectCard project={project} />
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
