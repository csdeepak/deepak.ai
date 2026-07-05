import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

/**
 * Badge — state only (docs/15 §6): draft · scheduled · new · updated ·
 * stale. Badge ration applies (DSVL §5): if everything is badged,
 * nothing is. Category taxonomy uses Tag, never Badge.
 */
const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2 py-0.5 text-legal font-medium",
  {
    variants: {
      tone: {
        neutral: "border border-border text-muted",
        success: "bg-success/10 text-success",
        warning: "bg-warning/10 text-warning",
        danger: "bg-danger/10 text-danger",
        info: "bg-info/10 text-info",
      },
    },
    defaultVariants: { tone: "neutral" },
  },
);

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, tone, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />;
}

/** Tag — neutral pill for taxonomy; never color-coded (DSVL §5). */
export function Tag({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-border px-2.5 py-0.5 text-micro text-muted",
        className,
      )}
      {...props}
    />
  );
}
