"use client";

import { useEffect } from "react";
import { useUiStore } from "@/stores/ui-store";

/**
 * Command Palette — PLACEHOLDER (Sprint 0).
 *
 * The full palette (docs/13 §4.18: grouped results Pages · Content ·
 * Actions · Ask-Dex, glass surface per D-020, combobox grammar) is its
 * own sprint. Sprint 0 ships only the global ⌘K wiring so the store
 * contract and keyboard entry point are stable from day one.
 */
export function CommandPaletteListener() {
  const openPalette = useUiStore((s) => s.openPalette);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        openPalette();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [openPalette]);

  return null;
}
