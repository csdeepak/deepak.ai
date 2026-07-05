import type { TierDecision } from "./shared/types";

/**
 * The Tier Gate (docs/22 §2, D-036): decides the experience tier
 * BEFORE any 3D byte downloads. Tier 0 visitors never pay for three.js.
 *
 * Client-only — call from an effect after mount.
 */
export function decideTier(): TierDecision {
  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  // Hard Tier-0 signals: save-data, low memory, no WebGL2.
  type NetInfo = { saveData?: boolean };
  const connection = (navigator as Navigator & { connection?: NetInfo })
    .connection;
  if (connection?.saveData) return { tier: 0, reducedMotion };

  const deviceMemory = (navigator as Navigator & { deviceMemory?: number })
    .deviceMemory;
  if (deviceMemory !== undefined && deviceMemory < 4) {
    return { tier: 0, reducedMotion };
  }

  if (!probeWebGL2()) return { tier: 0, reducedMotion };

  // Mobile-capable → Lite (Tier 1): coarse pointer or narrow viewport.
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const narrow = window.matchMedia("(max-width: 1023px)").matches;
  if (coarse || narrow) return { tier: 1, reducedMotion };

  return { tier: 2, reducedMotion };
}

/** Cheap WebGL2 capability probe — context is discarded immediately. */
function probeWebGL2(): boolean {
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2", { failIfMajorPerformanceCaveat: true });
    if (!gl) return false;
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return true;
  } catch {
    return false;
  }
}
