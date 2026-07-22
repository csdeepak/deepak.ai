# The Instrument Design System (D-052)

> Ratified by D-052 (2026-07-21). Supersedes the ad-hoc V1/V2 token usage as the
> single, coherent design language for the whole site. Inspired by Apple's
> restraint, Gemini's soft directed-energy motion, and Google's clarity.
>
> **This is a system, not a coat of paint.** Every page — `/`, `/projects`,
> `/projects/[slug]`, and the admin shell — resolves to these tokens. The
> implementation lives in `apps/web/src/styles/globals.css` (Tailwind v4
> `@theme` + CSS variables) and `apps/web/src/app/layout.tsx` (fonts).

---

## 0. First principles

1. **Dark-first.** Dark is the default identity; light ("Paper") is a mirrored, first-class equal.
2. **Energy is earned.** The colour accent is a *gradient* and it appears **only** at energy/signal moments — pulses, hover, active CTA, the live line. Never a flat brand fill, never a washed background.
3. **One idea per section.** No section presents two competing focal points (Apple pacing).
4. **Restraint is enforced by the token set.** Three display sizes, three body sizes, two energy easings. If a value isn't a token, it doesn't exist.
5. **Native scroll always wins.** No scroll hijacking anywhere.

---

## 1. Colour

Dark-first, light mirrored. All values are CSS variables in `globals.css`; components consume **semantic** names only (never raw hex).

### Stage & ink

| Role | Token (semantic) | Dark | Light |
|------|------------------|------|-------|
| Stage (the page) | `canvas` | `#0A0B0D` | `#FAFAF7` (warm off-white, Apple parchment) |
| Ink (primary text) | `ink` | `#F2F3F5` | `#0A0B0D` |
| Muted ink | `muted` | ink @ 60% | ink @ 60% |
| Faint ink (metadata) | `faint` | ink @ 38% | ink @ 38% |
| Grid lines / dividers | `border` (hairline) | ink @ 8% | ink @ 8% |
| Surface (cards, panels) | `surface` | `#131519` | `#FFFFFF` |
| Raised (overlays) | `raised` | `#1B1E24` | `#FFFFFF` |

### The accent — a Gemini-inspired gradient

```
#4F8CFF  →  #B69CFF  →  #FF9CB0
 blue        violet      warm pink
```

Exposed as tokens:

- `--grad-1 / --grad-2 / --grad-3` — the three stops (also read by the WebGL scene as directed-energy colours).
- `--accent-gradient` — `linear-gradient(100deg, var(--grad-1), var(--grad-2), var(--grad-3))`.

**Rules of use (non-negotiable):**
- Only as **directed energy**: a bright leading edge diffusing into a tail — pulses, active-CTA fill, active-nav underline, hover accents, focus ring.
- **Never** as a flat brand colour, never as a section background wash, never as body text.
- Any single view stays **≥ 92 % neutral** (stage + ink + hairline). The gradient is a spark, not a surface.
- For places that cannot render a gradient (e.g. `::selection`, some outlines), fall back to the **blue leading-edge stop** `--grad-1` as a solid (`--signal-solid`) — it is the highest-contrast stop and reads as the same signal in both themes.

**Hero-region accent uses (D-052.1 — dark stage only, restraint enforced):**

These are the only three colour additions introduced in D-052.1. All live exclusively inside the hero stage. No gradient may be added to nav, cards, mission, projects grid, or footer.

1. **Ambient stage bloom:** A large soft radial gradient plane (blue → violet → pink, additive blending) rendered in the WebGL stage at **~8 % peak opacity** (6–8 % breathing range, ±2 % over a 10-second sinusoidal cycle). Reads as ambient light, never as brand colour. Fades with the surface layer during the dive beat.
2. **Sub-line warm tint:** The four hero beat sub-lines receive a warm gradient tint applied via `.hero-subline-gradient` — the accent gradient at **40 % strength blended over dark-mode ink**. Contrast against the dark stage remains ≥ 4.5 : 1 (WCAG AA). Dark stage only.
3. **CTA secondary hover underline:** "Read the memory" text link receives an accent-gradient underline on hover via `.gradient-underline-hover`. No colour change at rest.

**Hero region always-dark rule (D-052.1):** The hero section (`[data-hero-section]`) carries `class="dark"` unconditionally. The nav adds `class="dark"` while any part of the hero section intersects the viewport. Below the hero, the site respects the user's theme choice normally.

### Status (state only, reserved)

`success #34C759 / #1E934A` · `warning #FFB020 / #B26B00` · `danger #FF5A5F / #D22D2D`. Never decorative.

---

## 2. Typography

Two families. **Six sizes total. No others exist.**

| Family | Token var | Stack |
|--------|-----------|-------|
| Display | `--font-display` | Inter Tight → SF Pro Display → Inter → system-ui |
| Body | `--font-sans` | Inter → SF Pro Text → system-ui |
| Mono (data/telemetry only) | `--font-mono` | JetBrains Mono → ui-monospace |

### The six sizes

| Token | Size | Line height | Tracking | Use |
|-------|------|-------------|----------|-----|
| `text-hero` | `clamp(3.5rem, 6vw + 1rem, 7rem)` | 1.05 | −0.02em | Hero headline only |
| `text-section` | `clamp(2rem, 3vw + 1rem, 3.5rem)` | 1.05 | −0.02em | Section headings |
| `text-card-title` | `1.25rem` | 1.2 | −0.01em | Card titles |
| `text-lead` | `1.125rem` | 1.6 | 0 | Lead paragraphs, support lines |
| `text-body` | `1rem` | 1.6 | 0 | Body copy |
| `text-micro` | `0.8125rem` | 1.5 | 0 | Micro / eyebrow / metadata |

**Weights:** 400, 500, 600 **only**. **Display** uses −0.02em tracking and 1.05 line-height; **body** uses 0 tracking and 1.6 line-height. Mono is machine-truth only (code, commands, versions, telemetry) — never headings, never "techy vibes."

> **Transition note (Phase 3):** legacy tokens (`text-display`, `text-h1…h4`, `text-reading`, `text-small`, `text-legal`) remain as thin aliases so the pre-reskin build keeps compiling. Phase 3 migrates every component to the six canonical tokens; once migration is complete the legacy aliases are deleted and Tester item #12 (no arbitrary sizes) passes.

---

## 3. Space & rhythm

- **8px base grid** (Tailwind's 4px unit; use even steps). Off-grid values are defects.
- **Section vertical rhythm:** `160px` desktop / `96px` mobile between beats → `py-24 md:py-40` (96/160), or the `.section-rhythm` utility.
- **Max content width** `1200px` (`container-content`); reading column `680px`; hero and immersive sections go **full-bleed**.
- **≥ 55 % negative space** at every rest frame. When a layout feels empty, fix hierarchy — never add ornament.

---

## 4. Motion

Two ownable easings + a single reveal recipe. Reduced-motion renders the final state immediately.

| Token | Curve | Use |
|-------|-------|-----|
| `--ease-instrument` | `cubic-bezier(0.22, 1, 0.36, 1)` | Default for reveals, hover, most UI |
| `--ease-arc` | `cubic-bezier(0.65, 0, 0.35, 1)` | Energy — pulses, gradient sweeps |

- **Reveal on scroll:** 400ms fade + 12px translate-up, **once**, IntersectionObserver-based (`ScrollReveal` / `fadeUp`). Honours `prefers-reduced-motion` (final state immediately).
- **Hover on interactive:** 180ms `ease-instrument` on transform + colour.
- **No page-scroll hijacking.** Native scroll owns truth; the scene rail is scrubbed by real scroll.
- Numbers settle, never spin. Only one ambient loop is permitted site-wide (Dex's breath).

---

## 5. Chrome

### Nav
Fixed top; **glass-morphism** at 8px blur over 60 % stage background; ink text; a **single accent-gradient underline** on the active route. **≤ 5 nav items.**

### CTA
Pill, **44px** height, **20px** horizontal padding, weight **500**, subtle **1px ink border at 20 % opacity**. On hover it fills with a **static gradient overlay** (not animated — energy is reserved). Utility: `.cta-pill` + `.cta-pill--energy`.

### Focus ring
**2px** ring, offset **2px**, always visible on keyboard focus. Rendered as a solid `--signal-solid` (`--grad-1`) ring globally (accessible, on-signal); chrome elements may opt into a true gradient outline via `.focus-gradient`.

### Cursor
Default everywhere. A small custom cursor dot (8px ink) with a 32px follow ring appears **only on the 3D stage** — never globally (globals feel gimmicky).

---

## 6. Utilities (in `globals.css`)

| Class | Purpose |
|-------|---------|
| `.text-gradient` | Accent gradient clipped to text — for the one energy word, never a paragraph |
| `.gradient-underline` | Active-nav / link underline in the accent gradient |
| `.cta-pill`, `.cta-pill--energy` | The pill CTA + its hover gradient fill |
| `.section-rhythm` | 96/160px vertical rhythm |
| `.focus-gradient` | True gradient focus outline for chrome |
| `.animate-entrance` | Zero-JS LCP entrance (hero text) |
| `.dl-breathe` | Dex's breath — the one permitted ambient loop |

---

## 7. Hero-scene — the glowing network (D-052.2 → D-052.6)

The 3D hero renders on its own dark stage (a "screen within the page"); its colours are the scene's own, but the accent stops match `--grad-1/2/3`.

**Ambient background glow (the "bulb behind the face"):** a large, heavily-blurred accent-gradient radial plane behind the head at **~12–15 % peak opacity**, breathing on a 10 s cycle (±1.5 %). It reads as a light source illuminating the body, never as brand fill. It fades out with the face during the dive so it does not wash the Beat-3 network.

**Bulb-nodes (Beat 3) — instanced billboards (D-052.6):** every inner node is a **camera-facing WORLD-SIZED quad** (an `InstancedBufferGeometry` of unit planes billboarded in the vertex shader), **not** a `gl.POINTS` sprite. Point size is capped by the driver on real Windows GPUs (ANGLE/D3D), which rendered nodes as sub-3 px pinpoints regardless of the requested `gl_PointSize`; world-sized quads have **no size cap** and give true fly-through parallax (near nodes grow into orbs, far ones recede). Apparent size is normalised to a reference viewport height (`uViewScale = 900 / actualHeight`). Additive, `depthWrite:false`, `toneMapped:false`, circular mask. **Colour is per-node** — biased along the accent gradient (`--grad-1`→`--grad-2`→`--grad-3`) by POSITION (projected onto the ~10° axis, normalised across the cloud), with per-layer saturation:

| Layer | Gradient bias · saturation | Core / halo | Base world Ø · core radius | Measured CSS px @ settle |
|-------|----------------------------|-------------|----------------------------|--------------------------|
| Project | blue-leaning · **full sat** | 2.8 / 0.45 | 0.0125 · 0.5 | **~43** (target 34–48) |
| Skill | violet-leaning · **0.85 sat** | 1.9 / 0.34 | 0.0066 · 0.5 | **~24** (target 20–28) |
| Ambient | full spread · **0.62 sat** | 1.0 / 0.22 | 0.0038 · 0.5 | **~10** (target 9–14) |

- **Bright body, not a pinpoint:** the fragment core occupies **half the sprite (radius 0.5)**, then a soft halo ring to the edge — each node reads as a lit bulb with a real bright body. Project/skill cores clear the 1.2 bloom threshold; ambient stays below (atmosphere).
- **Sizes are browser-MEASURED** (Playwright, real WebGL, 1440×900 dpr2) — not analytic. At the settled flight camera project ≈ 43 px, skill ≈ 24, ambient ≈ 10; close fly-through passes render much larger (parallax), the approach (off≈0.65) smaller.
- **Density guard 0.95:** halo/core × layer opacity keep typical overlaps under 0.95 luminance; ambient desaturated so it recedes.
- **Breathing:** per-node ±12 %, unique phase.

**Camera flight THROUGH the network (Beat 3, D-052.6):** for `off ∈ [0.60, 1.0]` the camera flies **into and through** the node field on a second `CatmullRomCurve3` whose control points are **derived from the graph data** (LAW-005): waypoints sit at the xy-centroid of nodes in successive depth bands, offset to alternating sides so the camera weaves between nodes, then nudged away from any node it would clip; it settles just in front of the deep cluster. Speed uses `smootherstep` (slow-in / steady / slow-out); orientation is a look-ahead (`getPointAt(u+0.006)` / end-tangent) with quaternion **slerp damping 0.08**; fog tracks the camera (near 0.04 / far 0.6) so depth reads. As the camera passes within ~0.14 of a project/skill node it brightens **+40 %** and a **DOM label** (project/skill name from the data) fades in beside it — **never more than 3 at once** (the nearest 3), projected from the node's 3D position, positioned/faded directly by the scene (no React churn).

**Edge pulses (Beat 3, D-052.4 FIX 2):** signal pulses travel the network via `meshline` + animated `dashOffset`. They are **launched on a cadence — a new pulse every 1.8–2.4 s** on a fresh path (`PULSE_INTERVAL_MIN/MAX`), each with a `PULSE_LIFETIME ≈ 4.5 s` so **2–3 pulses travel concurrently**. An opacity envelope (fast in, hold, diffuse out) makes each pulse read as a discrete event, not a constant glow. Two bright slots run project-connection paths (`--grad-1 ×2.4`, blooms); one dim slot runs ambient paths (`--grad-2 ×0.9`). **Static (non-pulsing) structural edges stay very dim (alpha 0.14)** so pulses register as events.

**Beat 2 cross-fade:** surface `0.32→0.60`, network `0.37→0.60` (+0.05 lag). The two layers are never both above ~0.70 opacity (verified: surface >0.70 only for off < 0.42; network >0.70 only for off > 0.52 — disjoint). A bottom stage-colour scrim keeps sub-lines 3 & 4 ≥ 4.5:1 over the network.

**Data:** node categories are algorithm-derived (LAW-005) via `npm run hero:enrich`. Re-run after any project publish/unpublish. Face data comes from `npm run hero:generate` (portrait-prior sampling, LAW-008-gated on the real photo).

---

## 8. Governance

- **One-file retune:** all colour/type/motion primitives live in `globals.css`. Touching primitives recolours the entire product.
- **Closed sets:** 6 type sizes, 3 weights, 2 energy easings, 1 gradient. Additions require a decision entry.
- **Admin stays quiet:** admin uses ink-on-stage + Instrument type; **no gradient anywhere in admin** — energy is for the public surface only.
- **Enforcement:** Tester item #12 greps for hex outside this doc's tokens (target: zero) and arbitrary Tailwind sizes outside the 6 tokens.
