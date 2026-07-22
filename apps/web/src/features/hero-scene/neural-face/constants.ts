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

/** Fraction of hero scroll before animations begin — 8% dead-zone at top. */
export const SCROLL_START = 0.08;

/** Beat boundaries over scroll offset 0..1 (docs/DESIGN_SYSTEM · Phase 2).
 *
 * Beat 2 cross-fade (D-052.2 FIX 1):
 *   surfaceFadeStart / surfaceFadeEnd span the entire Beat 2 window so the
 *   face dissolves fully before the inner network is bright.
 *   networkFadeStart lags surfaceFadeStart by +0.05 so the face has begun
 *   fading before a single network node appears. At any point during the
 *   dive, total visible opacity (surface + network) stays ≤ ~0.90× max of
 *   either layer — verified by construction (smoothstep math at t=0.485).
 */
export const BEAT = {
  faceEnd: 0.32,          // Beat 1 → 2 (face phase ends)
  diveEnd: 0.60,          // Beat 2 → 3 (dive ends)
  copyFadeOut: 0.28,      // hero copy fully gone by here
  surfaceFadeStart: 0.32, // surface cross-fade begins at Beat 1→2 boundary
  surfaceFadeEnd: 0.60,   // surface gone by diveEnd
  networkFadeStart: 0.37, // network fade-in lags surface by +0.05
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

/** Camera rail depth. D-052.3 Pillar 3: the Beat-3 rest position is pulled
 *  back to z=+0.12 (was +0.05) — ~40% more standoff from the inner-node
 *  centroid (z≈-0.18) — so the glowing bulbs read as a DEPTH FIELD with
 *  parallax rather than a close wall. Bulb screen size is clamped in-shader
 *  (4–8 px) so the pull-back does not shrink them below legibility. */
export const CAM_START_Z = 1.15;
export const CAM_END_Z = 0.12;

/** Face composition right-shift on desktop (D-052.2 FIX 4).
 *  Scene group shifts +FACE_X_OFFSET in world X when canvas px width
 *  is ≥ FACE_X_BREAKPOINT, centering the headline on the left third.
 *  On narrow viewports the face stays centered. */
export const FACE_X_OFFSET = 0.15;
export const FACE_X_BREAKPOINT = 640; // px
