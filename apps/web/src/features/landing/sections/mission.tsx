import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { ScrollReveal } from "@/animations/scroll-reveal";
import { mission } from "../../../../content/site";

/**
 * Screen 2 — MISSION. The landing's memorable core: what Deepak is
 * building and why he is different, as one confident editorial
 * statement (not a feature list). Answers "what is he building?" and
 * "why is he different?" in a single breath.
 *
 * Deliberately large type + wide margins: this is the beat that should
 * make an evaluator stop scrolling. No motif, no decoration — the
 * sentence is the design.
 */
export function Mission() {
  return (
    <Section
      aria-labelledby="mission-heading"
      className="py-24 md:py-40"
    >
      <Container width="content">
        <ScrollReveal>
          <p
            id="mission-heading"
            className="font-mono text-small uppercase tracking-[0.2em] text-faint"
          >
            {mission.kicker}
          </p>
          <p className="mt-8 max-w-4xl text-h1 font-medium leading-[1.16] tracking-tight text-ink md:text-[2.6rem]">
            {mission.statement}
          </p>

          <div className="mt-16 grid max-w-4xl grid-cols-1 gap-px overflow-hidden rounded-md border border-border bg-border sm:grid-cols-3">
            {mission.pillars.map((pillar) => (
              <div key={pillar.label} className="bg-canvas p-6">
                <h3 className="font-mono text-micro uppercase tracking-[0.18em] text-accent">
                  {pillar.label}
                </h3>
                <p className="mt-3 text-body text-muted">{pillar.body}</p>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </Container>
    </Section>
  );
}
