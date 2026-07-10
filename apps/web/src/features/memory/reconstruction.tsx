"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";
import { Container } from "@/components/layout/container";
import { memoryEdges, memoryNodes } from "../../../content/asmos";
import type { FragmentState, Memory, ReconstructionStage, StageItem } from "./types";

/**
 * Memory Reconstruction (docs/26 §4) — a page does not load; a memory
 * RECONSTRUCTS. The associated context surfaces first, then the stages
 * assemble in the order the thought actually evolved (question →
 * hypothesis → … → future). Honesty is baked in: fragments carry their
 * state, so Results and Publication read as in-progress, never faked.
 *
 * Reduced motion: the whole memory is present and still (complete, not
 * degraded). Semantic: <article> with a heading per fragment.
 */

const container: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.14, delayChildren: 0.45 } },
};
const fragment: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

function StateTag({ state }: { state: FragmentState }) {
  if (state === "settled") return null;
  const isProgress = state === "in-progress";
  return (
    <span
      className={
        isProgress
          ? "rounded-sm bg-[color-mix(in_oklab,var(--status-warning)_16%,transparent)] px-2 py-0.5 font-mono text-[0.65rem] uppercase tracking-[0.12em] text-warning"
          : "rounded-sm border border-border px-2 py-0.5 font-mono text-[0.65rem] uppercase tracking-[0.12em] text-faint"
      }
    >
      {isProgress ? "In progress" : "Unformed"}
    </span>
  );
}

function OutcomeTag({ outcome }: { outcome: StageItem["outcome"] }) {
  if (!outcome) return null;
  const map = {
    worked: "text-success",
    partial: "text-muted",
    failed: "text-danger",
  } as const;
  const label = { worked: "worked", partial: "partial", failed: "abandoned" }[
    outcome
  ];
  return (
    <span className={`font-mono text-[0.65rem] uppercase tracking-[0.12em] ${map[outcome]}`}>
      {label}
    </span>
  );
}

function Fragment({ stage }: { stage: ReconstructionStage }) {
  return (
    <motion.section
      variants={fragment}
      aria-labelledby={`stage-${stage.kind}`}
      className="border-l border-border pl-6"
    >
      <div className="flex items-center gap-3">
        <h2
          id={`stage-${stage.kind}`}
          className="font-mono text-small uppercase tracking-[0.18em] text-accent"
        >
          {stage.label}
        </h2>
        <StateTag state={stage.state} />
      </div>
      <div className="mt-4 space-y-4">
        {stage.body.map((p, i) => (
          <p key={i} className="max-w-reading text-reading text-muted">
            {p}
          </p>
        ))}
      </div>
      {stage.items && (
        <ul className="mt-6 space-y-4">
          {stage.items.map((item) => (
            <li
              key={item.title}
              className="rounded-md border border-border bg-surface p-4"
            >
              <div className="flex items-baseline justify-between gap-4">
                <h3 className="text-body font-medium text-ink">{item.title}</h3>
                <OutcomeTag outcome={item.outcome} />
              </div>
              <p className="mt-1.5 text-small text-muted">{item.note}</p>
            </li>
          ))}
        </ul>
      )}
    </motion.section>
  );
}

/** The associations that surface before the memory reconstructs. */
function Associations() {
  const reduced = useReducedMotion();
  const links = memoryEdges
    .filter((e) => e.from === "asmos")
    .map((e) => ({
      relation: e.relation,
      label: memoryNodes.find((n) => n.id === e.to)?.label ?? e.to,
    }));

  return (
    <motion.ul
      initial={reduced ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="mt-6 flex flex-wrap gap-x-6 gap-y-2"
      aria-label="Associations"
    >
      {links.map((l) => (
        <li key={l.label} className="text-small text-faint">
          <span className="font-mono text-[0.7rem] uppercase tracking-[0.12em]">
            {l.relation}
          </span>{" "}
          <span className="text-muted">{l.label}</span>
        </li>
      ))}
    </motion.ul>
  );
}

export function Reconstruction({ memory }: { memory: Memory }) {
  const reduced = useReducedMotion();

  return (
    <Container width="content" className="py-16 md:py-24">
      <article>
        {/* Context first — the memory names itself and its associations. */}
        <motion.header
          initial={reduced ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="font-mono text-small uppercase tracking-[0.2em] text-faint">
            {memory.kind}
          </p>
          <h1 className="mt-4 text-display font-semibold leading-[1.04] tracking-tight text-ink">
            {memory.title}
          </h1>
          <p className="mt-6 max-w-reading text-reading text-muted">
            {memory.oneLine}
          </p>
          <Associations />
        </motion.header>

        {/* Then the memory reconstructs, fragment by fragment. */}
        <motion.div
          variants={container}
          initial={reduced ? false : "hidden"}
          animate="visible"
          className="mt-16 space-y-14"
        >
          {memory.stages.map((stage) => (
            <Fragment key={stage.kind} stage={stage} />
          ))}
        </motion.div>
      </article>
    </Container>
  );
}
