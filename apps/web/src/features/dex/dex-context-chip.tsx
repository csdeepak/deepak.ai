"use client";

import { MessageCircle } from "lucide-react";
import { useUiStore } from "@/stores/ui-store";
import { cn } from "@/lib/utils";

/**
 * DexContextChip — "Ask about this project" on a detail page.
 *
 * docs/12 lists context chips as one of Dex's four entry points; they were
 * specified and never built, which left the hero CTA as the only door into
 * the entire answer pipeline. This is the second door, placed where a
 * visitor has just formed a question: at the end of the thing they read.
 *
 * It seeds the panel's input rather than firing the question, so the
 * visitor decides when a request is actually spent — see `openDex` in the
 * UI store for why that matters to the shared daily budget.
 */
export function DexContextChip({
  question,
  label = "Ask Dex about this",
  className,
}: {
  /** The question to pre-fill, e.g. "Tell me about ASMOS". */
  question: string;
  label?: string;
  className?: string;
}) {
  const openDex = useUiStore((s) => s.openDex);

  return (
    <button
      type="button"
      onClick={() => openDex(question)}
      aria-haspopup="dialog"
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2.5",
        "text-small text-muted transition-colors duration-(--duration-fast)",
        "hover:border-border-emphasis hover:text-ink",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
        className,
      )}
    >
      <MessageCircle className="size-4 shrink-0 text-accent" aria-hidden />
      <span>{label}</span>
    </button>
  );
}
