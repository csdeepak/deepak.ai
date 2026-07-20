import { NeuralFaceHeroRegion } from "@/features/neural-face/NeuralFaceHeroRegion";
import { Arrival } from "@/features/landing/sections/arrival";
import { Mission } from "@/features/landing/sections/mission";
import { Evidence } from "@/features/landing/sections/evidence";
import { Collaborate } from "@/features/landing/sections/collaborate";

/**
 * Landing — the Landing Experience (docs/24 bible + landing IA rebuild).
 *
 * A four-beat story, built around the hero:
 *   1. Arrival    — identity, over the "Neural Face Lite" hero (D-050)
 *   2. Mission    — what he's building, why he's different
 *   3. Evidence   — the domains of work + honest trust seeds
 *   4. Collaborate— the quiet close
 *
 * D-050 amendment: the ambient R3F scene was removed from `/`; the hero
 * atmosphere is now the dependency-free Canvas2D `NeuralFaceHeroRegion`.
 * The 3D scene lives only at `/dev/hero`. To restore it for v1.5, swap
 * `NeuralFaceHeroRegion` back for `HeroSceneRegion ambient` here (one
 * line) — see memory/DECISIONS.md D-050.
 *
 * The Tier-0 floor is the server-rendered Arrival copy — LCP is the
 * headline text, never the canvas (which fetches its data and self-hides
 * on any failure).
 */
export default function LandingPage() {
  return (
    <>
      <NeuralFaceHeroRegion>
        <Arrival />
      </NeuralFaceHeroRegion>
      <Mission />
      <Evidence />
      <Collaborate />
    </>
  );
}
