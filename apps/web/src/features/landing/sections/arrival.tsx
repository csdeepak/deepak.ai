"use client";

import { Container } from "@/components/layout/container";
import { SoundToggle } from "@/components/ui/sound-toggle";
import { useHeroStore } from "@/features/hero-scene/shared/hero-store";
import { siteContent } from "../../../../content/site";

/**
 * Screen 1 — ARRIVAL (bible §6, landing IA). The identity lives INSIDE
 * the scene — anchored low-left like a title card, never a left-text /
 * right-image poster. The headline is server-rendered with a CSS-only
 * entrance (LCP never waits on JS).
 *
 * Scroll choreography: the sub-line tracks the scene's act as the camera
 * travels the ~200vh rail, so the pinned first screen reads as
 * progression, not a static hold. Everything here amplifies the scene;
 * it does not compete with it.
 */
const ACT_LINE: Record<number, string> = {
  0: "A researcher-engineer's workspace. Scroll to look around.",
  1: "The current work — close, and warm.",
  2: "The systems, in orbit.",
  3: "The research, glowing.",
  4: "And Dex — soon you'll be able to ask it anything about the work.",
};

export function Arrival() {
  const act = useHeroStore((s) => s.act);

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
