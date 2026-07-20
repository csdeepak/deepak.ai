"use client";

import { Container } from "@/components/layout/container";
import { SoundToggle } from "@/components/ui/sound-toggle";
import { useScrollAct } from "@/features/neural-face/use-scroll-act";
import { siteContent } from "../../../../content/site";

/**
 * Screen 1 — ARRIVAL (bible §6, landing IA). The identity lives OVER the
 * hero — anchored low-left like a title card, never a left-text /
 * right-image poster. The headline is server-rendered with a CSS-only
 * entrance (LCP never waits on JS).
 *
 * Sub-line: a calm progression driven by native scroll through the hero
 * region (D-050 amendment — `useScrollAct`, dependency-free). It replaced
 * the old `useHeroStore` scene-act coupling when the ambient R3F scene was
 * removed from `/`. The face is atmosphere; the copy does not compete.
 *
 * NOTE (copy — owner ruling pending): these ambient sub-lines were rewritten
 * for the no-3D-scene hero (the old lines narrated the scene's camera acts
 * and Dex, which no longer render on `/` — keeping them would have been
 * dishonest, LAW-008). They are authored dev copy, not owner-ratified —
 * flagged for review.
 */
const ACT_LINE: Record<number, string> = {
  0: "A researcher-engineer, read as a network of the work.",
  1: "Systems, memory, and the questions between them.",
  2: "Everything here is real, or it isn't shown.",
  3: "Keep scrolling — the work comes first.",
};

export function Arrival() {
  const act = useScrollAct();

  return (
    <Container
      width="content"
      className="flex h-svh flex-col justify-end pb-[12svh] md:pb-[14svh]"
    >
      {/* Identity, single-sourced from content/site.ts (single-writer law).
          Heading + supporting line each self-hide if their field is empty. */}
      <div className="animate-entrance">
        <p className="font-mono text-small text-faint">{siteContent.name}</p>
        {siteContent.identitySentence && (
          <h1 className="mt-4 max-w-[18ch] text-display font-semibold leading-[1.02] tracking-tight text-ink">
            {siteContent.identitySentence}
          </h1>
        )}
        {siteContent.identitySupport && (
          <p className="mt-5 max-w-[52ch] text-reading text-muted">
            {siteContent.identitySupport}
          </p>
        )}
      </div>

      {/* Choreographed sub-line — fixed slot (no layout shift on change). */}
      <p className="mt-8 h-6 max-w-[46ch] text-body text-muted transition-opacity duration-(--duration-slow)">
        {ACT_LINE[act] ?? ACT_LINE[0]}
      </p>

      {/* Ambient controls: scroll cue + the sound placeholder. */}
      <div className="mt-10 flex items-center justify-between">
        {/* Static cue — the scene + the peek below ARE the motion; no
            second ambient loop (only Dex breathes, bible §6.3). */}
        <span className="flex items-center gap-3 text-faint">
          <span className="h-8 w-px bg-current opacity-60" aria-hidden />
          <span className="font-mono text-micro uppercase tracking-[0.2em]">
            Scroll
          </span>
        </span>
        <SoundToggle />
      </div>
    </Container>
  );
}
