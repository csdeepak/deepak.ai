import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { CopyButton } from "@/components/ui/copy-button";
import { DexContextChip } from "@/features/dex/dex-context-chip";
import { ROUTES } from "@/constants/routes";
import { contentService } from "@/services";
import { siteContent, mission } from "../../../../content/site";

/**
 * /about — the 90-second fast path as a page (LAW-009).
 *
 * Why this page exists: the site had no About page at all, which is the one
 * page an evaluator looks for by name. Until now the only route to "who is
 * this" was scrolling the hero and Mission on the landing, or asking Dex.
 *
 * Why it is built the way it is: LAW-002 says identity is discovered, never
 * introduced — so this is deliberately not a personal essay. It states the
 * thesis, then immediately hands over to *evidence*: real counts of published
 * work, each linked. Every number here is computed from published content at
 * build time, never written by hand, so it cannot drift or be inflated
 * (the no-fake-data law).
 *
 * Every optional field self-hides: no CV link until `cvUrl` is set, no
 * current-focus line if it is null, no social link that isn't filled in.
 */
export const metadata: Metadata = {
  title: "About",
  description:
    "Who Deepak is, what he is building, and the published work that evidences it.",
};

/**
 * The freshness rule from specs/landing.md R5: a "currently working on" claim
 * older than 30 days stops claiming to be current. Staleness is this brand's
 * mortal enemy, and an out-of-date "currently" is a small lie.
 */
const FOCUS_FRESH_DAYS = 30;

function focusIsFresh(updatedAt: string): boolean {
  const then = new Date(updatedAt).getTime();
  if (Number.isNaN(then)) return false;
  return (Date.now() - then) / 86_400_000 <= FOCUS_FRESH_DAYS;
}

export default async function AboutPage() {
  const [projects, posts, experience] = await Promise.all([
    contentService.getProjects(),
    contentService.getPosts(),
    contentService.getTimeline(),
  ]);

  const activeProjects = projects.filter(
    (project) => project.projectStatus === "active",
  ).length;

  const { currentFocus, cvUrl, contactEmail, outbound } = siteContent;
  const showFocus = currentFocus && focusIsFresh(currentFocus.updatedAt);

  // Only counts that are actually non-zero are shown — a "0 posts" tile is
  // worse than no tile (LAW-008).
  const facts = [
    { label: "Published projects", value: projects.length, href: ROUTES.projects },
    { label: "Currently active", value: activeProjects, href: ROUTES.projects },
    { label: "Posts written", value: posts.length, href: ROUTES.posts },
  ].filter((fact) => fact.value > 0);

  const links = [
    { label: "GitHub", href: outbound.github },
    { label: "LinkedIn", href: outbound.linkedin },
    { label: "Scholar", href: outbound.scholar },
    { label: "X", href: outbound.x },
    { label: "Instagram", href: outbound.instagram },
  ].filter((link): link is { label: string; href: string } => Boolean(link.href));

  return (
    <Section>
      <Container width="content">
        <header className="max-w-[56ch]">
          <p className="font-mono text-micro uppercase tracking-[0.2em] text-faint">
            About
          </p>
          <h1 className="mt-4 text-section font-display font-semibold text-ink">
            {siteContent.identitySentence}
          </h1>
          {siteContent.identitySupport && (
            <p className="mt-6 text-lead text-muted">
              {siteContent.identitySupport}
            </p>
          )}
        </header>

        {showFocus && currentFocus && (
          <section
            aria-labelledby="focus-heading"
            className="mt-14 rounded-md border border-border bg-surface p-6 theme-surface"
          >
            <h2
              id="focus-heading"
              className="font-mono text-micro uppercase tracking-[0.18em] text-accent"
            >
              Currently
            </h2>
            <p className="mt-3 max-w-[60ch] text-body text-ink">
              {currentFocus.phrase}
            </p>
            <p className="mt-3 font-mono text-micro tabular text-faint">
              updated {currentFocus.updatedAt}
            </p>
          </section>
        )}

        {/* The thesis, reused from the landing's Mission rather than restated
            in different words — two descriptions of the same person that drift
            apart is exactly the fragmentation this site exists to end. */}
        <section aria-labelledby="thesis-heading" className="mt-20">
          <h2
            id="thesis-heading"
            className="font-mono text-micro uppercase tracking-[0.2em] text-faint"
          >
            {mission.kicker}
          </h2>
          <p className="mt-6 max-w-4xl text-h3 font-display font-medium text-ink">
            {mission.statement}
          </p>
          <div className="mt-10 grid max-w-4xl grid-cols-1 gap-px overflow-hidden rounded-md border border-border bg-border sm:grid-cols-3">
            {mission.pillars.map((pillar) => (
              <div key={pillar.label} className="bg-canvas p-6">
                <h3 className="font-mono text-micro uppercase tracking-[0.18em] text-accent">
                  {pillar.label}
                </h3>
                <p className="mt-3 text-body text-muted">{pillar.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Evidence, counted from real published content at build time. */}
        {facts.length > 0 && (
          <section aria-labelledby="record-heading" className="mt-20">
            <h2
              id="record-heading"
              className="font-mono text-micro uppercase tracking-[0.2em] text-faint"
            >
              The record
            </h2>
            <ul className="mt-6 grid grid-cols-1 gap-px overflow-hidden rounded-md border border-border bg-border sm:grid-cols-3">
              {facts.map((fact) => (
                <li key={fact.label} className="bg-canvas">
                  <Link
                    href={fact.href}
                    className="group block p-6 transition-colors duration-(--duration-hover) hover:bg-surface"
                  >
                    {/* Numbers settle, they never count up (docs/24 §0.3). */}
                    <span className="block font-mono text-h2 tabular text-ink">
                      {fact.value}
                    </span>
                    <span className="mt-1 block text-small text-muted">
                      {fact.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-small text-faint">
              Counted from what is published here, not written by hand.
            </p>
          </section>
        )}

        {/* Experience — the most common recruiter screen (docs/31 §7.2), and
            absent from this site entirely until D-064 built the admin CRUD to
            create it. Shows the three most recent; the full record lives at
            /timeline. Self-hides completely when there is nothing published,
            rather than rendering a heading over an empty rail. */}
        {experience.length > 0 && (
          <section aria-labelledby="experience-heading" className="mt-20">
            <div className="flex flex-wrap items-baseline justify-between gap-4">
              <h2
                id="experience-heading"
                className="font-mono text-micro uppercase tracking-[0.2em] text-faint"
              >
                Experience
              </h2>
              {experience.length > 3 && (
                <Link
                  href={ROUTES.timeline}
                  className="py-2 text-small text-accent underline-offset-4 hover:underline"
                >
                  Full record →
                </Link>
              )}
            </div>
            <ol className="mt-6 space-y-px overflow-hidden rounded-md border border-border bg-border">
              {experience.slice(0, 3).map((entry) => (
                <li
                  key={entry.slug}
                  className="flex flex-wrap items-baseline gap-x-4 gap-y-1 bg-canvas p-5"
                >
                  <span className="text-body font-medium text-ink">
                    {entry.role}
                  </span>
                  <span className="text-small text-muted">
                    {entry.organization}
                  </span>
                  <span className="ml-auto font-mono text-micro tabular text-faint">
                    {entry.startDate.slice(0, 4)}
                    {entry.endDate ? `–${entry.endDate.slice(0, 4)}` : "–present"}
                  </span>
                </li>
              ))}
            </ol>
          </section>
        )}

        <section aria-labelledby="reach-heading" className="mt-20">
          <h2
            id="reach-heading"
            className="font-mono text-micro uppercase tracking-[0.2em] text-faint"
          >
            Reach me
          </h2>

          {contactEmail && (
            <p className="mt-6 flex flex-wrap items-center gap-3">
              <a
                href={`mailto:${contactEmail}`}
                className="font-mono text-body text-accent underline-offset-4 hover:underline"
              >
                {contactEmail}
              </a>
              <CopyButton value={contactEmail} label="Copy email address" />
            </p>
          )}

          {siteContent.contactSentence && (
            <p className="mt-4 max-w-[52ch] text-body text-muted">
              {siteContent.contactSentence}
            </p>
          )}

          <div className="mt-8 flex flex-wrap items-center gap-3">
            {/* Self-hides until a real CV exists — no "coming soon" button. */}
            {cvUrl && (
              <a
                href={cvUrl}
                className="cta-pill cta-pill--energy"
                download
              >
                Download CV
              </a>
            )}
            {links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="me noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2.5 text-small text-muted transition-colors duration-(--duration-fast) hover:border-border-emphasis hover:text-ink"
              >
                {link.label}
                <ArrowUpRight className="size-3.5 shrink-0 text-faint" aria-hidden />
              </a>
            ))}
          </div>
        </section>

        <div className="mt-20 border-t border-border pt-8">
          <DexContextChip
            question="Why should we hire Deepak?"
            label="Ask Dex about Deepak"
          />
        </div>
      </Container>
    </Section>
  );
}
