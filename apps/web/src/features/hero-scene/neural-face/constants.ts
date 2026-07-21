/**
 * Neural-face 3D scene constants (D-052 Track 2, docs/DESIGN_SYSTEM §2).
 *
 * The scene renders on its own dark stage regardless of site theme — a
 * "screen within the page" (ratified: tester item #14). Colours here are the
 * scene's own; the accent gradient stops match the Instrument tokens.
 */

/** Sticky scroll region length. ~400vh → four beats of travel. */
export const REGION_VH = 400;

/** drei ScrollControls page count (≈ REGION_VH / 100). */
export const SCROLL_PAGES = 4;

/** Scroll-scrub damping (lerp) — native scroll owns truth. */
export const SCROLL_DAMPING = 0.07;

/** Beat boundaries over scroll offset 0..1 (docs/DESIGN_SYSTEM · Phase 2). */
export const BEAT = {
  faceEnd: 0.32, // Beat 1 → 2
  diveEnd: 0.6, // Beat 2 → 3
  copyFadeOut: 0.28, // hero copy fully gone by here
  surfaceFadeStart: 0.45, // surface cross-fades out during the dive
  surfaceFadeEnd: 0.58,
} as const;

/** The dark stage (never theme-swaps — the scene is a screen). */
export const STAGE_COLOR = "#0A0B0D";

/** Gemini accent stops (match --grad-1/2/3) as linear RGB triples. */
export const GRAD_1 = [0.31, 0.55, 1.0] as const; // #4F8CFF blue leading edge
export const GRAD_2 = [0.71, 0.61, 1.0] as const; // #B69CFF violet
export const GRAD_3 = [1.0, 0.61, 0.69] as const; // #FF9CB0 warm pink tail

/** Cool node tint for the surface portrait (calm, near-white blue). */
export const SURFACE_TINT = [0.74, 0.8, 0.96] as const;

/** Device-pixel-ratio caps (docs/DESIGN_SYSTEM §5 / Phase 3). */
export const DPR_DESKTOP = 2;
export const DPR_MOBILE = 1.5;

/** Concurrent inner-network pulses. */
export const PULSE_CONCURRENT = 3;
/** Seconds between new pulse launches. */
export const PULSE_INTERVAL_MIN = 1.8;
export const PULSE_INTERVAL_MAX = 2.4;

/** Camera rail depth: starts back, dives through the surface (z≈0) inward. */
export const CAM_START_Z = 1.15;
export const CAM_END_Z = -0.42;
