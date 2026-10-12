"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Horizontal scroll carousel — preview/discovery surfaces (Featured Posts,
 * Posts) use this; reading a post itself is a normal vertical page, never
 * a carousel. Touch/swipe works natively via `overflow-x-auto` + CSS scroll-
 * snap, no JS required for mobile. Arrow buttons (desktop) are the only
 * client behaviour — everything else, including the cards themselves, can
 * stay server-rendered.
 *
 * D-072, measured before each change:
 * - The scroller clipped every card's focus ring (a 2px ring at 2px offset
 *   needs 4px the overflow box did not have). It now carries that room as
 *   padding, cancelled by a matching negative margin so cards rest exactly
 *   where they did.
 * - On a phone the scroller stopped 24px short of each screen edge, so cards
 *   were cut off inside the page rather than running off it. Below `md` it
 *   now bleeds to the edge (the same 24/48px as the Container gutter) and
 *   snaps with matching scroll-padding, so the first card still rests on the
 *   content edge. Sideways overscroll is contained so a swipe that hits the
 *   end does not navigate back in history.
 * - Arrows showed on a carousel that could not scroll, and "Scroll left" at
 *   the start did nothing while covering the first card. Arrows now render
 *   only when there is somewhere to go; at an end the arrow stays focusable
 *   (focus is never yanked away mid-keyboard-use) but is marked
 *   aria-disabled and lets clicks through to the card beneath.
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
  // Defaults match the server render (scrollLeft 0, assume scrollable) so
  // hydration agrees; the observer corrects them on the first frame.
  const [scrollable, setScrollable] = useState(true);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    let raf = 0;
    const measure = () => {
      raf = 0;
      const max = el.scrollWidth - el.clientWidth;
      setScrollable(max > 1);
      setAtStart(el.scrollLeft <= 1);
      setAtEnd(el.scrollLeft >= max - 1);
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(measure);
    };
    measure();
    const ro = new ResizeObserver(schedule);
    ro.observe(el);
    el.addEventListener("scroll", schedule, { passive: true });
    return () => {
      ro.disconnect();
      el.removeEventListener("scroll", schedule);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  function scrollByCard(direction: 1 | -1) {
    const el = scrollerRef.current;
    if (!el) return;
    if ((direction === -1 && atStart) || (direction === 1 && atEnd)) return;
    const card = el.querySelector<HTMLElement>("[data-carousel-item]");
    const gap = 24; // matches gap-6 below
    const step = card ? card.offsetWidth + gap : el.clientWidth * 0.8;
    el.scrollBy({ left: direction * step });
  }

  const arrowClass = (inert: boolean) =>
    cn(
      "flex size-10 items-center justify-center rounded-full border border-border bg-canvas text-ink transition-[color,border-color,background-color,opacity] duration-(--duration-fast) hover:border-border-emphasis hover:bg-surface active:border-border-emphasis",
      inert ? "pointer-events-none opacity-40" : "pointer-events-auto",
    );

  return (
    <div className={cn("relative", className)}>
      <div
        ref={scrollerRef}
        role="group"
        aria-label={ariaLabel}
        className="carousel-scroller -mx-6 -mt-1 flex snap-x snap-mandatory scroll-px-6 gap-6 overflow-x-auto overscroll-x-contain px-6 pt-1 pb-2 sm:-mx-12 sm:scroll-px-12 sm:px-12 md:-mx-1 md:scroll-px-1 md:px-1"
      >
        {children}
      </div>

      {/* Desktop-only — mobile relies on native swipe. Rendered only when
          the row actually overflows. */}
      {scrollable && (
        <>
          <div className="pointer-events-none absolute inset-y-0 -left-4 hidden items-center md:flex">
            <button
              type="button"
              onClick={() => scrollByCard(-1)}
              aria-label="Scroll left"
              aria-disabled={atStart || undefined}
              className={arrowClass(atStart)}
            >
              <ChevronLeft className="size-5" aria-hidden />
            </button>
          </div>
          <div className="pointer-events-none absolute inset-y-0 -right-4 hidden items-center md:flex">
            <button
              type="button"
              onClick={() => scrollByCard(1)}
              aria-label="Scroll right"
              aria-disabled={atEnd || undefined}
              className={arrowClass(atEnd)}
            >
              <ChevronRight className="size-5" aria-hidden />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
