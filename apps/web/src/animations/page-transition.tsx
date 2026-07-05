"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";
import { DURATION, EASE_OUT } from "./tokens";

/**
 * `page` recipe (docs/15 §4): content-first crossfade at `slow`.
 * Content renders immediately — motion accompanies, never gates
 * (DSVL Law 14). Shared-element transitions (card → detail) use the
 * View Transitions API and land with Sprint 1.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: DURATION.slow, ease: EASE_OUT }}
    >
      {children}
    </motion.div>
  );
}
