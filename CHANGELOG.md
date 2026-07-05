# Changelog

All notable changes to Deepak Labs are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/).

---

## [Unreleased]

### Added
- Hero Scene Architecture (`docs/17-HERO_SCENE_ARCHITECTURE.md`) — the hero redefined as an interactive 3D scene: scene/object hierarchies (data-driven knowledge graph, the stylized Twin at a workbench, Dex as a spatial entity), scroll-scrubbed camera rail with five acts, lighting system, full interaction model (hover/keyboard-with-focus-proxies/touch/reduced-motion stations), performance budgets as release criteria, asset pipeline with owner sign-off gates, and a three-tier fallback ladder where the shipped Sprint 1 hero is Tier 0.

- Hero Scene Bible (`docs/18-HERO_SCENE_BIBLE.md`) — full creative direction (D-032): per-object bible, Twin style system with likeness gate, Dex life cycle with citation-trail illumination, graph luminance logic + growth-on-publish, five-shot camera grammar, lighting bible (separation light, time-of-day), particles-as-information taxonomy, motion bible, 5%-step scroll timeline, performance/accessibility/asset bibles, Hero v2/v3 visions.
- Hero Art Direction (`docs/19-HERO_ART_DIRECTION.md`) — eight divergent directions fully attributed and ranked; **"The Drafted Laboratory"** hybrid (Warm Lab × Drafting Space) ratified as D-033 with tier-continuity as the decisive argument and a 5-frame gate #1 packet defined.
- Hero Moodboard Specification (`docs/20-HERO_MOODBOARD.md`) — the look-dev contract (D-034): material family with roughness targets, lighting rig in Kelvin, lens settings, governed absences (no bloom / no mirrors / no in-scene glass), negative-space law, DOM typography with leader-line annotations, licensed micro-details, 16-tile reference list, acceptance checklist.

### Changed
- Decisions D-030/D-031 logged: owner supersession of D-020 (likeness ban lifted for a stylized, non-photoreal hero representation only), D-026 (typographic hero demoted to Tier 0 fallback, retained verbatim), and D-027 (hero-scope findings); D-016 amended for the hero scene only. Vocabulary: "the Twin" = the 3D representation; "Dex" remains the AI.
- `specs/landing.md` → v1.2: §2.1 superseded by docs/17; S2–S8 unchanged.
- `docs/17` refined by the bible in three named places (separation hairlight, time-of-day key lighting, particle taxonomy) — logged in D-032.

## [0.3.0-alpha] — Sprint 1: Landing Page Implementation

### Added
- Landing page implemented per `specs/landing.md` v1.1: Hero (CSS-only entrance, graph motif with once-per-session draw-in under R2 guardrails, R5 staleness rule), Featured Work, Research Highlight, Current Focus, Latest Posts, Contact strip (v1.0 resolution beat per R3), sitemap-of-record Footer with build-date freshness stamp.
- Reusable additions: `CopyButton` (flagship micro-interaction), `ThemeToggle`, CSS `animate-entrance` utility, local `ContentService` implementation over typed `content/` files, proper 404 page per IA error grammar.
- Implementation patterns logged as D-029 (CSS-first LCP, Motion pathLength over GSAP for the motif, data-driven graceful absence, build-date stamps).

### Changed
- Nav shell: 4 lanes + theme toggle; footer shell replaced by the real Footer.
- Landing sections self-hide until real content exists — no fake data renders anywhere.

### Notes
- Not rendered by design: Dex Preview (v1.5, D-004) and News slot (v2, D-006) — graceful absence.
- Public release gated on: real content, R4 identity-sentence tests, R2 motif hallway test.

## [0.2.0-alpha] — Documentation Stack + Frontend Foundation

### Added — Sprint 0: Frontend Foundation
- Frontend stack ratified in `docs/06-TECH_STACK.md` (Next.js App Router, TypeScript strict, Tailwind v4, Motion, GSAP lazy-only, Lucide, next-themes, Radix-based primitives, Zustand) — D-028.
- `apps/web` application in the npm-workspaces monorepo: design tokens as Tailwind v4 `@theme` (three-tier system, provisional color primitives), layout system (Container/Section/Grid, nav/footer shells), motion recipes with global reduced-motion parity, UI primitive scaffolds (Button, Card, Badge/Tag, Input, Dialog, Sheet, Tooltip, Skeleton, Portrait), content-variant scaffolds (ProjectCard, PublicationRow, PostRow, Timeline, Prose), content types + interface-only content service, command-palette ⌘K wiring, Dex feature boundary (graceful-absence placeholder).
- Build verified: compile + lint + typecheck + static generation.

### Added — Documentation
- Product Requirements Document (`docs/02-PRODUCT.md`) — the single source of truth for product scope, with strategic assessment, personas, prioritization tiers, metrics, risks, and constraints.
- Vision document completed (`docs/01-VISION.md`).
- Feature catalog prioritized into P0/P1/P2 tiers (`docs/05-FEATURES.md`).
- Product decisions D-004–D-006 logged (phased delivery; Posts as publishing, not social; News rescoped as "Radar" and deferred to v2.0).

- System Architecture Document (`docs/11-SYSTEM_ARCHITECTURE.md`) — the technical source of truth: 20 sections, trade-off analysis, diagrams, and appendices.
- Architecture decisions D-007–D-014 logged (modular monolith; PostgreSQL + pgvector + FTS; RAG AI; cached GitHub; Postgres search first; managed PaaS; object storage + CDN; single-admin auth with future-ready RBAC).
- Experience Architecture (`docs/12-EXPERIENCE_ARCHITECTURE.md`) — the experience source of truth: visitor journey, per-page purposes, navigation philosophy (command palette), motion doctrine with 15 technique verdicts, Digital Twin experience design, accessibility strategy, risks.
- Experience decisions D-015–D-017 logged (Twin represents-never-impersonates; motion teach-structure-not-perform verdicts; persistent nav + Cmd/K palette + contextual graph).
- Design System & Visual Language (`docs/03-DESIGN_LANGUAGE.md`) — brand identity, typography (Inter + JetBrains Mono), "Graphite & Paper" color philosophy with single accent, layout system, component language, iconography, glass/3D/photography charters, data-viz style, accessibility floors, responsive behavior, 25 design laws, 15 anti-patterns. The Twin is named **Dex**.
- Animation Guidelines ratified (`docs/08-ANIMATION_GUIDELINES.md`) — motion tokens, context rules, Dex motion, reduced-motion parity mapping, performance rules.
- Design decisions D-018–D-020 logged (design language ratified; Twin named Dex with presence-dot identity; glass finalized to two surfaces with liquid glass permanently rejected + 3D dormant charter).
- Information Architecture & UX Blueprint (`docs/04-INFORMATION_ARCHITECTURE.md`) — sitemap/routes, content model with closed relation taxonomy, navigation architecture, page blueprints for ~20 surfaces, 9 user flows, search architecture, Dex placement, empty/error states, mobile-intentional design.
- IA decisions D-021–D-022 logged (4-lane nav + 3-level depth + relation taxonomy; landing capped at 8 sections with Mission/News-preview cuts).
- Master Wireframe Specification (`docs/13-WIREFRAME_SPEC.md`) — 5 screen archetypes, structural specs for ~26 screens with ASCII layouts, component/interaction/layout inventories, responsive blueprint, cross-cutting loading/empty/error states, implementation notes for high-fidelity design.
- Wireframe decision D-023 logged (archetype system; brief's 12-section landing reconciled onto D-022's 8; closed sticky list; load-more over infinite scroll; triage-grade mobile admin; alt-text enforced at media library; full content export in admin settings).
- Brand Identity & Visual DNA (`docs/14-BRAND_IDENTITY.md`) — brand narrative, personality dials, visual DNA, typography/motion identity, logo direction (wordmark-first + monogram), icon/photography/illustration charters, Dex brand sheet, brand voice with banned vocabulary, design vocabulary (plain places, coined inventions), brand anti-patterns, 5–10 year evolution policy.
- Brand decision D-024 logged (wordmark-first with dL monogram; dot reserved for Dex; navigation renaming rejected; drawn-line as sole illustration language; no generative/AI-enhanced imagery anywhere).
- Design Token System & Component Architecture (`docs/15-DESIGN_TOKENS.md`) — framework-agnostic foundations (spacing, sizing, type, radius, z-bands, motion, delays, focus, a11y — all non-color values ratified), three-tier color token architecture (hex deferred), motion recipes with reduced-motion equivalents, layering contracts, component architecture for 24 families with universal contracts, composition rules, governance model.
- Token decision D-025 logged (three-tier architecture; per-domain color groups rejected; Avatar rejected for Portrait; one overlay contract; Cards+Rows as the only content-display families; closed-sets governance).
- Sprint 1: Landing Page master specification (`specs/landing.md`) — the first Specified feature: 8-beat narrative storyboard, deep section specs with hero fully detailed, scroll choreography, motion strategy with numeric budget, content strategy, independent mobile design, accessibility checklist, performance budget, implementation notes.
- Landing decision D-026 logged (typographic hero with the drawn graph motif replacing the requested 3D portrait; 85vh hero; ambient field declined; ≤3 narrative motions per session; claims-in-S1-only rule).
- Landing Page design review (`docs/16-LANDING_REVIEW.md`) — full scorecard (84/100), deep per-section review, hero/motion/AI/performance/accessibility/originality reviews, risk analysis, verdict: Approved with Changes.
- Landing spec amended to v1.1 (R1–R6): chevron cut; graph-motif guardrails + kill criterion; v1.0 ending choreographed; identity-sentence test protocol; hero staleness rule; S2/S5 differentiation, peek clamps, palette hint, Dex-offline state (D-027).

### Changed
- `ROADMAP.md` — Phases 0–1 marked complete; Phase 5 restructured around PRD tiers.
- `docs/06-TECH_STACK.md` — reframed as "awaiting ratification"; architecture-level datastore/hosting decisions recorded, concrete vendor picks deferred.
- `memory/ARCHITECTURE.md` — rewritten from "undecided" to the decided architecture.
- `docs/README.md` — indexed the new architecture document.
- `memory/` files synchronized (CURRENT_STATE, AI_HANDOFF, FEATURE_STATUS, DECISIONS).

## [0.1.0-alpha] — Repository Initialization

### Added
- Initial monorepo directory structure (`apps/`, `packages/`, `docs/`, `memory/`, `specs/`, `prompts/`, `scripts/`, `assets/`).
- Root documentation: `README.md`, `CONTRIBUTING.md`, `ROADMAP.md`, `CHANGELOG.md`, `VERSION.md`, `LICENSE`, `.gitignore`.
- Architecture and product documentation templates in `docs/`.
- AI-facing context files in `memory/`.
- Feature specification templates in `specs/`.
- Per-tool prompt directories in `prompts/`.
- Repository conventions, standards, and versioning strategy.

[Unreleased]: https://example.com/compare/v0.1.0-alpha...HEAD
[0.1.0-alpha]: https://example.com/releases/tag/v0.1.0-alpha
