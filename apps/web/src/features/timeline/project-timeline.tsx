import Link from "next/link";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { contentService } from "@/services";

/**
 * ProjectTimeline — the landing zig-zag spine (D-058 Phase E). Distinct
 * from `components/content/timeline.tsx`, which renders the unrelated
 * career `timeline_entries` (org/role/dates) — this one walks published
 * projects in owner-assigned `timelineOrder`, alternating left/right.
 *
 * Each node is a glowing sphere (echoing the hero neural-network's bulbs)
 * plus the project name — nothing else. The problem/status detail that
 * lived here initially was a wall of text at real content length; the
 * spine is a map, not a summary. Detail belongs on `/projects/[slug]`,
 * one click away.
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
            <li key={project.slug} className="timeline-node group">
              <span className="timeline-dot" aria-hidden />
              {/* The link's ::after covers the whole node, so the sphere is
                  clickable too — not just the name. The underline sweep lives
                  on the inner span because `.gradient-underline-hover` also
                  uses ::after and the two would collide on one element. */}
              <Link
                href={`/projects/${project.slug}`}
                className="timeline-card text-card-title font-display font-semibold text-ink after:absolute after:inset-0"
              >
                <span className="gradient-underline-hover">{project.title}</span>
              </Link>
            </li>
          ))}
        </ol>
      </Container>
    </Section>
  );
}
