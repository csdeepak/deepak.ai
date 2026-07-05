import { create } from "zustand";

/**
 * Global UI state — overlays only. One overlay at a time: opening the
 * palette closes the Dex panel and vice versa (docs/15 §2.11 rule).
 * Content state never lives here; it belongs to the server.
 */
interface UiState {
  paletteOpen: boolean;
  dexOpen: boolean;
  openPalette: () => void;
  openDex: () => void;
  closeOverlays: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  paletteOpen: false,
  dexOpen: false,
  openPalette: () => set({ paletteOpen: true, dexOpen: false }),
  openDex: () => set({ dexOpen: true, paletteOpen: false }),
  closeOverlays: () => set({ paletteOpen: false, dexOpen: false }),
}));
