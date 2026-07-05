# Current State

> Keep this file current. Update it after every significant piece of work.

**Last updated:** 2026-07-05

## Current Phase

Phase 4 — Technical Foundation, **in progress**: frontend stack ratified + Sprint 0 foundation shipped. **Code now exists.**

## Completed

**Documentation (docs 01–16, all approved):** PRD (D-004…006) · System Architecture (D-007…014) · Experience Architecture (D-015…017) · DSVL + Animation Guidelines (D-018…020) · IA (D-021…022) · Wireframes (D-023) · Brand (D-024) · Tokens (D-025) · Landing spec v1.1, review-approved 84/100 (D-026, D-027).

**Sprint 0 — Frontend Foundation (D-028):**
- Frontend stack ratified in `docs/06`: Next.js App Router · TS strict · Tailwind v4 · Motion · GSAP (lazy) · Lucide · next-themes · Radix-based primitives · Zustand
- `apps/web` in npm-workspaces monorepo; **build verified** (compile + lint + typecheck + 4 static pages; 103 kB first-load baseline)
- Design tokens live as Tailwind v4 `@theme` — three tiers, semantic utilities only; **color primitives provisional pending design sign-off**
- Layout system (Container/Section/Grid, nav + footer shells) · motion recipes (docs/08 as code) with global reduced-motion parity (`MotionConfig "user"`)
- UI primitives under the one-overlay contract (Button, Card, Badge/Tag, Input, Dialog, Sheet, Tooltip, Skeleton, **Portrait** — not Avatar, per D-025)
- Content variants (ProjectCard, PublicationRow, PostRow, Timeline, Prose) · content types + **interface-only** content service (no fake data)
- Palette ⌘K wiring (placeholder) · Dex feature boundary (graceful-absence placeholder, renders nothing)

## In Progress

- Nothing active; Sprint 1 (landing implementation) is unblocked

## Next Steps

1. **Sprint 1 — Landing implementation** per `specs/landing.md` v1.1 (build order = review's priority list; hallway-test the graph motif early)
2. `docs/09-DATABASE_PLAN.md` + data access layer ratification (content service implementation)
3. `docs/07-COMPONENT_GUIDELINES.md` against the working codebase
4. `docs/10-DEPLOYMENT.md` + vendor ratification
5. Design sign-off: provisional color primitives (one-file retune in `globals.css`)

## Notes

Version: **`v0.2.0-alpha`**. Still open with the owner: "Dex" name veto, monogram choice, accent hue confirmation. Remaining `docs/06` ratifications: ORM, LLM/embedding models, PaaS/storage/CDN vendors, auth, markdown pipeline, ops tooling.
