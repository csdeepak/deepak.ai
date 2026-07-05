"use client";

import { motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import { DURATION, EASE_OUT } from "@/animations/tokens";

/**
 * The graph motif — the hero's visual concept (specs/landing.md §2.1,
 * D-026): the content graph abstracted into the brand's drawn-line
 * language. Nodes = content types, edges = relation kinds (dashed =
 * `references`, solid = typed relations).
 *
 * R2 guardrails (D-027, binding):
 *  - asymmetric organic layout — no radial/grid symmetry
 *  - 7–12 nodes hard cap (this renders 9)
 *  - zero motion after draw-in; never pointer-reactive
 *  - compositor-safe: pathLength/opacity only
 *  - draw-in plays once per session; reduced motion = fully drawn
 *
 * KILL CRITERION (R2): if the 5-person hallway test reads this as a
 * "particle background," cut to pure typography — pre-approved.
 *
 * Implementation note: Motion's pathLength (not GSAP) — the stroke
 * choreography here is simple enough that loading GSAP would violate
 * the landing JS budget for no gain. GSAP stays reserved for the
 * timeline's richer draw (docs/06). Logged in D-029.
 */

// Asymmetric layout, hand-placed (R2: no generative symmetry).
const NODES: ReadonlyArray<{ x: number; y: number; r: number }> = [
  { x: 62, y: 48, r: 5 }, // publication cluster
  { x: 148, y: 26, r: 4 },
  { x: 232, y: 74, r: 6 }, // the central project
  { x: 320, y: 42, r: 4 },
  { x: 104, y: 152, r: 4 },
  { x: 208, y: 188, r: 5 }, // post
  { x: 316, y: 150, r: 4 },
  { x: 58, y: 246, r: 4 },
  { x: 252, y: 272, r: 5 }, // timeline era
];

const EDGES: ReadonlyArray<{ from: number; to: number; dashed?: boolean }> = [
  { from: 0, to: 2 }, // implements
  { from: 1, to: 2 },
  { from: 2, to: 3, dashed: true },
  { from: 2, to: 5 }, // writes-about
  { from: 4, to: 5 },
  { from: 5, to: 6, dashed: true },
  { from: 4, to: 7 },
  { from: 5, to: 8 }, // produced
  { from: 6, to: 8 },
];

const SESSION_KEY = "dl-motif-drawn";

function edgePath(e: (typeof EDGES)[number]): string {
  const a = NODES[e.from];
  const b = NODES[e.to];
  if (!a || !b) return "";
  return `M ${a.x} ${a.y} L ${b.x} ${b.y}`;
}

export function GraphMotif({ className }: { className?: string }) {
  const reduced = useReducedMotion();
  // Once per session (docs/08 draw-in): returning visitors see it drawn.
  const [alreadyDrawn] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    if (window.sessionStorage.getItem(SESSION_KEY)) return true;
    window.sessionStorage.setItem(SESSION_KEY, "1");
    return false;
  });

  const animate = !reduced && !alreadyDrawn;

  return (
    <svg
      viewBox="0 0 380 300"
      aria-hidden
      className={className}
      fill="none"
      strokeLinecap="round"
    >
      {EDGES.map((e, i) => (
        <motion.path
          key={i}
          d={edgePath(e)}
          className="stroke-border-emphasis"
          strokeWidth={1}
          strokeDasharray={e.dashed ? "3 5" : undefined}
          initial={animate ? { pathLength: 0, opacity: 0 } : false}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{
            duration: DURATION.narrative,
            ease: EASE_OUT,
            delay: 0.3 + i * 0.12,
          }}
        />
      ))}
      {NODES.map((n, i) => (
        <motion.circle
          key={i}
          cx={n.x}
          cy={n.y}
          r={n.r}
          className="fill-canvas stroke-border-emphasis"
          strokeWidth={1}
          initial={animate ? { opacity: 0 } : false}
          animate={{ opacity: 1 }}
          transition={{
            duration: DURATION.base,
            ease: EASE_OUT,
            delay: 0.2 + i * 0.08,
          }}
        />
      ))}
    </svg>
  );
}
