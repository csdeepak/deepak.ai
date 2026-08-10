import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

interface SectionProps extends HTMLAttributes<HTMLElement> {
  /**
   * Section rhythm (docs/DESIGN_SYSTEM §3):
   * `default` = 96px mobile / 160px desktop · `compact` = admin/dense.
   */
  rhythm?: "default" | "compact";
}

/** Semantic page section carrying the Instrument vertical rhythm. */
export function Section({
  rhythm = "default",
  className,
  ...props
}: SectionProps) {
  return (
    <section
      className={cn(
        rhythm === "default" ? "py-24 md:py-40" : "py-6 md:py-8",
        className,
      )}
      {...props}
    />
  );
}
