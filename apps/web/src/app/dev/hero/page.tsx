import { notFound } from "next/navigation";
import { HeroSceneRegion } from "@/features/hero-scene/HeroSceneRegion";
import { Hero } from "@/features/landing/sections/hero";

/**
 * /dev/hero — the hero scene laboratory (Sprint H-01).
 *
 * The scene infrastructure is verified here in isolation before it
 * integrates into the landing (a later sprint, when acts/handoff and
 * real content exist). Production builds 404 this route — it is a
 * workbench, not a page.
 */
export default function HeroDevPage() {
  if (process.env.NODE_ENV === "production") notFound();

  return (
    <HeroSceneRegion>
      {/* Tier 0 content = the shipped landing hero, unchanged */}
      <Hero />
    </HeroSceneRegion>
  );
}
