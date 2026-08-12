import type { TierDecision } from "./shared/types";

type NetInfo = { saveData?: boolean };

function getConnection(): NetInfo | undefined {
  return (navigator as Navigator & { connection?: NetInfo }).connection;
}

function getDeviceMemory(): number | undefined {
  return (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
}

/**
 * WebGL2 capability probe — context is discarded immediately.
 *
 * `withCaveatFlag` requests `failIfMajorPerformanceCaveat: true`, which makes
 * the browser report "no WebGL2" on a software-rendered or GPU-blocklisted
 * context. The real gate (below) no longer sets this — it is a well-known
 * over-triggering footgun on real mobile GPUs (D-058 Phase A), and Tier 1
 * exists specifically to serve lower-power devices a reduced-complexity
 * scene, so pre-emptively rejecting them here defeated that tier's purpose.
 * The flag is still exposed here so `diagnoseTier()` can report whether it
 * WOULD have rejected the current device, without that affecting the
 * decision actually made.
 */
function probeWebGL2(withCaveatFlag = false): boolean {
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext(
      "webgl2",
      withCaveatFlag ? { failIfMajorPerformanceCaveat: true } : undefined,
    );
    if (!gl) return false;
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return true;
  } catch {
    return false;
  }
}

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
  if (getConnection()?.saveData) return { tier: 0, reducedMotion };

  const deviceMemory = getDeviceMemory();
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

/**
 * Full raw-signal dump for the `?herodebug=1` overlay (D-058 Phase A).
 * Never called on the normal path — only from NeuralFace3DClient when the
 * query flag is present, so a visitor can self-report exactly why their
 * device landed on a given tier.
 */
export interface TierDiagnostics {
  decidedTier: 0 | 1 | 2;
  reducedMotion: boolean;
  saveData: boolean;
  deviceMemory: number | "unknown";
  webgl2: boolean;
  /** True if the removed failIfMajorPerformanceCaveat flag would have
   *  rejected this device even though plain WebGL2 succeeds. */
  webgl2CaveatWouldReject: boolean;
  pointerCoarse: boolean;
  viewportNarrow: boolean;
  innerWidth: number;
  innerHeight: number;
  dpr: number;
  userAgent: string;
}

export function diagnoseTier(): TierDiagnostics {
  const { tier: decidedTier, reducedMotion } = decideTier();
  const webgl2 = probeWebGL2(false);
  const webgl2WithCaveat = probeWebGL2(true);
  const deviceMemory = getDeviceMemory();

  return {
    decidedTier,
    reducedMotion,
    saveData: Boolean(getConnection()?.saveData),
    deviceMemory: deviceMemory ?? "unknown",
    webgl2,
    webgl2CaveatWouldReject: webgl2 && !webgl2WithCaveat,
    pointerCoarse: window.matchMedia("(pointer: coarse)").matches,
    viewportNarrow: window.matchMedia("(max-width: 1023px)").matches,
    innerWidth: window.innerWidth,
    innerHeight: window.innerHeight,
    dpr: window.devicePixelRatio,
    userAgent: navigator.userAgent,
  };
}
