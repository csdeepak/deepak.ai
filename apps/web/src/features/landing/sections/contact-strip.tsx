import Link from "next/link";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { CopyButton } from "@/components/ui/copy-button";
import { ScrollReveal } from "@/animations/scroll-reveal";
import { ROUTES } from "@/constants/routes";
import { siteContent } from "../../../../content/site";

/**
 * S7 — Contact strip (specs/landing.md §2.7). In v1.0 this absorbs the
 * page's resolution beat (R3 — Dex Preview is v1.5 and does not render;
 * graceful absence, XA §0.3). Maximal whitespace above: the page's
 * final breath. Email is copyable AND a real link (copy is never the
 * only path).
 */
export function ContactStrip() {
  return (
    <Section
      aria-labelledby="contact-heading"
      className="pt-20 md:pt-40"
    >
      <Container width="reading">
        <ScrollReveal>
          <h2 id="contact-heading" className="text-h2 font-semibold">
            Collaborate
          </h2>
          <p className="mt-3 text-body text-muted">
            {siteContent.contactSentence}
          </p>
          {siteContent.contactEmail && (
            <p className="mt-6 flex items-center gap-2">
              <a
                href={`mailto:${siteContent.contactEmail}`}
                className="font-mono text-body text-accent underline-offset-2 hover:underline"
              >
                {siteContent.contactEmail}
              </a>
              <CopyButton
                value={siteContent.contactEmail}
                label="Copy email address"
              />
            </p>
          )}
          <p className="mt-6">
            <Link
              href={ROUTES.contact}
              className="text-small text-muted hover:text-ink"
            >
              Contact →
            </Link>
          </p>
        </ScrollReveal>
      </Container>
    </Section>
  );
}
