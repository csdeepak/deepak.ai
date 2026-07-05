/**
 * GSAP is reserved for the SVG draw-in recipes (hero graph motif,
 * timeline stroke — docs/08 `draw-in`) where stroke choreography
 * exceeds what Motion handles cleanly. Loaded lazily so the reading
 * path never pays for it (specs/landing.md §8 budget).
 *
 * Usage (Sprint 1+):
 *   const gsap = await loadGsap();
 */
export async function loadGsap() {
  const { gsap } = await import("gsap");
  return gsap;
}
