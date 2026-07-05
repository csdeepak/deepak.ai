"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import { fadeUp } from "./variants";

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
}

/**
 * `scroll-reveal` recipe (docs/15 §4): entrance at ~20% visibility,
 * fires once, never re-triggers. Under reduced motion the content is
 * simply present (docs/08 parity map) — content always exists in the
 * DOM regardless (XA §11).
 */
export function ScrollReveal({ children, className }: ScrollRevealProps) {
  const reduced = useReducedMotion();

  if (reduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
    >
      {children}
    </motion.div>
  );
}
