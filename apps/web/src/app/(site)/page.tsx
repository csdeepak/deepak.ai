import { HeroSceneRegion } from "@/features/hero-scene/HeroSceneRegion";
import { Arrival } from "@/features/landing/sections/arrival";
import { Mission } from "@/features/landing/sections/mission";
import { Evidence } from "@/features/landing/sections/evidence";
import { Collaborate } from "@/features/landing/sections/collaborate";

/**
 * Landing — the Landing Experience (docs/24 bible + landing IA rebuild).
 *
 * A four-beat story, built around the live workspace scene:
 *   1. Arrival    — identity, inside the scene (the hero region)
 *   2. Mission    — what he's building, why he's different
 *   3. Evidence   — the domains of work + honest trust seeds
 *   4. Collaborate— the quiet close
 *
 * The scene runs in `ambient` mode: the graph is atmosphere, not a data
 * claim, until real ContentService data feeds it (no fake data). The
 * Tier-0 floor (no 3D) is the server-rendered Arrival — LCP is the
 * headline text, never the canvas.
 */
export default function LandingPage() {
  return (
    <>
      <HeroSceneRegion ambient>
        <Arrival />
      </HeroSceneRegion>
      <Mission />
      <Evidence />
      <Collaborate />
    </>
  );
}
