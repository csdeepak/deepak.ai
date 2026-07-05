"use client";

import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { cn } from "@/lib/utils";
import type { ComponentPropsWithoutRef } from "react";

/**
 * Tooltip — docs/15 §6: 300ms hover delay, instant on focus, never
 * interactive content, never the only home of information.
 */
export const TooltipProvider = (
  props: ComponentPropsWithoutRef<typeof TooltipPrimitive.Provider>,
) => <TooltipPrimitive.Provider delayDuration={300} {...props} />;

export const Tooltip = TooltipPrimitive.Root;
export const TooltipTrigger = TooltipPrimitive.Trigger;

export function TooltipContent({
  className,
  ...props
}: ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        sideOffset={6}
        className={cn(
          "z-(--z-floating) rounded-sm bg-ink px-2 py-1 text-legal text-inverse",
          className,
        )}
        {...props}
      />
    </TooltipPrimitive.Portal>
  );
}
