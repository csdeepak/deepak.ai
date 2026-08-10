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
| AI Assistant | [`../specs/ai-assistant.md`](../specs/ai-assistant.md) | **In Progress (D-054)** | Dex v1 is cached grounded recall with public zero-cost answers; interview rounds 1-3 integrated; visitor intake + question logging live; suggestions ordered by visitor role; `npm run check:dex` guards matching/refusal behaviour; live RAG still deferred. |
| Admin: Dex analytics | [`../specs/ai-assistant.md`](../specs/ai-assistant.md) | **In Progress (D-054)** | `/admin/dex` shows answer rate, the unanswered-question gap list, role breakdown, and visitors, with CSV export. `/admin/ai-kb` redirects here. Owner-triggered knowledge *editing* UI still not built — knowledge cards/FAQs are still hand-edited JSON. |
| Gallery | [`../specs/gallery.md`](../specs/gallery.md) | **Deferred from v1 (D-056 code in repo, dev-only in production)** | File-backed cluster gallery implemented (D-056); deferred from the first production deploy (D-057) pending an owner alt-text/caption/copy pass on all 11 photos and a live browser review. `/gallery` 404s in production; landing has no `GalleryStrip`; footer has no Gallery link. Re-enabling is a small diff. Open gaps: `specs/gallery.md` §9. |
| GitHub Integration (deep) | — | Planned | Repo↔project linking. |
| Analytics (full) | [`../specs/admin-dashboard.md`](../specs/admin-dashboard.md) | Planned | |

## P2 — Expansion (v2.0)

| Feature | Spec | Status | Notes |
| --- | --- | --- | --- |
| News Platform ("Radar") | [`../specs/news.md`](../specs/news.md) | Planned | Rescoped + deferred (D-006); gated on curation habit. |
| Save / bookmarks | [`../specs/news.md`](../specs/news.md) | Planned | Anonymous/local; no visitor accounts. |
| Weekly digest | [`../specs/news.md`](../specs/news.md) | Planned | Requires Radar sustainability ≥2 months. |

Dex and Gallery are both in development on `codex/ai-development-process`. Both shipped ahead of their spec docs, and both specs (`ai-assistant.md`, `gallery.md`) have since been rewritten to describe what was actually built. Several older specs/status notes remain stale relative to the implemented site and should be treated as historical unless confirmed by `CURRENT_STATE.md`.
