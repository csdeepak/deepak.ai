"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ComponentPropsWithoutRef } from "react";

/**
 * Dialog — the ONE overlay contract (docs/15 §7): scrim, focus trap,
 * Esc + return-to-trigger (Radix provides all three). Sheet reuses
 * this; a second modal behavior anywhere is a defect.
 * Reserved for decisions and focused tasks (docs/15 §6).
 */
export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogTitle = DialogPrimitive.Title;
export const DialogDescription = DialogPrimitive.Description;
export const DialogClose = DialogPrimitive.Close;

export function DialogContent({
  className,
  children,
  ...props
}: ComponentPropsWithoutRef<typeof DialogPrimitive.Content>) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-(--z-scrim) bg-scrim" />
      <DialogPrimitive.Content
        className={cn(
          "fixed left-1/2 top-1/2 z-(--z-overlay) w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-lg bg-raised p-6 shadow-overlay",
          className,
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close
          className="absolute right-4 top-4 text-muted hover:text-ink"
          aria-label="Close"
        >
          <X size={20} aria-hidden />
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}
