import { Github } from "lucide-react";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { ScrollReveal } from "@/animations/scroll-reveal";
import { domains, siteContent } from "../../../../content/site";

/**
 * Screen 3 — EVIDENCE. Answers "why should I trust him?" and "what can
 * I explore?" without a project dump (curiosity over listing) and
 * without fabricated content.
 *
 * The domains are the intellectual TERRITORY (real focus areas, not
 * projects) — rendered as a hover-alive system that echoes the scene's
 * graph, so the visitor wants to run their eye across it. Trust seeds
 * (real external presence) appear only when their URL exists (graceful
 * absence); nothing links to an internal page that isn't built yet.
 */
export function Evidence() {
  const { github, scholar, linkedin, x, instagram } = siteContent.outbound;
  const hasSeeds = Boolean(github || scholar || linkedin || x || instagram);

  return (
    <Section aria-labelledby="evidence-heading" className="py-24 md:py-40">
      <Container width="content">
        <ScrollReveal>
          <p className="font-mono text-small uppercase tracking-[0.2em] text-faint">
            The work
          </p>
          <h2
            id="evidence-heading"
            className="mt-6 max-w-[20ch] text-h1 font-medium leading-tight tracking-tight text-ink"
          >
            The territory: intelligent systems, and the research that keeps them
            honest.
          </h2>

          {/* The domains — a hover-alive index (pure CSS group-hover; no
              JS, no fake links). Each note is always visible (touch/AT). */}
          <ul className="mt-14 grid grid-cols-1 gap-x-10 gap-y-6 sm:grid-cols-2">
            {domains.map((d) => (
              <li key={d.name} className="group flex items-start gap-4">
                <span
                  aria-hidden
                  className="mt-2 size-2 shrink-0 rounded-full border border-border-emphasis transition-colors duration-(--duration-fast) group-hover:border-accent group-hover:bg-accent"
                />
                <span>
                  <span className="text-body font-medium text-muted transition-colors duration-(--duration-fast) group-hover:text-ink">
                    {d.name}
                  </span>
                  <span className="block text-small text-faint">{d.note}</span>
                </span>
              </li>
            ))}
          </ul>

          {/* Honest status + trust seeds. */}
          <div className="mt-16 flex flex-col gap-6 border-t border-border pt-8 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-[42ch] text-small text-muted">
              The systems and papers are being documented here — this is where
              they will live.
            </p>
            {hasSeeds && (
              <nav
                aria-label="Elsewhere"
                className="flex items-center gap-6 text-small"
              >
                {github && (
                  <a
                    href={github}
                    className="inline-flex items-center gap-2 text-muted transition-colors duration-(--duration-fast) hover:text-ink"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Github className="size-4" aria-hidden />
                    GitHub
                  </a>
                )}
                {scholar && (
                  <a
                    href={scholar}
                    className="text-muted transition-colors duration-(--duration-fast) hover:text-ink"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Scholar
                  </a>
                )}
                {linkedin && (
                  <a
                    href={linkedin}
                    className="text-muted transition-colors duration-(--duration-fast) hover:text-ink"
                    target="_blank"
                    rel="noreferrer"
                  >
                    LinkedIn
                  </a>
                )}
                {x && (
                  <a
                    href={x}
                    className="text-muted transition-colors duration-(--duration-fast) hover:text-ink"
                    target="_blank"
                    rel="noreferrer"
                  >
                    X
                  </a>
                )}
                {instagram && (
                  <a
                    href={instagram}
                    className="text-muted transition-colors duration-(--duration-fast) hover:text-ink"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Instagram
                  </a>
                )}
              </nav>
            )}
          </div>
        </ScrollReveal>
      </Container>
    </Section>
  );
}
