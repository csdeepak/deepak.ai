import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { CopyButton } from "@/components/ui/copy-button";
import { ScrollReveal } from "@/animations/scroll-reveal";
import { siteContent } from "../../../../content/site";

/**
 * The close — COLLABORATE. The landing's final breath: maximal
 * whitespace above, one honest invitation, one real action. The email
 * is copyable AND a link (copy is never the only path). Absorbs the
 * page's resolution beat in v1.0 (Dex preview is v1.5; graceful absence).
 */
export function Collaborate() {
  const { contactEmail, contactSentence } = siteContent;

  return (
    <Section aria-labelledby="collaborate-heading" className="py-28 md:py-48">
      <Container width="reading">
        <ScrollReveal>
          <h2
            id="collaborate-heading"
            className="text-section font-display font-medium text-ink"
          >
            Let&rsquo;s build something worth understanding.
          </h2>
          <p className="mt-5 max-w-[48ch] text-lead text-muted">
            {contactSentence}
          </p>

          {contactEmail && (
            <p className="mt-8 flex items-center gap-3">
              <a
                href={`mailto:${contactEmail}`}
                className="font-mono text-body text-accent underline-offset-4 hover:underline"
              >
                {contactEmail}
              </a>
              <CopyButton value={contactEmail} label="Copy email address" />
            </p>
          )}
        </ScrollReveal>
      </Container>
    </Section>
  );
}
