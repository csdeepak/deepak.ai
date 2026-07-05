import { Hero } from "@/features/landing/sections/hero";
import { FeaturedWork } from "@/features/landing/sections/featured-work";
import { ResearchHighlight } from "@/features/landing/sections/research-highlight";
import { CurrentFocus } from "@/features/landing/sections/current-focus";
import { LatestPosts } from "@/features/landing/sections/latest-posts";
import { ContactStrip } from "@/features/landing/sections/contact-strip";
import { localContent } from "@/services/local-content";

/**
 * Landing page — specs/landing.md v1.1 (D-026, D-027).
 *
 * Section order is D-022's ratified 8 (claims in S1 only; S2–S6 are
 * evidence). Data sections self-hide while empty — the page grows as
 * real content is added; no fake data ever renders.
 *
 * Not rendered by design (graceful absence, XA §0.3):
 *  - S6 Dex Preview  → v1.5 (D-004); inserts between S5 and S7
 *  - News/Radar slot → v2   (D-006); inserts between S5 and S6
 * In v1.0 the resolution beat belongs to S7 + the footer stamp (R3).
 *
 * Static route: all data is resolved at build time — no client-side
 * fetching above S6 (spec §8 budget).
 */
export default async function LandingPage() {
  const [featured, latestPosts, currentSkills, timeline] = await Promise.all([
    localContent.getFeaturedProjects(2),
    localContent.getLatestPosts(3),
    localContent.getCurrentSkills(),
    localContent.getTimeline(),
  ]);

  const latestEntry =
    timeline
      .slice()
      .sort((a, b) => b.startDate.localeCompare(a.startDate))[0] ?? null;

  return (
    <>
      <Hero />
      <FeaturedWork projects={featured} />
      <ResearchHighlight />
      <CurrentFocus skills={currentSkills} latestEntry={latestEntry} />
      <LatestPosts posts={latestPosts} />
      <ContactStrip />
    </>
  );
}
