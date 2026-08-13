import NeuralFace3DClient from "@/features/hero-scene/neural-face/NeuralFace3DClient";
import { Mission } from "@/features/landing/sections/mission";
import { Evidence } from "@/features/landing/sections/evidence";
import { Collaborate } from "@/features/landing/sections/collaborate";
import { FeaturedPost } from "@/features/posts/featured-post";
import { RecentPosts } from "@/features/posts/recent-posts";

/**
 * Landing — the Landing Experience (D-052 Track 2, extended D-056/D-058
 * Phase D).
 *
 *   1. Hero         — the 3D neural-face: face → dive → inner network
 *   2. Mission      — what he's building, why he's different
 *   3. Posts        — Featured, then Recent (5) + "More posts" (self-hide
 *                      entirely when empty, LAW-008 — docs/30 Phase D)
 *   4. Evidence     — the domains of work + honest trust seeds
 *   5. Collaborate  — the quiet close
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
      <FeaturedPost />
      <RecentPosts />
      <Evidence />
      <Collaborate />
    </>
  );
}
