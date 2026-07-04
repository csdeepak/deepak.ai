# 08 — Animation Guidelines

> **Status:** Ratified — v1.0.
> **Derived from:** [`12-EXPERIENCE_ARCHITECTURE.md`](12-EXPERIENCE_ARCHITECTURE.md) §5–6 (motion philosophy, technique verdicts, timing doctrine) and [`03-DESIGN_LANGUAGE.md`](03-DESIGN_LANGUAGE.md) §8 (motion tokens). This document is the practical motion spec; conflicts resolve upward to the XA.

---

## Motion Principles (binding, from XA §5)

1. Motion is information — location, causality, relation, or state. Decoration is cut.
2. Feedback ≤200ms · transitions 200–350ms · narrative ≤600ms · **nothing the visitor waits on, ever.**
3. One focal motion per moment (DSVL Law 15).
4. Reading surfaces, evidence/data, navigation chrome, and the admin are still (XA §5).
5. Narrative moments play **once per session**.

## Token Set (from DSVL §8)

| Token | Duration | Easing | Use |
| --- | --- | --- | --- |
| `motion-instant` | 80ms | ease-out | Press feedback, toggles, hover-out |
| `motion-fast` | 120ms | ease-out | Hover-in, icon morphs, tooltip-in |
| `motion-base` | 200ms | ease-out | Palette open, menus, filters, most UI |
| `motion-slow` | 300ms | ease-out / ease-spring | Page transitions, dialogs, Dex panel, shared-element |
| `motion-narrative` | 450–600ms | ease-out | Landing reveals, timeline/SVG draw-ins — once |

Easings: **ease-out** for 90% of motion (user-caused); **ease-in-out** for cross-fades and theme toggle; **ease-spring** (gentle, ≤2% overshoot) for shared-element only; **linear** for progress indication only.

## Context Rules

- **Hover:** in at `fast`, out at `instant`. Leaving is weightless.
- **Scroll reveals:** opacity + ≤16px translate at `base`; trigger once; never re-fire; content exists in DOM regardless (XA §11). Scrollytelling responds to scroll, never owns it — no hijacking (DSVL §15).
- **Page transitions:** `slow`, content-first; data never waits on choreography. Shared-element (card→detail) is the priority transition (XA §6) at `slow`/`ease-spring`.
- **SVG line draw-ins:** timeline, diagrams — `narrative`, once per session, then permanently drawn.
- **Micro-interactions:** copy→check, save confirmations, form validation — `fast`–`base`; the core motion investment (XA §6).
- **Celebration:** exactly two — contact-form sent, first Dex conversation (XA §5). `base`, dignified, no confetti physics.

## Dex (AI) Motion

- **Idle:** presence-dot breathing, ~2.4s period, sub-perceptual amplitude. The only permitted loop in the product.
- **Thinking:** breathing deepens (amplitude, not speed — calm under load).
- **Panel:** opens `slow`/`ease-spring` as side panel (bottom sheet on mobile).
- **Streaming:** text renders plainly — no per-character typewriter effects (terminal cosplay, DSVL §15). Live-region announcements chunked (XA §11).
- **Failure:** states swap at `base` with honest copy; no error shake theatrics.

## Loading Behavior

- Skeletons match final geometry (zero layout shift — DSVL Law 16); shimmer period ≥1.2s.
- Sub-150ms resolutions show no loader at all.
- Inline spinners only inside controls; full-page spinners forbidden.
- The shell always renders first.

## Reduced-Motion Parity Mapping (release criterion — XA §11, DSVL Law 24)

| Full motion | `prefers-reduced-motion` equivalent |
| --- | --- |
| Shared-element transition | Instant navigation; clear heading confirms arrival |
| Page transition | Instant swap |
| Scroll reveals | Content simply present |
| SVG draw-ins | Diagrams/timeline fully drawn |
| Hero cinematic | Composed static first frame |
| Dex breathing dot | Static dot + text state ("thinking…") |
| Skeleton shimmer | Static skeleton blocks |
| Celebration moments | Static confirmation message |
| Hover/focus tone steps | Retained (state changes are information, not motion) |

Nothing is communicated only through motion; the still experience is designed, complete, and first-class.

## Performance Rules

- Animate **transform and opacity only**; never layout properties (width/height/top/left) — no reflow-driven motion.
- 60fps on mid-range hardware is the test target (XA §12); a janky animation ships as no animation.
- Motion never delays interactivity: input handlers attach before entrance animations complete.
- Ambient instances (Dex dot; optional landing field) must be imperceptible in CPU/battery profiles.

## Technique Verdicts

Governed by XA §6 — the verdict table there is binding. Rejected techniques (3D-as-decoration, liquid glass, horizontal-scroll pages, magnetic interactions, cursor effects) require an XA amendment plus a decision-log entry to revisit.
