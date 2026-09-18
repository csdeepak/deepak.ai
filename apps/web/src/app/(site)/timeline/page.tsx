import type { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { EmptyState } from "@/components/content/empty-state";
import { DexContextChip } from "@/features/dex/dex-context-chip";
import { contentService } from "@/services";
import type { TimelineEntry } from "@/types/content";

/**
 * /timeline — the career record.
 *
 * Why this page exists: `timeline_entries` has had a full schema since the
 * D-043 database sprint and no way to create a row, because `/admin/timeline`
 * was a 13-line stub. docs/31 §7.2 names work experience "the single most
 * common recruiter screen" and records that it is absent from Dex's corpus
 * entirely. D-064 built the admin CRUD; this is the page it feeds.
 *
 * Distinct from the landing page's Timeline section, which walks *projects* by
 * `timelineOrder`. This is the career one: roles, internships, research
 * positions.
 *
 * Zero published entries is a legitimate state — the page renders an honest
 * empty state rather than a fabricated history (LAW-008), and it stays out of
 * the nav until there is something in it.
 */
export const metadata: Metadata = {
  title: "Experience",
  description:
    "Roles, internships and research positions — what each one produced.",
};

const MONTH_YEAR: Intl.DateTimeFormatOptions = {
  month: "short",
  year: "numeric",
};

function formatMonth(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime())
    ? iso
    : date.toLocaleDateString("en-US", MONTH_YEAR);
}

/** "Jun 2025 — present" — an absent end date means still there, not unknown. */
function formatRange(entry: TimelineEntry): string {
  const start = formatMonth(entry.startDate);
  return entry.endDate ? `${start} — ${formatMonth(entry.endDate)}` : `${start} — present`;
}

export default async function TimelinePage() {
  const entries = await contentService.getTimeline();

  return (
    <Section>
      <Container width="content">
        <header className="max-w-[52ch]">
          <p className="font-mono text-micro uppercase tracking-[0.2em] text-faint">
            Experience
          </p>
          <h1 className="mt-4 text-section font-display font-semibold text-ink">
            Where the work happened
          </h1>
          <p className="mt-4 text-lead text-muted">
            Roles, internships and research positions — each with what it
            actually produced, not what it was called.
          </p>
        </header>

        {entries.length === 0 ? (
          <EmptyState
            className="mt-12"
            title="No experience is documented here yet."
            body="This shelf is honestly empty. Entries appear here once they are written up and published."
          />
        ) : (
          <ol className="mt-14 border-l border-border">
            {entries.map((entry) => (
              <li key={entry.slug} className="relative pb-12 pl-8 last:pb-0">
                {/* The marker sits on the rail. Filled = current role. */}
                <span
                  aria-hidden
                  className={
                    entry.endDate
                      ? "absolute -left-[5px] top-1.5 size-2.5 rounded-full border border-border-emphasis bg-canvas"
                      : "absolute -left-[5px] top-1.5 size-2.5 rounded-full bg-accent"
                  }
                />

                <p className="font-mono text-micro tabular text-faint">
                  {formatRange(entry)}
                  {entry.place && (
                    <>
                      <span aria-hidden> · </span>
                      {entry.place}
                    </>
                  )}
                </p>

                <h2 className="mt-2 text-card-title font-display font-semibold text-ink">
                  {entry.role}
                </h2>
                <p className="mt-1 text-body text-muted">{entry.organization}</p>

                {entry.summary && (
                  <p className="mt-4 max-w-[60ch] text-body text-muted">
                    {entry.summary}
                  </p>
                )}

                {entry.highlights && entry.highlights.length > 0 && (
                  <ul className="mt-4 space-y-2">
                    {entry.highlights.map((highlight, index) => (
                      <li key={index} className="flex gap-3 text-body">
                        <span
                          aria-hidden
                          className="mt-2 size-1.5 shrink-0 rounded-full bg-accent"
                        />
                        <span className="text-ink">{highlight}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {entry.links && entry.links.length > 0 && (
                  <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1">
                    {entry.links.map((link) => (
                      <li key={link.url}>
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-small text-accent underline-offset-4 hover:underline"
                        >
                          {link.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ol>
        )}

        <div className="mt-16 border-t border-border pt-8">
          <DexContextChip
            question="What work experience does Deepak have?"
            label="Ask Dex about his experience"
          />
        </div>
      </Container>
    </Section>
  );
}
