/**
 * Motion tokens (docs/15 §2.14, docs/08) as TypeScript constants.
 * The CSS mirror lives in styles/globals.css — keep both in sync.
 */
export const DURATION = {
  instant: 0.08,
  fast: 0.12,
  hover: 0.18,
  base: 0.2,
  slow: 0.3,
  reveal: 0.4,
  narrative: 0.55,
} as const;

/** ease-out (standard) — legacy, retained for existing components */
export const EASE_OUT = [0.2, 0, 0, 1] as const;
/** ease-in-out — cross-fades, theme toggle */
export const EASE_IN_OUT = [0.45, 0, 0.55, 1] as const;
/** ease-instrument (docs/DESIGN_SYSTEM §4) — default for reveals + hover */
export const EASE_INSTRUMENT = [0.22, 1, 0.36, 1] as const;
/** ease-arc (docs/DESIGN_SYSTEM §4) — energy: pulses, gradient sweeps */
export const EASE_ARC = [0.65, 0, 0.35, 1] as const;

/** The product's only permitted loop: Dex's breath (docs/15 §2.14). */
export const DEX_BREATH_PERIOD = 2.4;

export const DELAY = {
  tooltip: 0.3,
  skeletonThreshold: 0.15,
  searchDebounceMs: 180,
  dexSlowMs: 8000,
} as const;
