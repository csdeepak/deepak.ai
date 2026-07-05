"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * CopyButton — the flagship micro-interaction (specs/landing.md §2.7):
 * copy → check morph at `fast`, success announced to AT. Reusable for
 * email, citations, and code blocks.
 */
export function CopyButton({
  value,
  label,
  className,
}: {
  value: string;
  /** Accessible name, e.g. "Copy email address". */
  label: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable — the value is always also visible/linked
      // (copy is never the only path, DSVL).
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={label}
      className={cn(
        "inline-flex size-8 items-center justify-center rounded-sm text-muted transition-colors duration-(--duration-fast) hover:bg-surface hover:text-ink",
        className,
      )}
    >
      {copied ? (
        <Check size={16} aria-hidden className="text-success" />
      ) : (
        <Copy size={16} aria-hidden />
      )}
      <span aria-live="polite" className="sr-only">
        {copied ? "Copied" : ""}
      </span>
    </button>
  );
}
