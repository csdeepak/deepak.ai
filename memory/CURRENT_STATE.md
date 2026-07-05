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

## Hero Scene Bible (this session)

Creative direction complete — [`../docs/18-HERO_SCENE_BIBLE.md`](../docs/18-HERO_SCENE_BIBLE.md) (D-032): recency-as-proximity spatial thesis; Twin style system (matte-ceramic, eyes-suggested, no eye contact, no close-ups) with a **likeness gate — reference images of Deepak do not exist in the repo yet and are required for gate #1**; Dex life cycle incl. citation-trail illumination; luminance-not-hue graph logic + growth-on-publish; five-shot camera grammar, no idle camera; particles-as-information (4 data-event types, ambient sparkle refused); 5%-step scroll bible; cut-order documented for scope pressure.

## Moodboard spec ratified (latest)

**Look-dev contract** — [`../docs/20-HERO_MOODBOARD.md`](../docs/20-HERO_MOODBOARD.md) (D-034): materials with roughness targets, lighting in Kelvin, 35mm lens, governed absences (no bloom / no mirrors / no in-scene glass), ≥55% negative space, licensed micro-details, 16-tile reference list, 8-point acceptance checklist. Gate #1 frames are judged against this checklist.

## Art direction ratified

**"The Drafted Laboratory"** — [`../docs/19-HERO_ART_DIRECTION.md`](../docs/19-HERO_ART_DIRECTION.md) (D-033): the Warm Lab drawn by the Drafting Space's hand. Solids carry hairline construction lines; new content is drawn into existence; accent = "the live line"; **the Twin is exempt from construction lines (the human is never a diagram)**; ≥80%-solid-at-rest guard. Decisive: **tier continuity** — Tier 0's 2D motif is the same world at its drawing layer. Eight directions explored and ranked; C and E rejected on named law collisions. Gate #1 packet defined (5 frames incl. tier-continuity proof).

## Next Steps

1. **Owner (blocking gate #1):** supply reference photos of Deepak → Twin style frames *in the Drafted Laboratory direction* → gate #1 review (uncanny check on drawings); also size the 3D asset budget
2. Engine/library ratification into `docs/06` (R3F-class vs vanilla WebGL-class) before any scene code
3. **Owner content pass** — fill `content/site.ts` TODO(copy) fields + first real projects/posts (feeds page and scene graph alike)
4. `docs/09-DATABASE_PLAN.md` + real content layer behind the existing interface
5. Next page sprints: Projects index/detail (shared-element pattern), then Posts
6. `docs/07`, `docs/10` + vendor ratification → first deploy (Tier 0 can deploy before the scene exists)

## Notes

Version: **`v0.3.0-alpha`**. Still pending with owner: Dex name veto, monogram, accent hue sign-off (provisional values in `globals.css` tier-1). Lighthouse audit deferred to first deploy environment (local numbers are not the release evidence).
