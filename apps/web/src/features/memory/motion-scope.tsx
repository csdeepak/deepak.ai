"use client";

import { MotionConfig } from "motion/react";
import type { ReactNode } from "react";

/**
 * Motion's reduced-motion parity, scoped to the one route that animates with
 * it. Until D-072 this `MotionConfig` wrapped every page from the root
 * provider, which shipped the Motion runtime in every first load even where
 * nothing used it. /memory is the only consumer (AnimatePresence and the
 * reconstruction sequence), so the config lives with it.
 */
export function MemoryMotionScope({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
