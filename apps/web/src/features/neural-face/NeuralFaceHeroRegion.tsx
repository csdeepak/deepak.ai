import type { ReactNode } from "react";
import { NeuralFaceHero } from "./NeuralFaceHero";
import { HERO_REGION_VH } from "./constants";

/**
 * NeuralFaceHeroRegion — the landing hero region for Track 1 (D-050).
 *
 * Replaces `HeroSceneRegion` on `/` (D-050 amendment). Structurally it is
 * the same "sticky viewport, atmosphere behind, copy on top" pattern, but
 * self-contained: it depends on NOTHING in `features/hero-scene`. The 3D
 * scene continues to live at `/dev/hero`.
 *
 * Layering law (unchanged): `children` = the Tier-0 DOM copy, always
 * rendered and complete without the canvas. The face mounts BEHIND it as
 * pure enhancement; if the face never loads, the copy stands alone.
 *
 * This is a server component — the copy renders on the server; only the
 * <NeuralFaceHero /> island is client-side.
 */
export function NeuralFaceHeroRegion({ children }: { children: ReactNode }) {
  return (
    <section
      style={{ minHeight: `${HERO_REGION_VH}svh` }}
      className="relative"
    >
      <div className="sticky top-0 h-svh overflow-hidden">
        {/* Atmosphere (client island, decorative, behind the copy). */}
        <NeuralFaceHero />

        {/* Tier-0 DOM copy — always present, always complete. */}
        <div className="pointer-events-none relative z-10 [&_a]:pointer-events-auto [&_button]:pointer-events-auto">
          {children}
        </div>
      </div>
    </section>
  );
}
