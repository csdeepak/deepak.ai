# web — Deepak Labs public application

The public site (and, until split, the admin surface) of Deepak Labs. Built on the ratified stack (`docs/06-TECH_STACK.md`): Next.js App Router · TypeScript (strict) · Tailwind CSS v4 · Motion · GSAP (lazy, draw-ins only) · Lucide · next-themes · Zustand.

## Commands

```bash
npm run dev        # develop
npm run build      # production build
npm run typecheck  # tsc --noEmit
```

Run from the repo root (npm workspaces) or from this directory.

## Structure

```
src/
├── app/          → routes (App Router)
├── components/
│   ├── layout/   → Container · Section · Grid · nav/footer shells
│   ├── ui/       → primitives (Button, Card, Dialog, …) — docs/15 §6
│   ├── content/  → Card/Row content variants (ProjectCard, PostRow, …)
│   ├── search/   → search skins
│   └── overlays/ → palette (placeholder)
├── features/     → feature modules (dex/ — v1.5 placeholder)
├── animations/   → motion recipes (docs/08 as code) + lazy GSAP
├── hooks/        → shared hooks
├── stores/       → Zustand (overlay state only)
├── providers/    → theme + MotionConfig
├── services/     → data contracts (interface-only until docs/09 lands)
├── types/        → content model (docs/04 §2)
├── config/ · constants/ · lib/ · styles/
content/          → temporary local content (no fake data)
```

## The rules that bind this codebase

1. **Tokens only** — components never hardcode values; semantic Tailwind utilities come from `src/styles/globals.css` (three-tier system, D-025). Color primitives are provisional pending design sign-off (D-028).
2. **One overlay contract** — Dialog/Sheet share one Radix behavior; a second modal implementation is a defect.
3. **Cards + Rows** are the only content-display families (docs/15 §7).
4. **Reduced-motion parity** is global (`MotionConfig reducedMotion="user"`) — never re-implement per component.
5. **Server components by default**; `"use client"` only where interaction demands it.
6. **No fake data, no placeholder portfolio content** — graceful absence over stubs (XA §0.3).

Full documentation: [`../../docs/`](../../docs) — start at [`../../memory/MASTER_CONTEXT.md`](../../memory/MASTER_CONTEXT.md).
