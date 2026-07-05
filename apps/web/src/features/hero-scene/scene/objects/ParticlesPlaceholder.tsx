"use client";

/**
 * Particle system placeholder — deliberately renders NOTHING.
 *
 * The particle law (docs/18 §9, D-032): every particle is a datum;
 * no idle emitters exist. Since no data events exist yet (no publish
 * events, no commit cache, no Dex citations), the honest render is
 * empty. This file fixes the EMITTER CONTRACT so the final shader
 * system slots in without touching callers.
 */

/** The four sanctioned event types (docs/18 §9 — closed set). */
export type ParticleEvent =
  | { kind: "birth"; nodeId: string }
  | { kind: "commit-pulse" }
  | { kind: "citation-trace"; fromDex: true; toNodeId: string }
  | { kind: "selection-flare"; nodeId: string };

/** Future emitter API — the swap target for the final shader system. */
export function emitParticleEvent(event: ParticleEvent): void {
  // No-op until the shader system lands (post asset integration).
  void event;
}

export function ParticlesPlaceholder() {
  return null;
}
