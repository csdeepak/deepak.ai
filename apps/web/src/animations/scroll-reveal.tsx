"use client";

import { useEffect, useLayoutEffect, useRef, type ReactNode } from "react";
import { usePathname } from "next/navigation";

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  /**
   * "trigger" (D-074): never hidden itself. It only marks when it is first
   * seen, for children that run their own entrance (the landing gallery
   * strip). It fires on the first visible pixel, not at 20%: a tall cluster
   * would otherwise sit blank while most of it is already on screen.
   */
  variant?: "fade" | "trigger";
}

/**
 * `scroll-reveal` recipe (docs/15 §4, DESIGN_SYSTEM §4): 400ms fade + 12px
 * rise on `--ease-instrument`, at ~20% visibility, once, never re-triggers.
 * Under reduced motion the content is simply present (docs/08 parity map) —
 * content always exists in the DOM regardless (XA §11).
 *
 * D-072: this used to be a `motion.div` with `whileInView`, which put the
 * whole Motion runtime (34 kB gzipped) into the first load of `/` and every
 * other page — for one fade. The visual contract is unchanged: the hidden
 * state, the transition and the reduced-motion parity now live in CSS
 * (`[data-reveal]` in globals.css, transform/opacity only, so it runs on the
 * compositor), and one IntersectionObserver shared by every instance flips a
 * data attribute.
 *
 * Two more things the old version got wrong, both measured:
 * - It could not reveal anything until React hydrated. A visitor who reached
 *   the Mission block early on a throttled phone looked at an empty band for
 *   a median 1.45s. `RevealBootstrap` (reveal-bootstrap.tsx, rendered by the
 *   site layout) now observes every
 *   block straight from the HTML, before any bundle runs; this component's
 *   effect remains the path for blocks that arrive by client navigation. The
 *   attribute that script adds is why the div suppresses hydration warnings.
 * - Every client navigation re-mounted the blocks hidden, so pressing Back
 *   to the landing faded already-seen content in again (opacity 0 → 1). The
 *   reveal is once per visit (docs/08: "never re-fire"): each block is keyed
 *   by route + its order among the page's reveal blocks, and a block already
 *   revealed this visit mounts in its final state. Blocks never reached still
 *   reveal. Two keys that did not work, both measured: "is it in view at
 *   mount" (Next restores the scroll position after this layout effect), and
 *   useId (it is tree-based when hydrating but counter-based on a client
 *   render, so the first visit and the return never shared a key).
 */

type Reveal = (element: Element, onReveal: () => void) => () => void;

/** One observer per threshold for the whole page, created on first use. */
const observers = new Map<number, Reveal>();
/** Blocks revealed during this visit, as `pathname#order`. */
const seen = new Set<string>();
const callbacks = new WeakMap<Element, () => void>();

function getObserver(threshold: number): Reveal {
  const existing = observers.get(threshold);
  if (existing) return existing;
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.setAttribute("data-revealed", "");
        callbacks.get(entry.target)?.();
        io.unobserve(entry.target);
      }
    },
    { threshold },
  );
  const observe: Reveal = (element, onReveal) => {
    callbacks.set(element, onReveal);
    io.observe(element);
    return () => io.unobserve(element);
  };
  observers.set(threshold, observe);
  return observe;
}

export function ScrollReveal({ children, className, variant = "fade" }: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const keyOf = (element: Element) =>
    `${pathname}#${[...document.querySelectorAll("[data-reveal]")].indexOf(element)}`;

  // Before paint: a block already revealed this visit returns in its final
  // state instead of fading in again. `data-reveal-seen` lets the children of
  // a trigger skip their own entrance the same way.
  useLayoutEffect(() => {
    const element = ref.current;
    if (!element || element.hasAttribute("data-revealed") || !seen.has(keyOf(element))) return;
    element.style.transition = "none";
    element.setAttribute("data-reveal-seen", "");
    element.setAttribute("data-revealed", "");
    void element.offsetHeight; // commit the final state without a transition
    element.style.transition = "";
    // eslint-disable-next-line react-hooks/exhaustive-deps -- keyOf reads only pathname
  }, [pathname]);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const key = keyOf(element);
    const remember = () => {
      seen.add(key);
    };
    // Revealed already — by the HTML bootstrap, or by the effect above.
    if (element.hasAttribute("data-revealed")) return remember();
    if (typeof IntersectionObserver === "undefined") {
      element.setAttribute("data-revealed", "");
      return remember();
    }
    return getObserver(variant === "trigger" ? 0 : 0.2)(element, remember);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- keyOf reads only pathname
  }, [pathname]);

  return (
    <div
      ref={ref}
      data-reveal={variant === "trigger" ? "trigger" : ""}
      className={className}
      suppressHydrationWarning
    >
      {children}
    </div>
  );
}

