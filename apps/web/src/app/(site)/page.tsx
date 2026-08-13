import NeuralFace3DClient from "@/features/hero-scene/neural-face/NeuralFace3DClient";
import { Mission } from "@/features/landing/sections/mission";
import { Collaborate } from "@/features/landing/sections/collaborate";
import { FeaturedPosts } from "@/features/posts/featured-posts";
import { RecentPosts } from "@/features/posts/recent-posts";
import { ProjectTimeline } from "@/features/timeline/project-timeline";

/**
 * Landing — the Landing Experience (D-052 Track 2, extended D-056/D-058
 * Phase D/E).
 *
 *   1. Hero         — the 3D neural-face: face → dive → inner network
 *   2. Mission      — what he's building, why he's different
 *   3. Featured Posts — horizontal carousel, ordered, ends in "See all
 *                        posts" (self-hides when nothing is featured)
 *   4. Posts        — horizontal carousel, newest first, "More posts" link
 *                      (self-hides entirely when empty — LAW-008,
 *                      docs/30 Phase D, carousel redesign)
 *   5. Timeline     — zig-zag project spine, owner-ordered (self-hides
 *                      when no project has a timeline position — D-058
 *                      Phase E)
 *   6. Collaborate  — the quiet close
 *
 * Evidence (the domains list + trust seeds) was removed 2026-08-13 —
 * owner asked explicitly, after leaving it up as a standing question
 * through the Phase E rollout. The component (`features/landing/sections
 * /evidence.tsx`) is left in the repo, unmounted — social links live in
 * the footer regardless.
 *
 * D-052 (supersedes D-050 Track 1): the Canvas2D hero is retired from `/`
 * (its renderer stays in the repo for poster generation + emergency
 * fallback). The hero region's poster is the LCP element and the permanent
 * fallback; the 3D scene mounts client-only after idle, three.js never in
 * `/` First Load JS. The ratified copy overlays the hero (DOM).
 */
export default function LandingPage() {
  return (
    <>
      <NeuralFace3DClient />
      <Mission />
      <FeaturedPosts />
      <RecentPosts />
      <ProjectTimeline />
      <Collaborate />
    </>
  );
}
