"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { X } from "lucide-react";
import type { DexRecall, Memory, StageKind } from "./types";

/**
 * Dex — recall, not chat (docs/26 §6). Dex knows only this memory and
 * answers ONLY from it, every answer citing the fragment it came from.
 * No generation, no backend: it recalls verified content and links to
 * the source. Off-memory cues are declined honestly — the trust spine.
 *
 * The presence dot breathes (the one permitted loop). Answers announce
 * via a live region; the citation recalls its fragment in place.
 */
export function DexRecall({
  memory,
  onCite,
  onClose,
}: {
  memory: Memory;
  onCite: (source: StageKind) => void;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState<DexRecall | null>(null);
  const [declined, setDeclined] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const stageLabel = useMemo(() => {
    const map: Record<string, string> = {};
    memory.stages.forEach((s) => (map[s.kind] = s.label));
    return map;
  }, [memory.stages]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const recall = (entry: DexRecall) => {
    setActive(entry);
    setDeclined(false);
    setQuery("");
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim().toLowerCase();
    if (!q) return;
    // Grounded match: only recalls a cue that exists in this memory.
    const hit = memory.dex.find(
      (d) =>
        d.cue.toLowerCase().includes(q) ||
        q.split(" ").some((w) => w.length > 3 && d.cue.toLowerCase().includes(w)),
    );
    if (hit) recall(hit);
    else {
      setActive(null);
      setDeclined(true);
    }
  };

  return (
    <div
      ref={panelRef}
      role="dialog"
      aria-label="Dex — recall from this memory"
      className="fixed inset-y-0 right-0 z-(--z-overlay) flex w-full max-w-md flex-col border-l border-border bg-raised/95 shadow-overlay backdrop-blur-xl"
    >
      <div className="flex items-center justify-between border-b border-border px-6 py-4">
        <div className="flex items-center gap-3">
          <span
            className="dl-breathe size-2.5 rounded-full bg-accent shadow-[0_0_16px_var(--interactive-default)]"
            aria-hidden
          />
          <span className="text-body font-medium text-ink">Dex</span>
          <span className="font-mono text-micro text-faint">
            recalling {memory.title}
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close Dex"
          className="text-faint transition-colors duration-(--duration-fast) hover:text-ink"
        >
          <X className="size-5" aria-hidden />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-5">
        <p className="text-small text-muted">
          I only know this memory — {memory.title}. Ask, and I&rsquo;ll recall
          what&rsquo;s in it, with its source.
        </p>

        {/* The answer / the recall */}
        <div aria-live="polite" className="mt-6">
          {active && (
            <div className="rounded-md border border-border bg-surface p-5">
              <p className="text-reading text-ink">{active.answer}</p>
              <button
                type="button"
                onClick={() => onCite(active.source)}
                className="mt-4 inline-flex items-center gap-1.5 font-mono text-micro text-accent underline-offset-2 hover:underline"
              >
                ↳ recalled from: {stageLabel[active.source] ?? active.source}
              </button>
            </div>
          )}
          {declined && (
            <div className="rounded-md border border-border bg-surface p-5">
              <p className="text-reading text-muted">
                That&rsquo;s outside this memory — I only recall what ASMOS
                actually contains. Try one of these:
              </p>
            </div>
          )}
        </div>

        {/* Grounded cues */}
        <p className="mt-8 font-mono text-micro uppercase tracking-[0.15em] text-faint">
          Recall
        </p>
        <ul className="mt-3 space-y-2">
          {memory.dex.map((entry) => (
            <li key={entry.cue}>
              <button
                type="button"
                onClick={() => recall(entry)}
                className="w-full rounded-md border border-border bg-surface px-4 py-3 text-left text-small text-muted transition-colors duration-(--duration-fast) hover:border-border-emphasis hover:text-ink"
              >
                {entry.cue}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <form onSubmit={submit} className="border-t border-border p-4">
        <label htmlFor="dex-input" className="sr-only">
          Ask Dex about this memory
        </label>
        <input
          id="dex-input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask about ASMOS…"
          className="w-full rounded-md border border-border bg-recessed px-4 py-3 text-body text-ink placeholder:text-faint focus:border-accent"
        />
      </form>
    </div>
  );
}
