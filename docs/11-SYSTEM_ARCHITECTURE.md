# 11 — System Architecture Document

> **Status:** Approved draft — v1.0 of the architecture.
> **Owner:** Deepak (Architecture) · Authored in the role of Chief Software Architect.
> **Source of truth for product scope:** [`02-PRODUCT.md`](02-PRODUCT.md) (PRD). This document designs the system around that PRD.
> **Binding rule:** This document decides *architecture* (shape, boundaries, data flow, strategies). Final selection of specific frameworks and vendors is ratified in [`06-TECH_STACK.md`](06-TECH_STACK.md) during the Technical Foundation phase. Any change to the decisions here requires an entry in [`../memory/DECISIONS.md`](../memory/DECISIONS.md).

---

## 0. Architectural Position & Reversibility

The single most important context for this architecture is the PRD's binding constraint: **one maintainer, for a decade, on a personal budget.** That constraint — not scale — drives every decision below. We are not building for enterprise throughput; we are building for the ability of one person (or their AI assistant) to understand, change, and operate this system years from now.

Two principles follow:

1. **Fewest moving parts that cleanly satisfy the PRD.** Every additional service, database, or vendor is a recurring cost in money, attention, and failure modes. Complexity must earn its place.
2. **Decide expensive-to-reverse things early; defer cheap-to-reverse things.** We lock the data layer now because migrating data and rewriting every query later is painful. We defer the runtime framework and hosting vendor because those are comparatively replaceable behind clean module boundaries.

| Decision class | Reversibility | Stance |
| --- | --- | --- |
| Overall shape (modular monolith) | Hard to reverse | **Decided now** |
| Primary datastore (relational / PostgreSQL) | Hard to reverse | **Decided now** |
| AI retrieval approach (RAG + pgvector) | Medium | **Decided now**, migration path defined |
| Media storage (object storage + CDN) | Medium | **Decided now** |
| Runtime framework, language | Medium | **Recommended direction**, ratified in `06` |
| Hosting vendor (managed PaaS) | Easy | **Recommended category**, ratified in `10` |

---

## 1. Overall Architecture

**Decision: a modular monolith.** One deployable application, internally partitioned into strongly-bounded modules that map to the PRD's content types and capabilities. Background work (ingestion, sync, embeddings) runs as scheduled jobs and async workers attached to the same codebase and datastore.

```
                          ┌──────────────────────────────────────────┐
        Visitors  ───────▶│                  CDN                      │
        (P1–P3, P5)       │        (static assets, cached pages)      │
                          └───────────────────┬──────────────────────┘
                                              │ cache miss / dynamic
                                              ▼
   ┌───────────────────────────────────────────────────────────────────────┐
   │                        DEEPAK LABS APPLICATION                          │
   │                         (modular monolith)                             │
   │                                                                         │
   │   PUBLIC MODULES            ADMIN MODULE           INTEGRATION MODULES  │
   │   ┌───────────────┐         ┌───────────────┐      ┌──────────────────┐ │
   │   │ Landing       │         │ Dashboard     │      │ GitHub Sync      │ │
   │   │ About         │         │ CRUD · Drafts │      │ AI Assistant     │ │
   │   │ Projects      │◀───────▶│ Scheduling    │◀────▶│  (RAG)           │ │
   │   │ Posts         │         │ Versioning    │      │ News Radar (v2)  │ │
   │   │ Publications  │         │ Media uploads │      │ Analytics ingest │ │
   │   │ Timeline      │         │ Analytics     │      └──────────────────┘ │
   │   │ Skills        │         │ Auth / RBAC   │                           │
   │   │ Gallery       │         └───────────────┘                           │
   │   │ News · Contact│                                                     │
   │   └───────────────┘                                                     │
   │                                                                         │
   │   ── SHARED CORE ──  content service · media service · auth · caching   │
   └───────────┬───────────────────────┬───────────────────────┬────────────┘
               │                        │                       │
               ▼                        ▼                       ▼
   ┌────────────────────┐   ┌────────────────────┐   ┌────────────────────┐
   │  PostgreSQL         │   │  Object Storage     │   │  Background Workers │
   │  (+ pgvector,       │   │  (media/originals)  │   │  cron + job queue   │
   │   full-text search) │   │  + image CDN        │   │  (sync, embed,      │
   └────────────────────┘   └────────────────────┘   │   ingest, digest)   │
                                                       └─────────┬──────────┘
                                                                 │
                              external ◀────────────────────────┼─────────▶
                              GitHub API · LLM API · News sources
```

**Why a modular monolith.** It gives us clean internal boundaries (the maintainability and extensibility the constraints demand) without the operational tax of microservices (multiple deployments, network calls, distributed debugging, versioned contracts). Modules communicate through in-process interfaces, so a module can later be *extracted* into its own service if it ever genuinely needs independent scaling — the boundaries make that a refactor, not a rewrite.

**Alternatives considered.**
- *Microservices from day one* — rejected. The PRD explicitly forbids unnecessary microservices; for one maintainer this multiplies ops surface for zero benefit at this scale.
- *Fully static site + third-party CMS SaaS* — rejected as the core, though we borrow its ideas. It sacrifices the owned/canonical principle, complicates the custom admin and the AI corpus integration, and rents the most important asset (the content).
- *Serverless functions as the primary compute* — partially adopted for spiky/async work, rejected as the whole. Cold starts hurt the 90-second-comprehension goal, and long-running background jobs (ingestion, embedding) fit workers better.

**Migration path.** Extract the heaviest or most independent modules first (News, then AI Assistant) into separate services behind the existing interfaces if load or team size ever demands it.

---

## 2. System Components

| Component | Responsibility | Notes |
| --- | --- | --- |
| **Web application** | Serves public site (SSR/SSG) + admin (authenticated SPA-like) | Single codebase, two surfaces |
| **Content service (core)** | CRUD, drafts, scheduling, publishing, version history for all content types | Shared by every content module |
| **Media service** | Uploads, validation, variant generation, CDN URLs | Wraps object storage |
| **Auth service** | Admin authentication, session/token handling, RBAC checks | Single admin now; RBAC schema future-ready |
| **AI Assistant (RAG)** | Retrieval + grounded generation, domain restriction | Consumes content read-only |
| **Embedding pipeline** | Chunk → embed → upsert on publish | Event-driven from content service |
| **GitHub sync worker** | Periodic fetch + cache of repos/activity | Scheduled + optional webhook |
| **News pipeline (v2)** | Ingest → categorize → store; digest generation | Scheduled worker |
| **Analytics collector** | Privacy-respecting event capture + aggregation | Aggregate-only |
| **PostgreSQL** | System of record: content, users, vectors, news, cache tables | Single primary datastore |
| **Object storage + CDN** | Binary media + edge delivery | Not in the database |
| **Background runtime** | Cron scheduler + lightweight job queue | Hosts all async work |

---

## 3. Data Flow

**Content publish flow (the product's heartbeat — PRD's ≤10-min update loop):**

```
Admin edits content ──▶ Content service validates ──▶ save as DRAFT (versioned)
        │
        ├─ schedule?  ──▶ publish job enqueued for future time
        └─ publish now ──▶ status=PUBLISHED, new version recorded
                               │
             ┌─────────────────┼───────────────────────────┐
             ▼                 ▼                           ▼
   invalidate page cache   enqueue embedding         update search index
   (CDN + server)          (AI corpus refresh)       (Postgres FTS)
             │
             ▼
   public surfaces + feeds (RSS) reflect change; AI assistant now "knows" it
```

This diagram encodes a core PRD principle — **write once, surface everywhere**. A single admin action fans out to the site, the feeds, the search index, and the AI corpus. Duplication of content-entry is designed out.

**Read flow (public visitor):**

```
Request ──▶ CDN ──hit──▶ served from edge (fast path, most traffic)
             │
             └─miss──▶ App renders (SSG cached / SSR) ──▶ Postgres reads
                                                     └──▶ cached GitHub data
```

---

## 4. Module Relationships

```
                 ┌──────────────────────────────┐
                 │        ADMIN MODULE           │  orchestrates all content
                 └───────────────┬──────────────┘
                                 │ writes via
                                 ▼
        ┌────────────────── CONTENT CORE ───────────────────┐
        │  Projects · Posts · Publications · Timeline ·      │
        │  Skills · Gallery   (share CRUD/draft/version/     │
        │                      schedule/media infrastructure)│
        └───────┬───────────────────────────────┬──────────┘
                │ read-only                       │ read-only
                ▼                                 ▼
        ┌───────────────┐                 ┌───────────────┐
        │ AI ASSISTANT  │                 │  SEARCH / RSS │
        │ (RAG corpus)  │                 │  (indexes)    │
        └───────────────┘                 └───────────────┘

   INTEGRATION / SEMI-INDEPENDENT (candidates for future extraction)
   ┌───────────────┐   ┌───────────────┐   ┌───────────────┐
   │ GitHub Sync   │   │ News "Radar"  │   │  Analytics    │
   │ (external→cache)  │ (external→store)  │ (cross-cutting)│
   └───────────────┘   └───────────────┘   └───────────────┘
```

**Key relationships & dependency rules:**
- Content modules **share one content-core** (CRUD, drafts, scheduling, versioning, media). They differ only in their schema/fields and presentation. This is the biggest maintainability lever: build the machinery once.
- The **AI Assistant and Search consume content read-only.** They never write product content. This keeps the corpus a pure projection of the system of record.
- **News, GitHub, Analytics are the loosely-coupled edge.** They have external dependencies and independent lifecycles, which makes them the natural first candidates for extraction if ever needed.
- **Cross-linking is a first-class relationship** (PRD's "graph, not pages"): publications ↔ projects ↔ posts ↔ timeline. Modeled as relations in the database, not duplicated content.

---

## 5. Backend Services

The backend is one process exposing internal module APIs, not a fleet. Logical services within it:

- **Content service** — the transactional core. Owns the content lifecycle state machine: `draft → scheduled → published → archived`, each transition versioned.
- **Media service** — accepts uploads, validates type/size, strips metadata, stores originals in object storage, and records references; variant generation is delegated to the image CDN or an async worker.
- **Auth service** — authenticates the admin, issues sessions/tokens, enforces RBAC checks at the module boundary.
- **AI service** — orchestrates retrieval and generation (see §11).
- **Integration workers** — GitHub sync, news ingestion, embedding refresh, weekly digest, scheduled publishing. All are **idempotent scheduled jobs**, safe to retry.

**Why in-process modules over separate services.** At this scale a function call is simpler, faster, and more debuggable than a network hop. Boundaries are enforced by code structure and review discipline, not by network topology.

**Trade-off.** A monolith shares a failure and deploy domain — a bad deploy affects everything. Mitigated by CI, migrations discipline, health checks, and the small blast radius of a single-maintainer release cadence. The upside (one thing to reason about) decisively wins here.

---

## 6. Frontend Structure

The repository's monorepo (`apps/`, `packages/`) is the vehicle.

```
apps/
├── web/     → public site  (SSR/SSG, SEO-first, 90-second comprehension)
└── admin/   → admin console (authenticated, richer interactivity)

packages/
├── ui/          → design-system components (shared)
├── content/     → content types, schemas, validation (shared contract)
├── config/      → shared config, lint, tokens
└── sdk/         → typed client for internal APIs (shared)
```

**Why split public and admin apps.** They have opposite optimization targets: the public site prioritizes SEO, first-paint, and static delivery for anonymous traffic; the admin prioritizes rich interactivity for one authenticated user. Splitting lets each optimize independently while sharing the design system and content contracts through packages.

**Rendering strategy.** Public content is largely **static/SSG with incremental revalidation** (fast, cheap, cacheable at the CDN), falling back to SSR for personalized or highly dynamic views. This directly serves the PRD's 90-second-comprehension and SEO goals.

**Framework:** a full-stack, SSR/SSG-capable framework is the **recommended direction**; the specific choice is ratified in [`06-TECH_STACK.md`](06-TECH_STACK.md). The architecture depends only on the *capability* (hybrid rendering, file/route-based structure, an integrated server layer for the API), not on a particular vendor.

---

## 7. Database Strategy

**Decision: a single relational database — PostgreSQL — as the system of record**, extended with `pgvector` (AI embeddings) and native full-text search.

**Why relational, why one database.**
- The content is **inherently relational**: the PRD's cross-linking graph (publications↔projects↔posts↔timeline) is exactly what foreign keys and joins model well.
- **ACID** guarantees matter for the content lifecycle (drafts, scheduled publishing, version history).
- **One database is the maintainability win of the whole design.** By choosing Postgres, we get the primary store, full-text search, *and* the AI vector store in one managed service — eliminating two additional systems a solo maintainer would otherwise operate.
- Mature migrations, backups, and tooling; a decade-safe, boring, well-understood technology.

**Schema shape (conceptual):**
```
users(id, role, ...)                      ── RBAC-ready, single admin active
content_items(id, type, status, slug,     ── shared spine for all content types
              published_at, ...)
content_versions(id, content_id, data,    ── full version history
                 created_at, author)
media(id, content_id, storage_key, ...)
relations(from_id, to_id, kind)           ── the cross-link graph
embeddings(id, source_id, chunk, vector)  ── pgvector, AI corpus
news_items(id, category, source, ...)     ── v2
bookmarks(id, anon_token, news_id)        ── v2, anonymous
analytics_events(...aggregated...)
audit_log(id, actor, action, target, ts)  ── admin action trail
```

**Alternatives considered.**
- *Document/NoSQL store* — rejected as primary. Flexible schema is not the need; relational integrity and cross-linking are. Would push join logic into application code.
- *Headless CMS SaaS as datastore* — rejected. Rents the canonical asset, constrains the custom admin and AI integration, adds per-seat/usage cost.
- *Separate specialized stores (search engine + vector DB + relational) from day one* — rejected as premature. Three systems to operate for a personal corpus. We start unified and split only on evidence of need.

**Future migration path.** If search or vector workloads outgrow Postgres, extract them to a dedicated engine (§8) or vector DB (§11) behind the existing repository interfaces — the application code depends on an interface, not on `pgvector` directly.

---

## 8. Search Strategy

**Decision: PostgreSQL full-text search for v1.0; dedicated engine only on evidence of need.**

- Site-wide search across projects, posts, publications, etc. is a PRD-added P0 feature. Postgres FTS (with ranking and highlighting) comfortably covers a personal corpus of hundreds–low-thousands of documents with **zero additional infrastructure**.
- Keep search behind a `SearchIndex` interface so the engine is swappable.

**Alternatives / migration path.**
- *Dedicated search engine (Meilisearch / Typesense / Elastic-class)* — deferred, not dismissed. Superior typo-tolerance, faceting, and instant-search UX. Migrate when corpus size or search UX ambitions justify a second service. The interface makes this a contained change.

**Why this order.** It embodies the "avoid overengineering" and "fewest moving parts" constraints: don't run a search cluster for a personal site until the site proves it needs one.

---

## 9. Authentication Strategy

**Decision: single admin identity now; RBAC modeled in the schema but dormant.**

- The public site requires **no visitor authentication** — a direct consequence of the PRD non-goal (no visitor accounts, no social features).
- The admin is protected by strong authentication (secure session or token), **MFA-ready**, over HTTPS only, with brute-force rate limiting.
- The `users`/`roles` schema exists from day one (`role` column, permission checks at module boundaries) so multi-role support is a data/UI addition later, **not** a re-architecture. This satisfies "role-based permissions (future-ready)" without building unused UI now.

**Alternatives considered.**
- *Managed auth provider (Auth-as-a-service)* — reasonable and may be chosen in `06`; reduces security-sensitive code. Trade-off: a dependency and potential cost for a single user. Acceptable either way; the boundary is thin.
- *Full RBAC UI now* — rejected as YAGNI. One user does not need a permissions matrix; we keep the schema, skip the interface.

**v2 note.** News bookmarks use an **anonymous/local token**, not accounts — preserving the no-visitor-accounts principle.

---

## 10. File Storage Strategy

**Decision: object storage for originals + an image CDN for delivery; never blobs in the database.**

```
Upload ──▶ Media service (validate type/size, strip EXIF)
        ──▶ store original in object storage (S3-compatible)
        ──▶ record storage_key in Postgres
Delivery ──▶ image CDN serves optimized, resized, format-negotiated variants
```

- **Why not in the database:** binary blobs bloat the DB, slow backups, and waste expensive transactional storage. Object storage is cheap, durable, and CDN-friendly.
- **Image optimization** (resize, WebP/AVIF, responsive variants) is delegated to the image CDN or an async worker — directly serving the PRD's fast-load and gallery goals.
- Store originals immutably; derive variants. Uploads are validated and sanitized (security, §15).

**Alternatives.** DB blobs (rejected, above); serving originals directly without a CDN (rejected — slow, expensive egress, no optimization). **Migration path:** object storage is an interface in the media service; the specific provider is swappable and ratified in `10`.

---

## 11. AI Architecture

**Decision: Retrieval-Augmented Generation (RAG), grounded strictly in Deepak's corpus, with retrieval-gated domain restriction. Vectors live in `pgvector` (same Postgres).**

```
 CONTENT PUBLISH ─▶ chunk ─▶ embed ─▶ upsert into embeddings (pgvector)
                                             ▲   corpus = projects, posts,
                                             │   research, publications,
                                             │   timeline, skills, resume,
                                             │   future uploaded docs
 USER QUESTION
      │
      ▼
 embed query ─▶ vector search (top-k relevant chunks)
      │
      ├─ NO relevant context above threshold ─▶ politely DECLINE
      │        ("I can only answer questions about Deepak's work.")
      │
      └─ relevant context found
                 │
                 ▼
        LLM (via API) with: system prompt (domain restriction, persona,
        no-fabrication rule) + retrieved context ──▶ grounded answer
                 │
                 ▼
        response WITH source attribution (links to the content)
```

**Domain restriction is enforced in three layers** (PRD constraint: "assistant boundary is absolute"):
1. **Retrieval gating** — if no corpus chunk clears the relevance threshold, the assistant declines *before* calling the LLM. This is the primary, most reliable guard and also controls cost.
2. **System prompt** — instructs the model to answer only from provided context, to never fabricate, and to decline off-topic questions.
3. **Optional lightweight classifier** — a cheap pre-filter for obviously out-of-scope input, added only if gating proves insufficient.

**Knowledge updates are event-driven.** On publish/edit, the content service enqueues an embedding job that (re)chunks and upserts vectors. Deletes remove vectors. The corpus is therefore always a faithful, near-real-time projection of published content — no manual sync. **Future uploaded documents** (PDFs, resume revisions) enter through the same media/ingest path: extract text → chunk → embed.

**Why pgvector over a dedicated vector database.**
- A personal corpus is small (hundreds–low-thousands of chunks). `pgvector` handles this with excellent latency and **no new service**.
- Keeping vectors beside content means retrieval can trivially join back to source records for attribution and access control.
- One database to back up, secure, and operate — the maintainability principle again.

**Alternatives considered.**
- *Dedicated vector DB (Pinecone / Weaviate / Qdrant)* — deferred. Justified only at large scale or with advanced filtering needs. Migration path: the retrieval layer is an interface; swapping the vector backend is contained.
- *Fine-tuning a model on Deepak's data* — rejected. Expensive, slow to update, prone to hallucination, and stale the moment content changes. RAG updates instantly and cites sources — strictly better for this use case.
- *No retrieval (stuff everything in the prompt)* — rejected. Doesn't scale past a small corpus, costs more per call, and dilutes relevance.

**The LLM itself** is consumed via a provider API behind an interface, so the model is swappable; the concrete model is chosen in `06`. Cost controls (rate limiting, caps, caching of common questions) are treated as security/ops concerns (§15, §14).

---

## 12. News Pipeline

**Decision: a simple scheduled pipeline. Rules-based categorization first; AI summarization later. (Feature is PRD-tier P2 / v2.0 — "Radar".)**

```
Scheduled worker (e.g., hourly/daily)
   │
   ▼
 Ingest from sources (RSS / public APIs)  ── AI, tech, hackathons, jobs,
   │                                          conferences, research
   ▼
 Normalize (dedupe, clean, canonical fields)
   │
   ▼
 Categorize  ── rules/keywords first;  AI classification later (optional)
   │
   ▼
 Store in news_items (Postgres)
   │
   ├──▶ Public "Radar" feed (with freshness signal; auto-hide if stale)
   ├──▶ Bookmarks (anonymous token, no accounts)
   └──▶ Weekly digest job  ── aggregates recent items
              └──▶ future: AI summarization enrichment step
```

**Why deliberately minimal.** Per the PRD (D-006), News is the only feature with a *recurring weekly obligation* and is the top risk to the product's freshness promise. The architecture matches that caution: a plain scheduled worker and a single table — **no message broker, no stream processor, no separate service.** AI summarization is an *optional enrichment step* bolted on later, not a foundation.

**Alternatives considered.**
- *Event-streaming/broker architecture (Kafka-class)* — rejected outright as massive overengineering for a personal feed.
- *Real-time push ingestion* — rejected. News does not need sub-minute freshness; scheduled polling is simpler and sufficient.
- *Third-party news API as the whole feature* — possible for sourcing, but curation/categorization stays ours to preserve the "personal radar" framing.

**Migration path.** If Radar ever grows into a real product, it is already the most extraction-ready module (its own worker, its own tables, external inputs).

---

## 13. GitHub Sync

**Decision: cache in the database with scheduled refresh — do NOT fetch live per request.** Optionally augment with webhooks for near-real-time updates on push.

```
Scheduled worker (e.g., hourly) ── GitHub API ──▶ repos, contributions,
   │                                              pinned, languages, activity
   ▼
 Normalize ──▶ upsert into github_cache (Postgres)
   ▲
   └── optional: GitHub webhook on push ──▶ targeted refresh (fresher, event-driven)

Public pages read ONLY from github_cache (never call GitHub inline)
```

**The cache-vs-live decision, explicitly:**

| Factor | Live fetch per request | **Cached + scheduled (chosen)** |
| --- | --- | --- |
| Latency | Adds external round-trip to page load | Instant (local read) |
| Rate limits | Easily exhausted; unauthenticated limits are low | A handful of calls per interval |
| Resilience | GitHub outage breaks your landing page | Site unaffected; serves last-known-good |
| Freshness | Real-time | Minutes–hours (ample for slow-changing data) |
| Cost/complexity | Simple to write, costly at runtime | Slightly more setup, cheap at runtime |

The data (repos, languages, activity) changes slowly and is decorative-to-supporting on the page — **there is no user need for real-time**, and the resilience argument alone (GitHub's availability must not gate *your* availability) settles it. Webhooks are the clean upgrade for people who want push-freshness without polling more aggressively.

**Alternatives / migration path.** Pure live fetch (rejected, above). Webhook-only (rejected — misses non-push changes like stars); webhooks *complement* the scheduled baseline. The sync worker is an integration module, swappable and extractable.

---

## 14. Caching Strategy

**Layered, with invalidation driven by the publish event.**

```
1. CDN / edge cache        → static assets + SSG pages (most public traffic)
2. Application data cache   → expensive reads: GitHub data, aggregations,
                              common AI answers
3. Database-level          → Postgres query planning/indexes; FTS
```

- **Invalidation is event-driven:** publishing content invalidates the affected pages (CDN + server) — see §3. No blind time-based guessing for content freshness; TTLs are reserved for external data (GitHub, news) where staleness is acceptable.
- **AI answer caching:** frequently asked, identical questions can serve cached grounded answers to cut LLM cost and latency — invalidated when the underlying corpus changes.
- **Principle:** cache aggressively at the edge (content is mostly read-only and public), precisely invalidate on write.

**Trade-off.** Cache invalidation is famously error-prone; we bound the risk by tying invalidation to the single, well-defined publish event rather than scattering ad-hoc cache writes.

---

## 15. Security Model

**Threat-informed, proportionate to a public content site with a single privileged admin and an AI cost surface.**

- **Transport & headers:** HTTPS everywhere; HSTS, CSP, and standard security headers.
- **Admin:** strong auth, MFA-ready, session/token hygiene, brute-force rate limiting, least-privilege via the RBAC checks.
- **Input/output:** validate all input; **sanitize Markdown→HTML** (a primary XSS vector for a CMS); validate and strip metadata from uploads; parameterized queries only.
- **CSRF/CORS:** CSRF protection on admin mutations; strict CORS.
- **Secrets:** in environment/secret manager, never in the repo; rotation-capable.
- **AI-specific:** prompt-injection awareness (treat retrieved/user text as untrusted), **hard cost caps and rate limiting** on the assistant endpoint (protects both budget and against abuse), and retrieval-gating as a safety boundary.
- **Public endpoints:** rate limiting on contact form, search, and AI to deter spam/abuse.
- **Audit:** admin actions written to an `audit_log` (ties into version history — who changed what, when).
- **Dependencies:** automated dependency scanning; minimal dependency surface.
- **Privacy:** analytics are aggregate and anonymous (PRD constraint); no visitor PII beyond what a contact submission voluntarily provides.

**Trade-off.** We favor a small, auditable security surface (one admin, no visitor accounts, minimal PII) over feature-driven complexity. Fewer entry points is itself a security strategy.

---

## 16. Deployment Strategy

**Decision (category): a managed platform (PaaS) + managed Postgres + object storage + CDN. Avoid self-managed orchestration (Kubernetes). Final vendors ratified in [`10-DEPLOYMENT.md`](10-DEPLOYMENT.md).**

```
git push ──▶ CI (lint, test, build, migrations check) ──▶ CD
                                                         │
              ┌──────────────────────────────────────────┤
              ▼                    ▼                       ▼
        App (PaaS)          Managed Postgres        Object storage + CDN
        + workers/cron      (backups, PITR)         (media)
```

- **Environments:** `development` → (optional `staging`) → `production`.
- **CI/CD:** automated from git; migrations run as a gated deploy step.
- **Background jobs:** the platform's cron + worker facility hosts sync/ingest/embedding/digest jobs — no separate scheduling infrastructure.

**Why managed PaaS + managed services.** For one maintainer on a budget, **operational simplicity is the feature.** Managed Postgres (backups, point-in-time recovery, patching) and a PaaS remove the ops burden that would otherwise consume the maintenance budget. This is the "optimize for maintainability, not enterprise scale" constraint made concrete.

**Alternatives considered.**
- *Self-managed VPS* — cheaper in dollars, far costlier in attention (patching, backups, security). Rejected for a solo maintainer.
- *Kubernetes* — categorically overkill; rejected.
- *Fully serverless* — attractive for scale-to-zero economics; used for spiky/async pieces but not forced onto stateful/long-running workers where it fits poorly.

**Migration path.** Because the app is a standard monolith with a managed Postgres and object storage behind interfaces, it is **portable across PaaS vendors** — avoiding lock-in is a deliberate outcome of keeping infra boring.

---

## 17. Logging

- **Structured (JSON) logs** with severity levels, centralized in one aggregator.
- **Request logs** (latency, status) and **error logs** (stack, context) for the app.
- **Job logs** for every background worker run — idempotent jobs log start/outcome for observability.
- **Audit log** (§15) is distinct from operational logs: a durable, queryable record of admin actions, retained long-term.
- **AI logs:** questions, whether retrieval passed the gate, tokens/cost — for tuning the assistant and controlling spend (privacy-respecting; no sensitive PII).

**Principle:** logs should let a future maintainer answer "what happened and why" without reproducing the issue.

---

## 18. Monitoring

| Concern | What | Why |
| --- | --- | --- |
| **Uptime** | External health checks on public + admin | Know before visitors do |
| **Errors** | Error-tracking service (Sentry-class) with alerting | Catch regressions fast |
| **Performance** | Core Web Vitals, response times | Protects 90-second-comprehension goal |
| **AI cost/usage** | Token spend, call volume, decline rate | Budget guardrail + quality signal |
| **Jobs** | Success/failure of scheduled workers | Detect silent sync/ingest failures |
| **Freshness** | Content age surfaced in admin dashboard | Enforces the PRD's freshness metric |

Operational monitoring is **separate from product analytics** (which is privacy-respecting and aggregate, per PRD). Alerts route to a single channel — appropriate for one maintainer.

---

## 19. Scalability Considerations

**Honest scale profile:** a personal site with modest, **spiky** traffic (a post or project occasionally goes viral). This is a caching problem, not a distributed-systems problem.

- **First line of defense: the CDN.** Static/SSG public content absorbs traffic spikes at the edge without touching the app.
- **Stateless app tier** scales horizontally if ever needed (sessions/state live in Postgres/store, not in memory).
- **Database:** vertical scaling first; a **read replica** is the next lever if read load ever demands it (public reads vastly outnumber writes).
- **Async offload:** expensive work (embeddings, image processing, ingestion) is already off the request path in workers.
- **Module extraction** (§1) is the escape hatch for any single hotspot (AI, News) — but only on evidence.

**Explicit non-goal:** we do **not** pre-build for scale we will not see. Premature scaling infrastructure is itself a maintainability liability. The architecture *permits* scaling; it does not *pay for it* upfront.

---

## 20. Future Expansion

The architecture is designed so the PRD's future ideas slot in without redesign:

| Future idea (PRD §16) | How the architecture accommodates it |
| --- | --- |
| Talks & media section | A new content type on the shared content-core — schema + views only |
| Newsletter from Radar digest | An output channel on the existing digest job |
| Reading list / library | Another content type; optionally added to the AI corpus |
| **Programmatic/agent access** | Expose the existing read layer as a public read-only API/feed — the machine-readable principle realized |
| "Uses" page | Static content type |
| Multilingual | A localization dimension on content records + routing |
| RBAC / collaborators | Activate the dormant `users`/`roles` schema (§9) + admin UI |
| Dedicated search / vector DB | Swap behind the `SearchIndex` / retrieval interfaces (§8, §11) |
| Module extraction to services | Refactor along existing module boundaries (§1) |

**The through-line:** new content types are *additive* to a shared core; new scale or capability is *swappable* behind interfaces; new independence is *extractable* along module seams. Extensibility is a property of the boundaries, not of any one technology choice.

---

## Appendix A — Decision Summary

| ID | Decision | Ratified where |
| --- | --- | --- |
| D-007 | Modular monolith (not microservices) | This doc §1 |
| D-008 | PostgreSQL as single relational system of record | This doc §7 |
| D-009 | RAG + `pgvector` for the AI assistant (one database) | This doc §11 |
| D-010 | GitHub data cached with scheduled refresh (not live) | This doc §13 |
| D-011 | Postgres full-text search first; dedicated engine later | This doc §8 |
| D-012 | Managed PaaS + managed services (not self-hosted/k8s) | This doc §16 |
| D-013 | Object storage + CDN for media (no DB blobs) | This doc §10 |
| D-014 | Single admin auth now; RBAC schema future-ready | This doc §9 |

## Appendix B — Deferred to Tech Stack Ratification (`06-TECH_STACK.md`)

These are intentionally **not** decided here; the architecture depends only on their *capabilities*:
- Concrete full-stack framework and language.
- Specific LLM provider/model and embedding model.
- Specific PaaS, object-storage, and CDN vendors.
- Auth implementation (managed provider vs. self-rolled).
- Specific error-tracking, logging, and analytics tools.

## Appendix C — What This Architecture Deliberately Omits

Called out so no future reader assumes an oversight:
- **No message broker / event bus** — in-process calls + a lightweight job queue suffice.
- **No microservices, no service mesh, no orchestration platform.**
- **No separate search or vector service (yet)** — Postgres covers both initially.
- **No visitor accounts / social graph** — a PRD non-goal, not an omission.
- **No multi-region / HA topology** — unjustified at this scale; revisit only on evidence.
