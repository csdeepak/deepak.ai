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

## In Progress

- Landing is **implemented but release-gated** on: real content in `content/site.ts` (all TODO(copy) fields), R4 identity-sentence tests, R2 motif hallway test

## Next Steps

1. **Owner content pass** — fill `content/site.ts` (identity sentence, email, CV, focus line, outbound links) + first real projects/posts/publications
2. R2 hallway test (motif) + R4 copy tests — release gates
3. `docs/09-DATABASE_PLAN.md` + real content layer replacing `local-content.ts` behind the same interface
4. `docs/07-COMPONENT_GUIDELINES.md` against the working codebase
5. Next page sprints: Projects index/detail (the shared-element pattern), then Posts
6. `docs/10-DEPLOYMENT.md` + vendor ratification → first deploy

## Notes

Version: **`v0.3.0-alpha`**. Still pending with owner: Dex name veto, monogram, accent hue sign-off (provisional values in `globals.css` tier-1). Lighthouse audit deferred to first deploy environment (local numbers are not the release evidence).
