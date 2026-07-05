import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

interface SectionProps extends HTMLAttributes<HTMLElement> {
  /**
   * Section rhythm (docs/15 §2.1 aliases):
   * `default` = 96–160px desktop / halved mobile · `compact` = admin/dense.
   */
  rhythm?: "default" | "compact";
}

/** Semantic page section carrying the vertical rhythm. */
export function Section({
  rhythm = "default",
  className,
  ...props
}: SectionProps) {
  return (
    <section
      className={cn(
        rhythm === "default" ? "py-12 md:py-24" : "py-6 md:py-8",
        className,
      )}
      {...props}
    />
  );
}
