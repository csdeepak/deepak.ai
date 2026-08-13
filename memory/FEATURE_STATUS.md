# Feature Status

> Live status of every planned feature. Update as features move through their lifecycle.
> Tiers are defined by the PRD ([`../docs/02-PRODUCT.md`](../docs/02-PRODUCT.md) §10).

**Lifecycle:** `Planned → Specified → In Progress → Shipped → Iterating`

## P0 — Foundation (v1.0)

| Feature | Spec | Status | Notes |
| --- | --- | --- | --- |
| Landing Page | [`../specs/landing.md`](../specs/landing.md) | **Shipped** | Live. Restructured by D-058 (V2): hero → Mission → Featured Posts → Posts → Timeline → Gallery → Collaborate. `Evidence` was removed 2026-08-13 at the owner's request. |
| About + CV download | — | Planned | |
| Projects | [`../specs/projects.md`](../specs/projects.md) | **Shipped** | Live at `/projects` + `/projects/[slug]`, DB-backed. Full admin CRUD (create/save/publish/unpublish/archive/restore-version). 6 published, 12 draft. |
| Publications | [`../specs/publications.md`](../specs/publications.md) | Planned | Route + schema exist; admin is a stub. |
| Posts | [`../specs/posts.md`](../specs/posts.md) | **Shipped** | Live at `/posts` + `/posts/[slug]`, DB-backed, server-rendered markdown. Full admin CRUD + featured-carousel ordering (D-058 Phases C/D). |
| Timeline | [`../specs/timeline.md`](../specs/timeline.md) | **Shipped (landing section)** | Zig-zag project spine on `/`, ordered by an owner-assigned `timelineOrder` per project (D-058 Phase E). Note: this is a timeline **of projects** — the separate `timeline_entries` career table and its `/admin/timeline` stub are still unbuilt. |
| Skills (current/previous) | [`../specs/skills.md`](../specs/skills.md) | Planned | Doubles as "Now"/freshness signal. |
| Contact | — | Planned | |
| GitHub Integration (display) | — | Planned | Read-only signal; deep integration is P1. |
| Admin Dashboard + core CMS | [`../specs/admin-dashboard.md`](../specs/admin-dashboard.md) | Planned | Ships with the content it manages. |
| SEO / structured data / RSS / search | — | Planned | Added by PRD §0. |
| Basic analytics | [`../specs/admin-dashboard.md`](../specs/admin-dashboard.md) | Planned | Privacy-respecting, aggregate only. |

## P1 — Differentiation (v1.5)

| Feature | Spec | Status | Notes |
| --- | --- | --- | --- |
| AI Assistant | [`../specs/ai-assistant.md`](../specs/ai-assistant.md) | **In Progress (D-054)** | Dex v1 is cached grounded recall with public zero-cost answers; interview rounds 1-3 integrated; visitor intake + question logging live; suggestions ordered by visitor role; `npm run check:dex` guards matching/refusal behaviour; live RAG still deferred. |
| Admin: Dex analytics | [`../specs/ai-assistant.md`](../specs/ai-assistant.md) | **In Progress (D-054)** | `/admin/dex` shows answer rate, the unanswered-question gap list, role breakdown, and visitors, with CSV export. `/admin/ai-kb` redirects here. Owner-triggered knowledge *editing* UI still not built — knowledge cards/FAQs are still hand-edited JSON. |
| Gallery | [`../specs/gallery.md`](../specs/gallery.md) | **Shipped** | Live (D-058 Phase F). `/gallery` reachable, `GalleryStrip` mounted on the landing page, footer link present — all three self-hide while nothing is published. Photos are curated in `/admin/gallery` from the media library, which is what lifted the old alt-text deferral: alt text is a required field at the point of entry rather than a manual pre-launch pass. The 11 file-backed photos from D-056 are **not** in the DB — production reads `gallery_items`, which starts empty. |
| GitHub Integration (deep) | — | Planned | Repo↔project linking. |
| Analytics (full) | [`../specs/admin-dashboard.md`](../specs/admin-dashboard.md) | Planned | |

## P2 — Expansion (v2.0)

| Feature | Spec | Status | Notes |
| --- | --- | --- | --- |
| News Platform ("Radar") | [`../specs/news.md`](../specs/news.md) | Planned | Rescoped + deferred (D-006); gated on curation habit. |
| Save / bookmarks | [`../specs/news.md`](../specs/news.md) | Planned | Anonymous/local; no visitor accounts. |
| Weekly digest | [`../specs/news.md`](../specs/news.md) | Planned | Requires Radar sustainability ≥2 months. |

Dex and Gallery both shipped ahead of their spec docs, and both specs
(`ai-assistant.md`, `gallery.md`) have since been rewritten to describe what
was actually built. Several older specs/status notes remain stale relative to
the implemented site and should be treated as historical unless confirmed by
`CURRENT_STATE.md`.

**Rows above corrected 2026-08-13 (D-058 Phase G).** Projects, Posts and
Timeline had been sitting at "Planned — template only" while all three were
substantially built and live. That staleness had real cost: `docs/30`'s Phase F
plan was written partly against notes like these and mis-scoped the work as an
alt-text copy pass when the actual gap was that nothing could put an image into
the gallery at all. Treat this file as authoritative only when its claims are
cheap to verify — and verify before planning against it.
