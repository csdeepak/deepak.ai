# Feature Status

> Live status of every planned feature. Update as features move through their lifecycle.
> Tiers are defined by the PRD ([`../docs/02-PRODUCT.md`](../docs/02-PRODUCT.md) §10).

**Lifecycle:** `Planned → Specified → In Progress → Shipped → Iterating`

## P0 — Foundation (v1.0)

| Feature | Spec | Status | Notes |
| --- | --- | --- | --- |
| Landing Page | [`../specs/landing.md`](../specs/landing.md) | **In Progress (implemented)** | Built per spec v1.1 (D-029); ships when real content + R4 copy tests + R2 hallway test pass. |
| About + CV download | — | Planned | |
| Projects | [`../specs/projects.md`](../specs/projects.md) | Planned | Template only. |
| Publications | [`../specs/publications.md`](../specs/publications.md) | Planned | Template only. |
| Posts | [`../specs/posts.md`](../specs/posts.md) | Planned | Publishing only — no social mechanics (D-005). |
| Timeline | [`../specs/timeline.md`](../specs/timeline.md) | Planned | Template only. |
| Skills (current/previous) | [`../specs/skills.md`](../specs/skills.md) | Planned | Doubles as "Now"/freshness signal. |
| Contact | — | Planned | |
| GitHub Integration (display) | — | Planned | Read-only signal; deep integration is P1. |
| Admin Dashboard + core CMS | [`../specs/admin-dashboard.md`](../specs/admin-dashboard.md) | Planned | Ships with the content it manages. |
| SEO / structured data / RSS / search | — | Planned | Added by PRD §0. |
| Basic analytics | [`../specs/admin-dashboard.md`](../specs/admin-dashboard.md) | Planned | Privacy-respecting, aggregate only. |

## P1 — Differentiation (v1.5)

| Feature | Spec | Status | Notes |
| --- | --- | --- | --- |
| AI Assistant | [`../specs/ai-assistant.md`](../specs/ai-assistant.md) | **In Progress (D-053 v1 built)** | Dex v1 is cached grounded recall with public zero-cost answers; owner interview round 1 is integrated; live RAG deferred. |
| Admin: AI Knowledge Base | [`../specs/ai-assistant.md`](../specs/ai-assistant.md) | **In Progress (D-053 v1 file-backed)** | Owner-triggered Knowledge Space files exist; interview round 1 is stored as approved content; admin approval UI comes after owner review. |
| Gallery | [`../specs/gallery.md`](../specs/gallery.md) | Planned | Template only. |
| GitHub Integration (deep) | — | Planned | Repo↔project linking. |
| Analytics (full) | [`../specs/admin-dashboard.md`](../specs/admin-dashboard.md) | Planned | |

## P2 — Expansion (v2.0)

| Feature | Spec | Status | Notes |
| --- | --- | --- | --- |
| News Platform ("Radar") | [`../specs/news.md`](../specs/news.md) | Planned | Rescoped + deferred (D-006); gated on curation habit. |
| Save / bookmarks | [`../specs/news.md`](../specs/news.md) | Planned | Anonymous/local; no visitor accounts. |
| Weekly digest | [`../specs/news.md`](../specs/news.md) | Planned | Requires Radar sustainability ≥2 months. |

Dex is now in development on `codex/ai-development-process`. Several older specs/status notes remain stale relative to the implemented site and should be treated as historical unless confirmed by `CURRENT_STATE.md`.
