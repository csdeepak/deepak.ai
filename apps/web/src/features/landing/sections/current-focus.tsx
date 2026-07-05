import Link from "next/link";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { ROUTES } from "@/constants/routes";
import type { Skill, TimelineEntry } from "@/types/content";

/**
 * S4 — Current Focus (specs/landing.md §2.4): the freshness engine.
 * Absorbs Experience Snapshot + GitHub Activity. The page's one dense
 * section; NO animation — data is still (XA §5), the stillness is the
 * credibility. Self-hides when every block is empty.
 *
 * TODO(data): GitHub sparkline block lands with the sync worker
 * (docs/11 §13, D-010) — reads only from cache, with last-synced stamp.
 */
export function CurrentFocus({
  skills,
  latestEntry,
}: {
  skills: Skill[];
  latestEntry: TimelineEntry | null;
}) {
  if (skills.length === 0 && !latestEntry) return null;

  return (
    <Section aria-labelledby="current-focus-heading">
      <Container width="content">
        <h2 id="current-focus-heading" className="text-h2 font-semibold">
          Currently
        </h2>
        <div className="mt-8 grid grid-cols-1 gap-px overflow-hidden rounded-md border border-border bg-border sm:grid-cols-2 md:grid-cols-3">
          {skills.length > 0 && (
            <div className="bg-canvas p-6">
              <h3 className="text-small font-medium text-muted">Working on</h3>
              <ul className="mt-3 space-y-2">
                {skills.slice(0, 3).map((skill) => (
                  <li key={skill.slug} className="text-body">
                    {skill.title}
                    <span className="block text-small text-muted">
                      {skill.context}
                    </span>
                  </li>
                ))}
              </ul>
              <Link
                href={ROUTES.skills}
                className="mt-3 inline-block text-small text-muted hover:text-ink"
              >
                All skills →
              </Link>
            </div>
          )}
          {latestEntry && (
            <div className="bg-canvas p-6">
              <h3 className="text-small font-medium text-muted">Latest</h3>
              <p className="mt-3 text-body">
                {latestEntry.role} · {latestEntry.organization}
              </p>
              <p className="mt-1 font-mono text-micro tabular text-faint">
                {latestEntry.startDate} — {latestEntry.endDate ?? "present"}
              </p>
              <Link
                href={ROUTES.timeline}
                className="mt-3 inline-block text-small text-muted hover:text-ink"
              >
                Full timeline →
              </Link>
            </div>
          )}
          {/* GitHub activity block: renders when the cache exists (TODO(data)) */}
        </div>
      </Container>
    </Section>
  );
}
