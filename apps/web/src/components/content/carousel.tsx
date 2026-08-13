"use client";

import { useRef, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Horizontal scroll carousel — preview/discovery surfaces (Featured Posts,
 * Posts) use this; reading a post itself is a normal vertical page, never
 * a carousel. Touch/swipe works natively via `overflow-x-auto` + CSS scroll-
 * snap, no JS required for mobile. Arrow buttons (desktop) are the only
 * client behaviour — everything else, including the cards themselves, can
 * stay server-rendered.
 */
export function Carousel({
  children,
  ariaLabel,
  className,
}: {
  children: ReactNode;
  ariaLabel: string;
  className?: string;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  function scrollByCard(direction: 1 | -1) {
    const el = scrollerRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-carousel-item]");
    const gap = 24; // matches gap-6 below
    const step = card ? card.offsetWidth + gap : el.clientWidth * 0.8;
    el.scrollBy({ left: direction * step });
  }

  return (
    <div className={cn("relative", className)}>
      <div
        ref={scrollerRef}
        role="group"
        aria-label={ariaLabel}
        className="carousel-scroller flex snap-x snap-mandatory gap-6 overflow-x-auto pb-2"
      >
        {children}
      </div>

      {/* Desktop-only — mobile relies on native swipe. */}
      <div className="pointer-events-none absolute inset-y-0 -left-4 hidden items-center md:flex">
        <button
          type="button"
          onClick={() => scrollByCard(-1)}
          aria-label="Scroll left"
          className="pointer-events-auto flex size-10 items-center justify-center rounded-full border border-border bg-canvas text-ink shadow-sm transition-colors duration-(--duration-fast) hover:border-border-emphasis hover:bg-surface"
        >
          <ChevronLeft className="size-5" aria-hidden />
        </button>
      </div>
      <div className="pointer-events-none absolute inset-y-0 -right-4 hidden items-center md:flex">
        <button
          type="button"
          onClick={() => scrollByCard(1)}
          aria-label="Scroll right"
          className="pointer-events-auto flex size-10 items-center justify-center rounded-full border border-border bg-canvas text-ink shadow-sm transition-colors duration-(--duration-fast) hover:border-border-emphasis hover:bg-surface"
        >
          <ChevronRight className="size-5" aria-hidden />
        </button>
      </div>
    </div>
  );
}
