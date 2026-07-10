"use client";

import { motion, useReducedMotion } from "motion/react";
import { memoryEdges, memoryNodes } from "../../../content/asmos";
import type { MemoryNode } from "./types";

/**
 * The Memory Map — the graph IS navigation (docs/26 §5). Semantic memory
 * rendered as an accessible, associative field: edges are associations,
 * nodes are memories. ASMOS is the one formed, recallable memory; the
 * rest are real but "unformed" (honest, docs/26 §9) — dim, dashed, not
 * yet reconstructed.
 *
 * Accessibility is first-class: every node is a real <button> in a
 * labelled list; the SVG is decorative (aria-hidden). Arrival = the map
 * assembling once (edges draw, nodes settle); reduced motion = present,
 * still. Nothing loops (only Dex breathes).
 */
export function MemoryMap({
  onRecall,
  onUnformed,
}: {
  onRecall: (id: string) => void;
  onUnformed: (node: MemoryNode) => void;
}) {
  const reduced = useReducedMotion();
  const nodeById = (id: string) => memoryNodes.find((n) => n.id === id);

  return (
    <div className="relative mx-auto aspect-[4/3] w-full max-w-3xl">
      {/* Associations (decorative) */}
      <svg
        viewBox="0 0 100 100"
        className="absolute inset-0 h-full w-full"
        aria-hidden
        preserveAspectRatio="none"
      >
        {memoryEdges.map((e, i) => {
          const a = nodeById(e.from);
          const b = nodeById(e.to);
          if (!a || !b) return null;
          return (
            <motion.line
              key={i}
              x1={a.x * 100}
              y1={a.y * 100}
              x2={b.x * 100}
              y2={b.y * 100}
              className="stroke-border-emphasis"
              strokeWidth={0.2}
              vectorEffect="non-scaling-stroke"
              initial={reduced ? false : { pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{
                duration: 0.6,
                ease: [0.2, 0, 0, 1],
                delay: reduced ? 0 : 0.1 + i * 0.08,
              }}
            />
          );
        })}
      </svg>

      {/* Memories — the accessible, interactive layer */}
      <ul aria-label="Memories" className="absolute inset-0 m-0 list-none p-0">
        {memoryNodes.map((node, i) => {
          const formed = node.reconstructable;
          return (
            <li
              key={node.id}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${node.x * 100}%`, top: `${node.y * 100}%` }}
            >
              <motion.button
                type="button"
                onClick={() =>
                  formed ? onRecall(node.id) : onUnformed(node)
                }
                aria-label={
                  formed
                    ? `Recall ${node.label}`
                    : `${node.label} — not yet reconstructed`
                }
                initial={reduced ? false : { opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  duration: 0.4,
                  ease: [0.22, 1, 0.36, 1],
                  delay: reduced ? 0 : 0.5 + i * 0.09,
                }}
                className="group flex flex-col items-center gap-2 rounded-sm p-2 text-center"
              >
                <span
                  aria-hidden
                  className={
                    formed
                      ? "size-3.5 rounded-full bg-accent shadow-[0_0_20px_var(--interactive-default)] transition-transform duration-(--duration-fast) group-hover:scale-125"
                      : "size-2.5 rounded-full border border-dashed border-border-emphasis transition-colors duration-(--duration-fast) group-hover:border-muted"
                  }
                />
                <span
                  className={
                    formed
                      ? "text-small font-medium text-ink"
                      : "text-small text-faint"
                  }
                >
                  {node.label}
                </span>
                <span className="font-mono text-[0.65rem] uppercase tracking-[0.15em] text-faint">
                  {formed ? node.kind : "unformed"}
                </span>
              </motion.button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
