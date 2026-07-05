import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

/**
 * Prose — the long-form reading container (docs/15 §6 Markdown/Prose):
 * 720px measure, reading type scale, one prose spec for all long-form.
 *
 * Scaffold: the markdown pipeline (renderer choice, syntax highlighting
 * with the closed syntax.* set, footnote popovers) is a build decision
 * for the posts sprint — no renderer dependency is committed yet.
 */
export function Prose({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "mx-auto max-w-reading text-reading text-ink",
        "[&_h2]:mt-12 [&_h2]:text-h2 [&_h2]:font-semibold",
        "[&_h3]:mt-8 [&_h3]:text-h3 [&_h3]:font-semibold",
        "[&_p]:mt-5 [&_a]:text-accent [&_a]:underline-offset-2 hover:[&_a]:underline",
        "[&_code]:rounded-sm [&_code]:bg-recessed [&_code]:px-1 [&_code]:font-mono [&_code]:text-[0.9em]",
        className,
      )}
    >
      {children}
    </div>
  );
}
