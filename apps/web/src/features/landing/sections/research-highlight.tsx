import Link from "next/link";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { ScrollReveal } from "@/animations/scroll-reveal";
import { ROUTES } from "@/constants/routes";
import { researchHighlight } from "../../../../content/site";

/**
 * S3 — Research Highlight (specs/landing.md §2.3). Absorbs the
 * publications preview as a stat strip. Stats fade with the section —
 * never count up (DSVL §15 odometer ban). Self-hides without a theme.
 *
 * R2 differentiation rule: S3's future figure must differ in kind
 * from the hero's constellation (theme figure, not a second graph) —
 * deferred until a real theme exists. TODO(asset): theme motif.
 */
export function ResearchHighlight() {
  if (!researchHighlight) return null;
  const r = researchHighlight;

  return (
    <Section aria-labelledby="research-heading">
      <Container width="content">
        <ScrollReveal>
          <h2 id="research-heading" className="text-h2 font-semibold">
            Research
          </h2>
          <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-12">
            <div className="md:col-span-7">
              <h3 className="text-h4 font-medium">{r.themeName}</h3>
              <p className="mt-3 max-w-reading text-body text-muted">
                {r.question}
              </p>
              <p className="mt-6">
                <Link
                  href={ROUTES.research}
                  className="text-small text-muted hover:text-ink"
                >
                  Explore research →
                </Link>
              </p>
            </div>
            <dl className="flex gap-10 md:col-span-5 md:justify-end">
              <div>
                <dd className="text-h1 font-semibold tabular">
                  {r.publicationCount}
                </dd>
                <dt className="text-small text-muted">publications</dt>
              </div>
              <div>
                <dd className="text-h1 font-semibold tabular">
                  {r.venueCount}
                </dd>
                <dt className="text-small text-muted">venues</dt>
              </div>
              <div>
                <dd className="text-h1 font-semibold tabular">{r.yearSpan}</dd>
                <dt className="text-small text-muted">years</dt>
              </div>
            </dl>
          </div>
        </ScrollReveal>
      </Container>
    </Section>
  );
}
