# 27 — Admin CMS Architecture

> **Status:** Phase 1 ratified — D-047 (Option A: iron-session) and D-046
> (collocation) accepted. Phase 2 implementation active.
>
> **Decisions made here:** D-046 (admin collocation — ratified),
> D-047 (auth strategy — iron-session Option A, ratified).
>
> **Governing documents:** `docs/24` Part 11 (admin CMS philosophy, the
> ≤10-minute update loop spec), `docs/09-DATABASE.md` (CTI schema + lifecycle
> state machine), `docs/10-DEPLOYMENT.md` (Render posture).
>
> **Out of scope this document:** Dex/RAG implementation, media upload
> pipeline, public pages (Research/Posts/Timeline/Skills), multi-user auth,
> any copy changes, the hero scene.

---

## Table of Contents

1. [Governing Constraints](#1-governing-constraints)
2. [Collocation Decision — D-046](#2-collocation-decision--d-046)
3. [Route Structure](#3-route-structure)
4. [Auth Strategy — D-047 ⟨PENDING RATIFICATION⟩](#4-auth-strategy--d-047-pending-ratification)
5. [Session Handling](#5-session-handling)
6. [CSRF Posture](#6-csrf-posture)
7. [Public Bundle Isolation](#7-public-bundle-isolation)
8. [Editor Information Architecture](#8-editor-information-architecture)
9. [Version-History UX](#9-version-history-ux)
10. [Scheduled Publishing UX](#10-scheduled-publishing-ux)
11. [Single-Writer Law Enforcement](#11-single-writer-law-enforcement)
12. [Dex / Embeddings Sync Status — Design Only](#12-dex--embeddings-sync-status--design-only)
13. [Threat Model](#13-threat-model)

---

## 1. Governing Constraints

The admin is designed around four fixed axioms:

| Axiom | Source | What it means for the admin |
|-------|--------|-----------------------------|
| ≤10-minute update loop | docs/24 §11 | Every UI decision is evaluated against this. A question field that takes 3 clicks to reach fails the test. |
| File mode is the permanent floor | D-040, D-045 | `npm run build` and CI must succeed with zero running database. Admin pages must never be prerendered at build time. |
| Single-writer law | D-038 | In DB mode, the admin is the sole writer for content. `content/site.ts` becomes read-only reference material. |
| No admin surface on the public site | D-014, §13 threat model | No `/admin` links, no admin JS in public bundles, no admin cookie checks in public routes. |

The admin is a **private instrument for one person.** It is boring by design. Speed and honesty are the only metrics — not delight for its own sake, not marketing copy, not clever UX.

---

## 2. Collocation Decision — D-046

`docs/SESSION_START.md` §12 anticipates `apps/admin` as a separate Next.js app. This decision re-evaluates that for the current context.

### Option A — Collocated: `apps/web/app/(admin)/...` ⟨RATIFIED⟩

The admin lives as a route group inside the existing `apps/web` Next.js application.

**Why this wins for a single-user personal CMS:**

- Shares all existing code with zero friction: Drizzle schema (`src/db/`), content types (`types/content.ts`), token system (`globals.css`), lazy DB client (`src/db/index.ts`), ContentService interface — all available by relative import.
- Route groups in Next.js 15 create separate chunk trees. `(admin)` code never ends up in `(site)` chunks. This is structural, not a convention.
- One deployed Render service, one `render.yaml` entry, one Docker container, one bill.
- No new `package.json`, no second Next.js config, no second `next/font`, no second dev server port.
- All admin Server Components are server-side DB code — they add exactly zero bytes to any public client bundle.

**The isolation concern (addressed by import discipline):**

- `(admin)` layout must never be imported by `(site)` code.
- Admin-specific components live in `src/features/admin/` — a separate directory, never cross-imported.
- TypeScript's module graph enforces the boundary; linting can verify it.

### Option B — Separated: `apps/admin` (matches SESSION_START.md §12 anticipation)

A second Next.js app in the monorepo. Would require: a new `apps/admin/package.json`, new `tsconfig.json`, new `next.config.ts`, a second Render web service (or monorepo deploy config), and extracting the Drizzle schema into a shared `packages/db` (not yet created).

**Not recommended now:** the overhead is disproportionate for a single-user CMS that shares all schema and types with the public app. `apps/admin` is the correct eventual shape when the admin grows to deserve it — the collocation structure doesn't prevent extraction later.

**D-046 ratified:** Collocate. `apps/web/src/app/(admin)/admin/...`. Nothing in this structure prevents extraction to `apps/admin` along the monorepo boundary later.

---

## 3. Route Structure

```
/admin                           → redirect to /admin/overview (requires auth)
/admin/login                     → the ONLY unauthenticated admin page

/admin/overview                  → freshness engine, publish queue, recent activity
/admin/projects                  → projects list (all 18, status + featured at-a-glance)
/admin/projects/new              → new project form
/admin/projects/[slug]           → project editor (the launch-critical editor)
/admin/publications              → publications list
/admin/publications/new          → new publication
/admin/publications/[slug]       → publication editor
/admin/posts                     → posts list
/admin/posts/new                 → new post
/admin/posts/[slug]              → post editor
/admin/timeline                  → timeline entries (drag-orderable)
/admin/timeline/new              → new timeline entry
/admin/timeline/[slug]           → timeline entry editor
/admin/skills                    → skills (two drag lists: current / previous)
/admin/settings                  → site-copy editor + identity + outbound + export
/admin/settings/versions         → site-settings version history
/admin/ai-kb                     → Dex / embeddings sync status (design only — see §12)
```

Deferred (not built this sprint, route stubs with honest empty states):
```
/admin/gallery                   → v1.5 (media upload pipeline not in scope)
/admin/analytics                 → v1.5 (no tracking service configured yet)
```

### File system layout

```
apps/web/src/
├── app/
│   ├── (site)/                   ← all public routes — UNCHANGED
│   └── (admin)/
│       └── admin/
│           ├── layout.tsx         ← auth gate + admin shell
│           ├── login/
│           │   └── page.tsx
│           ├── overview/
│           │   └── page.tsx
│           ├── projects/
│           │   ├── page.tsx       ← list
│           │   ├── new/
│           │   │   └── page.tsx
│           │   └── [slug]/
│           │       └── page.tsx   ← editor
│           ├── publications/     (same pattern)
│           ├── posts/            (same pattern)
│           ├── timeline/         (same pattern)
│           ├── skills/
│           │   └── page.tsx
│           ├── settings/
│           │   ├── page.tsx
│           │   └── versions/
│           │       └── page.tsx
│           └── ai-kb/
│               └── page.tsx
├── features/
│   └── admin/                    ← admin components (NEVER imported from (site))
│       ├── components/
│       │   ├── AdminShell.tsx     ← nav rail + header
│       │   ├── ProjectEditor.tsx
│       │   ├── PublishBar.tsx     ← sticky bottom lifecycle controls
│       │   ├── VersionHistory.tsx
│       │   ├── RelationsBuilder.tsx
│       │   ├── AbandonedBranchesList.tsx
│       │   └── ...
│       └── actions/              ← Server Actions — all admin writes live here
│           ├── projects.ts
│           ├── publications.ts
│           ├── posts.ts
│           ├── timeline.ts
│           ├── skills.ts
│           └── site-settings.ts
└── lib/
    └── auth/
        └── session.ts            ← iron-session config + getSession() helper
```

### Build-mode safety (the critical guarantee)

**Every admin page file carries:**

```typescript
export const dynamic = 'force-dynamic';
```

This tells Next.js: do not prerender this page at build time. Admin pages are compiled (TypeScript checked, import graph resolved) but **never executed** during `npm run build`. `getDb()` is never called during the static build. The public site builds clean with zero database.

The `(admin)` layout uses `cookies()` (to read the session) which also triggers dynamic rendering automatically — `force-dynamic` is belt-and-suspenders that makes the intent explicit.

---

## 4. Auth Strategy — D-047 ⟨RATIFIED: Option A⟩

Three options judged against: security posture, boring-technology value, dependency weight, and single-server/decade-horizon fit.

---

### Option A — iron-session: signed sealed cookie + bcrypt passphrase ⟨RECOMMENDED⟩

**Mechanism:**

1. Owner generates a bcrypt hash of their chosen passphrase (e.g. `htpasswd -bnBC 10 "" "mypassphrase" | tr -d ':\n'`) and stores it as `ADMIN_PASSWORD_HASH` in the Render env dashboard and locally in `.env.local`.
2. A `SESSION_SECRET` (32+ byte random string, e.g. `openssl rand -hex 32`) is stored alongside it. Both are in `.env.example` as non-secret placeholders.
3. `POST /admin/login` (Server Action): receives the submitted password, calls `bcrypt.compare(submitted, ADMIN_PASSWORD_HASH)` in constant time. On match: seal `{ user: 'owner', iat: Date.now() }` using `iron-session` (HMAC-SHA256 + AES256-CBC over `SESSION_SECRET`) into a cookie named `__session`.
4. Cookie flags: `HttpOnly; Secure; SameSite=Strict; Max-Age=28800` (8 hours).
5. Next.js **middleware** (`src/middleware.ts`) runs on all `/admin/*` routes except `/admin/login`. Unseals the `__session` cookie. Invalid or missing → `redirect('/admin/login')`. Valid → proceed.
6. Explicit logout (Server Action): overwrites the cookie with an expired value → redirects to `/admin/login`.

**Brute-force posture:**

- Middleware rate-limiter: in-memory `Map<ip, {count, resetAt}>`. 5 failed attempts per IP per 15 minutes → 429 with "Too many attempts. Try again in N minutes." Single-server Render deployment; the counter resets on restart, which is acceptable for a personal site.
- `bcrypt.compare` at cost-10 takes ~100ms on a modern server → theoretical maximum is 10 attempts/second independent of the rate-limiter. Both defenses are independent.

**Secret rotation:**

- `SESSION_SECRET` rotation: all active sessions are invalidated (unsealing fails). Owner must re-login after the next deploy. Change in Render env → redeploy.
- `ADMIN_PASSWORD_HASH` rotation: generate new bcrypt hash of the new passphrase, update env var in Render and `.env.local`. No deploy required if `SESSION_SECRET` is unchanged.

**On Render:** two env vars in the dashboard (`ADMIN_PASSWORD_HASH`, `SESSION_SECRET`). No SMTP. No OAuth provider registration. No external service.

**Dependency weight:** `iron-session@8` (~7 kB, no transitive deps beyond `iron-core`) + `bcryptjs` (~9 kB). Total: ~16 kB added to the server bundle. Zero bytes added to any client bundle (all auth code is server-only).

**Why it passes the boring-technology test:** HMAC + AES sealed cookies have been the web's standard auth primitive for 20 years. The `iron` sealing library (by @hapi/iron) is 15 years old and audited. There is nothing to go stale. Every Next.js engineer has seen this pattern. The threat model is: one POST endpoint + constant-time bcrypt comparison + sealed cookie. Nothing is clever; everything is understood.

---

### Option B — Auth.js v5 (NextAuth.js) with Credentials provider

**Mechanism:** `CredentialsProvider` with username/password. JWT sessions work without a DB table (database sessions require the `users` table, deferred in schema). `NEXTAUTH_SECRET` + `NEXTAUTH_URL` required.

**What it adds over Option A:**
- Maintained auth framework with version releases
- Could add OAuth providers (GitHub, Google) later without re-architecting

**Why it loses for this use case:**
- Dependency weight: ~50 kB extra + transitive packages (jose, @auth/core, @auth/drizzle-adapter if DB sessions) — loaded for every admin request.
- Auth.js is designed for multi-provider OAuth applications. Using it for a single bcrypt password comparison imports the whole freight train to move a bike.
- No built-in brute-force protection — still requires custom middleware rate-limiting.
- `NEXTAUTH_URL` must be set correctly across Render's production URL + preview URLs. This is a recurring operational gotcha with Auth.js on Render (preview URL changes per-PR).
- The "add OAuth later" argument is YAGNI — D-014 explicitly forecloses multi-user and multi-provider auth. "No RBAC UI yet" doesn't mean "add Auth.js now."

---

### Option C — Platform-level protection (Cloudflare Access)

**Mechanism:** Cloudflare Zero Trust Access in front of `/admin/*`. The application has no auth code at all. One-time-code to owner's email or identity provider at the platform level.

**What it adds:**
- Zero application auth code.
- Cloudflare handles brute-force, MFA, device trust policies.
- Can restrict by IP allowlist at the Cloudflare level.

**Why it loses for this use case:**
- External service dependency: if Cloudflare Access is down, the admin is inaccessible. Violates "boring, works offline, no external service dependency."
- Requires configuring Cloudflare DNS for the custom domain. An additional ops step.
- Local development: Cloudflare Access doesn't protect localhost. Requires a Cloudflare Tunnel (cloudflared daemon) or a bypass for local — complicating the dev workflow.
- The application still needs to validate the `Cf-Access-Authenticated-User-Email` header; if a request bypasses the Cloudflare proxy (direct-to-origin), the app is open. Correct implementation is non-trivial.
- Render doesn't support Basic Auth natively on production Web Services.

---

### Summary table

| Criterion | Option A: iron-session | Option B: Auth.js | Option C: Cloudflare Access |
|-----------|----------------------|-------------------|----------------------------|
| Dependency weight | ~16 kB | ~50 kB+ | ~0 kB app code |
| External service dependency | None | None | Cloudflare (critical path) |
| Local dev experience | Identical to prod | Requires NEXTAUTH_URL tuning | Requires tunnel |
| Secret rotation | 2 env vars | 2+ env vars + URL config | Cloudflare dashboard |
| Brute-force protection | Rate-limit + bcrypt | Custom rate-limit needed | Cloudflare handles |
| Boring-tech test | ✅ HMAC/AES + bcrypt | ⚠️ OAuth framework for no OAuth | ⚠️ External service |
| Future OAuth possible | No (no reason to) | Yes | Separate to app auth |

**D-047 recommendation: Option A — iron-session.**

---

## 5. Session Handling

*(Assumes D-047 ratifies Option A. Details pending — if B or C is chosen, this section is rewritten for Phase 2.)*

| Property | Value |
|----------|-------|
| Cookie name | `__session` |
| Flags | `HttpOnly; Secure; SameSite=Strict` |
| Max-Age | 28800 seconds (8 hours) |
| Payload | `{ user: 'owner', iat: number }` |
| Sealing | HMAC-SHA256 + AES256-CBC over `SESSION_SECRET` |
| Unsealing | Middleware + `getSession()` Server Component helper |
| Logout | Server Action clears cookie, redirects to `/admin/login` |

**Session payload is minimal by design.** No username (it's always 'owner'), no permissions (there's only one permission level), no email. PII surface is zero.

**Auto-expiry:** `Max-Age=28800` means the browser discards the cookie after 8 hours regardless of server state. No DB session store is needed; no cleanup cron is needed.

---

## 6. CSRF Posture

All admin write operations are implemented as **Next.js 15 Server Actions**:

- Server Actions require a `Next-Action` custom header. Browsers enforce the Same-Origin Policy on custom headers — cross-origin JavaScript cannot add `Next-Action`. Cross-site requests cannot trigger Server Actions.
- React forms using Server Actions as `action` validate the action ID at the framework level.
- The session cookie is `SameSite=Strict` — it will not be sent on any cross-origin request regardless.

**Result:** CSRF protection is structural, not dependent on token rotation. `SameSite=Strict` + Server Action headers + route-group isolation = no exploitable CSRF surface.

No additional `<input type="hidden" name="_csrf">` tokens are needed. No CSRF middleware package is needed.

---

## 7. Public Bundle Isolation

The admin must be **invisible to the public site at the bundle level** — not just at the URL level.

### Structural guarantees

**1. Route group chunk isolation.** `(admin)` and `(site)` are separate subtrees in Next.js 15 App Router. Next.js builds separate chunk graphs for each group. A Server Component in `(admin)/` is compiled to a server handler — it never appears in any client bundle.

**2. Client components.** Admin forms and interactive elements are `'use client'` components in `src/features/admin/`. They are never imported from `(site)/` code. The TypeScript module graph enforces this — there is no import path from any `(site)/` file to `features/admin/`.

**3. CI hard failure.** The existing CI three.js guard in `.github/workflows/ci.yml` verifies that `features/hero-scene` is absent from `(site)` First Load JS by checking `.next/app-build-manifest.json`. An identical hard-failure guard verifies `features/admin` is absent from all public route chunks. Both guards exit 1 on violation — not a warning, not a soft check.

**4. robots.txt.** `apps/web/src/app/robots.ts` must include `disallow: '/admin'`. This prevents search-engine discovery. Current `robots.ts` needs this addition.

**5. No admin links anywhere on the public site.** The `BUILT_ROUTES` registry (`constants/routes.ts`) contains only public routes. No admin URL appears in `NavShell`, `Footer`, or any public `Link` component — this is structural.

**6. Security headers.** `X-Robots-Tag: noindex` on all `/admin/*` responses (belt + suspenders on top of robots.txt). Added via Next.js `headers()` in `next.config.ts`.

---

## 8. Editor Information Architecture

### Shell layout

```
┌──────────────────┬──────────────────────────────────────────────────────┐
│ dL admin         │  [breadcrumb]                  [owner] [Sign out]    │
│                  │                                                       │
│ Overview         │                                                       │
│ ────────────     │   ── main work area ──                                │
│ Projects    (18) │                                                       │
│ Research         │   list / editor / form per section                    │
│ Publications     │                                                       │
│ Posts            │                                                       │
│ Timeline         │                                                       │
│ Skills           │                                                       │
│                  │                                                       │
│ ────────────     │                                                       │
│ Settings         │                                                       │
│ AI KB  ●         │                                                       │
│                  │                                                       │
│ Sign out         │                                                       │
└──────────────────┴──────────────────────────────────────────────────────┘
```

Left rail is the one sticky region (docs/24 §23 closed sticky list). Main area is the work area. No second sticky region exists.

### Overview (freshness engine — §11.2)

- **Freshness cards:** each content type shows last-updated timestamp + a freshness indicator. Green: updated < 7 days. Amber: 7–30 days. Red: > 30 days. ("Projects last updated 3 days ago — green.")
- **Publish queue:** items with `status = 'scheduled'` listed with their scheduled times + "Cancel" and "Publish now" affordances.
- **Recent activity:** last 10 version entries (timestamp + slug + action).
- **Quick-add buttons:** "+ New Project", "+ New Post" etc. — direct to the `/new` form.
- **Draft count badges** on nav rail items (number of drafts per type, read from DB).

### Universal content editor

**Left pane — the content:**
- Title (large text input, always first)
- `question` field (textarea, labeled "Origin question — required to publish"; shows the publish gate inline)
- Content-type-specific fields (see §8.5 per-type tables)
- `abandonedBranches` ordered list (add/edit/remove; each entry: tried / whyAbandoned / learned)
- Markdown body (posts and publications only)

**Right pane — metadata:**
- Slug (auto-generated from title on creation, editable, uniqueness-checked on blur)
- Status label (read-only display — controlled by Publish Bar)
- `publishedAt` (shown when published, set by publish action, read-only)
- `scheduledFor` (date-time picker, shown when scheduling)
- Type-specific toggles: `featured` (projects), `verified` (all), `current` (skills)
- Tags (tag chip input)
- Relations builder (see §8.4)
- "Version history →" link (shows version count in parens)

**Publish Bar (sticky bottom, always visible):**

```
[ Save draft ]   [ Preview ↗ ]   [ Schedule ▾ ]   [ Publish ]
```

- **Save draft:** saves current state; `status` stays `draft`. Always enabled. Every save creates a version entry.
- **Preview:** opens the public-facing page URL in a new tab. Note: in DB mode, the page reads live from the DB, so the latest saved draft state is immediately visible. Preview of `draft` items requires no special preview-mode token for the owner — they are the only user.
- **Schedule:** opens an inline date-time picker. Sets `scheduled_for` and `status = 'scheduled'` on confirm.
- **Publish:** validates `question` is non-empty. If empty: shows a blocking message in-place (not a toast — it must be readable and specific): *"A published project must answer its origin question. Fill in the question above before publishing."* On valid: `status = 'published'`, `published_at = NOW()`.

### Lifecycle state machine

```
draft ──→ scheduled ──→ published ──→ archived
  ↑            │              │
  └────────────┘              └──→ draft (un-publish)
  (cancel schedule)
```

**Available transitions per current status:**

| Current status | Available transitions (shown in UI) |
|----------------|-------------------------------------|
| `draft` | → `scheduled` (Schedule button), → `published` (Publish button, blocked without question) |
| `scheduled` | → `draft` (Cancel schedule), → `published` (Publish now) |
| `published` | → `draft` (Un-publish), → `archived` (Archive) |
| `archived` | → `draft` (Un-archive) |

The UI only renders buttons for legal transitions. No illegal transition is reachable from the UI. The schema's `ck_published_has_question` CHECK constraint is the second enforcement layer — if the UI gate somehow fails, the DB rejects it with a clear error.

### Relations builder (right pane)

```
Relations
─────────────────────────────────────────────
Kind:  [implements ▾]     Target: [search...]  [ + Add ]

  implements
    → ShortcutScore: Predictive Typing  [ × ]
  writes-about
    (empty)
  references
    (empty)
─────────────────────────────────────────────
```

- **Kind selector:** closed dropdown — implements / writes-about / produced / evidences / depicts / references. This is the only kind enum in the system; adding a kind requires a D-entry (D-043 binding condition 3).
- **Target search:** free-text search against `content_items` (all types, all statuses).
- **Validation before the Server Action fires:**
  - Same-slug self-relation → blocked: *"A project cannot relate to itself."*
  - Duplicate `(source, target, kind)` → blocked: *"This exact relation already exists."*
  - The UI validates these before submission; the schema's `ck_no_self_relation` and `uq_relations_from_to_kind` constraints enforce them independently. The UI must not rely on DB error messages as its only UX.
- Bidirectional links: when a relation is created, the inverse direction is recorded in the `relations` table (e.g., creating `project-A implements publication-B` adds both `A→B implements` and notes on B's detail page that A implements it). Implementation: a single Server Action inserts both rows in a transaction.

### Per-type field table

**Projects** (`content_items` + `projects`):

| Field | UI element | Notes |
|-------|-----------|-------|
| `title` | Text input | Required |
| `slug` | Text input | Auto-generated; editable; unique-checked on blur |
| `question` | Textarea | Publish gate; required to publish |
| `problem` | Textarea | One-line problem statement |
| `year` | Number input | 4-digit |
| `projectStatus` | Select | active / archived |
| `featured` | Toggle | |
| `repoUrl` | URL input | Optional |
| `tags` | Tag chip input | |
| `abandonedBranches` | Ordered list | add/edit/remove; tried + whyAbandoned + learned per entry |
| `verified` | Toggle | LAW-008 |

**Publications** (`content_items` + `publications`): title, question, problem (abstract), authors (chip input), venue, year, `pdfUrl`, `bibtex`, `doi`, `plainSummary`, abandonedBranches, verified.

**Posts** (`content_items` + `posts`): title, question, `dek`, tags, Markdown body (with preview toggle), `readingMinutes` (auto-estimated from body word count), abandonedBranches, verified.

**Timeline** (`content_items` + `timeline_entries`): title, question, organization, role, startDate, endDate (absent = current), summary (one-line).

**Skills** (`content_items` + `skills`): title, question, context, `current` toggle (current / previous).

---

## 9. Version-History UX

### Schema additions (Phase 2 migration required)

```sql
-- Content item versions
CREATE TABLE content_versions (
  id             uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id        uuid    NOT NULL REFERENCES content_items(id) ON DELETE CASCADE,
  version_num    integer NOT NULL,
  snapshot       jsonb   NOT NULL,       -- full item + type-row + abandoned_branches
  changed_fields text[]  NOT NULL DEFAULT '{}',
  -- Amendment (owner 2026-07-12): origin provenance is cheap at design time,
  -- impossible to backfill. Allowed values: manual_save | publish | unpublish |
  -- schedule | restore | scheduled_publish
  origin         text    NOT NULL DEFAULT 'manual_save',
  created_at     timestamp with time zone DEFAULT now() NOT NULL
);
CREATE INDEX idx_cv_item_created ON content_versions (item_id, created_at DESC);

-- Site settings versions
CREATE TABLE site_settings_versions (
  id         uuid  PRIMARY KEY DEFAULT gen_random_uuid(),
  key        text  NOT NULL,
  snapshot   jsonb NOT NULL,
  origin     text  NOT NULL DEFAULT 'manual_save',
  created_at timestamp with time zone DEFAULT now() NOT NULL
);
CREATE INDEX idx_ssv_key_created ON site_settings_versions (key, created_at DESC);
```

The `snapshot` is a JSONB object capturing the full state: `content_items` row + type-specific child row + all `abandoned_branches` rows for that item. This snapshot is self-contained; restoring it requires no join.

### When versions are created

A new version entry is written on every explicit save (Save draft, Publish, Schedule, Restore). The `changed_fields` array is computed by diffing the previous snapshot against the new one — it drives the "Changed: question, tags" summary in the history list.

### Version history view

```
Version History — ASMOS: Predictive Typing
───────────────────────────────────────────────────────────────
v12   2026-07-12 14:23   Published                   [ Restore ]
v11   2026-07-12 11:05   Changed: question            [ Diff ] [ Restore ]
v10   2026-07-10 09:32   Changed: tags, repoUrl       [ Diff ] [ Restore ]
v9    2026-07-08 16:47   Saved (draft)                [ Diff ] [ Restore ]
...
───────────────────────────────────────────────────────────────
Showing 10 of 12 versions.  [ Show all ]
```

- **Diff view:** compare the selected version's snapshot against the current state. Field-by-field — each changed field shown as: `fieldName: "old value" → "new value"`. No external diff library needed; simple JSON object comparison.
- **Restore:** creates a new version (v13 in the example above = the restored state of v11). **Never destructive.** The current state is always reachable in version history. Restore sets `status = 'draft'` on the restored item — the owner must deliberately re-publish. This prevents accidentally restoring a published item to a past state that goes live immediately.

---

## 10. Scheduled Publishing UX

### The mechanism

1. Owner sets `scheduledFor` via the date-time picker in the Publish Bar → Schedule action.
2. Server Action writes `status = 'scheduled'`, `scheduled_for = <datetime>` to `content_items`.
3. A **Render Cron Job** runs every minute. **Amendment (owner 2026-07-12): the cron must be idempotent and safe to overlap.** Implementation uses row-level claiming via `FOR UPDATE SKIP LOCKED`:
   ```sql
   BEGIN;
   -- Claim up to 50 rows atomically; concurrent cron run skips claimed rows
   SELECT id FROM content_items
     WHERE status = 'scheduled' AND scheduled_for <= NOW()
     FOR UPDATE SKIP LOCKED LIMIT 50;
   -- Update only the claimed rows
   UPDATE content_items SET status='published', published_at=NOW(),
     scheduled_for=NULL, updated_at=NOW()
     WHERE id = ANY(<claimed ids>);
   INSERT INTO content_versions (..., origin='scheduled_publish') VALUES ...;
   COMMIT;
   ```
   Two concurrent runs never double-publish the same row. A stuck row is skipped rather than wedging the batch.
4. In DB mode, the public site reflects the published state on the next request (no build required — SSR).

```yaml
# render.yaml addition (Phase 2):
- type: cron
  name: deepak-labs-scheduler
  runtime: node
  schedule: "* * * * *"   # every minute — Render bills per-run, see docs/10
  buildCommand: npm ci
  startCommand: npm run db:publish-scheduled --workspace=web
```

The `db:publish-scheduled` script is a simple `tsx scripts/db-publish-scheduled.ts` that runs the UPDATE above and exits.

### UI affordances

**In the Overview publish queue:**
```
Publish queue (2)
─────────────────────────────────────────────────────────
ASMOS: Predictive Typing       → Jul 15 at 09:00  [ Cancel ] [ Publish now ]
ShortcutScore                  → Jul 20 at 14:00  [ Cancel ] [ Publish now ]
```

**In the editor Publish Bar (when `status = 'scheduled'`):**
```
[ Scheduled: Jul 15 at 09:00 — Cancel ]       [ Publish now ]
```

**Past-due items:** if `scheduled_for` is in the past and the cron hasn't run yet (max 1-minute lag), the item shows "Publishing soon…" — the cron resolves this within one minute.

---

## 11. Single-Writer Law Enforcement

The D-038 single-writer law: exactly one runtime writes any datum.

### The precedence rule

| Mode | Source of truth | Who can write |
|------|-----------------|---------------|
| `CONTENT_SOURCE=file` (default, unset) | `content/site.ts` + `content/asmos.ts` | Owner edits TypeScript files directly |
| `CONTENT_SOURCE=db` | `content_items`, type tables, `site_settings` | The admin CMS exclusively |

### In file mode

`content/site.ts` is the sole writer. The admin CMS is DB-native — it writes to the database — but the public site ignores the DB. If `CONTENT_SOURCE ≠ db`, the admin displays a persistent banner:

> **⚠ Site is running in file mode.** Changes saved here update the database but will not appear on the public site until you set `CONTENT_SOURCE=db` in your environment and restart. [Learn more]

This banner cannot be dismissed. It is honest per LAW-008 — the admin must never silently write changes that have no effect.

### In DB mode

The admin is the sole writer. `content/site.ts` becomes read-only reference material. The settings page carries a permanent note:

> **DB mode is active.** `content/site.ts` and `content/asmos.ts` are read-only reference — edits there are ignored while `CONTENT_SOURCE=db`. All content is managed from this admin.

**The owner must not edit both.** If `content/site.ts` is edited while `CONTENT_SOURCE=db`, those edits are silently ignored. The admin is the source of truth.

### Site-copy editor (settings page)

Edits the `site_settings` table. Each save creates a `site_settings_versions` entry.

Editable keys:
- `identitySentence` — the `<h1>` hero line
- `identitySupport` — the support line beneath it
- `currentFocus` — the current focus phrase
- `currentFocusUpdatedAt` — the freshness date for the focus stamp
- `mission` — the mission section copy
- `contactSentence` — the contact invite sentence
- `contactEmail` — the contact email address
- `outbound` — JSONB: `{ github, linkedin, x, instagram, scholar }` outbound link URLs
- `cvUrl` — CV download URL (when added)

Each key is presented as a labeled field. The editor matches the exact shape of `content/site.ts` so the owner can migrate from file mode to DB mode by copying values one field at a time.

---

## 12. Dex / Embeddings Sync Status — Design Only

This section defines the UX for `/admin/ai-kb` — **implementation deferred to the Dex sprint (v1.5)**. The `embeddings` table is designed in `docs/09` §8 but not yet migrated. This page exists at `/admin/ai-kb` today as a designed, honest empty state; it does not block Phase 2.

### Designed UI (LAW-008 — honest empty state)

```
AI Knowledge Base
──────────────────────────────────────────────────────────────
Corpus overview

 Items: 18          Synced: 0          Pending: 0         Stale: 0

 Last sync: never

 [ Re-sync all ]    ← disabled: "Configure an LLM API key in Settings first"

──────────────────────────────────────────────────────────────

ASMOS: Predictive Typing         ○ not synced
ShortcutScore: …                 ○ not synced
[16 project drafts]              — draft (not syncable until published)

──────────────────────────────────────────────────────────────

 Dex is not live.
 Configure OPENAI_API_KEY (or equivalent) in Settings → AI to enable Dex.
 Answer testing will be available once an embedding service is configured.
```

**Key LAW-008 requirements:**
- "Synced: 0" is honest. Never show a fabricated synced count.
- "Dex is not live" is honest and non-apologetic. No "coming soon" banner.
- Status indicators: ● synced / ○ pending / ✗ stale / — not applicable (drafts cannot be synced).
- Buttons are disabled with honest explanations, not hidden.

When the Dex sprint ships: the "Configure API key" CTA resolves to a Settings → AI field. The Re-sync button enables. Status indicators update in real time after sync.

---

## 13. Threat Model

### What an unauthenticated attacker reaching `/admin` can do

- See the login form. Expected and acceptable.
- Submit login attempts. Mitigated: rate-limit (5/15min) + bcrypt ~100ms delay.
- **Nothing else.** No data is hydrated into the unauthenticated login page. No DB query fires before auth.

### What an authenticated attacker (stolen or forged session) can do

- Read all 18 project drafts (not yet public — low severity for a personal site).
- Publish / unpublish / archive content. All state changes are reversible via version history + git.
- Modify copy fields (question, problem, etc.). Recoverable from version history.
- Change `site_settings` (contact email, outbound links). Recoverable.
- **Cannot:** access server environment variables, execute raw SQL, access the filesystem, or exfiltrate the DB connection string. All writes go through typed Drizzle ORM calls with no dynamic query construction.

### Mitigations in place

| Threat | Mitigation |
|--------|-----------|
| Brute-force on `/admin/login` | In-memory rate-limiter (5 attempts / 15 min / IP) + bcrypt cost-10 delay (~100ms/attempt). **Known gap (recorded per owner amendment 2026-07-12):** see below. |
| Cookie forgery | iron-session seals with HMAC-SHA256 + AES256-CBC using `SESSION_SECRET` — unforgeable without the key |
| Session fixation | New sealed cookie issued on every successful login |
| CSRF | Server Actions (Next-Action header, SOP-enforced) + `SameSite=Strict` cookie |
| Clickjacking | `X-Frame-Options: DENY` on all admin responses |
| Content-type sniffing | `X-Content-Type-Options: nosniff` |
| Admin routes indexed by search engines | `Disallow: /admin` in `robots.txt` + `X-Robots-Tag: noindex` header on admin responses |
| Admin links discoverable via public site | No `/admin` URL in `NavShell`, `Footer`, `BUILT_ROUTES`, or any public component |
| Admin JS in public bundles | Route group isolation + import discipline + CI bundle-manifest check |
| Insecure transport | HTTPS enforced by Render; `Strict-Transport-Security` in response headers |
| SQL injection | Drizzle ORM uses parameterized queries exclusively; no raw SQL in admin code |

### Security headers (added to `next.config.ts` `headers()`)

```typescript
// Applied to all /admin/* responses
{
  key: 'X-Frame-Options',       value: 'DENY',
  key: 'X-Content-Type-Options', value: 'nosniff',
  key: 'Referrer-Policy',        value: 'no-referrer',
  key: 'X-Robots-Tag',           value: 'noindex',
  key: 'Permissions-Policy',     value: 'camera=(), microphone=(), geolocation=()',
}
```

`Strict-Transport-Security` is set by Render at the edge level (not in `next.config.ts`) to avoid issues with local HTTP development.

### Known gap: in-memory rate-limiter (recorded, not silent)

**Amendment owner 2026-07-12:** the rate-limiter's limitations must be documented explicitly.

The rate-limiter uses a module-level `Map<ip, {count, resetAt}>` in the Node.js server process. This has two documented failure modes:

1. **Resets on deploy/restart.** Every Render deploy is a process restart; the attempt counter resets. An attacker aware of deploy timing could time a burst immediately after each deploy. Acceptable for a personal site where deploys are infrequent; bcrypt's ~100ms delay independently limits burst rate to ~10 attempts/second regardless.

2. **Per-instance only.** If Render ever runs more than one web instance, each instance has its own Map. An attacker distributing requests across instances bypasses the 5-attempt window. The personal site starter plan runs one instance; this is documented for the day the service scales.

**Future fix:** move the counter to a Postgres table (`rate_limit_attempts (ip text, count int, reset_at timestamptz)`). A `WHERE reset_at < NOW()` upsert is a single atomic query. This survives restarts and multi-instance deployments. No schema exists yet — add it to the backlog when either failure mode becomes a real concern.

**The login form reveals nothing about which factor failed.** Every failed login — wrong password, unset env var, rate-limited — returns the same message: *"Incorrect credentials."* This prevents enumeration.

**Constant-time comparison:** `bcryptjs.compare()` is constant-time by construction (the algorithm runs the same number of rounds regardless of early mismatch). No early-exit path exists in the auth flow before bcrypt runs.

### What is explicitly NOT in scope (personal single-user site)

- **MFA/TOTP:** Optional upgrade in v1.5 via an authenticator app (add a `totp_secret` to the session flow — no schema change needed).
- **Account lockout with unlock flow:** Rate-limiting handles this. There are no "accounts" to lock.
- **Audit logs with IP addresses:** Version history serves as the content audit trail. IP logging requires a privacy policy and is disproportionate for a personal site.
- **Penetration testing:** Out of scope for a personal budget. Rate-limit + HTTPS + sealed cookies + CSRF-by-construction cover the realistic threat model for a single-owner personal site.

---

*This document is the engineering contract for the admin sprint. Every implementation decision in Phase 2 traces back to a section here. Changes to the auth mechanism, route structure, or version-history schema require updating this document.*
