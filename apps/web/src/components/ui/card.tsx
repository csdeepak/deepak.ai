import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

/**
 * Card base — docs/15 §6: surface + hairline, radius.md, no shadow at
 * rest; hover = one tone step (no translate-jump). Content variants
 * (ProjectCard, GalleryTile) compose this base — never fork it.
 */
export function Card({
  className,
  interactive = false,
  ...props
}: HTMLAttributes<HTMLDivElement> & { interactive?: boolean }) {
  return (
    <div
      className={cn(
        "rounded-md border border-border bg-surface p-6 theme-surface",
        interactive &&
          "transition-colors duration-(--duration-fast) hover:bg-raised",
        className,
      )}
      {...props}
    />
  );
}
