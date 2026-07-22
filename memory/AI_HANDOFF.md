# AI Handoff

> Update this file before ending any work session, so the next assistant can resume seamlessly.

## Handoff Protocol

Before finishing a session, record:

1. **What I did** — the changes made this session.
2. **Why** — the reasoning and any decisions (also log to [`DECISIONS.md`](DECISIONS.md)).
3. **State** — update [`CURRENT_STATE.md`](CURRENT_STATE.md).
4. **Next** — the recommended next steps.
5. **Open questions / blockers** — anything unresolved.

## Session Log

### 2026-07-21 — D-052: Instrument redesign + 3D neural-face hero (Phases 0–5)

- **Branch:** `feat/instrument-redesign` (cut off the release work). **Nothing committed by the AI (T1)** — owner reviews in-browser, then commits/merges.
- **What I did (five phases):**
  - **Phase 0 — regressions:** root-caused the live hero copy bug. The hero `<h1>` (`arrival.tsx` → now `NeuralFace3DClient`) reads `siteContent.identitySentence` via a **static file import**; the `site_settings` DB table is **write-only** (admin `SettingsEditor` writes it, no public read path exists), so the file was the sole source and held the old rejected string. Fixed at the file (`"I build intelligent systems."`), documented file-vs-DB precedence in a code comment, flagged the write-only-settings latent gap. Removed the dead `SoundToggle` (LAW-008).
  - **Phase 1 — design system:** `docs/DESIGN_SYSTEM.md` + the Instrument token layer in `globals.css` (dark-first stage/ink, muted/faint as ink-opacity, hairline ink@8%, Gemini accent gradient energy-only, six-size type scale, `ease-instrument`/`ease-arc`, `.cta-pill`/`.gradient-underline*`/`.section-rhythm` utilities). Inter Tight wired in `layout.tsx`. Motion primitives aligned (`tokens.ts`/`variants.ts`: 400ms/12px reveal).
  - **Phase 3 — reskin:** nav → glass + active gradient underline (+client for `usePathname`); Section rhythm 96/160; mission/evidence/collaborate/arrival + projects index → six-token scale + display face; ProjectCard rebuilt (title + role, hover gradient underline, no imagery); detail page question → large display pull-quote at 160px rhythm; AdminShell wordmark → display (admin stays gradient-free).
  - **Phase 2 — 3D hero (`features/hero-scene/neural-face/`):** pipeline v2 extends `generate-hero-face.mjs` → `hero-face-3d.json` (8000 surface / 2500 mobile / 280 inner + 12 pulses) + `hero-face-poster.webp` (+`-sm`), `--depth-map` flag. Scene = custom-shader particle relief (additive, circular mask, drift+breathing) → CatmullRom camera dive with fog cross-fade → instanced inner nodes + faint edges + meshline `dashOffset` pulses + selective bloom. `NeuralFace3DClient` owns the poster-first SSR LCP, tier/idle/intersection gating, native-scroll offset, copy overlay, and the fallback ladder. `next/dynamic({ssr:false})` keeps three lazy.
  - **Phase 4 — governance/CI:** `check-bundle-budget.mjs` extended (170 kB ceiling; lazy 3D chunk ≤500 kB gz; `hero-face-3d.json` ≤140 kB gz + posters ≤90 kB existence/budget); `ci.yml` step relabelled; **D-052** logged in `DECISIONS.md` (supersedes D-050 Track 1, amends the bundle law, records the ScrollControls→native-scroll deviation).
  - **Phase 5 — tester pass:** static/code items verified; browser-only items flagged, not faked.
- **Verified numbers:** typecheck clean; `next build` green, 0 warnings, 14 pages; `/` First Load **154 kB** (Next) / 150.4 kB (guard) ≤170; three.js **absent** from `/` First Load; lazy 3D stack **253.5 kB gz** (5 chunks) ≤500; `hero-face-3d.json` 43.8 kB gz; posters 86.0 kB; `--depth-map` flag works.
- **Deliberate deviation (flagged):** native window-scroll drives the scene, not drei `<ScrollControls>` (which owns its own scroll container and fights the document flow of the sections below the hero). Honours "native scroll wins" + keeps the page flowing. Recorded in D-052 + the scene header.
- **Needs owner's browser (NOT faked as PASS):** 60/40 fps, visual/likeness correctness, LCP under Fast 3G, real `WEBGL_lose_context` recovery, mount/unmount ×10 memory, mobile emulation smoothness.
- **Owner sign-off checklist:** `npm run dev` → `/` desktop (poster → face → dive → network); confirm copy overlays Beat 1 and fades; reduced-motion → poster only; mobile emulation → 2500 nodes, no bloom; light theme → hero stays a dark stage; DevTools Network → 3D chunks load only after idle.
- **Owner git commands (run after in-browser sign-off):**
  ```bash
  # Stage the D-052 work (Phases 0–5) on the current branch:
  git add -A
  git commit -m "feat: D-052 — Instrument design system + 3D neural-face hero (supersedes D-050 Track 1)"
  git push origin feat/instrument-redesign
  # After sign-off, open a PR into main (or, once CI green):
  git checkout main && git merge feat/instrument-redesign --no-ff && git push origin main
  ```
- **Open / next:** wire a `getSiteSettings()` read path so admin copy edits reach the public site (the write-only gap); optionally add `/memory` to the reskin scope (it still has `text-[0.65rem]` micro-labels outside the six-token scale); real depth map via `--depth-map` for richer relief; the live-browser QA sign-off above.

### 2026-07-21 — D-050 Close-Out + Release Readiness (final engineering session)

- **What I did:** Four engineering deliverables completing the last deploy-blocking gates.
  1. **`brief.tsx` self-hide fix** — added `.filter(([, value]) => value)` before `.map()` on `rows` in the Brief dialog so empty gist fields (e.g. `formed: ""`) never render a blank label (LAW-008). One line.
  2. **`content/asmos.ts` rewritten** — old scaffold described a fabricated "structured memory architecture" project (wrong project, wrong framing). Replaced entirely with owner-ratified content: ASMOS is an ownership-based multi-agent orchestration system; ratified text covers the insight (systems only compared answers, not routed by ownership), the experiment (subtask routing by owning agent), and the result (confirmed; context tokens cut ~24% per query in evaluation). 3 stages (`question`, `experiments`, `results`), 3 dex Q&As grounded in those stages, `role: "Researcher and engineer"`, `formed: ""` (self-hiding), `links: []`. `draft: false` flipped. `memoryNodes`/`memoryEdges` preserved unchanged. Clears **G3 (hard deploy gate)**.
  3. **`apps/web/src/instrumentation.ts` created** — Next.js `register()` startup hook. Throws a named error at `next start` in production if `SESSION_SECRET` is missing/dev-fallback/< 32 chars or `ADMIN_PASSWORD_HASH` is missing/doesn't start with `$2`. Guarded by `process.env.NEXT_PHASE === "phase-production-build"` so CI builds with no real secrets pass clean. Closes the silent-credential failure mode (previous gap: `session.ts` used `?? "dev-secret-min-32-chars-change-me!"` silent fallback).
  4. **`docs/DEPLOY_RUNBOOK.md` created** — 6-step click-by-click first-deploy sequence: merge → CI green → Render Blueprint click → env vars (with raw/escape guide) → smoke test table (8 checks) → custom domain + TLS → flip `autoDeploy: true`.
  5. **`docs/10-DEPLOYMENT.md §8a` added** — complete deploy-day env var sheet as a new section; full table of all 11 env vars with field type, scope, and generation commands; R2 omitted with reason; escape-note for bcrypt hashes.
  6. **Arrival act-0 sub-line swapped** — "A researcher-engineer, read as a network of the work." → "Me, rendered as a network of the work." (owner ruling: LAW-002 third-person violation). All four sub-lines now owner-ratified.
  7. **`memory/CURRENT_STATE.md` updated** — status set to "RELEASE-READY — pending owner deploy click".
  8. **`memory/DECISIONS.md` G3 amendment note added** — records the ASMOS rewrite and Arrival ratification against D-050.
- **Build evidence (final run):** typecheck EXIT 0; build 14 static pages, zero warnings, `/` = 151 kB First Load JS; D-050 bundle guard 148.2 kB ✓ (≤ 164 kB); three/gsap/lenis/sharp absent ✓; hero-face.json 31.4 kB gz ✓ (≤ 60 kB); admin isolation ✓.
- **Ratified sub-lines (verbatim):**
  - Act 0: "Me, rendered as a network of the work."
  - Act 1: "Systems, memory, and the questions between them."
  - Act 2: "Everything here is real, or it isn't shown."
  - Act 3: "Keep scrolling — the work comes first."
- **CV:** `cvUrl: null` stays. No PDF in `apps/web/public/`. `hero.tsx` has `{siteContent.cvUrl && (...)}` guard — CTA self-hides. Owner to upload PDF and fill `cvUrl` when ready.
- **Why:** Release-readiness close-out. Final gate table confirmed RELEASE-READY pending owner-only items (copy tests R4, visual sign-off, R2, six featured projects).
- **Owner must do to deploy (in order):**
  1. Review + commit uncommitted working tree (git commands in final report below)
  2. Run copy tests R4: read all ratified landing copy aloud (10-second test), brief/a-friend test
  3. Visual look-dev sign-off: open `/` in Chrome + Safari on mobile; confirm hero on both; confirm dark/light
  4. `git checkout main && git merge release/v0.9.0-alpha --no-ff && git push origin main` — wait for CI green
  5. Render Blueprint → env vars → deploy → smoke test (DEPLOY_RUNBOOK.md §4)
  6. Flip `autoDeploy: true` in `render.yaml` after smoke test passes
  7. Fill `content/asmos.ts` `gist.formed` (year ASMOS work began) — currently `""`, self-hides
  8. Write `question` fields for featured six projects, flip their `status: "published"` → `/projects` goes live
  9. Set up R2 env vars when ready (media pipeline already built, just needs credentials)
- **Open:** `gist.formed` in asmos.ts; featured 6 projects question+publish; R2 setup; visual sign-off; R4 copy tests. None of these block the deploy click — they are post-deploy or parallel.

### 2026-07-20 — D-050 Track 1: "Neural Face Lite" Canvas2D hero

- **What I did:** Built the dependency-free Canvas2D particle-portrait hero and swapped it in for the ambient R3F scene on `/`.
  - **Pipeline:** `apps/web/scripts/generate-hero-face.mjs` (`npm run hero:generate`) — `sharp` reads a downscaled (≤220px) greyscale portrait; per-pixel score = 0.45·luminance + 0.55·Sobel-edge (edge-biased so eyes/nose/mouth/jaw win); rank-then-clamp keeps ≤3,000 nodes (MIN 300 floor guarantees a face even for very dark images); KNN (k=3) edges via a spatial bucket index, median-pruned (>2.5×) and capped ≤6,000; 4–6 pulse paths as region-seeded random walks; output `public/hero-face.json` (flat quantized arrays + meta). Prints raw+gz sizes, **fails over 60 KB gz after one auto-retry** at a 2,000-node cap. Missing photo ⇒ loud one-line failure (LAW-008), never a fake face.
  - **Component:** `apps/web/src/features/neural-face/` — `renderer.ts` (imperative Canvas2D: DPR cap 2, offscreen static edge layer blitted per frame, brightness-tiered node batching, ≤2 pulses with `lighter` comp + ≥2s gaps, pointer-lerp parallax + touch autonomous drift, per-node breathing, 800ms smoothstep fade-in, **zero per-frame allocation**), `NeuralFaceHero.tsx` (SSR-safe shell, **fetch-only** load, IntersectionObserver + visibility pause, debounced resize, reduced-motion single static frame, full listener teardown, `aria-hidden`), `types.ts` (+ structural validator), `NeuralFaceHeroRegion.tsx`, `constants.ts`, `use-scroll-act.ts`.
  - **Integration:** `app/(site)/page.tsx` now mounts `NeuralFaceHeroRegion` (was `HeroSceneRegion ambient`). `arrival.tsx` reads `useScrollAct()` (was `useHeroStore`) and its ambient sub-line copy was rewritten for the no-scene hero. `features/hero-scene/` untouched; the 3D scene still lives at `/dev/hero`.
  - **Guardrails:** `.gitignore` ignores `apps/web/scripts/assets/*` (keeps `README.md`); `apps/web/scripts/assets/README.md` documents the drop location; `package.json` gains `hero:generate` + `check:bundle`; `scripts/check-bundle-budget.mjs` + a new CI step enforce the 164 kB `/` ceiling, banned-dep absence (three/gsap/lenis/sharp), and fetch-not-bundled dataset.
  - **Governance:** D-050 added to `DECISIONS.md` (two-track ruling + budgets + zero-dep term + the R3F-removal amendment + the sharp-devDep **conflict note**). `CURRENT_STATE.md` + this entry updated.
- **Why:** owner directive (D-050 sprint) — a distinctive "alive-not-animated" hero with no WebGL on the public critical path. Owner ruled (this session) to **replace** the ambient R3F mount on `/` rather than coexist, with a minimal self-contained sub-line driver, reversible in one commit for v1.5.
- **Verification:** typecheck clean. Pipeline validated on **synthetic** images (normal/tiny-180px/very-dark/oversized-4000×5000) — all green, ≈28 KB gz at the 3,000-node cap; those synthetic outputs are **not committed**. Build/budget numbers + the T9 tester table are in the final report.
- **Owner must do to activate:** drop a real `apps/web/scripts/assets/portrait-source.jpg` (or `.png`) → `cd apps/web && npm run hero:generate` → commit the produced `public/hero-face.json`. Until then the hero copy stands alone (correct graceful absence). Also pending: ratify the rewritten Arrival sub-line copy.
- **Note:** the local `.env.local` has `CONTENT_SOURCE=db`; with no Postgres running, `npm run build` fails on `/projects/[slug]` (ECONNREFUSED) — **pre-existing, unrelated to this sprint**. CI + the public/zero-DB build run in **file mode** (build with `CONTENT_SOURCE=file`).

### 2026-07-12 — Rich Metadata + Media Sprint complete (Phases 1–3)

- **What I did:** Enriched the content model + built the deferred media pipeline (`docs/28`, D-048/D-049).
  - Phase 1: authored `docs/28` (field matrix + media architecture), proposed D-048/D-049. Owner ratified both — D-048 with `skillsLearned` amendment (dedicated typed field, distinct from tags); D-049 = Cloudflare R2 with 3 conditions (env-only creds + README/CORS, one-command backup, upload constraints).
  - Phase 2: schema — rich typed columns on projects/publications/timeline/skills + `media`/`content_media`/`content_links` tables (migration `0002_romantic_martin_li.sql`, incl. `ck_image_has_alt` CHECK + `uq_content_media_cover` partial unique index); applied. Types + ingest updated (new fields empty when absent). ProjectEditor regrouped (Basics/Body/Dates & Context/Links/Skills/Media/Advanced) with `StringListEditor` + `MediaPicker`; `actions/projects.ts` persists all fields + content_media; buildSnapshot/restore extended (round-trip verified via a temp script).
  - Phase 3: media pipeline — `lib/media/{storage,validate,url}.ts`, `actions/media.ts` (upload + reference-checked delete), `/admin/media` library + `queries/media.ts`, `next.config` R2 allow-list, `scripts/media-backup.ts`. Public `/projects/[slug]` renders all new fields self-hiding.
- **Why:** owner directive — editors too sparse; LinkedIn-grade *optional* metadata + media. Rich-but-typed (D-043 upheld: no JSONB, no custom-field builder).
- **Budgets (before → after):** `/` 152→152 kB, `/projects` 106→106 kB, `/projects/[slug]` 106→111 kB (+5 kB next/image on the detail route). three.js/admin/aws absent from public First Load JS (CI guards pass). Build green, zero warnings.
- **OWNER MUST DO to activate media:** create an R2 bucket + public URL + API token; set `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`, `MEDIA_PUBLIC_BASE_URL` in `.env.local` (+ Render env). Steps in README → "Media / R2 setup". Cost: R2 free tier ≈ **$0/mo**; D-041 total unchanged. Text fields need no setup (work in DB mode now).
- **Open / deferred:** public pages for Posts/Timeline/Skills/Research still future sprints (their new fields are built + editable, rendering-designed-but-dormant); full markdown rendering of Project `overview` is paragraph-split for now (adopt a real MD pipeline when the Posts reading column ships); `content_links` table exists but only wired for future Post/Timeline use.

### 2026-07-12 — Admin CMS Sprint complete (Phases 1–3)

- **What I did:** Full Admin CMS implementation from architecture through acceptance.
  - Phase 1: `docs/27-ADMIN_CMS_ARCHITECTURE.md` — auth options, route structure, IA, version history, threat model. D-046 + D-047 proposed.
  - Owner ratified D-046 (collocation) and D-047 (iron-session Option A) with 4 binding amendments (rate-limiter honesty/known-gap, SKIP LOCKED cron, origin provenance on versions, CI guard as hard failure).
  - Phase 2: `iron-session` + `bcryptjs` installed. `content_versions` + `site_settings_versions` schema + migration 0001 applied. Auth infrastructure (`src/lib/auth/session.ts`, `src/middleware.ts`, `loginAction`/`logoutAction` with constant-time bcrypt and in-memory rate-limiter). Admin shell (`AdminShell.tsx` with nav rail). Login page. Admin layout (uses `x-pathname` header to skip shell on login, no redirect loop). Overview page (freshness engine, publish queue, recent activity). Projects list, new-project form, project editor (full field set, abandoned branches, publish bar with lifecycle state machine, schedule). Settings/site-copy editor (single-writer banner). Security headers in `next.config.ts`. `robots.ts` disallows /admin. `render.yaml` cron stub. Version history pages.
  - Phase 3: VersionHistory component (with origin badge, restore creates new version). CI hard guard for admin bundle isolation. `db-publish-scheduled.ts` cron with `FOR UPDATE SKIP LOCKED`. `db:publish-scheduled` npm script.
  - Acceptance ritual: **1.9s** end-to-end (draft → question → publish → appears on /projects). Limit: 10 min.
- **Why:** Admin CMS sprint per session brief. D-046/D-047 ratified by owner.
- **Next owner actions:**
  1. Add `SESSION_SECRET` (32+ byte random) and `ADMIN_PASSWORD_HASH` (bcrypt of chosen passphrase) to Render env + `.env.local`
  2. Remove the test credentials from `.env.local` (currently: `SESSION_SECRET=dev-local-secret...`, `ADMIN_PASSWORD_HASH=$2b$10$szs3A...`)
  3. Run `npm run db:ingest` to populate 18 projects + site settings
  4. Test `CONTENT_SOURCE=db` mode in dev: open http://localhost:3000/admin
  5. Write `question` fields for the 18 project drafts (featured 6 first), publish them
  6. Ratify D-041 (Render deploy vendor) — then trigger first deploy
- **Open questions:** Publications/Posts/Timeline/Skills editors are stubs (honest empty states) — they need their own sprint. Relations editor not built. `content_stages` table not yet used by admin.

### 2026-07-12 (handoff ritual) — VERSION + CHANGELOG + ingest fix + memory sync

- **What I did:** Completed the handoff ritual for the DB sprint.
  - Fixed `scripts/db-ingest.ts` — same WSL/Windows env-var issue as `drizzle.config.ts`; added `dotenv` load at the top so `DATABASE_URL` is read from `.env.local` before `getDb()` is called.
  - Bumped `VERSION.md` to `v0.7.0-alpha`; added v0.7.0-alpha row to version history table.
  - Created `CHANGELOG.md` v0.7.0-alpha entry (Added/Changed/Decisions sections, full DB sprint summary).
  - Updated `memory/CURRENT_STATE.md` and `memory/AI_HANDOFF.md` (this entry).
- **Key correction to prior session notes:** `0001_constraints_and_indexes.sql` was manually created outside drizzle-kit and therefore NOT in `meta/_journal.json`. Drizzle `migrate` skips files not in the journal. All 0001 content was merged into `0000_fair_silver_surfer.sql` before the first `npm run db:migrate` run. There is no 0001 file in the repo.
- **Next owner actions:**
  1. Run `npm run db:ingest` (from repo root, with Docker DB running) — populates 18 project drafts + site settings
  2. Uncomment `CONTENT_SOURCE=db` in `apps/web/.env.local`, run `npm run dev`, verify `/projects` still shows EmptyState (all drafts) and no errors
  3. Write `question` fields for 18 projects (6 featured first) in `content/site.ts` + flip `status: "published"` → `/projects` goes live
  4. Ratify D-041 (Render deploy vendor) → trigger first deploy
- **State:** `v0.7.0-alpha`. All DB sprint artifacts complete and synced.

### 2026-07-11 (DB sprint — all three phases) — docs/09 + Drizzle schema + migrations + ContentService

- **What I did:** Full docs/09 database sprint. D-043/D-044/D-045 ratified by owner with three binding conditions before Phase 2 began.
- **D-043 binding conditions honored:**
  - (1) CTI hidden behind `contentService` interface — `dbContent` returns typed `Project[]` etc., page components never see joins or Drizzle objects.
  - (2) LAW-003 CHECK (`ck_published_has_question`) in migration 0001 — only fires when `status = 'published'`; drafts with `question = ''` insert/update freely.
  - (3) `ck_no_self_relation` CHECK + `uq_relations_from_to_kind` UNIQUE both in migration 0001. Closed kind enum enforced at application boundary (types/content.ts RelationKind); extensions require a D-entry.
- **Phase 2 files:**
  - `apps/web/src/db/schema.ts` — 9-table Drizzle schema
  - `apps/web/src/db/migrations/0000_fair_silver_surfer.sql` — auto-generated (tables + FKs)
  - `apps/web/src/db/migrations/0001_constraints_and_indexes.sql` — binding conditions + 10 indexes
  - `apps/web/src/db/index.ts` — lazy-init DB client singleton
  - `apps/web/drizzle.config.ts` — drizzle-kit config
  - `docker-compose.dev.yml` (repo root) — pgvector/pgvector:pg17, optional
  - `.env.example` updated with `CONTENT_SOURCE` and `DATABASE_URL` docs
  - `apps/web/scripts/db-ingest.ts` — idempotent upsert of 18 projects + site settings
  - `apps/web/package.json` — `db:generate`, `db:migrate`, `db:ingest` scripts
  - Packages: `drizzle-orm pg` (prod), `drizzle-kit @types/pg tsx` (dev)
- **Phase 3 files:**
  - `apps/web/src/services/db-content.ts` — full ContentService via Drizzle (8 methods, 3 queries/collection, no N+1)
  - `apps/web/src/services/index.ts` — `CONTENT_SOURCE=db → dbContent`, else `localContent`
  - `projects/page.tsx` + `projects/[slug]/page.tsx` — import `contentService` from `@/services`
- **Verified:** `tsc --noEmit` zero errors; `npm run build` green: `/` = 152 kB, 7 static pages, three.js absent from all First Load JS. File mode works with no DB present.
- **Deferred tables** (future sprints): content_stages, content_versions, embeddings/pgvector, users/sessions, github_cache, gallery_items, search_vector GENERATED column.
- **Next owner actions:** write question fields for 18 projects, flip status to published; ASMOS real content (deploy gate); first Render deploy.

### 2026-07-11 (session 26) — Content corpus: 18 projects inserted as drafts

- **What I did:** Inserted all 18 owner-supplied projects into `content/site.ts` as `status: "draft"`. Zero projects are published — LAW-003 (`question` required) and the brief's explicit instruction. Draft gating verified end-to-end: `getProjects()` filters `published`, `generateStaticParams()` calls `getProjects()`, so zero detail routes are generated and `/projects` shows the honest EmptyState. Added newest-first sort (`publishedAt` descending) to both `getProjects()` and `getFeaturedProjects()` in `local-content.ts` (recency law — was missing before).
- **Field mapping decisions (documented, not silent):**
  - `brief.context` → `problem` — both are one-line project descriptions; same semantic role.
  - `brief.stack` → `tags[]` — `tags: string[]` is the existing home for tech labels in the Project type; no schema field for stack exists.
  - `question: ""` on all 18 — owner must write and set `status: "published"` per LAW-003.
  - `projectStatus: "archived"` default on all — owner can flip to `"active"` for live projects.
  - Dental AI date range (2025-10 → 2026-05): `publishedAt: "2026-05-01"` (end date per brief); range noted in `problem` field.
  - Repo URLs copied byte-identical (including `weaher_app` typo).
- **Featured flag**: already existed in the Project type (D-042). No additive extension needed; no D-entry. Docs/24 defines no featured visual treatment for the index — `ProjectCard` renders all published projects uniformly. Surfaced: a featured treatment (badge, larger card, or separate section) can be added in a future sprint.
- **Checklist update**: replaced generic P1/P2/P3 with a per-project list of all 18 — 6 featured first (with note "write these first — publishing the featured six makes /projects launch-ready"), then the remaining 12. Publishing flow documented.
- **Verified:** `typecheck` + `build` clean, zero warnings; `/` = 152 kB; three.js absent from all First Load JS; `/projects` = 166 B generating zero `[slug]` routes (all drafts); `features/hero-scene/` untouched. `v0.6.0-alpha` (no bump — content corpus session).

### 2026-07-11 (session 25) — Content fill: currentFocus · contact · outbound links · X + Instagram

- **What I did:** Inserted all owner-ratified copy into `content/site.ts` exactly as provided: `currentFocus` (phrase + `updatedAt: "2026-07-11"`), `contactSentence`, `contactEmail` (`csdeepak2005@gmail.com`), `outbound.github`, `outbound.linkedin`. `outbound.scholar` left `null` — owner confirmed no Scholar profile; verified it self-hides in both `evidence.tsx` and `footer.tsx` (graceful absence, LAW-008). Extended the `outbound` object additively with `x` and `instagram` (URLs provided by owner); wired both in `evidence.tsx` (trust-seeds nav) and `footer.tsx` with the same graceful-absence guard pattern. Marked checklist items 7, 8, 9 ✅ DONE.
- **Outbound-set decision (X + Instagram):** docs/14 and docs/24 define no closed/ratified outbound-platform set — docs/24 Part 10.C and Part 11.7 reference "outbound links" generically; the existing three fields (github/scholar/linkedin) were code convention, not a locked contract. Added `x` and `instagram` as a purely additive change. This is a content/data extension, not an architectural change — an AI_HANDOFF note is the right scope (no D-entry warranted).
- **R5 gate status (reported):** `currentFocus` is wired in `hero.tsx` only → renders on `/dev/hero` (dev-only, 404 in prod). The freshness stamp renders ≤30 days from `updatedAt`; phrase renders unconditionally when non-null. The V2 landing (`arrival.tsx`) does NOT render `currentFocus` — wiring it there is a future session task.
- **Verified:** `typecheck` + `build` clean, zero warnings; `/` = 152 kB (page 2.27 kB); three.js absent from First Load JS on `/`; `features/hero-scene/` untouched. `v0.6.0-alpha` (no bump — content-fill session).
- **Note:** Checklist heading + mission copy (items 3–6) remain owner-pending. The ASMOS real content (item 12) remains the deploy-blocking gate.

### 2026-07-11 (session 24) — Micro: hero copy ruling (literal string, owner-confirmed)

- **What I did:** Set `content/site.ts` `identitySupport` to the first-person ruling copy ("…what I build, but how I think, learn, and evolve.") and `identitySentence` to the literal ratified string **"Deepak learns and enjoy building intelligent systems.."** No component change (`arrival.tsx` untouched — it already single-sources both fields with self-hide guards).
- **Conflict surfaced + owner-ruled:** the ruling's prose ("switch to first person, remove duplicate name, moot subject-verb") contradicted its literal `identitySentence` string (third person, repeats "Deepak", "learns and enjoy", double period). I stopped and asked rather than guess; **owner explicitly chose the literal string as pasted.** Inserted exactly, per "insert EXACTLY."
- **docs/24 constraint check on the final copy (reported, not changed, per standing instruction):** `identitySentence` — present tense ✓ · length ✓ · banned vocabulary ✓; **flagged:** subject-verb "learns and enjoy" (→ "enjoys"), third-person voice vs docs/24 §18 first-person preference + LAW-002 (names Deepak in the first line), duplicate "Deepak" (eyebrow + `<h1>`), and a trailing double period ".."​. `identitySupport` — present tense ✓ · length ✓ · banned vocab ✓; first person, clean. All left exactly as ratified.
- **Verified:** `typecheck` + `build` clean, zero warnings; `/` 152 kB (page 2.27 kB); three.js absent from First Load JS; hero self-hide guards intact; `features/hero-scene/` untouched. `v0.6.0-alpha` (no bump).
- **Note for next session:** these hero copy flags are owner-ratified as-is — do not "fix" them without a new ruling.

### 2026-07-11 (session 23) — Micro: identity copy + single source of truth

- **What I did:** (1) Wired the Arrival `<h1>` to `siteContent.identitySentence` and **removed the hardcoded headline entirely** (`arrival.tsx`) — the earlier divergence (session 22 gotcha) is resolved; the component now holds no identity copy (single-writer law). Heading + supporting line each self-hide if their field is emptied (graceful absence). (2) Inserted owner-ratified copy into `content/site.ts`: `identitySentence` = "Deepak learns and enjoy building intelligent systems."; added a companion field **`identitySupport`** = "An adaptive mind working across agentic AI, memory, and software engineering — documenting not just what he builds, but how he thinks, learns, and evolves." (docs/24 names the hero "identity line" but assigns no supporting-line field, so `identitySupport` was added next to `identitySentence`). Rendered beneath the `<h1>` as a `text-reading` muted line. (3) Marked checklist items 1–2 ✅ DONE.
- **docs/24 constraint check (verified, not rewritten):** tense present ✓ · length ✓ · banned vocabulary ✓ — both lines pass the named constraints. **Reported (did NOT silently fix, per the brief):** (a) subject-verb agreement — "Deepak learns and enjoy" should read "enjoys"; (b) voice shift first→third person (docs/24 §18 prefers first-person where personal; and LAW-002 "identity discovered, never introduced" — naming Deepak in the very first line introduces identity up front); (c) minor redundancy — the eyebrow already prints `name` ("Deepak"), so "Deepak" now appears twice in the hero. All three left as-is for the owner to rule on.
- **Verified:** `typecheck` + `build` clean, zero warnings; `/` 152 kB (page 2.27 kB); **three.js absent from First Load JS**. `features/hero-scene/` untouched.
- **State:** `v0.6.0-alpha` (no bump — micro copy/wiring change). CURRENT_STATE follow-up about the hardcoded-`<h1>` divergence is now cleared.
- **Next (unchanged):** owner finishes `OWNER_CONTENT_CHECKLIST.md` (still open: `currentFocus`, mission confirm, `contactSentence`/`contactEmail`, outbound links, `cvUrl`, Arrival act sub-lines, per-project `question`s, and the real ASMOS memory) → clear `RELEASE_CHECKLIST.md` → ratify vendor (D-041) → first Render deploy.

### 2026-07-11 (session 22) — Launch-readiness sprint (release gates · deployment · /projects)

- **What I did:** Three phases to make Tier 0 deployable-on-content, all green (`typecheck` + `build`, zero warnings; three.js verified absent from First Load JS across `/`, `/projects`, `/projects/[slug]` via app-build-manifest cross-check).
  - **Phase 1 (release readiness):** Wrote `OWNER_CONTENT_CHECKLIST.md` + `RELEASE_CHECKLIST.md` at repo root (every owner field: file+line, purpose, docs/24 tone/tense/banned-vocab constraints, R4 protocol, guiding question; ASMOS `content/asmos.ts` draft is a hard deploy gate in both). Implemented **graceful-absence nav + footer** via one shared `BUILT_ROUTES` registry + `isRouteBuilt()` (`constants/routes.ts`) — nav (`nav-shell.tsx`) and footer (`footer.tsx`) filter through it; no dead code, no "coming soon". Verified release criteria (three.js absent from `/` First Load, `/` 152 kB, LCP = Arrival `<h1>`).
  - **Phase 2 (deployment):** Authored `docs/10-DEPLOYMENT.md` (house style) — **Render** primary (D-041, pending ratification) vs Railway vs Vercel+Neon, judged on the modular-monolith-with-workers future (D-007); domain/DNS, 2-env strategy, CI-verifies/PaaS-deploys split, caching, rollback, and the docs/09 DB addition path. Config: `render.yaml` (Blueprint; Postgres/worker/cron stubbed for later), `.github/workflows/ci.yml` (typecheck+build+**three.js guard**), `.env.example`, README "Deployment" with owner first-deploy steps. **No deploy run.**
  - **Phase 3 (/projects):** Built `/projects` index + `/projects/[slug]` detail in the `(site)` group. Index reads `localContent.getProjects()` → honest `EmptyState` at zero content. Detail carries the cognitive spine with graceful absence: question (LAW-003, always), abandoned branches (LAW-004, self-hides), evidence (Law 6 — `repoUrl` + relations filtered to built routes only). `export const dynamicParams = false` keeps it fully static (no server for Tier 0). Extended `Project` type additively: `question: string` (required) + `abandonedBranches?: AbandonedBranch[]`.
- **Two conflicts surfaced (owner ruled) — see D-042:** (A) brief's `/work` vs ratified `/projects` → **ship `/projects`, label "Work"** (D-021 upheld, no amendment; "/work" = the Work lane). (B) `Project` lacked LAW-004 abandoned-branches → **extend additively** (not migrate onto `Memory`); full Project↔Memory convergence **deferred to docs/09** as an explicit open question.
- **Why:** the sprint's job was launch enablement, not new surface area. Tier 0 is the sacred floor; the 3D hero/Twin/Dex are v1.5 (D-040) and `features/hero-scene/` was not touched (stays at `/dev/hero`, 404 in prod).
- **State:** `v0.6.0-alpha`. `/projects` built → Work lane + footer link auto-return; all other lanes still hidden (correct). CHANGELOG/VERSION/CURRENT_STATE/DECISIONS (D-040/041/042) synced.
- **Next:** Owner: fill `OWNER_CONTENT_CHECKLIST.md` → clear `RELEASE_CHECKLIST.md` → ratify vendor (D-041) → trigger first Render deploy. Engineering: next page sprints (Research/Publications, Posts, About/Timeline/Skills) each flip their `BUILT_ROUTES` entry on ship; docs/09 must resolve Project↔Memory convergence.
- **Gotchas:** the Arrival `<h1>` (`arrival.tsx:38-41`) is hardcoded and diverges from `site.ts.identitySentence` (which now only feeds `/dev/hero`) — flagged in the checklist; wire to one source or keep in sync. Adding a page = add its path to `BUILT_ROUTES` or its nav/footer link stays hidden. `render.yaml` `autoDeploy:false` until the owner's first manual deploy. The three.js guard in CI keys on manifest page `/(site)/page` — update if the route group changes.

### 2026-07-05 (session 21) — Personal OS Runtime architecture (docs only)

- **What I did:** Authored `docs/23-PERSONAL_OS_RUNTIME.md` (D-038): the runtime spine turning pages into a coordinated OS. **Overrode the brief's "communicate only through the Event Bus"** with a two-plane Kernel — Event Bus (pub/sub facts, choreography) + Capability Registry (typed request→response for queries/reads) — because synchronous reads through a fire-and-forget bus is an anti-pattern (correlation-IDs, races; violates PRD simplicity). Decoupling requirement still satisfied literally: modules import only kernel-owned contracts, never each other. Defined all ten runtimes (owned data/state, publishes/subscribes, exposes/consumes capabilities, degraded mode each), the event catalog, four end-to-end choreographies, the single-writer law, the data/state ownership map grounded in the actual stores, bulkhead failure recovery, open/closed extension, and — critically — an **incremental adoption plan (§11): target skeleton, NOT a rewrite.** Did NOT modify the Hero Runtime (reclassified as a client). Logged D-038; synced docs index/CHANGELOG/CURRENT_STATE. No code, no version bump.
- **Framing for future sessions:** this is the shape the product grows into; don't kernelize shipped code prematurely (one-maintainer constraint). New modules (Dex v1.5, News v2, Admin) are born OS-native; existing stores become runtime faces by rename. The kernel earns itself when a module has its second consumer.
- **State:** Architecture stack now 11→23 complete. Code unchanged at `v0.4.0-alpha`.
- **Next:** unchanged options — owner gates (photos/budget/content pass), or H-02 in-engine blockout, or the practical page track (Projects sprint), or begin the OS kernel's first concrete step (contracts package + tiny EventBus routing the already-shipped reduced-motion/theme signals — the low-risk §11 step 1).

### 2026-07-05 (session 20) — Sprint H-01: Hero Runtime Foundation (code)

- **What I did:** Implemented `features/hero-scene/` per docs/22 with primitive stand-ins (D-037): shared core (constants/types/refs/zustand hero-store with shed/restore), tier gate (`gate.ts` — RM, save-data, deviceMemory, WebGL2 probe with `failIfMajorPerformanceCaveat`), scroll+pointer bridges (refs, never React state), CameraRail (CatmullRom over 5 act stations, exp damping ≤150ms, RM station-snap, focus-overrides-aim, parallax Tier-2-only, up locked +Y), PerfGovernor (60-frame sampling, DPR steps to 0.75 min, then shed order, 5s-sustained recovery), AnchorProjector (rest-point-only projections), SceneOverlay+FocusProxies (DOM buttons from anchors, Esc yields), SceneErrorBoundary + ContextLossGuard (one restore attempt), asset manifest (null entries = stand-ins render) + loader path contracts, objects (Atmosphere+LightRig reading CSS tokens via useCssColor/MutationObserver, GraphPlaceholder = 1 InstancedMesh + 1 merged lineSegments with instanceId hover, TwinPlaceholder capsule+bench+dock inside an inert-but-fixed Suspense seam, DexPlaceholder breath 2.4s + only small caster, ParticlesPlaceholder renders nothing + typed emitter API), dev-controls (Leva, NODE_ENV-stripped), `/dev/hero` route (notFound in prod). Deps: three 0.185 / fiber 9.6 / drei 10.7 / leva 0.10. Fixed the stray-lockfile workspace warning via `outputFileTracingRoot`. Build+typecheck clean, zero warnings. Bumped v0.4.0-alpha; synced CHANGELOG/VERSION/CURRENT_STATE.
- **Key proof:** three.js is in a lazy chunk — absent from every route's First Load JS; the landing is untouched.
- **Gotchas for next session:** run `/dev/hero` in dev only; drei is installed but barely used yet (deliberate — subset discipline); the rail's station numbers are placeholder cinematography (expect to retune with look-dev); `pointer-events` layering — Tier-0 children get `pointer-events-none` wrapper with links/buttons re-enabled, canvas receives hover through it; anchors only update at rail rest (mid-scroll proxies are stale by design).
- **Next:** H-02 recommendation — in-engine gate #2 blockout: retune rail stations against the scroll bible acts, add GSAP one-shot seam (birth/glance stubs), Act-caption wiring, and the frameloop='demand' RM render test. Or pivot to the practical track (content pass / Projects sprint) — owner's call.

### 2026-07-05 (session 19) — Hero Runtime Architecture (engine ratified)

- **What I did:** Authored `docs/22-HERO_RUNTIME_ARCHITECTURE.md` (architecture only, no code) and ratified the engine: **React Three Fiber** + drei subset + GSAP-inside-the-scene-chunk (D-036 — closes the docs/06 engine queue item; docs/06 updated with the ratification table). Load-bearing principle: the scene is an enhancement layer over an always-complete DOM page — the tier ladder IS the error architecture ("the ceiling disappears, the room remains"). Contracts: tier gate before any 3D import; three state domains (continuous=refs/useFrame, discrete=Zustand hero slice, content=server props); rail LUT sampled from `cam_rail.glb` driven by native scroll with acts as derived thresholds; one-property-one-owner motion split (GSAP=in-canvas one-shots, Motion=DOM, rail=camera); instanced graph targeting 2 draw calls; progressive Twin LOD (never swap while observed); PerfGovernor (pause off-viewport/hidden, DPR-first, then bible shedding order); FocusProxies at rail rest-points; RM=stations+unmounted ambients; explicit disposal; v1.5 Dex body/mind seam.
- **State:** Hero paper trail complete 17→22. Engineering unblocked: bench/rail assets + the runtime scaffold need no owner inputs. Twin remains photo-gated; budget sizing still open. Version `v0.3.0-alpha`.
- **Next:** either (a) hero implementation sprint — scaffold `features/hero-scene/` per §2-3 with primitive stand-ins (gate #2 blockout in-engine), or (b) the practical track (content pass, Projects sprint, docs/09). Owner's call.
- **Gotchas:** R3F/three/drei/GSAP are NOT yet installed — the ratification is on paper; install lands with the implementation sprint. Bundle budget ≤350KB gz for the whole scene chunk; assert it.

### 2026-07-05 (session 18) — Blender Production Pipeline

- **What I did:** Authored `docs/21-HERO_BLENDER_PIPELINE.md` as Lead Technical Artist. Core ruling: **the .blend is not the scene** — Blender authors only Twin + bench set + camera rail; nodes/edges/Dex/atmosphere/lights/signature-shaders are runtime (data-driven per the bible). Locked: collection=export-unit structure, naming convention with lint rules, 23-deform-bone rig (seated rest pose, no facial bones, deform-only export), 5 clips returning to base pose, camera rail keyed 0–100 = scroll% with named framing markers, LOD chain (60k/25k/8k + hand-modeled silhouettes), texture pipeline (bake→PNG masters→CLI KTX2, ≤8MB), export chain (glTF→gltf-transform Draco 14-10-12→validator zero-errors), per-GLB ship-size targets, QC checklist, future-expansion grammar (dock artifacts, Twin resculpt rig-compatible). Logged D-035; synced index/CHANGELOG/CURRENT_STATE.
- **Production start order (deliberate):** lib → bench set (proves pipeline cheap) → cam rail (unblocks gate #2 with primitives) → Twin blockout → gates → Twin production. The Twin is last: most expensive, and the only asset gated on the owner's reference photos.
- **State:** An artist can start today on bench + rail. Hero paper trail complete: 17→18→19→20→21. Version `v0.3.0-alpha`.
- **Next:** unchanged owner gates (photos, budget, engine) — but gate #2 blockout is now startable without any of them.

### 2026-07-05 (session 17) — Hero Moodboard Specification

- **What I did:** Authored `docs/20-HERO_MOODBOARD.md` — the look-dev contract for the Drafted Laboratory: 16-tile reference photography list; uber-material family with roughness numbers (Twin = warm ceramic 0.8, no edge pass; vellum = only translucency); lighting rig in Kelvin (key 4300K + time-of-day 5000→3600K, task pool 3200K +1 stop, hairlight ≤15%); 35mm lens spec; the governed trio — atmospheric-first depth, **bloom banned** (in-shader falloff), **reflections functionally absent** (roughness floor 0.6); ≥55% negative-space law; DOM typography with drawn leader-line annotations; licensed micro-detail set (ink-wet live-line, graphite dust, bench chamfer) with grime/grain/CA banned; 8-point acceptance checklist incl. grayscale test and the tile-16 Tier-0 continuity test. Logged D-034; synced index/CHANGELOG.
- **Note for artists:** brief asked for Glass/Bloom/Reflections specs — all three are *governed absences* under standing law; the doc specifies what replaces each rather than pretending they're open questions.
- **State:** Look-dev fully contracted. Hero paper trail: 17 → 18 → 19 → 20. Version `v0.3.0-alpha`.
- **Next (unchanged, all owner-gated):** reference photos → gate #1 frames judged against the §Acceptance checklist · asset budget · engine ratification · content pass.

### 2026-07-05 (session 16) — Hero Art Direction (eight directions → hybrid)

- **What I did:** Authored `docs/19-HERO_ART_DIRECTION.md` as Art Director: eight radically distinct directions (Keynote Dawn / Sculptor's Study / Playful Instrument / Vast Archive / White Archive / Neural Observatory / Drafting Space / Warm Lab), each with all 11 requested attributes; ranked all eight honestly against the constitution (C collides with four laws; E is the museum anti-pattern verbatim; D's loneliness contradicts the invitation beat); recommended G (Drafting Space); ratified the mandated hybrid **"The Drafted Laboratory"** (G×H) as D-033. Bible cross-annotated with its five amendments; synced index/CHANGELOG/CURRENT_STATE.
- **The hybrid in one line:** H's warm lab, whose bones are G's drawings — solids remember being drawn; new content is inked into existence; the accent means "the live line"; the Twin alone is never a diagram.
- **Decisive argument:** tier continuity — the shipped Tier-0 2D motif becomes the same world at its drawing layer; one art direction, honest at every fidelity. No other pairing achieves this.
- **Guards:** ≥80% of the scene fully solid at rest (drawing states are events); construction lines at hairline opacity, brightening only under attention.
- **State:** Art direction closed. Gate #1 packet defined (5 frames). Version `v0.3.0-alpha`.
- **Next:** owner's reference photos + asset budget → commission gate #1 frames in this direction; engine ratification into docs/06.

### 2026-07-05 (session 15) — Hero Scene Bible

- **What I did:** Authored `docs/18-HERO_SCENE_BIBLE.md` — the creative deepening of docs/17: one-idea north star + assumptions-challenged table; deepened scene hierarchy (recency-as-proximity thesis); object bible; full Twin chapter (facial style, hair, materials, eyes, clothing, pose, idle, expression, framing, LOD, fallbacks) as a *style system* with a likeness gate; Dex bible (habitat, sleep/wake, introduction, withdrawal, citation-trail illumination); knowledge-graph bible (luminance logic, growth-on-publish, aggregation at 150 nodes); camera bible (five named shots, no idle drift ever); lighting bible (+separation hairlight, +time-of-day — refinements to 17); particle bible (4 data-event types, taxonomy closed); motion bible; scroll bible in 5% steps; performance/accessibility/asset bibles; Hero v2/v3. Logged D-032; cross-referenced 17; synced index/CHANGELOG/CURRENT_STATE.
- **Critical flag:** the brief referenced "uploaded images" of Deepak — **none exist in this repo or conversation.** The Twin is designed as a style system; likeness calibration is gate #1 and needs the owner's reference photos. Silhouette ships if references never arrive — nothing blocks.
- **Refinements to 17 (named, logged):** separation hairlight (capped, functional — dramatic rim still banned); visitor-local time-of-day key lighting (Full tier only); particles-as-information taxonomy.
- **Cut-order under scope pressure (use it, don't debate it):** time-of-day → acknowledging glance → commit pulses → separation light.
- **State:** Creative direction complete; production blocked only on owner inputs (reference photos, asset budget) + engine ratification. Version `v0.3.0-alpha`.
- **Next:** gate #1 (needs photos) · engine choice into docs/06 · content pass · docs/09.

### 2026-07-05 (session 14) — Hero Scene Architecture (owner supersession)

- **What happened:** The hero brief demanded a 3D portrait, conflicting with D-020/D-026/D-027. I stopped and surfaced the conflict per governance; **the owner ruled to supersede.** Logged D-030 (supersession, risks on the record, scope limits: stylized-only, hero-only; photoreal/AI-imagery bans survive) and D-031 (scene architecture). Authored `docs/17-HERO_SCENE_ARCHITECTURE.md`: scene hierarchy, object hierarchy (Twin style mandate = the uncanny firewall), camera system (scroll-scrubbed rail, no hijack, no roll), lighting, interaction model (focus proxies give keyboard users a guided camera), five-act scroll timeline, animation caps, hard performance budgets, asset pipeline with two sign-off gates, three-tier fallback ladder. Amended `specs/landing.md` → v1.2; annotated D-016/D-020/D-026/D-027 statuses; synced docs index, CHANGELOG, CURRENT_STATE.
- **Critical framing for future sessions:** the shipped Sprint 1 hero is **Tier 0 fallback, retained verbatim** — do not delete or "clean up" the typographic hero; it is the no-3D-bytes path (RM/save-data/low-power) and can deploy before the scene exists. Vocabulary: **Twin = 3D figure of Deepak; Dex = the AI** — never conflate.
- **State:** Scene architecture approved at document level. No engine chosen, no scene code, no assets. Version `v0.3.0-alpha`.
- **Next:** owner sizes asset budget + concept gate #1; engine ratification into docs/06; content pass feeds page and scene alike.
- **Open questions:** engine choice; Twin art direction (gate #1); asset budget; the standing trio (Dex name veto, monogram, accent hue).

### 2026-07-05 (session 13) — Sprint 1: Landing Page Implementation

- **What I did:** Implemented the landing per `specs/landing.md` v1.1: Hero (CSS-only entrance; graph motif under R2 guardrails — 9 asymmetric nodes, Motion pathLength draw-in, once-per-session, reduced-motion pre-drawn; R5 stamp rule), FeaturedWork, ResearchHighlight, CurrentFocus (no animation — data is still), LatestPosts, ContactStrip (R3 resolution beat), real Footer (sitemap-of-record + build-date stamp). Added CopyButton, ThemeToggle, `animate-entrance` CSS utility, `content/site.ts` (typed content with TODO(copy) markers, empty collections), `local-content.ts` ContentService impl, 404 page. Nav got the theme toggle. Logged D-029; bumped v0.3.0-alpha; synced CHANGELOG/VERSION/CURRENT_STATE/FEATURE_STATUS.
- **Conflicts resolved by law, not invention:** brief's 13 sections → ratified 8 (D-022); "3D placeholder architecture" → refused, graph motif per D-020/D-026; "smooth scroll cue" → chevron stays cut (R1); "animated headline" → one block settle (no per-word).
- **Key patterns (D-029):** CSS-first LCP; Motion pathLength over GSAP for the motif (JS budget); data-driven graceful absence (empty sections self-hide); build-date = honest freshness stamp.
- **State:** Landing built, static, 150 kB first-load; **release-gated** on real content + R4 + R2 tests. Version `v0.3.0-alpha`.
- **Next:** Owner fills `content/site.ts` TODO(copy) fields; hallway test the motif; then Projects sprint (brings shared-element transitions) or docs/09 (real content layer).
- **Gotchas:** content lives in `apps/web/content/site.ts` (relative imports from features — path alias only covers `src/`); sections render nothing until content exists — an "empty-looking" landing in dev is correct behavior, not a bug; footer build stamp = build date (rebuild = re-stamp).

### 2026-07-05 (session 12) — Sprint 0: Frontend Foundation (first code)

- **What I did:** Ratified the frontend stack in `docs/06` (D-028) and built the foundation: npm-workspaces monorepo root + `apps/web` (Next.js 15 App Router, TS strict, Tailwind v4). Tokens from docs/15 as `@theme` in `src/styles/globals.css` (three tiers; provisional graphite ramp + accent hex in tier-1 only). Layout (Container/Section/Grid, nav/footer shells), motion recipes (`src/animations/` — docs/08 as code, global reduced-motion via MotionConfig), UI primitives (Radix Dialog/Tooltip + CVA; one overlay contract; Portrait not Avatar), content variants (ProjectCard/PublicationRow/PostRow/Timeline/Prose), content types + interface-only ContentService, ⌘K palette wiring (placeholder), Dex boundary (renders nothing — graceful absence). ESLint 9 flat config. **Build verified clean** (compile+lint+typecheck+SSG). Updated docs/06, VERSION (v0.2.0-alpha), CHANGELOG (0.2.0-alpha cut), ROADMAP, CURRENT_STATE.
- **Key calls:** Provisional color values minted to make tokens functional — flagged for design sign-off, one-file retune (D-028); Avatar→Portrait per D-025; NewsRow not scaffolded (v2 — no stubs); GSAP behind a lazy loader so the reading path never pays; Zustand holds overlay state only (one-overlay-at-a-time rule enforced in the store).
- **State:** Code exists; Sprint 1 unblocked. Version `v0.2.0-alpha`.
- **Next:** Sprint 1 landing per specs/landing.md v1.1; docs/09 + content service implementation; docs/07 against this codebase.
- **Gotchas for next session:** run commands from repo root (workspaces); Tailwind v4 — tokens in CSS `@theme`, NOT a tailwind.config; semantic utilities only (`bg-canvas`, `text-ink`, `z-(--z-nav)`); `motion/react` import (not framer-motion); typecheck via `npm run typecheck`.

### 2026-07-05 (session 11) — Landing Page Design Review

- **What I did:** Conducted an adversarial design review of `specs/landing.md` as `docs/16-LANDING_REVIEW.md` (16-category scorecard, deep per-section review with Apple/Linear/Anthropic keep-tests, hero/motion/AI/performance/a11y/originality reviews, risk analysis). Verdict: **Approved with Changes, 84/100**. Applied amendments R1–R6 to the spec (now v1.1). Logged D-027. Synced docs index, FEATURE_STATUS, CHANGELOG.
- **Why:** The spec establishes the whole product's design language; it needed hostile review before hi-fi, not validation.
- **Key findings:** C1 — the graph motif is one art-direction failure from the particles.js cliché → guardrails + hallway-test kill criterion with typographic fallback pre-approved; C2 — v1.0 ships without its S6 climax, unchoreographed → S7 absorbs the resolution, footer stamp = v1.0's quiet reveal; the spec's own chevron contradicted its own peek argument → cut; hero staleness failure mode was undefined → ≤30d stamp rule; identity sentence had no test → 10-second + read-aloud release gates. Rejected: Contact-in-nav, CV demotion, S3 motif removal (on notice instead).
- **State:** Landing spec v1.1, review-approved, build-ready pending stack. Version = `v0.1.0-alpha`.
- **Next:** Phase 4 tech-stack ratification remains the sole blocker for build; hallway test scheduled early in hi-fi; review's priority list = build order.
- **Open questions:** unchanged (Dex name, monogram, accent hue — due at ratification).

### 2026-07-05 (session 10) — Sprint 1: Landing Page Master Specification

- **What I did:** Authored `specs/landing.md` — the first fleshed-out feature spec: brief reconciliation (13→8 sections per D-022/D-023; 3D portrait rejected per D-020; cursor effects rejected per D-016), landing IA + storyboard (8-beat narrative arc), deep section specs S1–S8 (hero fully detailed: opening experience, headline philosophy, graph-motif concept, CTAs, keyboard, transitions), scroll choreography table, motion strategy with per-technique justifications + a numeric motion budget, content strategy (source + messaging intent per section), independent mobile design, a11y checklist, perf budget, implementation notes, future evolution. Logged D-026. Updated specs index, FEATURE_STATUS (Landing → Specified), CURRENT_STATE, CHANGELOG.
- **Why:** Sprint 1; the landing establishes the interaction/motion/layout language every page inherits, so it is specified deepest and first.
- **Key calls:** Hero = typographic + **drawn graph motif** (the content graph abstracted — product thesis, brand atom, and hero visual unified) instead of any portrait; 85vh hero with next-section peek as the honest scroll cue; left-anchored hero (document, not poster); XA's optional ambient field declined; motion budget = 2 draw-ins + 1 breath-deepen, hard cap; claims in S1 only, S2–S6 evidence only; typographic cards v1; no client fetch above S6.
- **State:** Landing = Specified (first feature). All docs 01–15 + this spec complete. Version = `v0.1.0-alpha`.
- **Next:** Phase 4 tech-stack ratification unblocks build; graph-motif design is the sprint's craft task; remaining P0 specs follow this spec's format.
- **Open questions:** "Dex" name veto (now four docs); monogram; accent hue — all due at stack ratification.

### 2026-07-05 (session 9) — Design Token System & Component Architecture

- **What I did:** Authored `docs/15-DESIGN_TOKENS.md`: naming convention (dot-notation, framework-agnostic); all foundation tokens with concrete non-color values (spacing/sizing/containers/grid/breakpoints/radius/elevation/borders/blur/opacity/z-bands/type scale/icons/motion/delays/focus/a11y); three-tier color architecture with semantic groups (hex deferred to stack); 16 motion recipes with reduced-motion equivalents; layering contracts; component architecture for 24 families with universal contracts and composition hierarchy; governance model (closed sets, additions ledger, deprecation policy, review heuristics). Logged D-025. Synced index, ROADMAP, CURRENT_STATE, CHANGELOG.
- **Why:** DSVL's deferred token item needed a formal home before engineering; component contracts needed defining before `07` and implementation.
- **Key calls:** Per-domain color groups (Research/News/Analytics/Admin) rejected per D-018 — density/iconography differentiate, never hue; `ai.presence` aliases the accent (dot = accent = brand equity); no `color.secondary` (aliasing over multiplication); Avatar family rejected → `Portrait` (D-019); one overlay contract for all modal surfaces; Cards+Rows are the only two content-display families; z reserved band kept for the brief's AR layer with recorded skepticism.
- **State:** Design system infrastructure complete. Only hex values + type-family confirmation remain, gated on Phase 4. Version = `v0.1.0-alpha`.
- **Next:** Phase 4 — tech-stack ratification (`docs/06`): framework, LLM/embedding models, vendors, token format, **hex ratification**; then `07` (inherits `15` §6–7), `09`, `10`, P0 specs.
- **Open questions:** "Dex" name veto (pending, three docs now reference it); monogram "dL" vs "D."; accent hue value; stack picks.

### 2026-07-05 (session 8) — Brand Identity & Visual DNA

- **What I did:** Authored `docs/14-BRAND_IDENTITY.md` (14 sections: brand narrative, personality dials, visual DNA, typography identity, motion personality, logo direction, icon language, photography direction, illustration charter, Dex brand sheet, brand voice + banned vocabulary, design vocabulary, brand anti-patterns, 5–10yr evolution policy; appendix mapping what's ruled elsewhere vs new). Logged D-024. Synced docs index, ROADMAP, CURRENT_STATE, CHANGELOG.
- **Why:** The identity layer above the DSVL needed articulation before logo execution, copywriting, and hi-fi design; prior docs are immutable, so this builds on rather than replaces.
- **Key calls:** Rejected the brief's navigation renaming ("Journey" etc.) — vocabulary rule: plain places, coined inventions (D-024); wordmark-first + dL monogram, dot reserved for Dex; drawn SVG line = the *entire* illustration range; motion temperament = mechanical, with Dex's breathing as the only living element (dilution barred); no generative/AI imagery anywhere; brand evolution rides major versions with the 2026→2031 recognition test.
- **State:** All design + brand documentation complete. Version = `v0.1.0-alpha`.
- **Next:** Phase 4 — tech-stack ratification (`docs/06`) + token spec; then `07`, `09`, `10`, P0 specs; logo execution per `14` §6 whenever design capacity exists.
- **Open questions:** "Dex" name veto (still pending, now referenced by two docs — decide before implementation); monogram choice ("dL" vs "D."); exact accent hue.

### 2026-07-05 (session 7) — Master Wireframe Specification

- **What I did:** Authored `docs/13-WIREFRAME_SPEC.md`: 5 screen archetypes; structural specs for ~26 screens (public, admin, overlays, errors) with ASCII layouts for anchors (Landing, Project Detail, /ai centerpiece, Palette, Admin Dashboard, Admin Editor); layout/component/interaction inventories; responsive blueprint; cross-cutting loading/empty/error states; implementation notes for hi-fi design. Logged D-023. Updated docs index, ROADMAP (Phase 3 complete), CURRENT_STATE, CHANGELOG.
- **Why:** Final Phase 3 artifact — hi-fi design and implementation need screen-level structure with zero assumptions.
- **Key calls:** Brief's 12-section landing reconciled onto D-022's 8 (mapping table, nothing lost); archetype system over per-screen essays; closed sticky-region list; no sticky TOC on posts; load-more over infinite scroll (footer reachability); admin mobile = triage-grade deliberately; alt-text required at media-library level; full content export in admin settings (own-your-data insurance); /ai context panel fed by retrieval-graph traversal; reserved future slots marked (voice, history, series, demo embeds).
- **State:** Phase 3 complete. All design documentation done. Version = `v0.1.0-alpha`.
- **Next:** Phase 4 — ratify tech stack (`docs/06`) + token spec; then `07`, `09`, `10`, P0 specs; hi-fi starts with the four grammar-setters.
- **Open questions:** "Dex" name veto still pending; exact accent hue; stack/vendor picks — all Phase 4.

### 2026-07-05 (session 6) — Information Architecture & UX Blueprint

- **What I did:** Authored `docs/04-INFORMATION_ARCHITECTURE.md` in full: sitemap/route map, content model + closed relation taxonomy, navigation architecture (4-lane bar, lane-tabs, footer-as-sitemap, palette sources, keyboard grammar), shared page grammar + hierarchies, per-page blueprints for ~20 surfaces (goals/questions/priority/CTA/sections/scroll/a11y/responsive/perf), 9 user flows, search architecture (1 index, 4 skins), Dex placement strategy, empty states, error states, mobile-intentional design, future scalability. Logged D-021, D-022.
- **Why:** The XA obligated `docs/04` to make the graph concrete; wireframes need a structural blueprint detailed enough to build from.
- **Key calls:** `/search` page as the palette's visible twin (palette never sole path); 4 nav lanes with everything else via lane-tabs/footer/palette; landing cut to 8 sections — Mission merged into hero, News preview deferred to v2 (D-022); priority-order = DOM order = mobile order as a binding law; semantic search *is* Dex (no duplicate UI); relation taxonomy is a closed set of 6 kinds (D-021).
- **State:** IA complete; wireframes are the remaining Phase 3 artifact; Version = `v0.1.0-alpha`.
- **Next:** Wireframes (start: Landing, Project detail, Post detail, Admin editor — the four grammars); then tech-stack ratification + token spec; `09` imports the entity/relation model.
- **Open questions:** none structural; visual questions belong to wireframes; "Dex" name veto still pending with owner.

### 2026-07-05 (session 5) — Design System & Visual Language (DSVL)

- **What I did:** Authored `docs/03-DESIGN_LANGUAGE.md` in full (15 sections: brand identity, typography, color philosophy, layout, component language, iconography, glass call, motion tokens, 3D charter, photography, data viz, accessibility, responsive behavior, 25 design laws, 15 anti-patterns). Ratified `docs/08-ANIMATION_GUIDELINES.md` (tokens, context rules, Dex motion, reduced-motion parity mapping, performance rules). Logged D-018…D-020. Synced memory + roadmap + changelog.
- **Why:** XA obligations (quiet confidence, Twin identity, glass call, contrast targets) were owed to `docs/03`; motion tokens made ratifying `docs/08` in the same pass natural, completing most of Phase 2.
- **Key calls:** "Graphite & Paper" + exactly one accent (D-018); **Twin named Dex, embodied as a breathing presence dot — no face ever** (D-019); glass on two surfaces only, liquid glass permanently dead, 3D dormant charter, no synthetic likenesses (D-020); Inter + JetBrains Mono only (serif considered, rejected); light default with first-class dark.
- **Deliberately deferred:** exact token values (hex ramp, px sizes, shadow recipe, icon library, syntax/data-viz hue sets) → ratified with the tech stack; `docs/07` component *engineering* conventions → tech-stack phase.
- **State:** Phase 2 essentially complete; Version = `v0.1.0-alpha`.
- **Next:** `docs/04-INFORMATION_ARCHITECTURE.md` (routes, content model, relation taxonomy, palette sources) → wireframes → tech-stack ratification + token spec.
- **Open questions:** Owner veto pending on the name "Dex"; exact accent hue value; concrete stack.

### 2026-07-05 (session 4) — Experience Architecture (XA)

- **What I did:** Authored `docs/12-EXPERIENCE_ARCHITECTURE.md` (experience vision, 7-stage visitor journey, per-page purposes for all 14 surfaces + admin, navigation philosophy, motion philosophy, 15 animation-technique verdicts, full Digital Twin experience design, emotional journey, information flow, 10 interaction principles, accessibility strategy, risks, future ideas, downstream-obligations appendix). Logged D-015…D-017. Added binding-note headers to `docs/03` and `docs/08`. Updated docs index, CURRENT_STATE, ROADMAP, CHANGELOG.
- **Why:** Complete experience definition must precede visual design and wireframes; the XA now binds `docs/03`, `04`, and `08`.
- **Key calls:** Twin represents-never-impersonates, speaks as itself with citations (D-015); calm-premium motion doctrine — rejected 3D/liquid-glass/cursor-effects/magnetic/horizontal-scroll, invested in shared-element + SVG + micro-interactions (D-016); persistent slim nav + Cmd/K palette + contextual graph as primary navigation (D-017); v1.0 designed complete with graceful Twin absence.
- **State:** XA approved at document level; Phase 2 (Design System) in progress; Version = `v0.1.0-alpha`.
- **Next:** `docs/03-DESIGN_LANGUAGE.md` (visual system, Twin name/identity, glass call, contrast targets) → `docs/08` → `docs/04`.
- **Open questions:** Twin's name; light/dark strategy; typography; concrete tech stack — all owned by upcoming phases.

### 2026-07-05 (session 3) — System Architecture

- **What I did:** Authored `docs/11-SYSTEM_ARCHITECTURE.md` (20 sections, trade-off analysis, Markdown diagrams, 3 appendices). Logged decisions D-007…D-014. Rewrote `memory/ARCHITECTURE.md` from "undecided" to the decided architecture. Reframed `docs/06-TECH_STACK.md` as awaiting ratification. Updated docs index, CURRENT_STATE, CHANGELOG.
- **Why:** Product (PRD) was defined; the system needed a decided, documented architecture before design/IA and before any implementation.
- **Key calls:** Modular monolith (no microservices); PostgreSQL as single datastore incl. `pgvector` + FTS; AI = RAG with retrieval-gated domain restriction; GitHub cached (not live); Postgres FTS first; managed PaaS; object storage + CDN; single admin auth with dormant RBAC.
- **Reversibility stance:** Locked the data layer now (expensive to reverse); deferred framework + hosting *vendor* picks to `docs/06` (cheap to reverse behind interfaces).
- **State:** Architecture approved at document level; Version = `v0.1.0-alpha`.
- **Next:** Design System → Information Architecture → ratify concrete tech stack (`docs/06`) → drill-down DB/deployment docs.
- **Open questions:** Framework/language, LLM & embedding models, and specific vendors are intentionally deferred to `docs/06` (Appendix B of `docs/11`).

### 2026-07-05 (session 2) — Product Definition (PRD)

- **What I did:** Authored the full PRD in `docs/02-PRODUCT.md` (18 sections + strategic assessment + feature-disposition appendix). Filled `docs/01-VISION.md` from it. Prioritized the feature catalog in `docs/05-FEATURES.md` into P0/P1/P2 tiers. Logged product decisions D-004–D-006. Updated ROADMAP, CHANGELOG, CURRENT_STATE, FEATURE_STATUS.
- **Why:** Product must be fully defined before design/development; the PRD is now the single source of truth for scope.
- **Key strategic calls:** AI Assistant → v1.5 (needs corpus first); News → v2.0 rescoped as "Radar" (recurring-obligation risk); Posts = publishing, not social; added search/RSS/SEO/CV-download/analytics as P0.
- **State:** Phase = Product Definition complete; Version = `v0.1.0-alpha`.
- **Next:** Design System → Information Architecture → P0 spec drafting.
- **Open questions:** Design language, IA details, tech stack — all still `TBD` by design.

### 2026-07-05 — Repository Initialization

- **What I did:** Initialized the repository: directory structure, root documentation, `docs/` templates, `memory/` context system, `specs/` templates, and `prompts/` folders. No application code.
- **Why:** To establish a durable, self-documenting foundation before any implementation, per the initialization brief.
- **State:** Phase = Repository Initialization; Version = `v0.1.0-alpha`.
- **Next:** Product Ideation, then Design System, then Wireframes.
- **Open questions:** Product scope, audience, tech stack, and design language are all undecided (`TBD`).

---

_Add new sessions above this line, most recent first._
