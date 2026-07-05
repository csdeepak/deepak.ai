"use client";

import { useCssColor } from "../../shared/use-css-color";

/**
 * Atmosphere (docs/18 §3): the paper/ink volume — depth is fog, not
 * walls. Colors come from the design-token system (no hex in scene
 * code); theme swaps propagate automatically via useCssColor.
 */
export function Atmosphere() {
  const canvasColor = useCssColor("--bg-canvas", "#fcfcfd");

  return (
    <>
      <color attach="background" args={[canvasColor]} />
      {/* Fog begins behind the bench, full swallow by ~15m (docs/20 §6). */}
      <fog attach="fog" args={[canvasColor, 4, 15]} />
    </>
  );
}
