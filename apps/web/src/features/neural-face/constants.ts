/**
 * Neural-face hero constants (D-050 Track 1).
 *
 * Kept tiny and dependency-free. These also encode the D-050 amendment:
 * the ambient R3F mount was removed from `/`, so the hero region here is
 * self-contained (no `features/hero-scene` coupling). Reverting to the
 * 3D scene for v1.5 is a one-line swap in `app/(site)/page.tsx`.
 */

/** Hero region scroll length (svh). Enough travel for a calm sub-line
 *  progression without the 3D scene's 200vh camera rail. */
export const HERO_REGION_VH = 170;

/** Sub-line act breakpoints over the hero region's scroll progress 0–1. */
export const ACT_BREAKPOINTS = [0, 0.3, 0.62, 0.88] as const;
