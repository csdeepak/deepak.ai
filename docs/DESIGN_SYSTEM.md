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

## 7. Governance

- **One-file retune:** all colour/type/motion primitives live in `globals.css`. Touching primitives recolours the entire product.
- **Closed sets:** 6 type sizes, 3 weights, 2 energy easings, 1 gradient. Additions require a decision entry.
- **Admin stays quiet:** admin uses ink-on-stage + Instrument type; **no gradient anywhere in admin** — energy is for the public surface only.
- **Enforcement:** Tester item #12 greps for hex outside this doc's tokens (target: zero) and arbitrary Tailwind sizes outside the 6 tokens.
