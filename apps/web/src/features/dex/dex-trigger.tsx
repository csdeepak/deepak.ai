"use client";

import { MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUiStore } from "@/stores/ui-store";

export function DexTrigger({
  className,
  children = "Know about Deepak using AI",
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  const openDex = useUiStore((s) => s.openDex);

  return (
    // Arrow-wrapped, not passed directly: `openDex` now takes an optional
    // seed question, and handing it the click handler slot would pass the
    // MouseEvent straight into the Dex input as a pre-filled question.
    <button type="button" onClick={() => openDex()} className={cn(className)}>
      <MessageCircle className="size-4" aria-hidden />
      <span>{children}</span>
    </button>
  );
}
