# Roadmap

This roadmap describes the phased evolution of Deepak Labs. Dates are intentionally omitted; phases advance when their goals are met. Detailed status lives in [`memory/CURRENT_STATE.md`](memory/CURRENT_STATE.md).

---

## Phase 0 — Repository Initialization

- [x] Create repository structure
- [x] Establish documentation foundation
- [x] Define conventions and standards
- [x] Finalize product direction

## Phase 1 — Product Ideation *(complete)*

- [x] Define product scope and audience
- [x] Draft feature list and priorities (P0/P1/P2 tiers)
- [x] Complete `docs/02-PRODUCT.md` (PRD — single source of truth)

## Phase 2 — Design System *(in progress)*

- [x] Experience Architecture (`docs/12-EXPERIENCE_ARCHITECTURE.md`) — journeys, navigation, motion doctrine, Twin experience
- [x] Establish design language (`docs/03-DESIGN_LANGUAGE.md`) — DSVL: color, type, components, laws, anti-patterns; Twin named Dex
- [x] Define animation guidelines (`docs/08-ANIMATION_GUIDELINES.md`) — motion tokens, parity mapping, performance rules
- [x] Brand identity & visual DNA (`docs/14-BRAND_IDENTITY.md`) — narrative, voice, vocabulary, logo direction
- [x] Design token system & component architecture (`docs/15-DESIGN_TOKENS.md`) — all non-color values ratified; color architecture fixed, hex pending
- [ ] Define component guidelines (`docs/07-COMPONENT_GUIDELINES.md`) — engineering conventions; inherits `docs/15` §6–7 contract
- [ ] Hex ratification into `docs/15` §3 architecture — with tech stack
- [ ] Logo/monogram execution — bound by `docs/14` §6 directions

## Phase 3 — Wireframes & Information Architecture *(complete)*

- [x] Complete `docs/04-INFORMATION_ARCHITECTURE.md` — sitemap, relation taxonomy, page blueprints, user flows, error/empty states, mobile
- [x] Wireframe all surfaces (`docs/13-WIREFRAME_SPEC.md`) — 5 archetypes, ~26 screens, states, interactions, responsive blueprint

## Phase 4 — Technical Foundation *(in progress)*

- [x] Select frontend tech stack (`docs/06-TECH_STACK.md`) — ratified with Sprint 0 (D-028)
- [x] Sprint 0: frontend foundation (`apps/web`) — tokens, layout, primitives, motion infra; build verified
- [ ] Define database plan (`docs/09-DATABASE_PLAN.md`) + ratify data access layer
- [ ] Define deployment strategy (`docs/10-DEPLOYMENT.md`) + ratify vendors
- [ ] `docs/07-COMPONENT_GUIDELINES.md` — written against the working codebase
- [ ] Design sign-off on provisional color primitives (D-028)

## Phase 5 — Feature Implementation

Per the PRD's tiers (`docs/02-PRODUCT.md` §10):

- [ ] **v1.0 (P0):** Landing, About, Projects, Publications, Posts, Timeline, Skills, Contact, GitHub (display), core Admin CMS, SEO/RSS/search, basic analytics
- [ ] **v1.5 (P1):** AI Assistant + knowledge base admin, Gallery, deep GitHub integration, full analytics
- [ ] **v2.0 (P2):** News "Radar", bookmarks, weekly digest

## Phase 6 — Launch & Iteration

- [ ] Public release
- [ ] Continuous improvement

---

*This roadmap is a living document. Update it as phases complete or priorities shift.*
