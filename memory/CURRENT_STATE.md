# Current State

> Keep this file current. Update it after every significant piece of work.

**Last updated:** 2026-07-05

## Current Phase

Phase 3 complete (IA + Wireframes). Next: Phase 4 — Technical Foundation (tech-stack ratification).

## Completed

- Repository initialized (structure, conventions, documentation system)
- **PRD** — [`../docs/02-PRODUCT.md`](../docs/02-PRODUCT.md) (D-004…D-006)
- **System Architecture** — [`../docs/11-SYSTEM_ARCHITECTURE.md`](../docs/11-SYSTEM_ARCHITECTURE.md) (D-007…D-014)
- **Experience Architecture** — [`../docs/12-EXPERIENCE_ARCHITECTURE.md`](../docs/12-EXPERIENCE_ARCHITECTURE.md) (D-015…D-017)
- **Design System & Visual Language** — [`../docs/03-DESIGN_LANGUAGE.md`](../docs/03-DESIGN_LANGUAGE.md) + [`../docs/08-ANIMATION_GUIDELINES.md`](../docs/08-ANIMATION_GUIDELINES.md) (D-018…D-020)
- **Information Architecture** — [`../docs/04-INFORMATION_ARCHITECTURE.md`](../docs/04-INFORMATION_ARCHITECTURE.md) (D-021…D-022)
- **Master Wireframe Specification** — [`../docs/13-WIREFRAME_SPEC.md`](../docs/13-WIREFRAME_SPEC.md) (D-023)
  - 5 screen archetypes (Index · Detail · Single-surface · Tool · Overlay) carrying ~26 screens
  - Full structural specs with ASCII layouts for anchor screens (Landing, Project Detail, /ai, Palette, Admin Dashboard, Admin Editor)
  - Component / interaction / layout inventories; responsive blueprint; loading/empty/error states
  - Brief's 12-section landing reconciled onto D-022's 8 sections (nothing lost — merged/deferred)
- **Brand Identity & Visual DNA** — [`../docs/14-BRAND_IDENTITY.md`](../docs/14-BRAND_IDENTITY.md) (D-024)
  - Narrative ("canonical"), personality dials, visual DNA (hairline + dot, human-hand-on-machine-grid tension)
  - Logo direction: wordmark-first + dL monogram; the dot stays exclusively Dex's
  - Vocabulary rule: plain names for places, coined names for inventions (nav renaming rejected)
  - Brand voice system + banned vocabulary; drawn-line as sole illustration language
  - Honesty ethic hardened: no generative/AI-enhanced imagery anywhere; evolution rides major versions
- **Design Token System & Component Architecture** — [`../docs/15-DESIGN_TOKENS.md`](../docs/15-DESIGN_TOKENS.md) (D-025)
  - All non-color token values ratified (spacing, sizing, type scale, radius, z-bands, motion, delays, focus, a11y floors)
  - Three-tier color architecture (primitive→semantic→component; primitives private) — **hex values still pending stack ratification**
  - Per-domain color groups rejected; `chart.*` is the only hue-minting set; Avatar rejected → `Portrait`
  - 24 component families under universal contracts; one overlay behavior; Cards+Rows only; closed-sets governance

- **Sprint 1: Landing Page master spec** — [`../specs/landing.md`](../specs/landing.md) (D-026) — **first feature Specified**
  - 13 requested sections reconciled to the 8 ratified (D-022 mapping); 3D portrait + cursor effects rejected per standing law
  - Hero: typographic + the **drawn graph motif** (real content graph, abstracted); 85vh, left-anchored; no ambient field in v1
  - Full section specs (S1–S8), scroll choreography, motion budget (≤3 narrative moments/session), content strategy, mobile-independent design, a11y checklist, perf budget (LCP = H1 text <1.5s, CLS 0)
- **Landing design review** — [`../docs/16-LANDING_REVIEW.md`](../docs/16-LANDING_REVIEW.md) (D-027): **84/100, Approved with Changes**; amendments R1–R6 applied → spec v1.1
  - Motif guardrails + hallway-test kill criterion (typographic fallback pre-approved); v1.0 ending choreographed (footer stamp = the quiet reveal); chevron cut; hero staleness rule; identity-sentence test gates; S6 offline state

## In Progress

- Nothing active; Phase 4 kickoff next

## Next Steps

1. **Ratify tech stack** (`docs/06`) — framework, LLM/embedding models, vendors + **hex ratification** into `docs/15` §3
2. `docs/07` component engineering conventions (post-stack)
3. Drill-down `09-DATABASE_PLAN.md` (imports IA §2 entities/relations) / `10-DEPLOYMENT.md`
4. Remaining P0 specs in `specs/` (projects, posts, publications, timeline, skills, admin — each imports its IA blueprint + wireframe spec)
5. High-fidelity design: the graph motif (Sprint 1's craft task) + the four grammar-setters — after tokens have hex

## Notes

No application code yet — by design. Six governing documents: PRD → `11` (system) → `12` (experience) → `03` (design) → `04` (structure) → `13` (screens). All design phases are document-complete; the project is ready for technical foundation.
