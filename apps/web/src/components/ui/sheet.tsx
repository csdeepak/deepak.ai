"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cn } from "@/lib/utils";
import type { ComponentPropsWithoutRef } from "react";

/**
 * Sheet — the mobile overlay idiom (docs/15 §6): bottom-anchored,
 * thumb-reach. Shares the Dialog overlay contract (same Radix root —
 * one behavior, two skins). Used by: mobile nav, filter sheets, and
 * the Dex bottom sheet at v1.5.
 */
export const Sheet = DialogPrimitive.Root;
export const SheetTrigger = DialogPrimitive.Trigger;
export const SheetTitle = DialogPrimitive.Title;
export const SheetClose = DialogPrimitive.Close;

type Side = "bottom" | "right";

const sideClass: Record<Side, string> = {
  bottom:
    "inset-x-0 bottom-0 rounded-t-lg border-t border-border max-h-[85svh]",
  right: "inset-y-0 right-0 h-full w-full max-w-md border-l border-border",
};

export function SheetContent({
  side = "bottom",
  className,
  children,
  ...props
}: ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
  side?: Side;
}) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-(--z-scrim) bg-scrim" />
      <DialogPrimitive.Content
        className={cn(
          "fixed z-(--z-overlay) bg-raised p-6 shadow-overlay",
          sideClass[side],
          className,
        )}
        {...props}
      >
        {children}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}
