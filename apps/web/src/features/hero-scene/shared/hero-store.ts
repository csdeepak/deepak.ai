import { create } from "zustand";
import type {
  ActIndex,
  DexState,
  NodeAnchor,
  QualityFlags,
  Tier,
} from "./types";

/**
 * Discrete-domain state (docs/22 §4): shared between canvas systems
 * (writers) and the DOM overlay (readers). Continuous values NEVER
 * live here — see shared/refs.ts.
 */
interface HeroState {
  tier: Tier;
  reducedMotion: boolean;
  gateResolved: boolean;
  canvasFailed: boolean;

  /** Boot complete — the workspace is "live" (bible §6.2, Act I). */
  sceneLive: boolean;

  act: ActIndex;
  hoveredNode: string | null;
  focusedNode: string | null;
  dexState: DexState;

  quality: QualityFlags;
  /** Screen-space anchors, updated at rail rest-points only. */
  anchors: Record<string, NodeAnchor>;

  /** Dev-only debug knobs (leva writes; scene reads with defaults). */
  debug: { showStats: boolean; keyIntensity: number | null };

  resolveGate: (tier: Tier, reducedMotion: boolean) => void;
  failCanvas: () => void;
  finishBoot: () => void;
  setAct: (act: ActIndex) => void;
  setHoveredNode: (id: string | null) => void;
  setFocusedNode: (id: string | null) => void;
  setDexState: (state: DexState) => void;
  setAnchors: (anchors: Record<string, NodeAnchor>) => void;
  /** Sheds the next quality flag in the bible's order; false = nothing left. */
  shedQuality: () => boolean;
  restoreQuality: () => void;
  setDebug: (debug: Partial<HeroState["debug"]>) => void;
}

const FULL_QUALITY: QualityFlags = {
  particles: true,
  lightingDrift: true,
  nodeDrift: true,
  parallax: true,
};

/** Shedding order per docs/18 §12. */
const SHED_ORDER: ReadonlyArray<keyof QualityFlags> = [
  "particles",
  "lightingDrift",
  "nodeDrift",
  "parallax",
];

export const useHeroStore = create<HeroState>((set, get) => ({
  tier: 0,
  reducedMotion: false,
  gateResolved: false,
  canvasFailed: false,
  sceneLive: false,
  act: 0,
  hoveredNode: null,
  focusedNode: null,
  dexState: "resting",
  quality: FULL_QUALITY,
  anchors: {},
  debug: { showStats: false, keyIntensity: null },

  resolveGate: (tier, reducedMotion) =>
    set({
      tier,
      reducedMotion,
      gateResolved: true,
      // Tier 1 starts pre-shed (Lite: no particles/drifts/parallax).
      quality:
        tier === 2
          ? FULL_QUALITY
          : { particles: false, lightingDrift: false, nodeDrift: false, parallax: false },
    }),
  failCanvas: () => set({ canvasFailed: true }),
  finishBoot: () => set((s) => (s.sceneLive ? s : { sceneLive: true })),
  setAct: (act) => set((s) => (s.act === act ? s : { act })),
  setHoveredNode: (id) =>
    set((s) => (s.hoveredNode === id ? s : { hoveredNode: id })),
  setFocusedNode: (id) =>
    set((s) => (s.focusedNode === id ? s : { focusedNode: id })),
  setDexState: (state) =>
    set((s) => (s.dexState === state ? s : { dexState: state })),
  setAnchors: (anchors) => set({ anchors }),
  shedQuality: () => {
    const q = get().quality;
    const next = SHED_ORDER.find((k) => q[k]);
    if (!next) return false;
    set({ quality: { ...q, [next]: false } });
    return true;
  },
  restoreQuality: () => {
    if (get().tier === 2) set({ quality: FULL_QUALITY });
  },
  setDebug: (debug) => set((s) => ({ debug: { ...s.debug, ...debug } })),
}));
