# Current State

> Keep this file current. Update it after every significant piece of work.

**Last updated:** 2026-07-05

## Current Phase

Phase 5 begun — **Sprint 1 (landing) implemented**; Phase 4 items (database plan, deployment, component guidelines) still open in parallel.

## Completed

**Documentation (docs 01–16):** PRD · System · XA · DSVL + Animation · IA · Wireframes · Brand · Tokens · Landing spec v1.1 (review-approved 84/100). Decisions D-004…D-027.

**Sprint 0 (D-028):** `apps/web` foundation — ratified stack, tokens as Tailwind v4 `@theme`, layout system, motion recipes, primitives, contracts. Build verified.

**Sprint 1 (D-029):** Landing implemented per `specs/landing.md` v1.1 —
- Hero: server-rendered text + CSS-only entrance (LCP never waits on JS); **graph motif** (9 nodes, R2 guardrails, Motion pathLength, once-per-session, reduced-motion = pre-drawn); R5 staleness rule; CV CTA renders only when a CV file exists
- S2–S5 data-driven with **graceful self-hiding** (no fake data anywhere); S4 has no animation (data is still)
- S7 contact = v1.0 resolution beat (R3); real Footer = sitemap-of-record + **build-date freshness stamp** (the quiet reveal)
- Dex Preview (v1.5) and News slot (v2) not rendered — graceful absence
- New reusables: CopyButton, ThemeToggle, `animate-entrance` CSS utility, local ContentService, 404 page
- **Build verified:** static prerender, 150 kB first-load on `/`

## Major direction change (this session)

**The hero is now an interactive 3D scene** (owner directive, D-030; architecture ratified as D-031 / [`../docs/17-HERO_SCENE_ARCHITECTURE.md`](../docs/17-HERO_SCENE_ARCHITECTURE.md)):
- Scene graph: data-driven knowledge graph + **the Twin** (stylized 3D Deepak at a workbench — vocabulary: Twin = 3D figure, Dex = the AI) + Dex as a luminous spatial entity
- Scroll-scrubbed camera rail, five acts, DOM-overlay text always (identity legible at scroll-zero in every tier)
- **Tier ladder:** Full 3D / Lite 3D / **Tier 0 = the shipped Sprint 1 hero (retained verbatim)**; reduced-motion = composed keyframe stations
- Hard budgets as release criteria; asset pipeline with two owner sign-off gates (concept → blockout) before production spend
- D-020 partially superseded (stylized only — photoreal/AI-imagery bans survive); D-026/D-027 superseded in hero scope; `specs/landing.md` → v1.2

## In Progress

- Landing (Tier 0) implemented but release-gated: real content in `content/site.ts`, R4 copy tests
- Hero scene: architecture approved; awaiting engine ratification + concept gate #1

## Next Steps

1. **Owner:** size the 3D asset budget; schedule concept gate #1 (Twin style frames — the cheapest kill point)
2. Engine/library ratification into `docs/06` (R3F-class vs vanilla WebGL-class) before any scene code
3. **Owner content pass** — fill `content/site.ts` TODO(copy) fields + first real projects/posts (feeds both the page and the scene's graph)
4. `docs/09-DATABASE_PLAN.md` + real content layer behind the existing interface
5. Next page sprints: Projects index/detail (shared-element pattern), then Posts
6. `docs/07`, `docs/10` + vendor ratification → first deploy (Tier 0 can deploy before the scene exists)

## Notes

Version: **`v0.3.0-alpha`**. Still pending with owner: Dex name veto, monogram, accent hue sign-off (provisional values in `globals.css` tier-1). Lighthouse audit deferred to first deploy environment (local numbers are not the release evidence).
