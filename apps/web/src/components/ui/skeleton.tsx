import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

/**
 * Skeleton — a geometry promise (DSVL Law 16: zero layout shift).
 * Shimmer ≥1.2s period; static under reduced motion (docs/08).
 * Nothing resolving in <150ms shows a loader at all.
 */
export function Skeleton({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-hidden
      className={cn(
        "rounded-sm bg-surface motion-safe:animate-pulse",
        className,
      )}
      {...props}
    />
  );
}
