# Decisions

> A log of significant decisions and their rationale (a lightweight ADR record). Never change architecture without adding an entry here.

## Format

Each decision uses:

- **ID** — sequential (`D-001`, `D-002`, …).
- **Date**
- **Status** — Proposed / Accepted / Superseded.
- **Context** — the situation prompting the decision.
- **Decision** — what was decided.
- **Consequences** — trade-offs and implications.

---

## D-001 — Monorepo structure

- **Date:** 2026-07-05
- **Status:** Accepted
- **Context:** Deepak Labs will comprise multiple applications and shared code over time.
- **Decision:** Use a monorepo with `apps/` and `packages/` plus dedicated documentation, memory, specs, prompts, scripts, and assets directories.
- **Consequences:** Enables shared code and unified tooling; requires discipline in dependency direction (apps → packages).

## D-002 — Documentation-first workflow

- **Date:** 2026-07-05
- **Status:** Accepted
- **Context:** The project must remain maintainable for years and resumable by future humans and AI.
- **Decision:** Author documentation, conventions, and the memory system before writing any application code.
- **Consequences:** Slower start; far greater continuity, clarity, and onboarding speed thereafter.

## D-003 — Semantic Versioning starting at v0.1.0-alpha

- **Date:** 2026-07-05
- **Status:** Accepted
- **Context:** A clear versioning scheme is needed from the outset.
- **Decision:** Adopt Semantic Versioning; begin at `v0.1.0-alpha`.
- **Consequences:** Predictable versioning; the `alpha` label signals pre-stable status.

## D-004 — Phased product delivery (P0 / P1 / P2)

- **Date:** 2026-07-05
- **Status:** Accepted
- **Context:** The mandated feature set mixes low-maintenance record-keeping features with high-maintenance platform features; a solo maintainer cannot ship and sustain all of it at once.
- **Decision:** Deliver in tiers per PRD §10 — P0 (v1.0) canonical record + core CMS; P1 (v1.5) AI Assistant, knowledge-base admin, Gallery, deep GitHub; P2 (v2.0) News/Radar, bookmarks, weekly digest. The AI Assistant is sequenced after the content corpus exists (cold-start dependency).
- **Consequences:** Signature features arrive later but launch trustworthy; pulling features forward requires a PRD amendment and a new decision entry.

## D-005 — Posts are technical publishing, not social

- **Date:** 2026-07-05
- **Status:** Accepted
- **Context:** The brief described Posts as "like LinkedIn but cleaner," which could imply social mechanics (reactions, comments, feeds).
- **Decision:** Posts are a first-party publishing surface: tags, dates, RSS. No comments, reactions, followers, or visitor accounts.
- **Consequences:** Eliminates moderation, spam surface, and account infrastructure; visitors engage via Contact or external channels.

## D-006 — News rescoped as "Radar" and deferred to v2.0

- **Date:** 2026-07-05
- **Status:** Accepted
- **Context:** A general news platform (AI/tech/hackathons/jobs/conferences/research, weekly updates, bookmarks) is effectively a second product with a recurring weekly obligation; a stale feed damages credibility more than no feed.
- **Decision:** Keep the feature but rescope it as a personal "Radar" (what Deepak tracks), defer to v2.0, and gate launch on a demonstrated ≥2-month curation habit. Feed auto-hides when stale.
- **Consequences:** Protects the core product's freshness guarantee; bookmark and digest features inherit the deferral.

## D-007 — Modular monolith (not microservices)

- **Date:** 2026-07-05
- **Status:** Accepted
- **Context:** One maintainer, decade horizon, personal budget. Microservices multiply operational surface for no benefit at this scale.
- **Decision:** Build a modular monolith — one deployable app with strongly-bounded internal modules; background work as scheduled jobs/workers on the same codebase and datastore.
- **Consequences:** Simple to reason about, deploy, and debug. Shares a failure/deploy domain (mitigated by CI, small release cadence). Modules are extractable along boundaries later (News, then AI) if load ever demands it. Ratified in `docs/11-SYSTEM_ARCHITECTURE.md` §1.

## D-008 — PostgreSQL as the single relational system of record

- **Date:** 2026-07-05
- **Status:** Accepted
- **Context:** Content is inherently relational (cross-linking graph); the lifecycle needs ACID; a solo maintainer benefits from fewer systems.
- **Decision:** One PostgreSQL database as the system of record, also hosting AI vectors (`pgvector`) and full-text search.
- **Consequences:** One managed system covers content + search + vectors. Mature, boring, decade-safe. Alternatives (NoSQL, headless CMS SaaS, multiple specialized stores) rejected as premature/misfit. See §7.

## D-009 — AI assistant = RAG with pgvector

- **Date:** 2026-07-05
- **Status:** Accepted
- **Context:** Assistant must answer only from Deepak's corpus, stay current, and never fabricate (PRD absolute constraint).
- **Decision:** Retrieval-Augmented Generation grounded in published content + resume + future docs; vectors in `pgvector` (same Postgres); event-driven re-embedding on publish; three-layer domain restriction (retrieval gating → system prompt → optional classifier); source-cited answers.
- **Consequences:** Instant knowledge updates, no fine-tuning cost, cited answers, cost-controlled by retrieval gating. Vector backend swappable behind an interface if scale demands. Fine-tuning and dedicated vector DBs rejected/deferred. See §11.

## D-010 — GitHub data cached with scheduled refresh (not live)

- **Date:** 2026-07-05
- **Status:** Accepted
- **Context:** GitHub data changes slowly and is supporting content; live per-request fetches add latency, hit rate limits, and couple site availability to GitHub's.
- **Decision:** Sync on a schedule (optionally augmented by push webhooks) into a Postgres cache; public pages read only from the cache.
- **Consequences:** Fast, resilient (survives GitHub outages), rate-limit-safe; freshness is minutes–hours (ample). See §13.

## D-011 — Postgres full-text search first; dedicated engine later

- **Date:** 2026-07-05
- **Status:** Accepted
- **Context:** Site-wide search over a personal corpus (hundreds–low-thousands of docs) does not justify a search cluster initially.
- **Decision:** Use Postgres full-text search behind a swappable `SearchIndex` interface; migrate to a dedicated engine only on evidence of need.
- **Consequences:** Zero extra infrastructure now; clean upgrade path later. See §8.

## D-012 — Managed PaaS + managed services (not self-hosted/k8s)

- **Date:** 2026-07-05
- **Status:** Accepted
- **Context:** For one maintainer, operational simplicity is the priority; ops burden must not consume the maintenance budget.
- **Decision:** Deploy on a managed platform with managed Postgres, object storage, and CDN; background jobs on the platform's cron/worker facility. No Kubernetes, no self-managed VPS as the core.
- **Consequences:** Backups/patching/recovery handled by providers; app stays portable across PaaS vendors (boring infra avoids lock-in). Specific vendors ratified in `docs/10-DEPLOYMENT.md`. See §16.

## D-013 — Object storage + CDN for media (no DB blobs)

- **Date:** 2026-07-05
- **Status:** Accepted
- **Context:** Binary media in the database bloats storage, slows backups, and prevents edge delivery/optimization.
- **Decision:** Store originals in S3-compatible object storage (references in Postgres); serve optimized variants via an image CDN.
- **Consequences:** Cheap, durable, fast delivery; provider swappable behind the media service interface. See §10.

## D-014 — Single admin auth now; RBAC schema future-ready

- **Date:** 2026-07-05
- **Status:** Accepted
- **Context:** Only Deepak administers the system; the public site needs no visitor accounts (PRD non-goal). "Role-based permissions (future-ready)" is required without building unused UI.
- **Decision:** One strongly-authenticated (MFA-ready) admin identity; model `users`/`roles` in the schema with permission checks at module boundaries, but ship no RBAC UI. v2 bookmarks use anonymous tokens, not accounts.
- **Consequences:** Multi-role support becomes a data/UI addition later, not a re-architecture; minimal auth/PII surface now. See §9.

## D-015 — The Twin represents Deepak; it never impersonates him

- **Date:** 2026-07-05
- **Status:** Accepted
- **Context:** The brief frames the AI as "a digital extension of Deepak." Speaking first-person-as-Deepak would make every model error fabricated testimony in his voice — and PRD G4 treats assistant trust as binary.
- **Decision:** The Twin is a named presence (name chosen in the design-language phase) that speaks as itself, about Deepak, always with source citations; introduces itself honestly; declines off-domain questions in-character with variant copy.
- **Consequences:** Preserves trust and personality simultaneously; citation UX becomes a core feature of the conversation surface; persona rules become functional requirements in `specs/ai-assistant.md`. See `docs/12` §0.2, §7.

## D-016 — Motion doctrine: teach-structure yes, perform no

- **Date:** 2026-07-05
- **Status:** Accepted
- **Context:** The XA brief listed 15 candidate animation techniques; the PRD's pillar is restraint and timelessness, and the 90-second goal cannot absorb an immersion tax.
- **Decision:** Adopt the XA verdicts (`docs/12` §6): invest in shared-element transitions, SVG line drawing, micro-interactions, subtle page transitions, vertical storytelling, selective scrollytelling (landing only), restrained hero, micro animated icons, and exactly two ambient instances. Reject 3D rendering (default), liquid glass, horizontal-scroll pages, magnetic interactions, and cursor effects. Timing doctrine: feedback ≤200ms, transitions 200–350ms, narrative ≤600ms, nothing blocking.
- **Consequences:** `docs/08` implements these verdicts; rejected techniques require an XA amendment to revisit; reduced-motion parity is a release criterion.

## D-017 — Navigation: persistent slim nav + command palette + contextual graph

- **Date:** 2026-07-05
- **Status:** Accepted
- **Context:** The "Personal OS" identity needs a navigation model that rewards fluency without hiding basic wayfinding.
- **Decision:** Persistent condensing top bar (hides only in long-form reading, scroll-up returns it); global search merged into a `Cmd/Ctrl+K` command palette (nav + search + actions + Twin hand-off) with a visible trigger; Twin globally accessible via one consistent presence mark; contextual cross-links as the primary navigation layer. Palette is an accelerator, never the only path.
- **Consequences:** Palette content sources and relation taxonomy must be specified in `docs/04`; keyboard-first becomes structural. See `docs/12` §4.

## D-018 — Design language ratified: "Graphite & Paper" with one accent

- **Date:** 2026-07-05
- **Status:** Accepted
- **Context:** The XA required a visual system serving "quiet confidence"; the brand must avoid developer-portfolio and cyberpunk clichés while remaining recognizable for a decade.
- **Decision:** Ratify `docs/03-DESIGN_LANGUAGE.md`: cool-neutral graphite/paper ramp; exactly one accent hue (precise "indicator-LED" blue); four reserved semantic colors; depth via surface tiers + hairlines (one shadow token, overlays only); two type families only (Inter variable + JetBrains Mono, no serif); 4px spacing scale; light mode default with first-class dark mode; 25 binding design laws + anti-pattern list. Exact token values ratified with the tech stack.
- **Consequences:** All future design/implementation is bound by the laws; recognition strategy relies on chromatic discipline (≥95% neutral per view), the hairline system, and the drawn-SVG illustration language.

## D-019 — The Twin is named Dex; its body is a dot

- **Date:** 2026-07-05
- **Status:** Accepted (owner may veto the name before implementation)
- **Context:** The XA (D-015) obligated the design language to name the Twin and define its visual identity without inviting uncanny impersonation.
- **Decision:** Name: **Dex** (Deepak + index). Visual identity: a small accent-colored presence dot with sub-perceptual breathing — no face, no avatar, no character illustration, ever. The dot's breathing deepens when thinking; it is the product's only permitted animation loop.
- **Consequences:** "Dex" and the dot become long-term brand equity; `specs/ai-assistant.md` inherits the persona + visual rules; any future avatar proposal contradicts D-015/D-019 and needs both amended.

## D-020 — Glass finalized (two surfaces); 3D dormant charter; no synthetic likeness

- **Date:** 2026-07-05
- **Status:** Accepted
- **Context:** XA §6 left the final glass call to the design language and rejected decorative 3D; the portrait question needed a hard answer.
- **Decision:** Glassmorphism (frosted, high-tint, readability-first) on exactly two surfaces: command palette and Dex panel; liquid glass permanently rejected. 3D appears only when the subject itself is 3D (research artifacts), under a technical-illustrative charter (matte graphite materials, orthographic-leaning user-controlled camera, no auto-spin). Explicitly forbidden: 3D portraits, AI-generated/retouched portraiture, Dex-with-a-face — photography is the only likeness medium.
- **Consequences:** GPU/contrast/maintenance costs stay bounded; the "honest evidence" identity is protected at the likeness level; any 3D exception requires its own spec.

## D-021 — Information architecture ratified: 4-lane nav, 3-level depth, closed relation taxonomy

- **Date:** 2026-07-05
- **Status:** Accepted
- **Context:** Wireframes and specs need a binding structural blueprint; the XA obligated `docs/04` to define routes, content model, relation taxonomy, and palette sources.
- **Decision:** Ratify `docs/04-INFORMATION_ARCHITECTURE.md`: full route map (public/utility/private) with permanent kebab-case URLs; page hierarchy capped at 3 levels; global nav carries exactly 4 lanes (Work · Research · Posts · About) with lane-tabs for siblings and the footer as sitemap-of-record; closed relation taxonomy (`implements`, `writes-about`, `produced`, `evidences`, `depicts`, `references`) with bidirectional traversal and never-empty related trails; priority-order-equals-DOM-order as a binding layout law; search = one FTS index with four skins (palette, /search page, scoped filters, Dex-semantic).
- **Consequences:** Wireframes build from §5 blueprints without structural debate; new features must fit "content type + typed relations + at most one lane-tab"; relation-kind additions require a decision entry.

## D-022 — Landing carries 8 sections; News preview and Mission section cut from v1

- **Date:** 2026-07-05
- **Status:** Accepted
- **Context:** The IA brief's example landing listed 11 sections including a Mission section and News preview; News is v2 (D-006) and the PRD's tone forbids mission-statement marketing sections.
- **Decision:** Landing = Hero (mission lives in the hero sentence) · Featured Work · Research Highlight · Current Focus · Latest Posts · Dex Preview (v1.5 only) · Contact strip · Footer. News preview appears only when Radar ships.
- **Consequences:** Protects the 90-second goal and graceful absence; adding landing sections requires amending D-022.

## D-023 — Wireframe specification ratified on a 5-archetype system

- **Date:** 2026-07-05
- **Status:** Accepted
- **Context:** ~26 screens needed wireframe-level specification without 26 redundant essays; the brief's 12-section landing conflicted with D-022.
- **Decision:** Ratify `docs/13-WIREFRAME_SPEC.md`: five screen archetypes (Index, Detail, Single-surface, Tool, Overlay) carry all screens with per-screen deltas; the brief's 12 landing items are mapped onto D-022's 8 sections (Identity+Mission→Hero; Experience Snapshot+GitHub→Current Focus; News→v2 slot); a closed sticky-region list (nav, admin rail, admin table headers, editor publish bar — nothing else); no sticky TOC on posts; load-more over infinite scroll; admin mobile is triage-grade by design; media-library alt-text required before use; admin settings includes full content export (JSON+markdown).
- **Consequences:** High-fidelity design proceeds without structural assumptions; the four grammar-setting screens (Landing, Project Detail, Post Detail, Admin Editor) are designed and reviewed first; structural changes to any screen require a decision entry.

## D-024 — Brand identity ratified: wordmark-first, plain-names vocabulary, honesty ethic

- **Date:** 2026-07-05
- **Status:** Accepted
- **Context:** The brand layer above the DSVL needed articulation (narrative, voice, logo direction, vocabulary); the brief proposed renaming navigation ("Projects"→"Engineering", "Timeline"→"Journey"), conflicting with IA D-021 and the PRD's plain-language tone.
- **Decision:** Ratify `docs/14-BRAND_IDENTITY.md`. Key rulings: wordmark-first identity with "dL"/"D." monogram for favicon/avatars — the presence dot remains exclusively Dex's and may never serve as site favicon; **vocabulary rule: plain names for places, coined names only for inventions** (Radar and Dex are the models; navigation renaming rejected); one illustration language (the drawn SVG line) as the brand's entire illustrative range; brand voice system with a banned-vocabulary list (passionate/journey/seamless/etc.); photography honesty ethic extended — no generative fill or AI enhancement on any imagery; motion temperament: mechanical precision with Dex's breathing as the sole organic/living element; identity evolution rides major versions with the 2026→2031 recognition test.
- **Consequences:** All future copy, marks, and external representation are bound; coined names enter the vocabulary table only via decision entries; any second "living" animation element would dilute Dex and is barred; logo execution is a future task constrained to the two approved symbolic directions (hairline frame, node-and-edge).

## D-025 — Token system ratified: three-tier architecture, closed sets, no per-domain colors

- **Date:** 2026-07-05
- **Status:** Accepted
- **Context:** The DSVL deferred exact token values; engineering handoff needs a framework-agnostic specification; the brief proposed per-domain color groups (Research/News/Analytics/Admin) and an Avatar component, both conflicting with immutable law (D-018, D-019).
- **Decision:** Ratify `docs/15-DESIGN_TOKENS.md`: three-tier token architecture (primitive → semantic → component; primitives private); dot-notation naming (`category.concept.property.variant.state`); all non-color values fixed (spacing ×4 scale, type scale w/ numeric sizes, radius 4/8/12/full, one shadow, blur=glass-only, z bands of 100, motion durations/easings, delays, focus recipe, a11y floors); color architecture ratified with hex deferred to stack ratification; per-domain color groups rejected — `ai.presence` aliases the accent, `chart.*` is the only hue-minting set; Avatar family rejected in favor of `Portrait`; universal component contracts (one state set, one overlay behavior, Cards+Rows as the only two content-display families); closed sets governance with review heuristics.
- **Consequences:** Engineering converts tokens mechanically; re-skinning at major versions touches primitives only; any new hue, shadow, blur surface, or duplicate overlay behavior is a one-line rejection; `07-COMPONENT_GUIDELINES.md` inherits §6–7 as its contract.

## D-026 — Landing master spec ratified: typographic hero with the graph motif

- **Date:** 2026-07-05
- **Status:** Accepted
- **Context:** Sprint 1 required a build-ready landing spec; the brief requested a 3D portrait hero (banned by D-020), cursor interactions (banned by D-016), and 13 sections (capped at 8 by D-022).
- **Decision:** Ratify `specs/landing.md`. Key rulings: hero is typographic + the **drawn graph motif** (an abstracted rendering of the actual content graph — the product thesis drawn; also the node-and-edge logo direction at full scale); no portrait on the landing — the photograph lives in About; hero is 85vh (next section peeks — the honest scroll cue), left-anchored (document, not poster); XA's optional ambient hero field declined for v1; motion budget fixed at ≤3 narrative-class moments per session (2 draw-ins + 1 Dex breath-deepen); claims live in S1 only — S2–S6 are exclusively evidence; no client-side data fetch above S6; typographic project cards in v1 (imagery deferred pending art-direction spec).
- **Consequences:** Hi-fi design and implementation proceed without assumptions; the graph motif is the sprint's main craft task; a fourth narrative motion requires killing one of the three; deviations during build require a decision entry before deviating.

## D-027 — Landing review: Approved with Changes (84/100); amendments R1–R6 applied

- **Date:** 2026-07-05
- **Status:** Accepted
- **Context:** The landing spec (D-026) underwent an adversarial design review (`docs/16-LANDING_REVIEW.md`) before hi-fi/build.
- **Decision:** Verdict **Approved with Changes, 84/100**. Applied to `specs/landing.md` (now v1.1): **R1** hero scroll chevron cut (the 85vh peek is the cue; the chevron duplicated it); **R2** graph-motif art-direction guardrails (asymmetric layout, drawn character, 7–12 node hard cap, zero post-draw motion, compositor-safe draw) + hallway-test **kill criterion** with the typographic-only hero as pre-approved fallback + S1/S3 differentiation rule (theme figure, not second constellation); **R3** v1.0 ending choreographed — S7 absorbs the resolution beat, the footer freshness stamp is v1.0's quiet reveal; **R4** identity-sentence release protocol (10-second test + read-aloud test as release gates); **R5** hero staleness rule (stamp renders ≤30 days only); **R6** batch — S2/S5 visual differentiation requirement, hero-peek viewport clamps, one-time palette discovery hint, S6 Dex-offline state (chips hidden, never dead). Rejected in review: Contact in nav lanes (D-021 holds); CV CTA demotion; removing S3's motif (put on notice as the motion budget's first eviction candidate instead).
- **Consequences:** The spec is build-ready at v1.1; the hallway test is scheduled early in hi-fi while the kill is cheapest; the review's revised priority list becomes the build order; critical risks (motif cliché, hero staleness, sentence failure) now have named mitigations and owners.

## D-028 — Frontend stack ratified; Sprint 0 foundation shipped

- **Date:** 2026-07-05
- **Status:** Accepted
- **Context:** Sprint 0 mandated the frontend foundation with a named stack; `docs/06` was awaiting ratification.
- **Decision:** Ratify the frontend stack (Next.js App Router · TypeScript strict · Tailwind v4 · Motion · GSAP lazy-only · Lucide · next-themes · Radix-based hand-rolled primitives · Zustand) — compatible with every architecture constraint. Ship the foundation in `apps/web` (npm workspaces): three-tier token system in `globals.css` (`@theme`), layout system, motion recipes with global reduced-motion parity, UI primitive scaffolds under the one-overlay contract, content types + interface-only content service, palette ⌘K wiring, Dex feature boundary as graceful-absence placeholder. **Color primitives are provisional pending design sign-off** — they live only in tier-1 CSS variables (one-file retune). The brief's Avatar component was implemented as `Portrait` per D-025. NewsRow deferred to v2 (no stub ships). Build verified: compile + lint + typecheck + 4 static pages, 103 kB first-load baseline.
- **Consequences:** Sprint 1 (landing) is unblocked; backend/AI/vendor ratifications remain open in `docs/06`; version bumps to `v0.2.0-alpha`; `docs/07` will be written against this working codebase.

---

_Add new decisions below, incrementing the ID._
