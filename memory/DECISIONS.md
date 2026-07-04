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

---

_Add new decisions below, incrementing the ID._
