"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import type { Memory } from "./types";

/**
 * The Brief — the gist (docs/26 §11). The fast path a recruiter can read
 * in under 90 seconds, reachable at any moment; the immersive experience
 * never blocks it. This is also the accessible, scannable summary. Status
 * tells the honest truth (in progress), never a polished overstatement.
 */
export function Brief({
  memory,
  onClose,
  onEnterRecall,
}: {
  memory: Memory;
  onClose: () => void;
  onEnterRecall: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const g = memory.gist;
  const rows: [string, string][] = [
    ["Problem", g.problem],
    ["Approach", g.approach],
    ["Status", g.status],
    ["Role", g.role],
    ["Formed", g.formed],
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${memory.title} — 90-second brief`}
      className="fixed inset-0 z-(--z-overlay) flex items-center justify-center p-4"
    >
      <div
        className="absolute inset-0 bg-scrim backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div className="relative w-full max-w-xl rounded-lg border border-border bg-raised p-8 shadow-overlay md:p-10">
        <div className="flex items-start justify-between gap-4">
          <p className="font-mono text-small uppercase tracking-[0.2em] text-faint">
            The 90-second brief
          </p>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close brief"
            className="text-faint transition-colors duration-(--duration-fast) hover:text-ink"
          >
            <X className="size-5" aria-hidden />
          </button>
        </div>

        <h2 className="mt-5 text-h1 font-semibold tracking-tight text-ink">
          {memory.title}
        </h2>
        <p className="mt-3 text-body text-muted">{memory.oneLine}</p>

        <dl className="mt-8 space-y-4">
          {rows.map(([label, value]) => (
            <div key={label} className="grid grid-cols-[6rem_1fr] gap-4">
              <dt className="font-mono text-micro uppercase tracking-[0.12em] text-faint">
                {label}
              </dt>
              <dd className="text-small text-muted">{value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-9 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={onEnterRecall}
            className="inline-flex h-11 items-center justify-center rounded-md bg-accent px-5 text-body font-medium text-on-accent transition-colors duration-(--duration-fast) hover:bg-accent-hover"
          >
            Reconstruct the full memory
          </button>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-11 items-center justify-center rounded-md border border-border px-5 text-body font-medium text-muted transition-colors duration-(--duration-fast) hover:border-border-emphasis hover:text-ink"
          >
            Back
          </button>
        </div>
      </div>
    </div>
  );
}
