# Changelog

All notable changes to Deepak Labs are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/).

---

## [Unreleased]

## [0.6.0-alpha] — Launch readiness (release gates · deployment · /projects)

### Added
- **`OWNER_CONTENT_CHECKLIST.md`** (repo root) — the single ordered list of every field the owner must write to make the Tier 0 site deployable: each with file+line, purpose, docs/24 constraints (tone/tense/banned-vocab), the R4 pass protocol, and a guiding question. Covers `site.ts` copy, the inline section headlines, per-project `question`/`abandonedBranches`, and the deploy-blocking ASMOS memory. No placeholder copy was written into `site.ts` (LAW-008).
- **`RELEASE_CHECKLIST.md`** (repo root) — the remaining human gates for the Landing V2 release (content fill, R4 copy tests, real ASMOS memory, look-dev sign-off) + the engineering re-verify steps and the exact first-deploy command sequence. The ASMOS scaffold is a hard, physical release gate here.
- **`docs/10-DEPLOYMENT.md`** — the deployment plan (D-041): vendor comparison (Render primary · Railway · Vercel+Neon) judged against the one-maintainer/decade/monolith-with-workers constraints, domain/DNS, environment strategy, CI pipeline, caching/CDN posture, rollback story, and exactly what changes when the database (docs/09) arrives — designed so the DB is an addition, not a re-architecture.
- **Deployment config:** `render.yaml` (Render Blueprint — web service now; Postgres/worker/cron stubs documented for docs/09), `.github/workflows/ci.yml` (typecheck + build + a scripted **three.js First-Load guard** — CI verifies, the PaaS deploys), `.env.example` (future secret shape; none needed for Tier 0), and a README "Deployment" section with the owner's first-deploy steps.
- **`/projects` Work pages** (Index + Detail archetypes, docs/24 Part 10): the index reads real content through the `ContentService` and renders an honest, designed **empty state** at zero content (no dummy projects, no fake counts); the detail structurally carries the cognitive spine — the **question** that created it (LAW-003, always shown), **abandoned branches** (LAW-004, self-hides when empty), and **evidence** links (Law 6, from `repoUrl` + relations to built routes only — no dead links). New primitive: `EmptyState`.
- `Project` content type extended additively (D-042): `question: string` (required — LAW-003) and `abandonedBranches?: AbandonedBranch[]` (LAW-004). `problem` kept as-is; full Project↔Memory convergence deferred to docs/09.

### Changed
- **Graceful-absence global navigation** (LAW-008): nav lanes and footer links now filter through one shared `BUILT_ROUTES` registry (`constants/routes.ts`) — a link appears only when its page is built; unbuilt routes self-hide (no 404s from chrome, no "coming soon", no dead code). `/projects` is now built, so the "Work" lane and footer link return automatically; everything else stays hidden until it ships.

### Decisions
- **D-040** — v1.5 deferral: the full 3D hero, the Twin, Dex, and all 3D/Blender asset work are frozen until after the launch path; the launch is Tier 0 only. `features/hero-scene/` untouched (stays dev-only at `/dev/hero`).
- **D-041** — deployment vendor: **Render** recommended as primary (pending owner ratification); Railway and Vercel+Neon compared.
- **D-042** — Project model extended with the cognitive spine; Project↔Memory convergence deferred to docs/09 as an explicit open question.

### Verified
- `npm run typecheck` + `npm run build` clean, **zero warnings**, all routes static; `/` held at 152 kB; `/projects` 106 kB, `/projects/[slug]` fully static (SSG). **three.js confirmed absent from First Load JS** across `/`, `/projects`, and `/projects/[slug]` (manifest cross-check). `features/hero-scene/` untouched.

### Landing Experience — full rebuild (product-experience sprint)
- The landing is rebuilt around the live workspace scene as a four-beat story: **Arrival** (identity inside the scene, scroll-choreographed sub-line tracking the scene acts), **Mission** (the researcher-engineer thesis as large editorial type + Build/Research/Explain pillars), **Evidence** (the six domains of work as a hover-alive system + honest status + graceful trust seeds), **Collaborate** (the quiet close). Answers who / what / why-different / why-trust / what-to-explore.
- The hero scene is integrated into `/` in a new **`ambient` mode** (graph = atmosphere, no placeholder node labels/proxies leak to visitors — no-fake-data); the scene runtime is unchanged. Tier-0 floor = the server-rendered Arrival (LCP = headline text; three.js still absent from First Load JS; `/` at 152 kB).
- Removed the five thin self-hiding sections (Featured Work, Research Highlight, Current Focus, Latest Posts, Contact Strip); their intent is merged into Evidence + Collaborate. No project dump on the landing (curiosity over listing); no internal links to unbuilt pages (no dead ends).
- Added: honest `mission` + `domains` copy in `content/site.ts` (real material, owner-editable, R4-gated); an ambient-sound **placeholder** toggle (bible §7.6, off by default, no audio yet).

## [0.5.0-alpha] — V2 Design Bible + Hero Scene V2 (Sprint HS-1)

### Added
- **Deepak Labs V2 Product Design Bible** (`docs/24-DESIGN_BIBLE_V2.md`, D-039) — the definitive redesign spec: the workspace-as-scene thesis, dark-first identity, committed color/type systems, the "settle" motion language, the Digital Twin & Dex specs, IA/navigation, all 15 pages via a 5-archetype system, the full admin CMS, accessibility and performance standards. Frozen as the implementation target.
- **Hero Scene V2 boot sequence** (bible §6.2, Act I): a headless `SceneDirector` drives `bootProgressRef` 0→1 — the "workspace comes online" moment. Once per session (sessionStorage), ≤1.1s, skippable on first scroll/pointer/key, instant under reduced motion (synchronous init + `invalidate()` for demand frameloop).
- **Luminance-not-hue knowledge graph** (bible §6.4): nodes are now unlit (brightness = recency, like data in a dark room); the accent appears only on the active node; a staggered boot draw-in assembles the graph outward from the Twin (recency-as-proximity); groups illuminate as their act is reached; Dex awakens (resting→curious→active) with the narrative. Still 2 draw calls; instances rewrite only while booting or on change (calm at rest).
- Shared `features/hero-scene/shared/ease.ts` (smoothstep / node-reveal) so boot math is defined once.

### Changed
- **Design tokens → V2, dark-first** (`globals.css`, D-039): the palette is now committed (not provisional). Dark is the default identity; light ("Paper") is a first-class equal. New `--scene-*` light/material tokens read live by the scene. Motion tokens updated to bible §12.2 (fast 130 / base 220 / slow 320 / narrative 560 + `settle` easing). `next-themes defaultTheme="dark"`.
- Light rig and Twin/bench materials tokenized — **no hex now lives in scene code** (fixes a D-025 violation); cool key + the single warm task-light per bible §6.5.

### Verified
- Typecheck clean; changed files lint clean; production build succeeds (static generation OK); **three.js remains absent from First Load JS** (tier-gated lazy chunk); shipped landing re-themes to dark-first with First Load JS unchanged.

### Added (previous session, unreleased)
- Personal OS Runtime architecture (`docs/23-PERSONAL_OS_RUNTIME.md`, D-038) — the permanent runtime spine: a two-plane Kernel (Event Bus for choreography + Capability Registry for typed queries) coordinating ten runtimes (Experience, Knowledge, Motion, Navigation, AI/Dex, Content, Analytics, Theme, Accessibility, + Bus). Includes the event catalog, capability contracts, event-flow choreographies, the single-writer ownership law, data/state ownership map grounded in the codebase, bulkhead failure recovery with the floor principle, open/closed extension strategy, and an incremental adoption plan. The brief's "event bus only" instruction is overridden with reasons (queries need request→response, not fire-and-forget); the Hero Runtime is reclassified as an unmodified client of this OS.

## [0.4.0-alpha] — Sprint H-01: Hero Runtime Foundation

### Added
- `features/hero-scene/` — the complete runtime infrastructure per docs/22 (D-037): tier gate (RM/save-data/memory/WebGL2 probe before any 3D byte), scroll bridge (native scroll → refs, acts as thresholds), pointer bridge, camera rail (CatmullRom stand-in over five act stations, damped, RM stations model, focus-driven aim), performance governor (DPR-first degradation → bible shedding order → timed recovery), anchor projector (rest-point-only screen projections), focus proxies + scene overlay (DOM captions, aria-live hover labels), scene error boundary + context-loss guard (tier ladder as error architecture), asset manifest/loader contracts (Draco/meshopt/KTX2 paths, versioned CDN scheme), placeholder objects (instanced 24-node graph + merged edges in 2 draw calls, Twin capsule + bench + dock marker, breathing Dex with the scene's only small caster, particles-render-nothing with the emitter API), Leva dev controls (production-stripped), `/dev/hero` laboratory route (404 in production).
- Dependencies: three 0.185, @react-three/fiber 9.6, @react-three/drei 10.7, leva 0.10, @types/three.

### Verified
- Typecheck + build clean, zero warnings; three.js absent from all First Load JS (lazy chunk confirmed); shipped landing untouched.
- Hero Scene Architecture (`docs/17-HERO_SCENE_ARCHITECTURE.md`) — the hero redefined as an interactive 3D scene: scene/object hierarchies (data-driven knowledge graph, the stylized Twin at a workbench, Dex as a spatial entity), scroll-scrubbed camera rail with five acts, lighting system, full interaction model (hover/keyboard-with-focus-proxies/touch/reduced-motion stations), performance budgets as release criteria, asset pipeline with owner sign-off gates, and a three-tier fallback ladder where the shipped Sprint 1 hero is Tier 0.

- Hero Scene Bible (`docs/18-HERO_SCENE_BIBLE.md`) — full creative direction (D-032): per-object bible, Twin style system with likeness gate, Dex life cycle with citation-trail illumination, graph luminance logic + growth-on-publish, five-shot camera grammar, lighting bible (separation light, time-of-day), particles-as-information taxonomy, motion bible, 5%-step scroll timeline, performance/accessibility/asset bibles, Hero v2/v3 visions.
- Hero Art Direction (`docs/19-HERO_ART_DIRECTION.md`) — eight divergent directions fully attributed and ranked; **"The Drafted Laboratory"** hybrid (Warm Lab × Drafting Space) ratified as D-033 with tier-continuity as the decisive argument and a 5-frame gate #1 packet defined.
- Hero Moodboard Specification (`docs/20-HERO_MOODBOARD.md`) — the look-dev contract (D-034): material family with roughness targets, lighting rig in Kelvin, lens settings, governed absences (no bloom / no mirrors / no in-scene glass), negative-space law, DOM typography with leader-line annotations, licensed micro-details, 16-tile reference list, acceptance checklist.
- Blender Production Pipeline (`docs/21-HERO_BLENDER_PIPELINE.md`) — the artist's handbook (D-035): Blender/runtime boundary ("the .blend is not the scene"), asset slate (Twin, bench set, camera rail — everything else is procedural), collections/naming/QC, 23-bone rig contract, five animation clips, LOD chain, hard poly/texture budgets, glTF→Draco→KTX2 export chain with per-GLB size targets, production start order.
- Hero Runtime Architecture (`docs/22-HERO_RUNTIME_ARCHITECTURE.md`) — engine ratified as React Three Fiber (D-036, closes the docs/06 queue item): scene-as-enhancement-layer principle, tier gate before any 3D download, three state domains, native-scroll rail sampling, GSAP/Motion division of labor, instancing (graph in 2 draw calls), progressive LOD with never-swap-while-observed, PerfGovernor with DPR-first degradation, FocusProxies at rail rest-points, error ladder where every failure resolves to a designed lesser tier, explicit memory disposal contracts.

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
