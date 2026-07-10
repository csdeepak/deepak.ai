/**
 * Scene easing helpers — shared so the boot/settle math lives in one
 * place (no duplicated curves across LightRig / Graph / Dex).
 */

export const clamp01 = (x: number): number => Math.min(1, Math.max(0, x));

/** Classic Hermite smoothstep, edge0→edge1. */
export function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = clamp01((x - edge0) / (edge1 - edge0 || 1));
  return t * t * (3 - 2 * t);
}

/**
 * Per-node boot reveal (bible §6.2): a node with draw-in order `birth`
 * (0 = first, near the Twin) resolves across a staggered window as boot
 * progresses. Returns 0→1.
 */
export function nodeReveal(
  birth: number,
  boot: number,
  window: number,
  softness: number,
): number {
  const start = birth * window;
  return smoothstep(start, start + softness, boot);
}
