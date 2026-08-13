import NeuralFace3DClient from "@/features/hero-scene/neural-face/NeuralFace3DClient";
import { Mission } from "@/features/landing/sections/mission";
import { Evidence } from "@/features/landing/sections/evidence";
import { Collaborate } from "@/features/landing/sections/collaborate";
import { FeaturedPosts } from "@/features/posts/featured-posts";
import { RecentPosts } from "@/features/posts/recent-posts";

/**
 * Landing — the Landing Experience (D-052 Track 2, extended D-056/D-058
 * Phase D).
 *
 *   1. Hero         — the 3D neural-face: face → dive → inner network
 *   2. Mission      — what he's building, why he's different
 *   3. Featured Posts — horizontal carousel, ordered, ends in "See all
 *                        posts" (self-hides when nothing is featured)
 *   4. Posts        — horizontal carousel, newest first, "More posts" link
 *                      (self-hides entirely when empty — LAW-008,
 *                      docs/30 Phase D, carousel redesign)
 *   5. Evidence     — the domains of work + honest trust seeds
 *   6. Collaborate  — the quiet close
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
      <Evidence />
      <Collaborate />
    </>
  );
}
