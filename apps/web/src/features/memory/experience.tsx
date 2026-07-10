"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { MemoryMap } from "./memory-map";
import { Reconstruction } from "./reconstruction";
import { Brief } from "./brief";
import { DexRecall } from "./dex-recall";
import type { Memory, MemoryNode, StageKind } from "./types";

/**
 * The Living Memory — the vertical slice orchestrator (docs/26).
 *
 * Flow: Arrival (the map assembling) → the graph IS navigation → recall a
 * memory (it reconstructs) → Dex (grounded recall) → Exit. The Brief (the
 * 90-second fast path) is reachable at every moment and never blocked by
 * the immersive path. One complete experience.
 */
type Phase = "map" | "recall";

export function LivingMemory({ memory }: { memory: Memory }) {
  const [phase, setPhase] = useState<Phase>("map");
  const [briefOpen, setBriefOpen] = useState(false);
  const [dexOpen, setDexOpen] = useState(false);
  const [unformed, setUnformed] = useState<string | null>(null);
  const mainRef = useRef<HTMLDivElement>(null);
  const unformedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Move focus to the region on phase change (keyboard continuity).
  useEffect(() => {
    mainRef.current?.focus();
  }, [phase]);

  const recall = (id: string) => {
    if (id === memory.id) setPhase("recall");
  };

  const onUnformed = (node: MemoryNode) => {
    setUnformed(node.label);
    if (unformedTimer.current) clearTimeout(unformedTimer.current);
    unformedTimer.current = setTimeout(() => setUnformed(null), 3600);
  };

  const exit = () => {
    setDexOpen(false);
    setPhase("map");
  };

  const cite = useCallback((source: StageKind) => {
    setDexOpen(false);
    const el = document.getElementById(`stage-${source}`);
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "center" });
  }, []);

  return (
    <div className="relative min-h-svh bg-canvas">
      {/* Persistent chrome — quiet, non-welcoming; the fast path always here. */}
      <header className="fixed inset-x-0 top-0 z-(--z-nav) flex h-14 items-center justify-between border-b border-border bg-canvas/80 px-6 backdrop-blur-md">
        <span className="flex items-center gap-2.5">
          <span className="size-2.5 rounded-full border border-border-emphasis" aria-hidden />
          <span className="font-mono text-micro uppercase tracking-[0.2em] text-faint">
            memory
          </span>
        </span>
        <div className="flex items-center gap-2">
          {phase === "recall" && (
            <>
              <button
                type="button"
                onClick={() => setDexOpen((v) => !v)}
                aria-pressed={dexOpen}
                className="inline-flex h-9 items-center gap-2 rounded-md px-3 text-small text-muted transition-colors duration-(--duration-fast) hover:text-ink"
              >
                <span className="dl-breathe size-2 rounded-full bg-accent" aria-hidden />
                Ask Dex
              </button>
              <button
                type="button"
                onClick={exit}
                className="inline-flex h-9 items-center rounded-md px-3 text-small text-muted transition-colors duration-(--duration-fast) hover:text-ink"
              >
                Exit
              </button>
            </>
          )}
          <button
            type="button"
            onClick={() => setBriefOpen(true)}
            className="inline-flex h-9 items-center rounded-md border border-border px-3 text-small font-medium text-muted transition-colors duration-(--duration-fast) hover:border-border-emphasis hover:text-ink"
          >
            90-sec brief
          </button>
        </div>
      </header>

      <main
        ref={mainRef}
        tabIndex={-1}
        className="pt-14 outline-none"
        aria-label={phase === "map" ? "Memory map" : `${memory.title} reconstructed`}
      >
        <AnimatePresence mode="wait">
          {phase === "map" ? (
            <motion.div
              key="map"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="flex min-h-[calc(100svh-3.5rem)] flex-col items-center justify-center px-6 py-16"
            >
              <MemoryMap onRecall={recall} onUnformed={onUnformed} />
              <p className="mt-10 max-w-sm text-center text-small text-faint">
                A mind, mid-thought. Select a memory to reconstruct it.
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="recall"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <Reconstruction memory={memory} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Honest response to an unformed memory. */}
      <AnimatePresence>
        {unformed && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            role="status"
            className="fixed inset-x-0 bottom-8 z-(--z-notification) mx-auto w-fit rounded-md border border-border bg-raised px-5 py-3 text-small text-muted shadow-overlay"
          >
            <span className="text-ink">{unformed}</span> hasn&rsquo;t been
            reconstructed yet — the memory is real, just not documented here.
          </motion.div>
        )}
      </AnimatePresence>

      {briefOpen && (
        <Brief
          memory={memory}
          onClose={() => setBriefOpen(false)}
          onEnterRecall={() => {
            setBriefOpen(false);
            setPhase("recall");
          }}
        />
      )}

      {dexOpen && phase === "recall" && (
        <DexRecall memory={memory} onCite={cite} onClose={() => setDexOpen(false)} />
      )}
    </div>
  );
}
