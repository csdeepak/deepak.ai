import type { Metadata } from "next";
import { ArrowUpRight, FileText } from "lucide-react";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/content/empty-state";
import { CopyButton } from "@/components/ui/copy-button";
import { DexContextChip } from "@/features/dex/dex-context-chip";
import { contentService } from "@/services";
import type { Publication } from "@/types/content";

/**
 * /publications — the research half of the record.
 *
 * `publications` has had a full schema since D-043 and `/admin/publications`
 * was a 21-line stub reading "ships in the next sprint". For a site whose
 * whole thesis is the researcher–engineer dual identity (docs/01), the
 * research half could not be entered, so it could not be shown. D-065 built
 * the admin; this is the page it feeds.
 *
 * Zero publications is a legitimate, visible state (`docs/SESSION_START` §6:
 * "No publications? The shelf is visibly, unashamedly empty"). This page
 * renders that honestly rather than hiding, because an empty research shelf on
 * a student's portfolio is true and unembarrassing — and the honesty is the
 * point of the whole system.
 */
export const metadata: Metadata = {
  title: "Publications",
  description:
    "Papers, preprints and work under review — each with a plain-language summary.",
};

/** `preprint` and `under-review` are honest states, not lesser ones. */
const STATUS_LABEL: Record<string, string> = {
  preprint: "Preprint",
  "under-review": "Under review",
  published: "Published",
};

function displayDate(publication: Publication): string {
  if (publication.pubDate) {
    const date = new Date(publication.pubDate);
    if (!Number.isNaN(date.getTime())) {
      return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
    }
  }
  return String(publication.year);
}

export default async function PublicationsPage() {
  const publications = await contentService.getPublications();

  return (
    <Section>
      <Container width="content">
        <header className="max-w-[52ch]">
          <p className="font-mono text-micro uppercase tracking-[0.2em] text-faint">
            Research
          </p>
          <h1 className="mt-4 text-section font-display font-semibold text-ink">
            Publications
          </h1>
          <p className="mt-4 text-lead text-muted">
            Each with a plain-language summary alongside the abstract — the
            result should be legible whether or not you read papers for a living.
          </p>
        </header>

        {publications.length === 0 ? (
          <EmptyState
            className="mt-12"
            title="No publications are listed here yet."
            body="This shelf is honestly empty rather than padded. When something is published, preprinted, or under review, it appears here with its abstract and a plain summary."
          />
        ) : (
          <ul className="mt-14 space-y-px overflow-hidden rounded-md border border-border bg-border">
            {publications.map((publication) => (
              <li key={publication.slug} className="bg-canvas p-6 sm:p-8">
                <div className="flex flex-wrap items-center gap-3 text-micro text-faint">
                  <span className="font-mono tabular">
                    {displayDate(publication)}
                  </span>
                  {publication.venue && (
                    <>
                      <span aria-hidden>·</span>
                      <span>{publication.venue}</span>
                    </>
                  )}
                  {publication.pubStatus &&
                    publication.pubStatus !== "published" && (
                      <Badge tone="info">
                        {STATUS_LABEL[publication.pubStatus] ??
                          publication.pubStatus}
                      </Badge>
                    )}
                </div>

                <h2 className="mt-3 text-card-title font-display font-semibold text-ink">
                  {publication.title}
                </h2>

                {publication.authors.length > 0 && (
                  <p className="mt-2 text-small text-muted">
                    {publication.authors.join(", ")}
                  </p>
                )}

                {/* The researcher→engineer bridge leads, not the abstract. */}
                {publication.plainSummary && (
                  <p className="mt-4 max-w-[64ch] text-body text-ink">
                    {publication.plainSummary}
                  </p>
                )}

                {publication.abstract && (
                  <details className="group mt-4">
                    <summary className="cursor-pointer text-small text-accent underline-offset-4 hover:underline">
                      Abstract
                    </summary>
                    <p className="mt-3 max-w-[68ch] text-body text-muted">
                      {publication.abstract}
                    </p>
                  </details>
                )}

                <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-small">
                  {publication.pdfUrl && (
                    <EvidenceLink href={publication.pdfUrl} label="PDF" icon />
                  )}
                  {publication.arxivUrl && (
                    <EvidenceLink href={publication.arxivUrl} label="arXiv" />
                  )}
                  {publication.doi && (
                    <EvidenceLink
                      href={`https://doi.org/${publication.doi}`}
                      label={`DOI ${publication.doi}`}
                    />
                  )}
                  {publication.bibtex && (
                    <span className="inline-flex items-center gap-2 text-muted">
                      BibTeX
                      <CopyButton
                        value={publication.bibtex}
                        label={`Copy BibTeX for ${publication.title}`}
                      />
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-16 border-t border-border pt-8">
          <DexContextChip
            question="What research has Deepak published?"
            label="Ask Dex about his research"
          />
        </div>
      </Container>
    </Section>
  );
}

function EvidenceLink({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon?: boolean;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-1.5 text-accent underline-offset-4 hover:underline"
    >
      {icon && <FileText className="size-4 shrink-0" aria-hidden />}
      {label}
      <ArrowUpRight className="size-3.5 shrink-0 text-faint" aria-hidden />
    </a>
  );
}
