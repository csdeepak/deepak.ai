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
