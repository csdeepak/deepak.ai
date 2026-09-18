import { create } from "zustand";

/**
 * Global UI state — overlays only. Content state never lives here; it
 * belongs to the server.
 *
 * `paletteOpen`/`openPalette` were removed: no component ever rendered a
 * command palette, so the flag could be set but never observed. The
 * "one overlay at a time" rule (docs/15 §2.11) returns with the palette
 * when it is actually built.
 */
interface UiState {
  dexOpen: boolean;
  /**
   * A question to pre-fill the Dex input with on open — set by the
   * "Ask about this project" context chips (docs/12 names these as a Dex
   * entry point; they were specified but never built).
   *
   * Pre-fill, never auto-submit. A chip that fired the question on click
   * would spend a unit of the shared daily LLM budget and an IP rate-limit
   * slot on a single curious click, and would race the Turnstile token,
   * which is not ready the instant the panel opens. Seeding the input keeps
   * the visitor in control of when a request is actually made.
   */
  dexSeedQuestion: string;
  openDex: (seedQuestion?: string) => void;
  /** Clears the seed once the panel has consumed it, so reopening Dex later
   *  does not resurrect a question from a page the visitor has left. */
  consumeDexSeed: () => void;
  closeOverlays: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  dexOpen: false,
  dexSeedQuestion: "",
  openDex: (seedQuestion = "") =>
    set({ dexOpen: true, dexSeedQuestion: seedQuestion }),
  consumeDexSeed: () => set({ dexSeedQuestion: "" }),
  closeOverlays: () => set({ dexOpen: false, dexSeedQuestion: "" }),
}));
