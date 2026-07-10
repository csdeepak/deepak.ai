# 10 — Deployment

> **Status:** Approved draft — v1.0 of the deployment plan. Vendor
> recommendation is **pending owner ratification** (D-041).
> **Owner:** Deepak · Authored in the role of Lead Engineer / Release Manager.
> **Binding rule:** [`11-SYSTEM_ARCHITECTURE.md`](11-SYSTEM_ARCHITECTURE.md)
> §0 delegates the *hosting vendor* selection to this document; D-012
> already decided the *category* (managed PaaS + managed Postgres + object
> storage + CDN, no Kubernetes, no self-managed VPS). This document
> selects a specific primary vendor within that category and specifies the
> pipeline, environments, and rollback story. Any change to the decisions
> here requires an entry in [`../memory/DECISIONS.md`](../memory/DECISIONS.md).

---

## 0. What we are deploying, and when

Two facts shape everything below:

1. **The launch is Tier 0 and fully static.** The current build prerenders
   every route (`○ (Static)`); three.js is absent from First Load JS; there
   is no server, no database, and no secrets yet. The site can go live the
   moment `content/site.ts` is filled (see `RELEASE_CHECKLIST.md`). The 3D
   hero, the Twin, and Dex are deferred to **v1.5** (D-040) and do not gate
   this deployment.
2. **The decade-horizon target is a modular monolith with a database and
   background workers.** Per D-007/D-008/D-009, the same codebase will grow
   an SSR/ISR surface, PostgreSQL + pgvector, full-text search, and
   scheduled jobs (GitHub sync, embeddings, digests, scheduled publishing)
   — *on the same datastore.*

The deployment decision must serve the launch **today** without **painting
the database into a corner tomorrow.** That tension is the whole design
problem: the easy static-launch answer (a pure static/serverless host) is
not the easy answer for a monolith that later needs long-running workers
against a managed Postgres.

**Governing constraint (from the PRD, restated):** one maintainer, a
decade, a personal budget. Operational simplicity outranks raw performance
and outranks best-in-class DX. Boring, portable, and legible wins.

---

## 1. Hosting vendor — options compared

All three options below satisfy D-012's category. They differ on how well
they carry the *future monolith with workers*, not on whether they can
serve a static Next.js app today (all can).

### The evaluation axes

| Axis | Why it matters here |
| --- | --- |
| **Next.js 15 fit** | SSR/ISR/streaming must work without fighting the platform. |
| **Managed Postgres + pgvector** | D-008/D-009 need it; ideally same vendor, same dashboard. |
| **Background workers + cron** | D-007's ingestion/embeddings/digests run as long-lived workers, not just short serverless functions. |
| **One-maintainer ops load** | Fewer dashboards, fewer bills, fewer failure domains. |
| **Cost on a personal budget** | Predictable, low floor, free/cheap for a static launch. |
| **Portability (anti-lock-in)** | D-012's "boring infra avoids lock-in." Must be able to leave. |

### Option A — **Render** (primary recommendation)

A managed PaaS that runs the app as a container-ish Node **Web Service**,
plus first-class **Managed PostgreSQL**, native **Background Workers**, and
**Cron Jobs** — all in one account, one dashboard, one bill. Infrastructure
is declared as code in `render.yaml` (a "Blueprint"), which is committed to
this repo. PR **preview environments** are built in.

- **Next.js 15 fit:** runs `next start` as a normal long-lived Node
  service — full SSR/ISR/streaming, no serverless cold-start or function
  size limits, no framework-specific adapter lock-in.
- **Postgres + pgvector:** managed Postgres with the `pgvector` extension
  available — the exact D-008/D-009 target, on the same vendor.
- **Workers + cron:** background workers and scheduled jobs are first-class
  service types — D-007's async work lands natively, sharing the codebase
  and datastore. **This is the decisive fit.**
- **Ops load:** low — managed backups, patching, TLS, health checks; one
  Blueprint describes app + db + workers together.
- **Cost:** static/low-traffic launch is inexpensive; the free/starter
  tiers cover a personal site; Postgres and workers are added only when the
  DB sprint arrives, so we pay for them *later*, not now.
- **Portability:** it's a plain Node app behind a health check on a
  standard Postgres — nothing Render-proprietary in application code. Leave
  by pointing another PaaS at the same repo.
- **Trade-off:** DX and edge-network polish are a notch below Vercel; a
  Node service is marginally more to reason about than "just static."

### Option B — **Railway** (close second)

Very similar shape to Render — app service + managed Postgres (pgvector) +
workers + cron, excellent DX, config-as-code. Ranks second only because its
**usage-based pricing** is less predictable on a fixed personal budget than
Render's flat service tiers, and the decade-horizon "boring/predictable"
lens (D-012) slightly favors Render. If the owner prefers Railway's DX,
the architecture is identical — this is a near-tie.

### Option C — **Vercel + Neon** (best launch DX, worst architectural fit)

Vercel is the reference platform for Next.js: zero-config, best-in-class
preview deploys, edge/ISR out of the box. For the **static Tier 0 launch it
is the fastest, cheapest path** (generous free tier). But it splits the
architecture:

- Postgres must come from a **separate** vendor (e.g. Neon — excellent
  serverless Postgres with pgvector) → two dashboards, two bills.
- **Background workers are the real problem.** Vercel's model is serverless
  functions + Cron; D-007's long-running ingestion/embedding workers do not
  fit the function execution model well. You end up adding *yet another*
  service (a worker host) — a third moving part.
- Net: three vendors to do what Render does in one, contradicting "fewest
  moving parts" (§0 of docs/11) and nudging toward vendor sprawl on a
  one-maintainer budget.

Vercel is the right answer for a **pure static marketing site**; it is the
wrong long-term answer for **this modular monolith with workers.** Choosing
it now to save a day at launch is exactly the "paint the DB into a corner"
risk this plan is required to avoid.

### Recommendation

**Primary: Render.** It is the one vendor that carries both the static
launch *and* the eventual monolith-with-workers-on-managed-Postgres without
a migration or a second/third vendor. Railway is an acceptable near-tie if
the owner prefers its DX. Vercel+Neon is explicitly **not** recommended as
the primary despite its launch-day appeal, because it structurally splits
D-007's monolith.

> **This selection is pending owner ratification (D-041, status: Proposed).**
> Nothing about the application code changes between these vendors — the
> choice is reversible, which is why D-012 deferred it to here.

---

## 2. Domain & DNS strategy

- **Apex domain** (e.g. `deepaklabs.com` or the owner's chosen domain) →
  the production service. Registrar is the owner's choice; keep DNS at the
  registrar or a neutral provider (Cloudflare DNS) rather than the PaaS, so
  **the domain is portable if the host changes** (anti-lock-in).
- **Records:** `CNAME`/`ALIAS` (or the host's flattened apex support) to the
  Render service hostname; `www` → apex redirect. TLS certificates are
  issued and auto-renewed by the host (Let's Encrypt) — no manual cert ops.
- **No email/MX coupling** to the web host — email stays independent so
  hosting can move without touching mail.
- **Preview deployments** get host-generated subdomains (no custom DNS).
- **Canonical host:** enforce a single canonical origin (apex, HTTPS) with a
  redirect from `www` and from HTTP, so SEO and OG tags have one true URL.

---

## 3. Environment strategy

| Environment | Trigger | Purpose | Data |
| --- | --- | --- | --- |
| **Local** | developer machine | `npm run dev` | none today; local Postgres later |
| **Preview** | every pull request | look-dev + review of the exact change | none today; an ephemeral/branch DB later |
| **Production** | merge to `main` | the live site | none today; managed Postgres later |

- **Preview = the review surface for the Gate 4 look-dev sign-off** in
  `RELEASE_CHECKLIST.md` — the owner reviews the real built page per PR.
- **Two environments, not three.** A separate long-lived "staging" is not
  justified for one maintainer (docs/13's triage-grade principle); PR
  previews *are* staging. A staging tier can be added later if the DB sprint
  makes destructive migrations risky enough to warrant it.
- **Configuration/secrets:** none required for Tier 0 (no server, no keys).
  When the DB/LLM arrive, secrets live in the host's environment-variable
  store (never in the repo), injected per-environment. `.env.example` will
  document the shape; real values never commit. This is why the launch is
  low-risk: there is no secret surface to leak yet.

---

## 4. CI pipeline

**Separation of duties:** GitHub Actions **verifies**; the PaaS **deploys**.

- **`.github/workflows/ci.yml`** runs on every PR and on `main`:
  1. `npm ci`
  2. `npm run typecheck` — must be clean.
  3. `npm run build` — must be clean, **zero warnings**.
  4. **three.js First-Load guard** — asserts three.js stays out of `/`
     First Load JS (the release criterion, scripted so it can never silently
     regress).
- **Deploy on `main`:** Render auto-deploys the production service on push
  to `main` *after* CI is green (branch protection requires the CI check).
  The pipeline is therefore "typecheck → build → guard → deploy on main,"
  split across the two systems by design — CI owns correctness, the PaaS
  owns rollout.
- **The first production deploy is owner-triggered**, not automated on the
  owner's behalf (see README + `RELEASE_CHECKLIST.md`). Auto-deploy on
  `main` is enabled only after that first manual deploy succeeds.

---

## 5. Caching & CDN posture

- **Static assets & prerendered pages** are served from the host's CDN edge.
  Today the entire site is static, so it is effectively a CDN-served site
  with near-zero origin load.
- **Immutable hashed assets** (`/_next/static/*`) get long-lived
  `immutable` cache headers (Next.js default) — safe because filenames are
  content-hashed.
- **HTML/data** uses conservative caching now (static); when ISR/SSR lands,
  per-route revalidation (`revalidate`) and stale-while-revalidate become
  the tuning surface — decided per route in the page sprints, not globally.
- **Media** (docs/13, D-013) will serve from object storage behind an image
  CDN with on-the-fly variants; `next.config.ts` already declares AVIF/WebP
  and reserves `images.remotePatterns` for when the media pipeline lands.
- **No third-party scripts** on the public site (specs/landing.md §8) — the
  cache and privacy posture stays clean by construction.

---

## 6. Rollback & recovery

- **Rollback = redeploy the previous green build.** The PaaS keeps prior
  successful deploys; one click (or one API call) restores the last good
  version. Because releases are small and frequent (D-007), the blast radius
  of any single release is small.
- **Git is the source of truth:** every deploy maps to a commit on `main`;
  `git revert` + push produces a clean forward-fix that CI re-verifies.
- **Today there is no data to recover** — the site is static, so rollback is
  purely code. This is a deliberate low-risk launch posture.
- **When Postgres arrives:** managed automated backups + point-in-time
  recovery (provider feature); migrations run forward-only and are tested on
  a preview/branch database before `main`; a destructive migration is the
  trigger to reconsider a dedicated staging tier (§3).
- **Health checks:** the service exposes a health path so the PaaS can
  detect a bad boot and hold the previous version rather than route traffic
  to a broken deploy.

---

## 7. What changes when the database arrives (docs/09)

The plan is explicitly built so the DB is an **addition**, not a
re-architecture:

- **Same vendor, same dashboard:** add a Render Managed Postgres instance +
  enable `pgvector`; wire `DATABASE_URL` as a per-environment secret. No
  host migration.
- **Same repo, new service types:** add a **Background Worker** service and
  **Cron Jobs** to the *existing* `render.yaml` Blueprint — the monolith
  gains workers without changing hosts or splitting the codebase (D-007
  honored literally).
- **Web service flips from static to SSR/ISR** per route as pages start
  reading from the DB — Render already runs it as a long-lived Node
  service, so nothing about the runtime changes; only route rendering modes
  do.
- **Preview databases:** PR previews get an ephemeral/branch database so
  reviews exercise real queries safely.
- **Secrets surface appears** for the first time (DB URL, LLM/embedding
  keys) — managed in the host's env store, documented in `.env.example`.

Because none of the above requires leaving the vendor, changing the app's
runtime model, or splitting the datastore, **the database is not painted
into a corner** by launching Tier 0 now.

---

## 8. First deploy — the owner's steps

Summarized here; the copy-paste version lives in the repo `README.md`
("Deployment") and is gated by `RELEASE_CHECKLIST.md`.

1. Fill `content/site.ts` + replace `content/asmos.ts` (content gates).
2. Ensure CI is green on `main` (`typecheck` + `build` + three.js guard).
3. Create the Render Blueprint from `render.yaml` (New → Blueprint → pick
   the repo). Review the planned service.
4. Deploy — **the owner triggers this first deploy manually.**
5. Add the custom domain + DNS records (§2); wait for TLS.
6. Smoke-test production (`/` LCP is the headline; nav/footer have no dead
   links; `/memory` reconstructs; `/dev/hero` 404s).
7. Enable auto-deploy on `main`.

---

## 9. Open items (owner-gated)

- **D-041 ratification:** confirm Render (or elect Railway / Vercel+Neon
  with the §1 trade-offs understood).
- **Domain name** selection + registrar.
- **Monitoring/observability** (error tracking, uptime) — deferred until
  there is a server to observe; revisit with the DB sprint. Today a static
  site needs only uptime pings.

---

*Deferred, on purpose: monitoring stack, staging tier, and secret
management all arrive with the database (docs/09) — adding them now would be
complexity ahead of need, which §0 forbids.*
