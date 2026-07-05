# AI Handoff

> Update this file before ending any work session, so the next assistant can resume seamlessly.

## Handoff Protocol

Before finishing a session, record:

1. **What I did** — the changes made this session.
2. **Why** — the reasoning and any decisions (also log to [`DECISIONS.md`](DECISIONS.md)).
3. **State** — update [`CURRENT_STATE.md`](CURRENT_STATE.md).
4. **Next** — the recommended next steps.
5. **Open questions / blockers** — anything unresolved.

## Session Log

### 2026-07-05 (session 12) — Sprint 0: Frontend Foundation (first code)

- **What I did:** Ratified the frontend stack in `docs/06` (D-028) and built the foundation: npm-workspaces monorepo root + `apps/web` (Next.js 15 App Router, TS strict, Tailwind v4). Tokens from docs/15 as `@theme` in `src/styles/globals.css` (three tiers; provisional graphite ramp + accent hex in tier-1 only). Layout (Container/Section/Grid, nav/footer shells), motion recipes (`src/animations/` — docs/08 as code, global reduced-motion via MotionConfig), UI primitives (Radix Dialog/Tooltip + CVA; one overlay contract; Portrait not Avatar), content variants (ProjectCard/PublicationRow/PostRow/Timeline/Prose), content types + interface-only ContentService, ⌘K palette wiring (placeholder), Dex boundary (renders nothing — graceful absence). ESLint 9 flat config. **Build verified clean** (compile+lint+typecheck+SSG). Updated docs/06, VERSION (v0.2.0-alpha), CHANGELOG (0.2.0-alpha cut), ROADMAP, CURRENT_STATE.
- **Key calls:** Provisional color values minted to make tokens functional — flagged for design sign-off, one-file retune (D-028); Avatar→Portrait per D-025; NewsRow not scaffolded (v2 — no stubs); GSAP behind a lazy loader so the reading path never pays; Zustand holds overlay state only (one-overlay-at-a-time rule enforced in the store).
- **State:** Code exists; Sprint 1 unblocked. Version `v0.2.0-alpha`.
- **Next:** Sprint 1 landing per specs/landing.md v1.1; docs/09 + content service implementation; docs/07 against this codebase.
- **Gotchas for next session:** run commands from repo root (workspaces); Tailwind v4 — tokens in CSS `@theme`, NOT a tailwind.config; semantic utilities only (`bg-canvas`, `text-ink`, `z-(--z-nav)`); `motion/react` import (not framer-motion); typecheck via `npm run typecheck`.

### 2026-07-05 (session 11) — Landing Page Design Review

- **What I did:** Conducted an adversarial design review of `specs/landing.md` as `docs/16-LANDING_REVIEW.md` (16-category scorecard, deep per-section review with Apple/Linear/Anthropic keep-tests, hero/motion/AI/performance/a11y/originality reviews, risk analysis). Verdict: **Approved with Changes, 84/100**. Applied amendments R1–R6 to the spec (now v1.1). Logged D-027. Synced docs index, FEATURE_STATUS, CHANGELOG.
- **Why:** The spec establishes the whole product's design language; it needed hostile review before hi-fi, not validation.
- **Key findings:** C1 — the graph motif is one art-direction failure from the particles.js cliché → guardrails + hallway-test kill criterion with typographic fallback pre-approved; C2 — v1.0 ships without its S6 climax, unchoreographed → S7 absorbs the resolution, footer stamp = v1.0's quiet reveal; the spec's own chevron contradicted its own peek argument → cut; hero staleness failure mode was undefined → ≤30d stamp rule; identity sentence had no test → 10-second + read-aloud release gates. Rejected: Contact-in-nav, CV demotion, S3 motif removal (on notice instead).
- **State:** Landing spec v1.1, review-approved, build-ready pending stack. Version = `v0.1.0-alpha`.
- **Next:** Phase 4 tech-stack ratification remains the sole blocker for build; hallway test scheduled early in hi-fi; review's priority list = build order.
- **Open questions:** unchanged (Dex name, monogram, accent hue — due at ratification).

### 2026-07-05 (session 10) — Sprint 1: Landing Page Master Specification

- **What I did:** Authored `specs/landing.md` — the first fleshed-out feature spec: brief reconciliation (13→8 sections per D-022/D-023; 3D portrait rejected per D-020; cursor effects rejected per D-016), landing IA + storyboard (8-beat narrative arc), deep section specs S1–S8 (hero fully detailed: opening experience, headline philosophy, graph-motif concept, CTAs, keyboard, transitions), scroll choreography table, motion strategy with per-technique justifications + a numeric motion budget, content strategy (source + messaging intent per section), independent mobile design, a11y checklist, perf budget, implementation notes, future evolution. Logged D-026. Updated specs index, FEATURE_STATUS (Landing → Specified), CURRENT_STATE, CHANGELOG.
- **Why:** Sprint 1; the landing establishes the interaction/motion/layout language every page inherits, so it is specified deepest and first.
- **Key calls:** Hero = typographic + **drawn graph motif** (the content graph abstracted — product thesis, brand atom, and hero visual unified) instead of any portrait; 85vh hero with next-section peek as the honest scroll cue; left-anchored hero (document, not poster); XA's optional ambient field declined; motion budget = 2 draw-ins + 1 breath-deepen, hard cap; claims in S1 only, S2–S6 evidence only; typographic cards v1; no client fetch above S6.
- **State:** Landing = Specified (first feature). All docs 01–15 + this spec complete. Version = `v0.1.0-alpha`.
- **Next:** Phase 4 tech-stack ratification unblocks build; graph-motif design is the sprint's craft task; remaining P0 specs follow this spec's format.
- **Open questions:** "Dex" name veto (now four docs); monogram; accent hue — all due at stack ratification.

### 2026-07-05 (session 9) — Design Token System & Component Architecture

- **What I did:** Authored `docs/15-DESIGN_TOKENS.md`: naming convention (dot-notation, framework-agnostic); all foundation tokens with concrete non-color values (spacing/sizing/containers/grid/breakpoints/radius/elevation/borders/blur/opacity/z-bands/type scale/icons/motion/delays/focus/a11y); three-tier color architecture with semantic groups (hex deferred to stack); 16 motion recipes with reduced-motion equivalents; layering contracts; component architecture for 24 families with universal contracts and composition hierarchy; governance model (closed sets, additions ledger, deprecation policy, review heuristics). Logged D-025. Synced index, ROADMAP, CURRENT_STATE, CHANGELOG.
- **Why:** DSVL's deferred token item needed a formal home before engineering; component contracts needed defining before `07` and implementation.
- **Key calls:** Per-domain color groups (Research/News/Analytics/Admin) rejected per D-018 — density/iconography differentiate, never hue; `ai.presence` aliases the accent (dot = accent = brand equity); no `color.secondary` (aliasing over multiplication); Avatar family rejected → `Portrait` (D-019); one overlay contract for all modal surfaces; Cards+Rows are the only two content-display families; z reserved band kept for the brief's AR layer with recorded skepticism.
- **State:** Design system infrastructure complete. Only hex values + type-family confirmation remain, gated on Phase 4. Version = `v0.1.0-alpha`.
- **Next:** Phase 4 — tech-stack ratification (`docs/06`): framework, LLM/embedding models, vendors, token format, **hex ratification**; then `07` (inherits `15` §6–7), `09`, `10`, P0 specs.
- **Open questions:** "Dex" name veto (pending, three docs now reference it); monogram "dL" vs "D."; accent hue value; stack picks.

### 2026-07-05 (session 8) — Brand Identity & Visual DNA

- **What I did:** Authored `docs/14-BRAND_IDENTITY.md` (14 sections: brand narrative, personality dials, visual DNA, typography identity, motion personality, logo direction, icon language, photography direction, illustration charter, Dex brand sheet, brand voice + banned vocabulary, design vocabulary, brand anti-patterns, 5–10yr evolution policy; appendix mapping what's ruled elsewhere vs new). Logged D-024. Synced docs index, ROADMAP, CURRENT_STATE, CHANGELOG.
- **Why:** The identity layer above the DSVL needed articulation before logo execution, copywriting, and hi-fi design; prior docs are immutable, so this builds on rather than replaces.
- **Key calls:** Rejected the brief's navigation renaming ("Journey" etc.) — vocabulary rule: plain places, coined inventions (D-024); wordmark-first + dL monogram, dot reserved for Dex; drawn SVG line = the *entire* illustration range; motion temperament = mechanical, with Dex's breathing as the only living element (dilution barred); no generative/AI imagery anywhere; brand evolution rides major versions with the 2026→2031 recognition test.
- **State:** All design + brand documentation complete. Version = `v0.1.0-alpha`.
- **Next:** Phase 4 — tech-stack ratification (`docs/06`) + token spec; then `07`, `09`, `10`, P0 specs; logo execution per `14` §6 whenever design capacity exists.
- **Open questions:** "Dex" name veto (still pending, now referenced by two docs — decide before implementation); monogram choice ("dL" vs "D."); exact accent hue.

### 2026-07-05 (session 7) — Master Wireframe Specification

- **What I did:** Authored `docs/13-WIREFRAME_SPEC.md`: 5 screen archetypes; structural specs for ~26 screens (public, admin, overlays, errors) with ASCII layouts for anchors (Landing, Project Detail, /ai centerpiece, Palette, Admin Dashboard, Admin Editor); layout/component/interaction inventories; responsive blueprint; cross-cutting loading/empty/error states; implementation notes for hi-fi design. Logged D-023. Updated docs index, ROADMAP (Phase 3 complete), CURRENT_STATE, CHANGELOG.
- **Why:** Final Phase 3 artifact — hi-fi design and implementation need screen-level structure with zero assumptions.
- **Key calls:** Brief's 12-section landing reconciled onto D-022's 8 (mapping table, nothing lost); archetype system over per-screen essays; closed sticky-region list; no sticky TOC on posts; load-more over infinite scroll (footer reachability); admin mobile = triage-grade deliberately; alt-text required at media-library level; full content export in admin settings (own-your-data insurance); /ai context panel fed by retrieval-graph traversal; reserved future slots marked (voice, history, series, demo embeds).
- **State:** Phase 3 complete. All design documentation done. Version = `v0.1.0-alpha`.
- **Next:** Phase 4 — ratify tech stack (`docs/06`) + token spec; then `07`, `09`, `10`, P0 specs; hi-fi starts with the four grammar-setters.
- **Open questions:** "Dex" name veto still pending; exact accent hue; stack/vendor picks — all Phase 4.

### 2026-07-05 (session 6) — Information Architecture & UX Blueprint

- **What I did:** Authored `docs/04-INFORMATION_ARCHITECTURE.md` in full: sitemap/route map, content model + closed relation taxonomy, navigation architecture (4-lane bar, lane-tabs, footer-as-sitemap, palette sources, keyboard grammar), shared page grammar + hierarchies, per-page blueprints for ~20 surfaces (goals/questions/priority/CTA/sections/scroll/a11y/responsive/perf), 9 user flows, search architecture (1 index, 4 skins), Dex placement strategy, empty states, error states, mobile-intentional design, future scalability. Logged D-021, D-022.
- **Why:** The XA obligated `docs/04` to make the graph concrete; wireframes need a structural blueprint detailed enough to build from.
- **Key calls:** `/search` page as the palette's visible twin (palette never sole path); 4 nav lanes with everything else via lane-tabs/footer/palette; landing cut to 8 sections — Mission merged into hero, News preview deferred to v2 (D-022); priority-order = DOM order = mobile order as a binding law; semantic search *is* Dex (no duplicate UI); relation taxonomy is a closed set of 6 kinds (D-021).
- **State:** IA complete; wireframes are the remaining Phase 3 artifact; Version = `v0.1.0-alpha`.
- **Next:** Wireframes (start: Landing, Project detail, Post detail, Admin editor — the four grammars); then tech-stack ratification + token spec; `09` imports the entity/relation model.
- **Open questions:** none structural; visual questions belong to wireframes; "Dex" name veto still pending with owner.

### 2026-07-05 (session 5) — Design System & Visual Language (DSVL)

- **What I did:** Authored `docs/03-DESIGN_LANGUAGE.md` in full (15 sections: brand identity, typography, color philosophy, layout, component language, iconography, glass call, motion tokens, 3D charter, photography, data viz, accessibility, responsive behavior, 25 design laws, 15 anti-patterns). Ratified `docs/08-ANIMATION_GUIDELINES.md` (tokens, context rules, Dex motion, reduced-motion parity mapping, performance rules). Logged D-018…D-020. Synced memory + roadmap + changelog.
- **Why:** XA obligations (quiet confidence, Twin identity, glass call, contrast targets) were owed to `docs/03`; motion tokens made ratifying `docs/08` in the same pass natural, completing most of Phase 2.
- **Key calls:** "Graphite & Paper" + exactly one accent (D-018); **Twin named Dex, embodied as a breathing presence dot — no face ever** (D-019); glass on two surfaces only, liquid glass permanently dead, 3D dormant charter, no synthetic likenesses (D-020); Inter + JetBrains Mono only (serif considered, rejected); light default with first-class dark.
- **Deliberately deferred:** exact token values (hex ramp, px sizes, shadow recipe, icon library, syntax/data-viz hue sets) → ratified with the tech stack; `docs/07` component *engineering* conventions → tech-stack phase.
- **State:** Phase 2 essentially complete; Version = `v0.1.0-alpha`.
- **Next:** `docs/04-INFORMATION_ARCHITECTURE.md` (routes, content model, relation taxonomy, palette sources) → wireframes → tech-stack ratification + token spec.
- **Open questions:** Owner veto pending on the name "Dex"; exact accent hue value; concrete stack.

### 2026-07-05 (session 4) — Experience Architecture (XA)

- **What I did:** Authored `docs/12-EXPERIENCE_ARCHITECTURE.md` (experience vision, 7-stage visitor journey, per-page purposes for all 14 surfaces + admin, navigation philosophy, motion philosophy, 15 animation-technique verdicts, full Digital Twin experience design, emotional journey, information flow, 10 interaction principles, accessibility strategy, risks, future ideas, downstream-obligations appendix). Logged D-015…D-017. Added binding-note headers to `docs/03` and `docs/08`. Updated docs index, CURRENT_STATE, ROADMAP, CHANGELOG.
- **Why:** Complete experience definition must precede visual design and wireframes; the XA now binds `docs/03`, `04`, and `08`.
- **Key calls:** Twin represents-never-impersonates, speaks as itself with citations (D-015); calm-premium motion doctrine — rejected 3D/liquid-glass/cursor-effects/magnetic/horizontal-scroll, invested in shared-element + SVG + micro-interactions (D-016); persistent slim nav + Cmd/K palette + contextual graph as primary navigation (D-017); v1.0 designed complete with graceful Twin absence.
- **State:** XA approved at document level; Phase 2 (Design System) in progress; Version = `v0.1.0-alpha`.
- **Next:** `docs/03-DESIGN_LANGUAGE.md` (visual system, Twin name/identity, glass call, contrast targets) → `docs/08` → `docs/04`.
- **Open questions:** Twin's name; light/dark strategy; typography; concrete tech stack — all owned by upcoming phases.

### 2026-07-05 (session 3) — System Architecture

- **What I did:** Authored `docs/11-SYSTEM_ARCHITECTURE.md` (20 sections, trade-off analysis, Markdown diagrams, 3 appendices). Logged decisions D-007…D-014. Rewrote `memory/ARCHITECTURE.md` from "undecided" to the decided architecture. Reframed `docs/06-TECH_STACK.md` as awaiting ratification. Updated docs index, CURRENT_STATE, CHANGELOG.
- **Why:** Product (PRD) was defined; the system needed a decided, documented architecture before design/IA and before any implementation.
- **Key calls:** Modular monolith (no microservices); PostgreSQL as single datastore incl. `pgvector` + FTS; AI = RAG with retrieval-gated domain restriction; GitHub cached (not live); Postgres FTS first; managed PaaS; object storage + CDN; single admin auth with dormant RBAC.
- **Reversibility stance:** Locked the data layer now (expensive to reverse); deferred framework + hosting *vendor* picks to `docs/06` (cheap to reverse behind interfaces).
- **State:** Architecture approved at document level; Version = `v0.1.0-alpha`.
- **Next:** Design System → Information Architecture → ratify concrete tech stack (`docs/06`) → drill-down DB/deployment docs.
- **Open questions:** Framework/language, LLM & embedding models, and specific vendors are intentionally deferred to `docs/06` (Appendix B of `docs/11`).

### 2026-07-05 (session 2) — Product Definition (PRD)

- **What I did:** Authored the full PRD in `docs/02-PRODUCT.md` (18 sections + strategic assessment + feature-disposition appendix). Filled `docs/01-VISION.md` from it. Prioritized the feature catalog in `docs/05-FEATURES.md` into P0/P1/P2 tiers. Logged product decisions D-004–D-006. Updated ROADMAP, CHANGELOG, CURRENT_STATE, FEATURE_STATUS.
- **Why:** Product must be fully defined before design/development; the PRD is now the single source of truth for scope.
- **Key strategic calls:** AI Assistant → v1.5 (needs corpus first); News → v2.0 rescoped as "Radar" (recurring-obligation risk); Posts = publishing, not social; added search/RSS/SEO/CV-download/analytics as P0.
- **State:** Phase = Product Definition complete; Version = `v0.1.0-alpha`.
- **Next:** Design System → Information Architecture → P0 spec drafting.
- **Open questions:** Design language, IA details, tech stack — all still `TBD` by design.

### 2026-07-05 — Repository Initialization

- **What I did:** Initialized the repository: directory structure, root documentation, `docs/` templates, `memory/` context system, `specs/` templates, and `prompts/` folders. No application code.
- **Why:** To establish a durable, self-documenting foundation before any implementation, per the initialization brief.
- **State:** Phase = Repository Initialization; Version = `v0.1.0-alpha`.
- **Next:** Product Ideation, then Design System, then Wireframes.
- **Open questions:** Product scope, audience, tech stack, and design language are all undecided (`TBD`).

---

_Add new sessions above this line, most recent first._
