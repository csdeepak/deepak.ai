/**
 * Continuous-domain shared refs (docs/22 §4): 60fps values flow
 * through mutable refs read in useFrame — NEVER through React state.
 * Module-scoped; inert without writers; owned by the two bridges.
 */

/** Native scroll progress through the hero region, 0–1. */
export const scrollProgressRef = { current: 0 };

/** Normalized pointer position, -1..1 each axis (0,0 = center). */
export const pointerRef = { current: { x: 0, y: 0 } };

/**
 * Damped rail position (written by CameraRail each frame). The
 * AnchorProjector compares this to scrollProgressRef to detect
 * rail rest-points (docs/22 §12).
 */
export const railPositionRef = { current: 0 };
