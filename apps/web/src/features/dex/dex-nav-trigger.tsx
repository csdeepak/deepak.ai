"use client";

import { useUiStore } from "@/stores/ui-store";
import { cn } from "@/lib/utils";

/**
 * DexNavTrigger — the persistent way into Dex, on every public page.
 *
 * Why this exists: until now `DexTrigger` was mounted in exactly one place,
 * the hero CTA row, and the hero copy fades to opacity 0 by 28% of the hero
 * scroll. A visitor who scrolled past the first screen — or who arrived on
 * /projects, /posts, a project detail page, or anywhere else — had no way to
 * reach Dex at all. The whole v2 answer pipeline was unreachable from most of
 * the site.
 *
 * The presence dot is deliberate, not decoration: docs/14 reserves it for Dex
 * and nothing else ("over years, the dot alone should mean the twin is here"),
 * and the breathing loop is the one ambient animation the design system
 * permits. `dl-breathe` already drops to static under prefers-reduced-motion.
 *
 * The label shows from 360px up (D-071). It used to hide below `sm` to make
 * room for the lanes; the lanes now live in the mobile menu, and a bare dot is
 * a cryptic door to the site's flagship feature for a first-time visitor. Below
 * 360px the dot alone still carries it. `aria-label` is unconditional, so the
 * accessible name survives the label being visually hidden.
 */
export function DexNavTrigger({ className }: { className?: string }) {
  const openDex = useUiStore((s) => s.openDex);

  return (
    <button
      type="button"
      onClick={() => openDex()}
      aria-label="Ask Dex about Deepak"
      aria-haspopup="dialog"
      className={cn(
        // min-h-9 because this is the site's primary new affordance and it
        // measured 26px tall on a phone from padding alone — above the 24px
        // WCAG 2.5.8 floor, but not a comfortable thumb target.
        "inline-flex min-h-9 items-center gap-2 rounded-full border border-border px-3 py-2",
        "text-micro text-muted transition-colors duration-(--duration-fast)",
        "hover:border-border-emphasis hover:text-ink",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
        className,
      )}
    >
      <span
        aria-hidden
        className="dl-breathe size-2 shrink-0 rounded-full bg-accent shadow-[0_0_10px_var(--interactive-default)]"
      />
      <span className="hidden whitespace-nowrap min-[360px]:inline">Ask Dex</span>
    </button>
  );
}
