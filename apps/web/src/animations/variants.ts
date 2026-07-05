import type { Variants } from "motion/react";
import { DURATION, EASE_OUT } from "./tokens";

/**
 * Reusable motion recipes (docs/15 §4). Components consume these —
 * never raw duration/easing pairs (anti-duplication rule).
 * Reduced-motion parity is handled globally by MotionConfig("user").
 */

/** `entrance` — opacity + ≤16px translate, base, once (docs/08). */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION.base, ease: EASE_OUT },
  },
};

export const fade: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: DURATION.base, ease: EASE_OUT },
  },
};

export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 24 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: DURATION.slow, ease: EASE_OUT },
  },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.98 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: DURATION.base, ease: EASE_OUT },
  },
};

/**
 * Stagger container — use sparingly: one focal motion per moment
 * (DSVL Law 15); never stagger two cards (specs/landing.md §2.2).
 */
export const staggerContainer = (staggerChildren = 0.06): Variants => ({
  hidden: {},
  visible: { transition: { staggerChildren } },
});
