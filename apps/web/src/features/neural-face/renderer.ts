/**
 * NeuralFaceRenderer — the imperative Canvas2D engine for the "Neural
 * Face Lite" hero (D-050 Track 1). Framework-agnostic: it touches no
 * React, only a <canvas> handed to it. The React shell owns lifecycle.
 *
 * Performance doctrine (T4):
 *   • ZERO allocation inside the rAF loop — every array, scratch value,
 *     and style string is pre-built in `setData` / `layout`.
 *   • Edges are rasterized ONCE to an offscreen layer and blitted each
 *     frame (with a single plane-parallax offset), so per-frame work is
 *     nodes + at most two pulses.
 *   • DPR capped at 2; backing store sized cssSize × dpr; context scaled.
 *
 * Restraint doctrine (T5): dim nodes, sub-perceptual edges, ≤2 concurrent
 * pulses with a calm traversal and a ≥2s idle gap. The copy stays the
 * anchor; this is atmosphere.
 *
 * Index note: `noUncheckedIndexedAccess` is on. Loop counters here are
 * provably in-bounds, so hot typed-array reads use `!`; array-of-array
 * and slot lookups are guarded once at the top of each method.
 */
import type { HeroFaceData } from "./types";

interface RGB {
  r: number;
  g: number;
  b: number;
}

const DPR_CAP = 2;
const MAX_SHIFT = 8; // parallax amplitude, px (brief: 6–10)
const POINTER_LERP = 0.05; // low-pass on the pointer
const BREATHE_AMP = 0.7; // ambient per-node breathing, px (±0.5–1)
const BREATHE_OMEGA = 0.6; // rad/s — very slow
const DRIFT_OMEGA = 0.13; // autonomous drift speed (touch / no-hover)
const INTRO_MS = 800; // constellation fade-in
const EDGE_ALPHA = 0.09; // sub-perceptual edges (0.05–0.12)
const NODE_TIERS = 6; // brightness buckets (few fillStyle switches)
// Face height as a fraction of canvas height. Width-responsive (owner
// ruling, D-050): on phones the hero is nearly full-height, which eats the
// negative space the restraint spec (T5) trades on — so the face SHRINKS on
// narrow widths (≈62% viewport height) and ramps back to 82% on desktop.
// Alphas are deliberately untouched: the fix is presence, not brightness.
const HEIGHT_FRAC_NARROW = 0.62; // ≤ NARROW_MAX px (phones)
const HEIGHT_FRAC_WIDE = 0.82; // ≥ WIDE_MIN px (desktop)
const NARROW_MAX = 640; // design sm breakpoint
const WIDE_MIN = 900;
const PULSE_SLOTS = 2; // ≤2 concurrent pulses
const PULSE_GAP_MIN = 2.0; // ≥2s idle gap (s)
const PULSE_GAP_RAND = 3.0; // extra random gap (s)
const PULSE_DUR_MIN = 4.0; // full traversal 4–7s
const PULSE_DUR_RAND = 3.0;
const TAIL_SAMPLES = 14; // fading tail points behind the head
const TAIL_STEP = 6; // px between tail samples

/** Parse "#rgb" / "#rrggbb" / "rgb(...)" / "rgba(...)" → RGB. */
function parseColor(input: string, fallback: RGB): RGB {
  const s = input.trim();
  if (s.startsWith("#")) {
    let hex = s.slice(1);
    if (hex.length === 3) {
      const r = hex[0]!;
      const g = hex[1]!;
      const b = hex[2]!;
      hex = r + r + g + g + b + b;
    }
    if (hex.length >= 6) {
      const n = parseInt(hex.slice(0, 6), 16);
      return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
    }
    return fallback;
  }
  const m = s.match(/-?\d+(\.\d+)?/g);
  if (m && m.length >= 3) {
    return { r: +m[0]! | 0, g: +m[1]! | 0, b: +m[2]! | 0 };
  }
  return fallback;
}

function rgba(c: RGB, a: number): string {
  return `rgba(${c.r},${c.g},${c.b},${a})`;
}

interface PulseSlot {
  active: boolean;
  pulse: number;
  head: number; // distance along the path, px
  speed: number; // px/s
  seg: number; // cached segment pointer (monotonic)
  wait: number; // idle countdown, s
}

export class NeuralFaceRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private off: HTMLCanvasElement;
  private offCtx: CanvasRenderingContext2D;

  private data: HeroFaceData | null = null;
  private n = 0;

  // Grid + layout transform.
  private gw = 1;
  private gh = 1;
  private scale = 1;
  private originX = 0;
  private originY = 0;
  private cssW = 0;
  private cssH = 0;
  private dpr = 1;

  // Pre-allocated node fields (indexed by node id).
  private baseX = new Float32Array(0); // screen px (no parallax/breath)
  private baseY = new Float32Array(0);
  private depth01 = new Float32Array(0); // 0..1 pseudo-depth
  private phase = new Float32Array(0); // breathing seed
  private tier = new Uint8Array(0); // brightness bucket
  private orderByTier = new Int32Array(0); // node ids sorted by tier

  // Pulse geometry (screen-space cumulative lengths, per pulse).
  private pulseIdx: Int32Array[] = [];
  private pulseCum: Float32Array[] = [];
  private pulseTotal: number[] = [];

  // Style caches (rebuilt on setData / theme).
  private nodeColor: RGB = { r: 243, g: 245, b: 247 };
  private accentColor: RGB = { r: 62, g: 142, b: 255 };
  private nodeStyle: string[] = [];
  private pulseStyle: string[] = [];
  private edgeStyle = "";

  // Pointer (target vs eased), and hover capability.
  private targetPX = 0;
  private targetPY = 0;
  private easePX = 0;
  private easePY = 0;
  private hoverCapable = true;

  // Pulse slots (reused objects — never re-allocated per frame).
  private slots: PulseSlot[] = Array.from({ length: PULSE_SLOTS }, () => ({
    active: false,
    pulse: 0,
    head: 0,
    speed: 0,
    seg: 0,
    wait: 0,
  }));

  private raf = 0;
  private running = false;
  private startedAt = 0;
  private lastT = 0;
  private lastDt = 0;
  private introDone = false;

  // Scratch for `seek` (no per-frame allocation).
  private seekX = 0;
  private seekY = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("2D context unavailable");
    this.ctx = ctx;
    this.off = document.createElement("canvas");
    const octx = this.off.getContext("2d");
    if (!octx) throw new Error("2D context unavailable");
    this.offCtx = octx;
    this.hoverCapable =
      typeof window !== "undefined" &&
      window.matchMedia("(hover: hover)").matches;
    this.readThemeColors();
  }

  /** Read node/accent colors from the live CSS tokens (no hex in code). */
  readThemeColors() {
    if (typeof window === "undefined") return;
    const cs = getComputedStyle(document.documentElement);
    this.nodeColor = parseColor(
      cs.getPropertyValue("--text-primary"),
      this.nodeColor,
    );
    this.accentColor = parseColor(
      cs.getPropertyValue("--signal"),
      this.accentColor,
    );
    this.buildStyles();
  }

  private buildStyles() {
    // Node brightness tiers: alpha ramps with the tier (dim → present).
    const node = new Array<string>(NODE_TIERS);
    for (let t = 0; t < NODE_TIERS; t++) {
      const a = 0.18 + (t / (NODE_TIERS - 1)) * 0.62; // 0.18 → 0.80
      node[t] = rgba(this.nodeColor, a);
    }
    this.nodeStyle = node;
    // Pulse tail alpha steps (head brightest).
    const pulse = new Array<string>(TAIL_SAMPLES);
    for (let t = 0; t < TAIL_SAMPLES; t++) {
      const a = (1 - t / TAIL_SAMPLES) * 0.9;
      pulse[t] = rgba(this.accentColor, a);
    }
    this.pulseStyle = pulse;
    this.edgeStyle = rgba(this.nodeColor, EDGE_ALPHA);
  }

  setData(data: HeroFaceData) {
    this.data = data;
    this.n = data.depth.length;
    this.gw = data.meta.grid[0] || 1;
    this.gh = data.meta.grid[1] || 1;

    this.baseX = new Float32Array(this.n);
    this.baseY = new Float32Array(this.n);
    this.depth01 = new Float32Array(this.n);
    this.phase = new Float32Array(this.n);
    this.tier = new Uint8Array(this.n);

    for (let i = 0; i < this.n; i++) {
      this.depth01[i] = data.depth[i]! / 255;
      // Deterministic-ish per-node breathing phase from grid position.
      const gx = data.pos[i * 2]!;
      const gy = data.pos[i * 2 + 1]!;
      this.phase[i] = ((gx * 12.9898 + gy * 78.233) % (Math.PI * 2)) + Math.PI;
      const b = data.bright[i]! / 255;
      this.tier[i] = Math.min(NODE_TIERS - 1, (b * NODE_TIERS) | 0);
    }

    // Node ids sorted by tier → contiguous fillStyle runs at draw time.
    const order = Array.from({ length: this.n }, (_, i) => i);
    order.sort((a, b) => this.tier[a]! - this.tier[b]!);
    this.orderByTier = Int32Array.from(order);

    // Pulse index arrays (cumulative lengths filled in layout()).
    this.pulseIdx = data.pulses.map((p) => Int32Array.from(p));
    this.pulseCum = data.pulses.map((p) => new Float32Array(p.length));
    this.pulseTotal = data.pulses.map(() => 0);
  }

  /** Size the backing store and recompute the screen-space layout. */
  resize(cssW: number, cssH: number) {
    this.cssW = cssW;
    this.cssH = cssH;
    this.dpr = Math.min(DPR_CAP, window.devicePixelRatio || 1);
    const bw = Math.max(1, Math.round(cssW * this.dpr));
    const bh = Math.max(1, Math.round(cssH * this.dpr));
    this.canvas.width = bw;
    this.canvas.height = bh;
    this.off.width = bw;
    this.off.height = bh;
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    this.offCtx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    this.layout();
  }

  /** Width-responsive height fraction (phones shrink; desktop full). */
  private heightFrac(): number {
    const w = this.cssW;
    if (w <= NARROW_MAX) return HEIGHT_FRAC_NARROW;
    if (w >= WIDE_MIN) return HEIGHT_FRAC_WIDE;
    const t = (w - NARROW_MAX) / (WIDE_MIN - NARROW_MAX);
    return HEIGHT_FRAC_NARROW + t * (HEIGHT_FRAC_WIDE - HEIGHT_FRAC_NARROW);
  }

  private layout() {
    const data = this.data;
    if (!data) return;
    // Contain the portrait by height, centered, nudged slightly up so the
    // face doesn't sit dead-centre behind the low-left copy.
    this.scale = (this.cssH * this.heightFrac()) / this.gh;
    const faceW = this.gw * this.scale;
    const faceH = this.gh * this.scale;
    this.originX = (this.cssW - faceW) / 2;
    this.originY = (this.cssH - faceH) / 2 - this.cssH * 0.04;

    for (let i = 0; i < this.n; i++) {
      this.baseX[i] = this.originX + data.pos[i * 2]! * this.scale;
      this.baseY[i] = this.originY + data.pos[i * 2 + 1]! * this.scale;
    }

    // Pulse cumulative screen lengths (translation-invariant).
    for (let p = 0; p < this.pulseIdx.length; p++) {
      const idx = this.pulseIdx[p]!;
      const cum = this.pulseCum[p]!;
      let total = 0;
      cum[0] = 0;
      for (let k = 1; k < idx.length; k++) {
        const a = idx[k - 1]!;
        const b = idx[k]!;
        const dx = this.baseX[b]! - this.baseX[a]!;
        const dy = this.baseY[b]! - this.baseY[a]!;
        total += Math.sqrt(dx * dx + dy * dy);
        cum[k] = total;
      }
      this.pulseTotal[p] = total;
    }

    this.rasterizeEdges();
  }

  /** Draw all edges once into the offscreen layer. */
  private rasterizeEdges() {
    const data = this.data;
    if (!data) return;
    const o = this.offCtx;
    o.clearRect(0, 0, this.cssW, this.cssH);
    o.strokeStyle = this.edgeStyle;
    o.lineWidth = 1;
    o.beginPath();
    const e = data.edges;
    for (let i = 0; i < e.length; i += 2) {
      const a = e[i]!;
      const b = e[i + 1]!;
      o.moveTo(this.baseX[a]!, this.baseY[a]!);
      o.lineTo(this.baseX[b]!, this.baseY[b]!);
    }
    o.stroke();
  }

  setPointer(nx: number, ny: number) {
    this.targetPX = nx;
    this.targetPY = ny;
  }

  /** Locate the screen point at distance `d` along pulse `p` (no alloc). */
  private seek(p: number, d: number, slotSeg: number): number {
    const idx = this.pulseIdx[p];
    const cum = this.pulseCum[p];
    if (!idx || !cum) return 0;
    let seg = slotSeg;
    while (seg < idx.length - 2 && cum[seg + 1]! < d) seg++;
    while (seg > 0 && cum[seg]! > d) seg--;
    const a = idx[seg]!;
    const b = idx[seg + 1] ?? a;
    const segLen = (cum[seg + 1] ?? cum[seg]!) - cum[seg]! || 1;
    const t = Math.min(1, Math.max(0, (d - cum[seg]!) / segLen));
    // Plane parallax offset (mid-depth) keeps the pulse on the edge plane.
    const par = 0.5;
    const ox = this.easePX * MAX_SHIFT * par;
    const oy = this.easePY * MAX_SHIFT * par;
    this.seekX = this.baseX[a]! + (this.baseX[b]! - this.baseX[a]!) * t + ox;
    this.seekY = this.baseY[a]! + (this.baseY[b]! - this.baseY[a]!) * t + oy;
    return seg;
  }

  private tickPulses(dt: number) {
    const ctx = this.ctx;
    ctx.globalCompositeOperation = "lighter";
    for (let s = 0; s < this.slots.length; s++) {
      const slot = this.slots[s]!;
      if (!slot.active) {
        slot.wait -= dt;
        if (slot.wait <= 0 && this.pulseIdx.length > 0) {
          // Start a new traversal on a random path.
          const p = (Math.random() * this.pulseIdx.length) | 0;
          const total = this.pulseTotal[p] ?? 0;
          if (total > 1) {
            slot.active = true;
            slot.pulse = p;
            slot.head = 0;
            slot.seg = 0;
            slot.speed = total / (PULSE_DUR_MIN + Math.random() * PULSE_DUR_RAND);
          } else {
            slot.wait = PULSE_GAP_MIN;
          }
        }
        continue;
      }
      slot.head += slot.speed * dt;
      const total = this.pulseTotal[slot.pulse] ?? 0;
      if (slot.head > total + TAIL_SAMPLES * TAIL_STEP) {
        slot.active = false;
        slot.wait = PULSE_GAP_MIN + Math.random() * PULSE_GAP_RAND;
        continue;
      }
      // Tail (dim → back) then head (bright).
      for (let t = TAIL_SAMPLES - 1; t >= 0; t--) {
        const d = slot.head - t * TAIL_STEP;
        if (d < 0 || d > total) continue;
        slot.seg = this.seek(slot.pulse, d, slot.seg);
        ctx.fillStyle = this.pulseStyle[t]!;
        const size = t === 0 ? 2.5 : 1.5;
        ctx.fillRect(this.seekX - size / 2, this.seekY - size / 2, size, size);
      }
    }
    ctx.globalCompositeOperation = "source-over";
  }

  private drawNodes(time: number, intro: number) {
    const ctx = this.ctx;
    const px = this.easePX * MAX_SHIFT;
    const py = this.easePY * MAX_SHIFT;
    ctx.globalAlpha = intro;
    let curTier = -1;
    for (let o = 0; o < this.orderByTier.length; o++) {
      const i = this.orderByTier[o]!;
      const t = this.tier[i]!;
      if (t !== curTier) {
        ctx.fillStyle = this.nodeStyle[t]!;
        curTier = t;
      }
      const d = this.depth01[i]!;
      const ph = this.phase[i]!;
      const br = Math.sin(time * BREATHE_OMEGA + ph) * BREATHE_AMP;
      const bx = Math.cos(time * BREATHE_OMEGA + ph * 1.3) * BREATHE_AMP;
      const x = this.baseX[i]! + d * px + bx;
      const y = this.baseY[i]! + d * py + br;
      const size = t >= 4 ? 2 : 1;
      ctx.fillRect(x | 0, y | 0, size, size);
    }
    ctx.globalAlpha = 1;
  }

  /** One composited frame (edges plane + nodes + pulses). */
  private draw(time: number, animate: boolean) {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.cssW, this.cssH);

    const intro = this.introDone
      ? 1
      : Math.min(1, (time * 1000 - this.startedAt) / INTRO_MS);
    if (intro >= 1) this.introDone = true;
    const eased = intro * intro * (3 - 2 * intro); // smoothstep

    // Edge plane — blit with a single mid-depth parallax offset.
    const ox = this.easePX * MAX_SHIFT * 0.5;
    const oy = this.easePY * MAX_SHIFT * 0.5;
    ctx.globalAlpha = eased;
    ctx.drawImage(this.off, ox, oy, this.cssW, this.cssH);
    ctx.globalAlpha = 1;

    this.drawNodes(time, eased);
    if (animate) this.tickPulses(this.lastDt);
  }

  private frame = (now: number) => {
    if (!this.running) return;
    const time = now / 1000;
    let dt = time - this.lastT;
    if (dt > 0.1) dt = 0.1; // clamp after a tab-hidden gap
    this.lastT = time;
    this.lastDt = dt;

    // Ease the pointer (autonomous drift when hover is unavailable).
    if (this.hoverCapable) {
      this.easePX += (this.targetPX - this.easePX) * POINTER_LERP;
      this.easePY += (this.targetPY - this.easePY) * POINTER_LERP;
    } else {
      this.easePX = Math.sin(time * DRIFT_OMEGA) * 0.6;
      this.easePY = Math.cos(time * DRIFT_OMEGA * 0.8) * 0.4;
    }

    this.draw(time, true);
    this.raf = requestAnimationFrame(this.frame);
  };

  start() {
    if (this.running || !this.data) return;
    this.running = true;
    if (!this.startedAt) this.startedAt = performance.now();
    this.lastT = performance.now() / 1000;
    this.raf = requestAnimationFrame(this.frame);
  }

  stop() {
    this.running = false;
    if (this.raf) cancelAnimationFrame(this.raf);
    this.raf = 0;
  }

  /** Reduced-motion path: exactly one static frame, no loop, no pulse. */
  renderStatic() {
    if (!this.data) return;
    this.introDone = true;
    this.easePX = 0;
    this.easePY = 0;
    this.draw(performance.now() / 1000, false);
  }

  destroy() {
    this.stop();
    this.data = null;
    // Release backing stores promptly.
    this.canvas.width = 0;
    this.canvas.height = 0;
    this.off.width = 0;
    this.off.height = 0;
  }
}
