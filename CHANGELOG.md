# Changelog

All notable changes to Deepak Labs are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/).

---

## [Unreleased]

### Added
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
