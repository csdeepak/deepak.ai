# Architecture

> Summary of the current architecture. **The authoritative document is [`../docs/11-SYSTEM_ARCHITECTURE.md`](../docs/11-SYSTEM_ARCHITECTURE.md).** Record the reasoning for changes in [`DECISIONS.md`](DECISIONS.md).

## Shape

**Modular monolith.** One deployable application, internally partitioned into strongly-bounded modules mapping to the PRD's content types and capabilities. Background work (GitHub sync, news ingestion, embeddings, digests, scheduled publishing) runs as scheduled jobs / async workers on the same codebase and datastore. Microservices are explicitly avoided; modules are *extractable* along their boundaries if ever needed.

## Structural Model

```
apps/web    → public site (SSR/SSG, SEO-first)
apps/admin  → admin console (authenticated CMS)
packages/   → ui · content (schemas) · config · sdk (shared)

Shared core: content service · media service · auth · caching
Data: PostgreSQL (+ pgvector + full-text search) · object storage + CDN
Runtime: app tier + background workers (cron + job queue)
```

## Decided (see DECISIONS.md D-007…D-014)

- **D-007** — Modular monolith, not microservices.
- **D-008** — PostgreSQL as the single relational system of record.
- **D-009** — AI assistant = RAG with `pgvector` (vectors in the same Postgres).
- **D-010** — GitHub data cached with scheduled refresh (not live per request).
- **D-011** — Postgres full-text search first; dedicated engine only on evidence.
- **D-012** — Managed PaaS + managed services; no self-hosted orchestration.
- **D-013** — Object storage + CDN for media; no blobs in the database.
- **D-014** — Single admin auth now; RBAC modeled in schema, dormant.

## Key Strategies (quick reference)

- **AI:** RAG, corpus = published content + resume + future docs, event-driven re-embedding on publish, three-layer domain restriction (retrieval gating → system prompt → optional classifier), source-cited answers.
- **News (v2 "Radar"):** simple scheduled ingest → normalize → categorize (rules first, AI later) → store; anonymous bookmarks; weekly digest job.
- **Caching:** CDN edge + app data cache + DB indexes; invalidation driven by the publish event.
- **Search:** Postgres FTS behind a swappable `SearchIndex` interface.

## Dependency Rules

Apps → packages (never the reverse). Content modules share one content-core (CRUD, drafts, scheduling, versioning, media). AI and Search consume content **read-only**. News, GitHub, Analytics are the loosely-coupled edge (first extraction candidates).

## Deferred to `06-TECH_STACK.md` (Technical Foundation phase)

Concrete framework/language, LLM & embedding models, specific PaaS/storage/CDN vendors, auth implementation, and ops tooling. The architecture depends only on their *capabilities*, not on specific vendors.

## Undecided elsewhere

- Design language (`../docs/03-DESIGN_LANGUAGE.md`) — next phase.
- Information architecture detail (`../docs/04-INFORMATION_ARCHITECTURE.md`).
