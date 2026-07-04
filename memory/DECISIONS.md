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

---

_Add new decisions below, incrementing the ID._
