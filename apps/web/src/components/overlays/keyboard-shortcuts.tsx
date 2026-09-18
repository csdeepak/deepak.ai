"use client";

import { useEffect } from "react";
import { useUiStore } from "@/stores/ui-store";

/**
 * Global keyboard shortcuts.
 *
 * ⌘K / Ctrl+K opens Dex — the entry point docs/12 lists first ("⌘K → Ask
 * Dex"). This replaces `CommandPaletteListener`, which bound the same keys
 * to `openPalette()` for a command palette that was never built and that
 * nothing rendered. That listener was never mounted, which was the only
 * reason it did no harm: had anyone mounted it, ⌘K would have swallowed the
 * browser's own shortcut and opened nothing at all.
 *
 * The full palette (docs/13 §4.18: grouped Pages · Content · Actions ·
 * Ask-Dex results) remains a future sprint. When it ships it can take this
 * binding back and move Dex to its own key — until then the shortcut points
 * at the overlay that actually exists.
 *
 * Renders nothing; it is a behaviour, mounted once in the site layout.
 */
export function KeyboardShortcuts() {
  const openDex = useUiStore((state) => state.openDex);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== "k") {
        return;
      }
      // Don't steal the key while someone is typing — including inside Dex
      // itself, where ⌘K would otherwise fire mid-question.
      const target = event.target as HTMLElement | null;
      if (
        target?.isContentEditable ||
        ["INPUT", "TEXTAREA", "SELECT"].includes(target?.tagName ?? "")
      ) {
        return;
      }
      event.preventDefault();
      openDex();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [openDex]);

  return null;
}
