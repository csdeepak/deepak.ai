/**
 * Neural-face 3D scene constants (D-052 Track 2, docs/DESIGN_SYSTEM §2).
 *
 * The scene renders on its own dark stage regardless of site theme — a
 * "screen within the page" (ratified: tester item #14). Colours here are the
 * scene's own; the accent gradient stops match the Instrument tokens.
 */

/**
 * Sticky scroll region length.
 *
 * Was 400vh. Measured on the live landing page, that made the hero 3072px of
 * a 7392px document — 41.6% of the entire page — and the copy and both CTAs
 * fade out by `copyFadeOut`, so roughly three viewport-heights of it were
 * scrolling past an animation with nothing to act on. LAW-009 makes the fast
 * path sacred, and the hero was the thing standing in front of it.
 *
 * 320vh removes one full viewport of that travel WITHOUT speeding up the
 * guided flight, which the owner tuned across two rounds in D-058 Phase B
 * (+92% arc length, 5.1× dwell) and explicitly confirmed. See BEAT below for
 * how the flight's scroll distance is held constant.
 */
export const REGION_VH = 320;

/** Fraction of hero scroll before animations begin — 8% dead-zone at top. */
export const SCROLL_START = 0.08;

/** Beat boundaries over scroll offset 0..1 (docs/DESIGN_SYSTEM · Phase 2).
 *
 * Beat 2 cross-fade (D-052.2 FIX 1):
 *   surfaceFadeStart / surfaceFadeEnd span the entire Beat 2 window so the
 *   face dissolves fully before the inner network is bright.
 *   networkFadeStart lags surfaceFadeStart so the face has begun fading
 *   before a single network node appears. At any point during the dive,
 *   total visible opacity (surface + network) stays ≤ ~0.90× max of either
 *   layer.
 *
 * THE FLIGHT'S SCROLL DISTANCE IS DELIBERATELY UNCHANGED. The guided flight
 * runs from `diveEnd` to 1.0. At the old numbers that was 0.40 × 400vh =
 * 160vh; at these it is 0.50 × 320vh = 160vh — identical travel, identical
 * pacing, so D-058 Phase B's owner-confirmed dwell tuning is preserved
 * exactly. What shortened is the face-and-dive prologue (240vh → 160vh),
 * which nobody tuned and nobody asked to keep.
 *
 * Every pre-flight boundary below is therefore the old value × 5/6 — a
 * uniform affine rescale of the same smoothstep domain, which preserves the
 * cross-fade relationships (including the ≤0.90 combined-opacity property
 * and the surface→network lag) rather than re-deriving them by eye.
 */
export const BEAT = {
  faceEnd: 0.27,          // Beat 1 → 2 (face phase ends)      — was 0.32
  diveEnd: 0.50,          // Beat 2 → 3 (dive ends, flight on) — was 0.60
  copyFadeOut: 0.23,      // hero copy fully gone by here      — was 0.28
  surfaceFadeStart: 0.27, // surface cross-fade begins at Beat 1→2 boundary
  surfaceFadeEnd: 0.50,   // surface gone by diveEnd
  networkFadeStart: 0.31, // network fade-in lags surface      — was 0.37
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
