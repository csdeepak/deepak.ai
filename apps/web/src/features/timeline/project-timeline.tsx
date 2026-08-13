import Link from "next/link";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { Badge } from "@/components/ui/badge";
import { contentService } from "@/services";

/**
 * ProjectTimeline — the landing zig-zag spine (D-058 Phase E). Distinct
 * from `components/content/timeline.tsx`, which renders the unrelated
 * career `timeline_entries` (org/role/dates) — this one walks published
 * projects in owner-assigned `timelineOrder`, alternating left/right.
 *
 * No dates are rendered: real start/end dates aren't populated yet
 * (owner call, D-058 Phase E) — showing a fabricated month would violate
 * LAW-008. Order alone tells the story.
 *
 * Self-hides entirely when no project has a timeline position (LAW-008).
 * Motion is scroll-driven CSS only (animation-timeline: view(), see
 * globals.css) — zero client JS, mirroring the gallery cluster.
 */
export async function ProjectTimeline() {
  const projects = await contentService.getTimelineProjects();
  if (projects.length === 0) return null;

  return (
    <Section aria-labelledby="timeline-heading" className="py-24 md:py-40">
      <Container width="content">
        <p className="font-mono text-micro uppercase tracking-[0.2em] text-faint">
          The record
        </p>
        <h2
          id="timeline-heading"
          className="mt-3 max-w-2xl text-section font-display font-medium text-ink"
        >
          How the work unfolded.
        </h2>

        <ol className="timeline-list mt-16 md:mt-20">
          {projects.map((project) => (
            <li key={project.slug} className="timeline-node">
              <span className="timeline-dot" aria-hidden />
              <Link href={`/projects/${project.slug}`} className="timeline-card group">
                <h3 className="text-card-title font-display font-semibold text-ink">
                  <span className="gradient-underline-hover">{project.title}</span>
                </h3>
                {project.problem && (
                  <p className="mt-2 text-small text-muted">{project.problem}</p>
                )}
                <div className="mt-3">
                  {project.projectStatus === "active" ? (
                    <Badge tone="info">active</Badge>
                  ) : (
                    <Badge tone="neutral">archived</Badge>
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ol>
      </Container>
    </Section>
  );
}
