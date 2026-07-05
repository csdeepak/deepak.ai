import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes } from "react";

/**
 * Button — docs/15 §6: primary (≤1 per view) · secondary · ghost ·
 * destructive. Labels are verb+object (Brand §11). Hover = tone step
 * in `fast`, out `instant` (docs/08).
 */
const buttonVariants = cva(
  "inline-flex h-10 items-center justify-center gap-2 rounded-md px-4 text-small font-medium transition-colors duration-(--duration-fast) disabled:pointer-events-none disabled:opacity-40",
  {
    variants: {
      variant: {
        primary: "bg-accent text-on-accent hover:bg-accent-hover",
        secondary: "border border-border text-ink hover:border-border-emphasis",
        ghost: "text-ink hover:bg-surface",
        destructive: "bg-danger text-on-accent hover:opacity-90",
      },
      size: {
        sm: "h-8 px-3 text-micro",
        md: "h-10 px-4",
        lg: "h-12 px-6 text-body",
      },
    },
    defaultVariants: { variant: "secondary", size: "md" },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}
