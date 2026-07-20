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
- **Status:** **Partially superseded by D-030/D-031** — the 3D-portrait ban is lifted for the hero scene (stylized only); photoreal/AI-imagery bans and glass rules remain in force
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
- **Status:** **Superseded in hero scope by D-030/D-031** — the typographic hero is retained verbatim as Tier 0 fallback; S2–S8 and all non-hero rulings stand
- **Context:** Sprint 1 required a build-ready landing spec; the brief requested a 3D portrait hero (banned by D-020), cursor interactions (banned by D-016), and 13 sections (capped at 8 by D-022).
- **Decision:** Ratify `specs/landing.md`. Key rulings: hero is typographic + the **drawn graph motif** (an abstracted rendering of the actual content graph — the product thesis drawn; also the node-and-edge logo direction at full scale); no portrait on the landing — the photograph lives in About; hero is 85vh (next section peeks — the honest scroll cue), left-anchored (document, not poster); XA's optional ambient hero field declined for v1; motion budget fixed at ≤3 narrative-class moments per session (2 draw-ins + 1 Dex breath-deepen); claims live in S1 only — S2–S6 are exclusively evidence; no client-side data fetch above S6; typographic project cards in v1 (imagery deferred pending art-direction spec).
- **Consequences:** Hi-fi design and implementation proceed without assumptions; the graph motif is the sprint's main craft task; a fourth narrative motion requires killing one of the three; deviations during build require a decision entry before deviating.

## D-027 — Landing review: Approved with Changes (84/100); amendments R1–R6 applied

- **Date:** 2026-07-05
- **Status:** Accepted; **hero-scope findings superseded by D-030/D-031** — the review's discipline (budgets, kill criteria, staleness/copy gates) carries into docs/17
- **Context:** The landing spec (D-026) underwent an adversarial design review (`docs/16-LANDING_REVIEW.md`) before hi-fi/build.
- **Decision:** Verdict **Approved with Changes, 84/100**. Applied to `specs/landing.md` (now v1.1): **R1** hero scroll chevron cut (the 85vh peek is the cue; the chevron duplicated it); **R2** graph-motif art-direction guardrails (asymmetric layout, drawn character, 7–12 node hard cap, zero post-draw motion, compositor-safe draw) + hallway-test **kill criterion** with the typographic-only hero as pre-approved fallback + S1/S3 differentiation rule (theme figure, not second constellation); **R3** v1.0 ending choreographed — S7 absorbs the resolution beat, the footer freshness stamp is v1.0's quiet reveal; **R4** identity-sentence release protocol (10-second test + read-aloud test as release gates); **R5** hero staleness rule (stamp renders ≤30 days only); **R6** batch — S2/S5 visual differentiation requirement, hero-peek viewport clamps, one-time palette discovery hint, S6 Dex-offline state (chips hidden, never dead). Rejected in review: Contact in nav lanes (D-021 holds); CV CTA demotion; removing S3's motif (put on notice as the motion budget's first eviction candidate instead).
- **Consequences:** The spec is build-ready at v1.1; the hallway test is scheduled early in hi-fi while the kill is cheapest; the review's revised priority list becomes the build order; critical risks (motif cliché, hero staleness, sentence failure) now have named mitigations and owners.

## D-028 — Frontend stack ratified; Sprint 0 foundation shipped

- **Date:** 2026-07-05
- **Status:** Accepted
- **Context:** Sprint 0 mandated the frontend foundation with a named stack; `docs/06` was awaiting ratification.
- **Decision:** Ratify the frontend stack (Next.js App Router · TypeScript strict · Tailwind v4 · Motion · GSAP lazy-only · Lucide · next-themes · Radix-based hand-rolled primitives · Zustand) — compatible with every architecture constraint. Ship the foundation in `apps/web` (npm workspaces): three-tier token system in `globals.css` (`@theme`), layout system, motion recipes with global reduced-motion parity, UI primitive scaffolds under the one-overlay contract, content types + interface-only content service, palette ⌘K wiring, Dex feature boundary as graceful-absence placeholder. **Color primitives are provisional pending design sign-off** — they live only in tier-1 CSS variables (one-file retune). The brief's Avatar component was implemented as `Portrait` per D-025. NewsRow deferred to v2 (no stub ships). Build verified: compile + lint + typecheck + 4 static pages, 103 kB first-load baseline.
- **Consequences:** Sprint 1 (landing) is unblocked; backend/AI/vendor ratifications remain open in `docs/06`; version bumps to `v0.2.0-alpha`; `docs/07` will be written against this working codebase.

## D-029 — Sprint 1 implementation patterns (landing)

- **Date:** 2026-07-05
- **Status:** Accepted
- **Context:** Implementing specs/landing.md v1.1 introduced reusable patterns that future pages inherit.
- **Decision:** (1) **CSS-only entrance for LCP content** — the hero text animates via a CSS keyframe utility (`animate-entrance`), zero hydration on the LCP path; ScrollReveal (Motion) is reserved for below-the-fold sections. (2) **Motion `pathLength` for the graph motif draw-in, not GSAP** — the choreography is simple enough that loading GSAP would violate the landing JS budget for no gain; GSAP stays reserved for the timeline's richer draw. (3) **Data-driven graceful absence** — landing preview sections self-hide when their content is empty (no fake data, no empty-states on previews); the page grows as real content is added. (4) **Footer stamp = build date** — for a statically generated site, build time is last-updated; an honest freshness stamp by construction. (5) Draw-in once-per-session via `sessionStorage`. Conflicts in the sprint brief (3D placeholder, scroll cue, 13 sections, per-word headline animation) were resolved by standing law (D-020/D-022/D-026/D-027), not reinvented.
- **Consequences:** Landing implemented and building statically (150 kB first-load; LCP unblocked by JS); sections await real content + R4 copy protocol + the R2 hallway test before public release; the four patterns above are the defaults for future page sprints.

## D-030 — Owner supersession: the hero becomes an interactive 3D scene

- **Date:** 2026-07-05
- **Status:** Accepted (owner directive)
- **Context:** The owner directed that the hero fundamentally change from a webpage hero to an interactive 3D scene containing a stylized 3D representation of Deepak — overriding the standing rejections in D-020 (likeness ban), D-026 (typographic hero), and D-027 (review concurrence). The architect surfaced the conflict and the owner ruled.
- **Decision:** Supersede, **in hero scope only**: D-020's 3D-portrait ban is lifted for a *stylized, non-photoreal* representation (the photoreal/AI-generated-imagery bans remain everywhere); D-026's typographic hero is demoted from primary to **Tier 0 fallback** (retained verbatim, already shipped); D-016's 3D-as-decoration default is amended for the hero scene only. Risks recorded on the record: uncanny valley (mitigated by a binding stylization mandate + hallway-test kill gates), maintenance organism (one maintainer owning a 3D pipeline), performance (hard tier budgets), and scope gravity (act-structure fence). **Vocabulary amendment (Brand §12):** "the Twin" = the 3D representation of Deepak; "Dex" remains the AI entity — never conflated.
- **Consequences:** D-031 designs the scene; the Sprint 1 hero becomes the permanent graceful-degradation tier and the no-3D-bytes path for low-power/save-data/RM visitors; any future photoreal drift violates the surviving clause of D-020.

## D-031 — Hero Scene Architecture

- **Date:** 2026-07-05
- **Status:** Accepted
- **Context:** D-030 sanctioned the 3D hero; the scene needed a complete architecture before any asset or engine spend.
- **Decision:** Ratify `docs/17-HERO_SCENE_ARCHITECTURE.md`: a scene-graph hero (Environment · data-driven KnowledgeGraph from real content · the Twin at a workbench, stylized-sculptural with a three-pose state machine · Dex as a luminous spatial entity preserving D-015/D-019 · scroll-scrubbed camera rail with five acts · single-key lighting · DOM-overlay text always). Binding laws: all text is DOM (never 3D-rendered); identity legible at scroll-zero in every tier; scroll position = camera position (bidirectional, no auto-play); zero camera roll; graph nodes are real content with true counts; three-tier ladder (Full / Lite / Tier 0 = shipped Sprint 1 hero) gated **before** engine download; reduced-motion = five composed keyframe stations; hard budgets as release criteria (≤350KB gz lazy-after-LCP, ≤150k tris, ≤100 draw calls, LCP unchanged from Tier 0); asset pipeline with two owner sign-off gates (concept, blockout) before production spend; hallway-test kill gates for uncanny and particle-cliché reads.
- **Consequences:** Engine/library ratification joins the docs/06 queue; `specs/landing.md` §2.1 is superseded (S2–S8 unchanged); the scene is the product's first real asset-production cost — owner sizes budget before gate #1; the "one living thing" rule expands to a governed ambient budget (≤3 simultaneous ambient motions per frame).

## D-032 — Hero Scene Bible ratified (creative deepening of D-031)

- **Date:** 2026-07-05
- **Status:** Accepted
- **Context:** The scene architecture (docs/17) needed full creative direction before asset production: per-object design, the Twin's style system, Dex's life cycle, camera/lighting/particle/motion bibles, and a percent-by-percent scroll timeline.
- **Decision:** Ratify `docs/18-HERO_SCENE_BIBLE.md`. Key creative rulings: **recency-as-proximity** as the scene's spatial thesis (current work near the Twin in warm light; the past recedes into atmosphere); Twin style system — stylized-sculptural, matte-ceramic skin (no SSS/pores), sculpted hair mass, **eyes suggested not simulated, no eye contact with camera ever, no close-ups ever**, expression fixed; **likeness gate** — no reference images exist yet, likeness calibration happens at gate #1, silhouette ships if references never arrive; Dex life cycle (habitat in the graph, awakened by attention, withdraws never vanishes, **citation-trail illumination** — cited nodes light in sequence as Dex answers); graph **luminance-not-hue color logic** (D-018 upheld), growth-on-publish with birth particles, ≥150-node aggregation; camera five-shot grammar with **no idle camera drift ever**; **particles-as-information taxonomy** — every particle is a real datum (birth/commit/citation/selection), ambient sparkle refused. Three refinements to docs/17: a capped **separation hairlight** (dark-mode form legibility; dramatic rim stays banned), **time-of-day key lighting** (visitor-local, subtle, Full tier only), and the particle taxonomy. No bloom post-processing; loading-as-arrival streaming order.
- **Consequences:** Asset production has complete direction; gate #1 (Twin style frames vs likeness references) is the next creative step and requires the owner to supply reference photos; cut-order under scope pressure is documented (time-of-day → glance → commit pulses → separation light); Hero v2/v3 visions recorded as unscheduled.

## D-033 — Hero art direction: "The Drafted Laboratory" (G × H hybrid)

- **Date:** 2026-07-05
- **Status:** Accepted
- **Context:** Eight divergent art directions were explored and ranked (`docs/19-HERO_ART_DIRECTION.md`); the brief mandated a recommendation and a hybrid of the best two.
- **Decision:** Ratify **The Drafted Laboratory** — Direction H ("Warm Lab," the bible's world) drawn by Direction G's hand ("Drafting Space"): matte solids carrying hairline construction-line edges; new content enters as ink lines that resolve into form; the accent's meaning sharpens to "the live line" (currently-being-written: Dex, current mission, freshest nodes); **the Twin is exempt from construction lines — the human is never a diagram**; at rest ≥80% of the scene is fully solid (drawing states are events, not a condition). Decisive argument: **tier continuity** — Tier 0's 2D drawn motif becomes the same world at its drawing layer, one art direction honest at every fidelity. Bible amendments: birth particle → drawn-assembly birth; loading = "the lab drafts itself" around the already-solid Twin; uber-material gains the edge-line pass; Study framings gain ≤2° axonometric ease. Runner-up record: B (Sculptor's Study) third; C and E rejected with named law collisions (C: four; E: the museum anti-pattern verbatim).
- **Consequences:** Gate #1 style frames are commissioned in this direction (5-frame packet defined, incl. the tier-continuity proof frame); the construction-line shader pass becomes the scene's key technical investment; any future art-direction drift is measured against this document.

## D-034 — Hero moodboard specification ratified (look-dev contract)

- **Date:** 2026-07-05
- **Status:** Accepted
- **Context:** The Drafted Laboratory (D-033) needed artist-grade material/lighting/lens values before gate #1 look-dev.
- **Decision:** Ratify `docs/20-HERO_MOODBOARD.md`: uber-material family with concrete roughness targets (graphite 0.85–0.95, ceramic Twin 0.8 with no edge pass, vellum as the only translucency); lighting rig in Kelvin (key 4300K baseline with 5000→3600K time-of-day, task pool 3200K at +1 stop, separation hairlight ≤15% key); 35mm fixed lens, filmic curve, no auto-exposure; **the governed trio** — depth is atmospheric-first (f/4 assist at Study only), **bloom banned** (in-shader falloff instead), **reflections functionally absent** (roughness floor 0.6, no SSR); ≥55% negative space at every rest frame; DOM-only typography with drawn leader-line annotations; licensed micro-detail set incl. the "ink-wet" live-line transition (8% brighter first 400ms), with grime/grain/aberration explicitly banned; 16-tile reference photography list; 8-point acceptance checklist (incl. grayscale-legibility and the tile-16 Tier-0 continuity test).
- **Consequences:** Look-dev has pass/fail criteria, not vibes; ±10% artistic latitude beyond which changes return to review; gate #1 frames are judged against the acceptance checklist.

## D-035 — Blender production pipeline ratified

- **Date:** 2026-07-05
- **Status:** Accepted
- **Context:** Asset production needed an executable handbook for a Blender artist, with the Blender/runtime boundary made explicit before any modeling begins.
- **Decision:** Ratify `docs/21-HERO_BLENDER_PIPELINE.md`. Core ruling: **the .blend is not the scene** — Blender authors only the Twin (LOD0–2 + rig + 5 clips), the bench set (bench/tools/dock), and the camera rail; graph nodes/edges, Dex, atmosphere, lighting, and all signature shaders (construction-line pass, halos, vellum) are runtime/procedural and must never be modeled. Locked specifics: collection-equals-export-unit structure with `_WIP`/`_REF` quarantine; `{ASSET}_{part}_{LODn}` naming with zero-default-names QC; 23-deform-bone rig (cap 24, seated rest pose, deform-only export, no facial bones); five animation clips (seamless 4s breath, two shifts, 0.8s head-only glance, hand adjust) all returning to base pose; camera rail keyed frames 0–100 = scroll 0–100% with the five framings as markers; hard budgets (Twin ≤60k/25k/8k tris, bench set ≤10k, shipped textures ≤8MB expected ~5, per-GLB size targets); export chain = Blender glTF → gltf-transform (prune/dedup/Draco 14-10-12/KTX2) → validator zero-errors; HDRI is look-dev-only and never ships; production start order ends with the Twin (gated on owner reference photos).
- **Consequences:** A Blender artist can start today on the bench set and camera rail; gate #2 (blockout) is unblocked with primitive stand-ins; the Twin remains the only photo-gated asset; QC is scriptable (budget sums, naming lint, validator).

## D-036 — Hero runtime architecture ratified; engine = React Three Fiber

- **Date:** 2026-07-05
- **Status:** Accepted
- **Context:** The hero scene needed its engineering architecture, and the engine choice had sat in the docs/06 queue since D-030.
- **Decision:** Ratify `docs/22-HERO_RUNTIME_ARCHITECTURE.md` and the engine: **three.js via React Three Fiber** + minimal drei subset + GSAP lazily inside the scene chunk (Motion stays DOM-only; one property, one owner). Load-bearing principle: **the scene is an enhancement layer** — the DOM page (Tier 0 hero + content) is complete before the canvas exists and remains complete if it dies; every failure resolves to a lesser tier that was already a designed experience ("the ceiling disappears, the room remains"). Locked contracts: tier gate decides before any 3D byte downloads; three state domains (continuous = refs in useFrame, never React state; discrete = Zustand hero slice; content = server props); native scroll owns truth with the baked Blender rail sampled as a LUT and acts derived as discrete thresholds; instanced graph (nodes = 1 InstancedMesh with per-instance attributes, edges = 1 merged geometry, target 2 draw calls); progressive Twin LOD swap that never swaps while observed; frameloop pauses off-viewport/hidden/post-handoff with DPR-first degradation then the bible's shedding order; FocusProxies recomputed at rail rest-points only; RM = stations + ambient systems unmounted; explicit disposal on LOD swap/unmount; the Dex body/mind seam preserved for v1.5.
- **Consequences:** docs/06's engine item closes; the implementation sprint has a component tree, store shape, and constants contract; bundle cost (~220–280 KB gz) is accepted within the ≤350 KB tier budget, Tier 1/2 only, lazy after LCP.

## D-037 — Sprint H-01: hero runtime foundation shipped

- **Date:** 2026-07-05
- **Status:** Accepted
- **Context:** D-036's architecture needed its implementation skeleton before any asset work; the sprint mandate was infrastructure with primitive stand-ins, no visual polish.
- **Decision:** Ship `features/hero-scene/` implementing docs/22 §§1–15 with stand-ins. Sprint-level calls: (1) **the scene mounts on a dev-only route** (`/dev/hero`, 404s in production) — infrastructure is verified in isolation; landing integration is its own sprint (acts/handoff need real content); (2) **code-authored rail stand-in** — a CatmullRom spline over five hand-placed act stations, same sampler contract as the future `cam_rail.glb` (manifest swap, not rework); (3) **the particle system renders nothing** — the particle law (every particle is a datum) means no data events = empty render; the emitter API contract is fixed instead; (4) **Leva is dead-code-eliminated** from production via a literal NODE_ENV check at the import site; (5) Tier 1 starts pre-shed (Lite = no particles/drifts/parallax by construction); (6) scene colors read the CSS token system live (`useCssColor` + MutationObserver) — no hex in scene code, theme swaps propagate automatically; (7) meshopt/KTX2 decoder wiring is documented-but-not-imported until the first real GLB (no dead decoder bytes). Verified: typecheck + build clean, zero warnings; **three.js is absent from every route's First Load JS** (the tier-gated lazy chunk works); landing untouched.
- **Consequences:** Every future object is a swap (capsule→Twin GLB, placeholder graph→data-driven graph, noop emitter→shader system); the gate/bridges/rail/governor/proxies are production code that survives asset integration unchanged; version bumps to `v0.4.0-alpha`.

## D-038 — Personal OS Runtime: kernel + two-plane decoupling + ten runtimes

- **Date:** 2026-07-05
- **Status:** Accepted
- **Context:** The product needed to stop behaving as independent pages and become a coordinated set of runtimes; the brief mandated an Event Bus through which "every subsystem communicates only."
- **Decision:** Ratify `docs/23-PERSONAL_OS_RUNTIME.md`. Core ruling — **override the "event bus only" instruction with a two-plane Kernel**: an Event Bus (pub/sub, past-tense facts, choreography) *and* a Capability Registry (typed request→response interfaces, queries/reads) — because forcing synchronous reads (search, retrieval, relation lookups) through a fire-and-forget bus is an anti-pattern that adds correlation-ID plumbing and races (violates the PRD's simplicity constraint). The brief's real requirement (no module directly depends on another) is satisfied literally: modules import only kernel-owned **contracts** (event types + capability interfaces), never each other. Locked: ten runtimes (Experience · Knowledge · Motion · Navigation · AI/Dex · Content · Analytics · Theme · Accessibility · + the Bus inside the kernel), each with owned data/state, published/subscribed events, exposed/consumed capabilities, and a declared degraded mode; the **single-writer law** (exactly one runtime writes any datum); the **floor principle** generalized from the hero ("the room remains") with Accessibility as the one runtime that never degrades; Content = system of record, Knowledge = projections over it; bounded event replay for late-booting lazy runtimes.
- **Adoption:** explicitly a **target skeleton adopted incrementally** (§11), NOT a rewrite of shipped code — for a one-maintainer product the value is discipline for future modules (Dex v1.5, News v2, Admin ship OS-native); existing stores become runtime faces by rename-and-formalize; never retrofit a single-consumer module for its own sake.
- **Consequences:** the Hero Runtime (D-037) is reclassified as a *client* of this OS (unmodified); future modules plug in open/closed with zero edits to existing ones; formalizes D-007/D-008/D-011/D-025/D-029/D-037 into an enforceable kernel.

## D-039 — Deepak Labs V2 Design Bible ratified; dark-first token retune; Hero Scene V2 (Sprint HS-1)

- **Date:** 2026-07-06
- **Status:** Accepted (owner directive: "the bible is frozen; implement exactly")
- **Context:** The V2 Product Design Bible (`docs/24-DESIGN_BIBLE_V2.md`) redefined the product's surface from first principles — dark-first identity, committed color/type systems, the workspace-as-scene, the "settle" motion signature — while retaining the ratified product truths (PRD, IA, data model, runtime spine, a11y floors). Implementation began with the Hero Scene.
- **Decision:** (1) **V2 bible is the implementation target**; it supersedes the *visual execution, hero, and landing layout* of the V1 system and the emotional/material posture of DSVL `03` (§1, §3-depth, §7-glass, §8-amplitude), while preserving DSVL §2/§4/§6/§11/§12/§14/§15, IA `04`, and the runtime spine `23`. (2) **Color is now committed, not provisional, and the product is dark-first** — dark is the default identity (`next-themes defaultTheme="dark"`, system still selectable), light ("Paper") is a first-class equal. The graphite ramp, Signal-Azure accent (`#3E8EFF` dark / `#0A66E0` light), semantic set, glass rules, and new `--scene-*` light tokens are ratified in `globals.css` (the D-025 one-file retune mechanism, exactly as intended). (3) **Motion tokens updated to bible §12.2** (fast 130 / base 220 / slow 320 / narrative 560 + the `settle` easing). (4) **Sprint HS-1 shipped the Hero Scene to V2**: the Boot sequence (Act I "the workspace comes online" — once-per-session, ≤1.1s, skippable, reduced-motion-instant, driven by a new headless `SceneDirector` + `bootProgressRef`); luminance-not-hue graph nodes (unlit, brightness = recency, accent only on the active node) with a staggered draw-in assembled outward from the Twin; act-driven group illumination (work→research as acts advance) and Dex awakening (resting→curious→active, eased); a tokenized light rig (cool key + the one warm task-light) — fixing a no-hex-in-scene law violation; and a graphite-neutral matte Twin/bench placeholder behind the unchanged GLB swap contract.
- **Consequences:** The GLB Digital Twin remains a manifest-swap (no rework). The shipped landing now renders dark-first (semantic tokens re-theme automatically; build verified static, First Load JS unchanged, three.js still absent from First Load). Font licences (Display/editorial serif) remain a build gate — Inter is the documented interim. Visual look-dev calibration on `/dev/hero` is the acceptance gate. Version → `v0.5.0-alpha`. Next sprints implement the remaining pages per the bible's 5-archetype system, gated on real content for any public knowledge-graph surface (no-fake-data).

## D-040 — v1.5 deferral: the 3D hero, the Twin, and Dex are frozen until after the launch path

- **Date:** 2026-07-11
- **Status:** Accepted (creative-director ruling, owner-ratified brief)
- **Context:** The launch objective is to get the Tier 0 site deployable the moment `content/site.ts` is filled. The full interactive 3D hero scene (the Twin GLB, the Blender asset pipeline) and Dex (the AI assistant) are the most expensive, most owner-gated surfaces (reference photos for the Twin; a populated corpus for Dex — D-004's cold-start dependency). Carrying them into the launch path would block a shippable static site on work that is correctly sequenced later.
- **Decision:** Defer the **full 3D hero, the Twin GLB, Dex, the Blender/GLB asset pipeline, and any 3D asset work to v1.5** — after the launch path (Tier 0 + the initial page sprints) is live. The launch path is **Tier 0 only**: the static, no-3D, no-database, no-secrets site. `features/hero-scene/` is **not modified** this session and remains dev-only at `/dev/hero` (404 in production). The Twin ≠ Dex distinction (D-030) is preserved. This does **not** supersede D-030/D-031/D-036/D-037 (the 3D architecture stands, ratified and unbuilt) — it schedules them.
- **Consequences:** The Tier 0 landing can deploy independently of any 3D asset or corpus (RELEASE_CHECKLIST.md). The already-shipped hero runtime foundation (D-037) stays in the repo as dev-only infrastructure, unchanged, ready for the v1.5 sprint. No law is weakened — Tier 0 is the sacred floor, and this ruling protects it as the launch surface.

## D-041 — Deployment vendor: Render (primary), pending owner ratification

- **Date:** 2026-07-11
- **Status:** **Proposed** — pending owner ratification
- **Context:** D-012 decided the hosting *category* (managed PaaS + managed Postgres + object storage + CDN; no Kubernetes, no self-managed VPS) and deferred the specific vendor to `docs/10`. The launch is a fully static Tier 0 site today, but the decade-horizon target is D-007's modular monolith with PostgreSQL + pgvector + long-running background workers on the same datastore. The vendor must serve the static launch now without painting the database into a corner later.
- **Decision:** Recommend **Render** as the primary vendor and author `docs/10-DEPLOYMENT.md` (v1.0) around it. Rationale: Render is the one option that carries both the static launch *and* the future monolith-with-workers-on-managed-Postgres in one account/dashboard/bill (Web Service + Managed Postgres w/ pgvector + Background Workers + Cron), declared as code in a committed `render.yaml` Blueprint, with built-in PR preview environments and no proprietary application coupling (portable per D-012). Compared alternatives: **Railway** (near-tie; ranked second only on usage-based-pricing predictability) and **Vercel + Neon** (best launch DX but structurally splits D-007's monolith across 2–3 vendors, especially for long-running workers — explicitly not recommended as primary despite launch-day appeal). Implemented the config: `render.yaml` (web service now; Postgres/worker/cron stubs documented for the docs/09 sprint), `.github/workflows/ci.yml` (typecheck + build + a scripted three.js First-Load guard; CI verifies, the PaaS deploys), `.env.example` (future secret shape; none needed for Tier 0), and a README "Deployment" section with the exact owner first-deploy steps. **No deploy was run — the owner triggers the first one** (`autoDeploy: false` until then).
- **Consequences:** `docs/11` §0's deferred vendor item closes *pending ratification*. Application code is vendor-neutral, so this choice is reversible (why D-012 deferred it). When docs/09 lands, the database, workers, and cron are added to the same `render.yaml` and `.env` gains real secrets — no host migration, no runtime-model change (docs/10 §7). If the owner elects Railway or Vercel+Neon, only `docs/10` §1 and the config files change; the plan's structure holds.

## D-042 — Project content model extended with the cognitive spine; Project↔Memory convergence deferred to docs/09

- **Date:** 2026-07-11
- **Status:** Accepted (owner ruling during the /projects sprint)
- **Context:** Building the `/projects` Work pages required project details to structurally support the cognitive spine the constitution mandates: the question that created the artifact (LAW-003) and its abandoned branches (LAW-004). The existing `Project` type (`types/content.ts`) had `problem` (a one-line problem statement, not the question) and `relations`/`repoUrl` (usable as evidence, Experiential Law 6), but **no field for abandoned branches** and no distinct question field. Per the governance rule (surface, don't silently invent a schema change), the conflict was raised; the owner ruled to extend the model additively rather than migrate Projects onto the richer `Memory` type this sprint.
- **Decision:** Extend `Project` additively: add **`question: string`** (required — LAW-003; a real project without it is not publishable, surfaced as a required owner field in `OWNER_CONTENT_CHECKLIST.md`) and **`abandonedBranches?: AbandonedBranch[]`** (LAW-004; `AbandonedBranch = { tried, whyAbandoned, learned }`; empty/absent → the detail section self-hides, honest per LAW-008). `problem` is kept as-is (no rename/removal this sprint). Evidence links (Law 6) render from `repoUrl` (external) + typed `relations` filtered to **built** target routes (no dead links). The `/projects/[slug]` detail renders these as spine sections with graceful absence; the index renders a designed honest empty state at zero content. **The route is `/projects`** (label "Work"), honoring D-021 — the brief's "/work" reads as "the Work lane" (no D-021 amendment). **Full convergence of `Project` and the `Memory` model** (docs/26 ontology: projects = conclusions/memories, already modeled richly for the `/memory` slice) **is deliberately deferred to the docs/09 database sprint**, which designs the canonical schema — logged here as an explicit open question docs/09 must answer.
- **Consequences:** `/projects` index + detail ship on the ContentService path with zero and non-zero content both correct; the content model now satisfies LAW-003/004 for projects without entangling the `/memory` feature. docs/09 must resolve whether Project and Memory unify into one content model or stay distinct; until then, two spine representations coexist (the additive Project fields and the full `Memory` stages). No hex in components; no motion added; the 90-second fast path (title + question + problem) is unobstructed.

---

## D-043 — Project↔Memory convergence: Option B — Shared spine + separate type tables (CTI)

- **Date:** 2026-07-11
- **Status:** Accepted (owner ruling; closes D-042 open question)
- **Context:** D-042 deferred the convergence question (does everything become a `Memory`, or do content types stay separate with a shared spine?) to docs/09. Option A = Unified Memory table with `kind` discriminator. Option B = `content_items` base table + separate type tables (Class Table Inheritance pattern).
- **Decision:** Option B ratified. A `content_items` base table carries the shared cognitive spine for all types (`question`, `status`, `search_vector`, `published_at`, etc.). Each content type has its own child table joined via the same `id`. The `content_stages` table is optional on all types — ASMOS fills all 10 stages; a course project fills only `question`. Three binding conditions: (1) The Living Memory ontology remains the **presentation contract** — CTI is an implementation detail that must not leak upward into page components; the `ContentService` interface and rendering layer may still speak in Memory terms where docs/26 demands it. (2) LAW-003 CHECK constraint is **lifecycle-aware**: `question` is required to ENTER published state but drafts are freely saveable with an empty question (the ≤10-minute update loop must remain frictionless). (3) The `relations` table must reject self-relations and duplicate `(source, target, kind)` triples at the schema level; the closed `kind` enum stays closed — **extending it in future requires a D-entry**.
- **Consequences:** Direct mirror of the TypeScript type hierarchy with zero migration impedance. All content types gain the cognitive spine (question, abandoned_branches, stages) via the base table without requiring them to fill every stage. Type-specific column constraints enforced at the DB level. The Living Memory metaphor preserved through `content_stages` (optional, all types), `abandoned_branches` (LAW-004), and `relations` (LAW-005 — the graph IS the semantic memory). The two-spine overlap (additive Project fields + full Memory stages coexisting since D-042) resolves: the CTI model IS the canonical schema; `content_stages` is how any type gains the richer Memory reconstruction.

## D-044 — Data-access tool: Drizzle ORM

- **Date:** 2026-07-11
- **Status:** Accepted
- **Context:** Phase 2 of the docs/09 DB sprint requires a data-access layer. Options considered: Drizzle ORM, Prisma, TypeORM, raw SQL.
- **Decision:** Drizzle ORM. TypeScript-native schema (schema defined in `.ts`, not a separate DSL), queries look like SQL ("just SQL with types"), migrations generate plain readable SQL files, edge-runtime compatible, pgvector support. One-maintainer decade-horizon: the queries are written once and read many times; Drizzle's SQL-like syntax keeps them self-documenting without a thick abstraction. Packages: `drizzle-orm` (production), `pg` (Postgres driver, production), `drizzle-kit` (migration CLI, dev), `@types/pg` (dev).
- **Consequences:** Drizzle is the only ORM dependency in production; `drizzle-kit` is CLI-only and never in the application bundle. Queries are typed end-to-end. Adding a table = adding a `pgTable()` definition + running `drizzle-kit generate` + committing the SQL migration. Future maintainers can read the migration SQL directly without learning a proprietary format.

## D-045 — Local dev database: Docker Compose + pgvector

- **Date:** 2026-07-11
- **Status:** Accepted
- **Context:** Phase 2 requires a local Postgres instance for DB-mode development. Options: local Postgres install, Docker Compose, Neon dev branch, no local DB.
- **Decision:** Docker Compose (`docker-compose.dev.yml` at repo root, `pgvector/pgvector:pg17` image). A single command starts a pgvector-enabled Postgres. **Optional** — frontend-only and content-fill work requires zero DB; `CONTENT_SOURCE=file` (the default) always works. CI never starts the DB; `npm run build` succeeds with no DB present.
- **Consequences:** Zero global installation footprint; the DB version is pinned in the compose file and identical across machines. `CONTENT_SOURCE` env var is the toggle: `file` (default, always works) vs `db` (requires compose up). Render deployment adds the Postgres service to `render.yaml` (documented in docs/10 §7) — no host migration, no runtime model change.

## D-046 — Admin CMS collocation: `apps/web/(admin)/` route group

- **Date:** 2026-07-12
- **Status:** Accepted (owner ratified 2026-07-12)
- **Context:** `docs/SESSION_START.md` §12 anticipates `apps/admin` as a separate Next.js app. Phase 1 of the Admin CMS sprint re-evaluated this against the project's current scale and decade-horizon values.
- **Decision:** Collocate the admin inside `apps/web` as a Next.js App Router route group: `apps/web/src/app/(admin)/admin/...`. Admin-specific components live in `src/features/admin/` and are never imported from `(site)/` code. All admin Server Actions live in `src/features/admin/actions/`.
- **Consequences:** Shares Drizzle schema, type definitions, tokens, and DB client with zero extraction overhead. Route group isolation in Next.js 15 ensures `(admin)` code never appears in `(site)` chunk graphs. Import discipline (TypeScript module graph) enforces the boundary. If the admin later needs a separate deployment lifecycle or dedicated package, extraction to `apps/admin` along the existing monorepo boundary is a clean cut — nothing in the collocated structure prevents it.

## D-047 — Admin auth strategy: iron-session sealed cookie + bcrypt passphrase

- **Date:** 2026-07-12
- **Status:** Accepted (owner ratified 2026-07-12; Option A chosen)
- **Context:** The admin CMS requires authentication. Three options were evaluated: (A) iron-session with bcrypt passphrase, (B) Auth.js v5 with CredentialsProvider, (C) Cloudflare Access platform-level protection. Criteria: boring-technology value, dependency weight, zero-external-service-dependency, single-user fit.
- **Decision (proposed):** Option A — `iron-session@8` sealed cookie (HMAC-SHA256 + AES256-CBC, 8-hour session) + `bcryptjs` passphrase comparison. Two env vars: `SESSION_SECRET` (32+ byte random string) and `ADMIN_PASSWORD_HASH` (bcrypt hash of the owner's chosen passphrase). In-memory rate-limiter in Next.js middleware: 5 failed attempts per IP per 15 minutes. All admin pages carry `export const dynamic = 'force-dynamic'` to prevent build-time execution.
- **Consequences:** ~16 kB added to the server bundle (zero bytes to client bundles). No SMTP, no OAuth provider, no external service. Works identically in local dev and on Render. Secret rotation is a Render env-var change + redeploy (for `SESSION_SECRET`) or a bcrypt re-hash (for the passphrase). If this is rejected in favor of Option B (Auth.js) or Option C (Cloudflare Access), `docs/27` §5 (session handling) must be rewritten before Phase 2 begins.

## D-048 — Rich typed metadata field matrix (extends the CTI model; no JSONB)

- **Date:** 2026-07-12
- **Status:** **Accepted** (owner ratified 2026-07-12, with the `skillsLearned` amendment below)
- **Amendment (owner 2026-07-12):** `skillsLearned` is a dedicated typed field on Project (implemented as `text[]`), **distinct from `tags`**. Semantics: `tags` = technologies/topics the project used; `skillsLearned` = what building it taught the owner. Rendering home: a self-hiding "What I learned" block on the project detail page.
- **Context:** The owner used the new admin and ruled the editors too sparse: every content type must offer a generous, LinkedIn-grade set of *optional* metadata where the owner fills what they want and everything empty self-hides (LAW-008). The risk is reintroducing D-043's rejected unified-JSONB model through a "flexibility" back door.
- **Decision (proposed):** Add a **generous but closed, fully-typed** field set per content type (`docs/28` §3) — named columns, typed `text[]` arrays, or typed child tables, never a JSONB bag and never a user-defined custom-field builder. New Project fields (the one live public page): `overview` (markdown body), `startDate`/`endDate`, `context`, `role`, `collaborators[]`, `liveUrl`, `videoUrl` (URL only), `outcomes[]`, `coverImage`/`gallery`/`attachments` (via `content_media`), and — pending a dedup ruling — `skillsLearned[]`. Publications gain `pubDate`, `pubStatus`, `arxivUrl` + uploaded-PDF attachment; Posts gain cover/attachments/`relatedLinks`; Timeline gains `place`, `highlights[]`, logo, `proofUrl`; Skills gain `category`, `sinceYear`. Three cross-cutting typed tables — `media`, `content_media`, `content_links` — serve all types. Every field is optional (only `question`-to-publish stays required per LAW-003; image `alt_text` is the one required-at-upload exception), self-hides when empty, and has a defined rendering home in a docs/24 archetype. Anything expressible as a relation (skill↔project, project↔publication) stays a `relation` (LAW-005) and is **not** duplicated as a column. Fields with no honest rendering home were cut (`readingContext`→reuses `question`; `duration`→derived; separate `stack`→`tags` already is it).
- **Open sub-ruling:** `skillsLearned[]` on Project overlaps the `evidences` relation — keep as lightweight prose takeaways (recommended) or drop in favor of relations only (`docs/28` §5.1).
- **Consequences:** Migration is additive; existing content maps with new fields empty (no invented values, no data loss). The CTI contract and D-043's three binding conditions hold. Public pages for non-Project types remain future sprints — their new fields are built + editable now, rendering-designed-but-dormant until those pages ship. If rejected/amended, `docs/28` §3 is revised before Phase 2 begins.

## D-049 — Media storage vendor + `media` schema: Cloudflare R2 (extends D-013)

- **Date:** 2026-07-12
- **Status:** **Accepted** (owner ratified 2026-07-12, Cloudflare R2, with three conditions below)
- **Conditions (owner 2026-07-12):** (1) credentials via env only — `.env.example` placeholders + README setup steps incl. bucket creation and CORS; (2) a documented one-command backup/export path that pulls the entire bucket to local disk (media is never vendor-hostage); (3) upload constraints as designed — auth-gated, size/type limits, alt-text required for images.
- **Context:** The rich-metadata sprint adds images + PDFs, which requires the deferred media pipeline. D-013 ratified the *category* (S3-compatible object storage, references in Postgres, no DB/app blobs, CDN variants) and deferred the vendor. Options weighed against one-maintainer/decade/Render: (a) Render persistent disk, (b) S3-compatible object storage, (c) repo-committed `/public` assets.
- **Decision (proposed):** **Cloudflare R2** (S3-compatible) as the media store, with `@aws-sdk/client-s3` against the R2 endpoint. Rationale: zero egress fees (the decade-cost killer for media), 10 GB + 1M writes/10M reads free per month (≈ **$0/mo for years**), S3-compatible API (portable per D-012/D-013 — swap to Backblaze B2 or AWS S3 is an endpoint/credential change, no rewrite). Backblaze B2 is the documented fallback. **(c) is disqualified** — it cannot accept auth-gated *runtime* uploads (Render's fs is ephemeral; git-as-media-store bloats the repo permanently) and contradicts D-013. **(a) works but couples media to the compute instance**, with the weakest backup/CDN story, and re-paints the D-007 monolith as a stateful single instance. Schema: a typed `media` table (`kind`, `storage_key`, `mime_type`, `byte_size`, `alt_text` — REQUIRED for images via CHECK, `caption`, `width`, `height`); content references media via the typed `content_media` join (`role` cover/gallery/attachment, `sort_order`, `ON DELETE RESTRICT` = reference-checked delete) — **no JSONB media array on content rows**. Upload flow: Server Action behind the D-047 admin gate; magic-byte content-type verification; server-side size limits (img ≤8MB, PDF ≤20MB); sharp dimension read + EXIF strip; server-generated random keys (no path traversal); alt-text enforced; nothing uploaded is ever executed.
- **Consequences:** D-013's deferred vendor closes *pending ratification*. **D-041's monthly cost is unchanged (+$0/mo)** at current + foreseeable scale; the only new secrets are R2 credentials (env only). next/image optimizes from the R2 base; three.js stays absent from public First Load JS; `/` holds ~152 kB. If B2 or another vendor is chosen, only the endpoint/credentials + `docs/28` §6 change; the schema and flow hold.

## D-050 — Neural-face hero: two tracks (Canvas2D now, R3F later); public JS + data-asset budgets; zero-runtime-dep term

- **Date:** 2026-07-20
- **Status:** **Accepted** (implemented — Track 1 shipped this session)
- **Context:** The landing wanted a distinctive, "alive-not-animated" hero portrait of the owner without dragging a WebGL/R3F payload onto the public critical path. The existing `features/hero-scene/` R3F scene is powerful but v1.5-deferred (D-040) and was still mounted on `/` in `ambient` mode.
- **Decision — two tracks:**
  - **Track 1 (now): "Neural Face Lite"** — a dependency-free **Canvas2D** hero. An offline `sharp` pipeline (`scripts/generate-hero-face.mjs`, `npm run hero:generate`) samples a personal source portrait into a quantized constellation (`public/hero-face.json`: ≤3,000 nodes, ≤6,000 KNN edges, pulse paths, pseudo-depth from luminance — no ML). A `"use client"` `<NeuralFaceHero />` (single canvas, single rAF loop, plain Canvas2D) renders dim nodes + sub-perceptual edges + a rare accent pulse + pointer parallax + ambient breathing. Data is **fetched, never imported**; missing data ⇒ the component renders nothing (graceful absence, LAW-008).
  - **Track 2 (v1.5): R3F** — the richer three.js/React-Three-Fiber neural-face treatment stays a laboratory concern at **`/dev/hero`** (404 in prod). It does not ship on the public `/` in this track.
- **Budgets (hard gates, CI-enforced):**
  - **`/` First Load JS ceiling amended to 164 kB** (was ~152 kB) — a **≤ +12 kB** allowance for Track 1's client JS. All other routes unchanged.
  - **Data asset ≤ 60 KB gzipped** for `hero-face.json` (the pipeline prints raw + gz sizes and fails over budget, after one auto-retry at a lower node cap).
- **Zero-runtime-dependency term:** Track 1 adds **no** new runtime dependency of any kind — no three.js, GSAP, Lenis, MediaPipe, or TensorFlow on the public client. `sharp` is used **build-time only** (it is already a dependency for next/image + the D-049 media pipeline; it is *not* moved to devDependencies — see Conflict note — and must never enter a public client bundle). The CI guard additionally fails if `three`, `gsap`, `lenis`, or `sharp` appear in `/`'s First Load JS, or if `/` First Load JS exceeds 164 kB, or if the `hero-face` dataset is bundled rather than fetched.
- **Amendment (owner, 2026-07-20) — R3F removed from `/`:** the ambient `HeroSceneRegion` mount was **removed from `app/(site)/page.tsx`**; `HeroSceneRegion` now lives **only at `/dev/hero`**. Consequently the Arrival sub-line, which previously read `act` from the scene's scroll rail via `useHeroStore`, was given a **self-contained, dependency-free driver** (`features/neural-face/use-scroll-act.ts` — native scroll → discrete act index, no GSAP/Lenis). **To reverse for v1.5:** swap `NeuralFaceHeroRegion` back for `HeroSceneRegion ambient` in `page.tsx` and repoint `arrival.tsx`'s import from `useScrollAct` to `useHeroStore((s) => s.act)` — a one-commit revert. `features/hero-scene/` itself was **not touched**.
- **Conflict note (surfaced, not silently resolved — T1):** the sprint brief asked to add `sharp` as a *devDependency only*. In this repo `sharp` is already a **runtime dependency** required server-side by next/image and the D-049 R2 media pipeline; demoting it would break those. It is therefore left as-is and used build-time only for the hero pipeline. The intended guarantee (sharp never in a public client bundle) is upheld by the extended CI guard, which is stronger than the dependency-section placement.
- **Governance term (owner ruling still pending):** the Arrival ambient **sub-line copy** was rewritten (the old lines narrated the removed 3D scene + Dex, which would be dishonest to keep — LAW-008). The new lines are authored dev copy, flagged for owner ratification; the ratified identity line + support line (`content/site.ts`) were **not** touched.
- **Consequences:** `/` gains a distinctive hero with no WebGL on the critical path and a strict, enforced JS ceiling. The source photo is gitignored (`apps/web/scripts/assets/`, README kept tracked); the derived `hero-face.json` is the committed artifact — and until the owner supplies a real photo and runs `hero:generate`, **no `hero-face.json` ships** and the hero copy stands alone (verified: build passes with zero DB and zero asset). Track 2 remains fully available at `/dev/hero`.

---

_Add new decisions below, incrementing the ID._
