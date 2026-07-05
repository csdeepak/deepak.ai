import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

interface GridProps extends HTMLAttributes<HTMLDivElement> {
  /** Columns at desktop; collapses 12→8→4 col context per docs/15 §2.4. */
  cols?: 1 | 2 | 3 | 4 | 12;
}

const colsClass: Record<NonNullable<GridProps["cols"]>, string> = {
  1: "grid-cols-1",
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 md:grid-cols-3",
  4: "grid-cols-2 md:grid-cols-4",
  12: "grid-cols-4 sm:grid-cols-8 md:grid-cols-12",
};

/** Grid with system gutters (24 desktop / 16 mobile). */
export function Grid({ cols = 12, className, ...props }: GridProps) {
  return (
    <div
      className={cn("grid gap-4 md:gap-6", colsClass[cols], className)}
      {...props}
    />
  );
}
