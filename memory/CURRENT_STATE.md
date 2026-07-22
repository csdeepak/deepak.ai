# Current State

> Keep this file current. Update it after every significant piece of work.

**Last updated:** 2026-07-22

## Current Phase

**D-052.6 COMPLETE (no commit) on `feat/instrument-redesign`** — real node size + camera flight through the graph.
- **Phase 1 (root cause, browser evidence):** the sub-3px pinpoints were `gl.POINTS` **driver size-cap** (ANGLE/D3D on Windows), not the geometry — the D-052.5 shader had a 14px floor so the shrink is downstream in the GPU. Confirmed via a real Playwright WebGL probe (headless SwiftShader reports `[1,1023]`, would render large → the fault is the owner's hardware point path).
- **Phase 2 (instanced billboards):** all layers re-authored as camera-facing **world-sized quads** (no `gl_PointSize`) → no cap + real parallax. Core radius 0.5 (bright body). **Browser-MEASURED** (Playwright, 1440×900 dpr2): at the settled camera **project ≈43px, skill ≈24, ambient ≈10** (targets 34-48/20-28/9-14); close passes 60–108px.
- **Phase 3 (camera flight):** scroll-driven `CatmullRomCurve3` (off 0.60→1.0) flies **through** the field; control points **derived from graph data** (depth-band centroids, weave, node-avoid). smootherstep speed, look-ahead + slerp 0.08, fog tracks camera. Proximity (≤0.14) brightens project/skill +40% and fades in a **DOM label** from the node name — **max 3, nearest**, projected from 3D.
- **Tooling:** Playwright/Chromium installed locally for measurement, **reverted from tracked package files** (not committed).
- **Scope:** no committed deps, no JSON/data-model/nav/DB/copy change. Budgets unchanged (`/` 150.7 kB; lazy 3D 253.5 kB gz). Click/nav/panels = next sprint. Final in-browser aesthetic pass = owner sign-off.
- **Owner action:** review in-browser, commit, then `git tag stable-glow-hero-v2 && git push origin stable-glow-hero-v2` (moving the tag — see git block in the report).

**D-052.5 COMPLETE (no commit) on `feat/instrument-redesign`** — bulb nodes made legible. After D-052.4, nodes were effectively invisible (hero read as bare wireframe) because a blanket 4–8 px cap + 0.90 density guard erased them. Retuned node rendering only:
- **Per-layer size ranges** (replaces the 4–8 px cap): project **14–20 px**, skill **10–14 px**, ambient **6–10 px** at the resting Beat-3 camera — non-overlapping, hierarchy readable at a glance. Verified analytically vs. real geometry + camera rail at t=0.65/0.80/0.95 (`BULB_SIZE 1.05→3.8`, per-layer `uMinPx/uMaxPx`).
- **Higher cores + readable halos** (project 2.4/0.35, skill 1.7/0.28, ambient 1.0/0.20; core mask 0.28→0.34) → each reads as a lit bulb.
- **Layered saturation** (project 1.0, skill 0.85, ambient 0.62) → ambient recedes as atmosphere.
- **Density guard relaxed 0.90 → 0.95**; edges unchanged (0.14); copy legibility protected by existing right-shift + faded-headline + scrim.
- Scope: node rendering only. Budgets unchanged. Live in-browser look = owner sign-off (no browser in build env). D-052.5 logged.

**D-052.4 COMPLETE (committed `36775ff`, tagged `stable-glow-hero-v2`) on `feat/instrument-redesign`** — node glow reads as a colour constellation + edge pulses fire on a cadence.

**What landed in D-052.4 (2026-07-22):**
- **Honest finding first (LAW-008):** the owner's "flat grey dots / static wireframe" screenshot was **not** a code strip. Git proves HEAD (D-052.3) added the bulb shader; tree clean; shader + pulses + correct cross-fade all present. The real cause: **267 of 280 inner nodes (95 %) are the ambient layer, which was hard-coded a single cool grey** — so the network was dominated by grey dots and the 13 coloured bulbs were lost. Pulses ran continuously (cadence constants unused). Cross-fade was already correct.
- **FIX 1 — per-node gradient colour:** every node biased along `--grad-1→2→3` by its position (projected onto the ~10° accent axis, normalised across the cloud). Layer = brightness/bloom, not flat hue. Ambient nodes now span blue→violet→pink instead of grey. Density guard untouched; bulb material gains `toneMapped:false`.
- **FIX 2 — pulse cadence:** a new pulse every 1.8–2.4 s on a fresh path, ~4.5 s lifetime → 2–3 concurrent, opacity envelope = discrete events. Static edges dimmed 0.18 → 0.14.
- **FIX 3 — no change:** cross-fade already correct (verified off = 0.32/0.45/0.50/0.55/0.60; never both > 0.70). Reported PASS.
- **Scope held:** no new deps, no JSON regeneration, no data-model/nav/routing/DB/copy change. `hero-face-3d.json` still 49 KB gz.
- **Gates:** tsc clean; build + budgets — see final report. Live visual confirmation is the owner sign-off item (no browser in build env).
- **Owner action:** review in-browser, commit, then `git tag stable-glow-hero-v2 && git push origin stable-glow-hero-v2`.

---

**D-052.3 COMPLETE (no commit — T1) on `feat/instrument-redesign`** — the glowing-nodes hero, reconstructed. Owner reviews in-browser, then commits + tags `stable-glow-hero`.

**What landed in D-052.3 (2026-07-21):**
- **Recovery:** D-052.2 (semantic node layers, Beat 2/3 cross-fade, scroll dead-zone) was lost in a revert; restored FROM reflog `fae4dab`. The bulb shader, glow boost, camera pull-back and portrait refinement are new on top.
- **Pillar 1 — face:** portrait-prior refined (`FACE_SY 0.34→0.32`, `FACE_FLOOR 0.45→0.40`), regenerated from real `portrait-source.jpeg`. Feature concentration 26.5× → 30.9× (93 % in-face, silhouette kept). Poster + `network` (48.3 KB gz) regenerated. Face shifts +0.15 right on desktop ≥640 px, centred on mobile.
- **Pillar 2 — glow:** ambient background glow 8 % → **12–15 %** peak, heavily blurred, 10 s breath.
- **Pillar 3 — bulbs:** inner nodes are custom-shader lit bulbs (emissive core + fresnel halo), additive, 4–8 px clamped, density-guarded, per-node breathing. Project/skill/ambient layers preserved.
- **Beat 2 / camera:** cross-fade never both >70 %; `CAM_END_Z +0.05 → +0.12` depth field; bloom 0.35/1.2; bottom scrim for sub-line legibility.
- **Gates:** tsc clean; `next build` exit 0, no warnings; `/` 154 kB; 3D chunk 253.5 kB gz; JSON 48.3 KB gz; posters 85.4 KB.

**Owner action:** review in-browser, commit, then `git tag stable-glow-hero && git push origin stable-glow-hero` (this is the checkpoint we lost).

---

**D-052.1 COMPLETE on `feat/instrument-redesign`** — four surgical fixes on top of D-052. Committed and pushed.

**What landed in D-052.1 (2026-07-21):**
- **FIX 1 — Theme mismatch resolved:** Hero `<section>` now carries `class="dark"` unconditionally → copy overlay always uses dark-mode tokens. `NavShell` adds `class="dark"` via IntersectionObserver while `[data-hero-section]` is visible.
- **FIX 2 — Headline:** `identitySentence` = "Turning curiosity into working systems." in `content/site.ts`.
- **FIX 3 — BLOCKED:** `apps/web/scripts/assets/portrait-source.jpg` absent. Per LAW-008, regeneration deferred until owner drops the source photo and runs `npm run hero:generate`.
- **FIX 4 — Accent glow:** (a) Ambient WebGL glow plane, accent gradient ~8% peak, 10s breathing cycle; (b) `.hero-subline-gradient` utility; (c) `.gradient-underline-hover` on CTA secondary.

---

**D-052 — Phases 0–5 complete.**

The Instrument redesign + 3D neural-face hero (D-052, supersedes D-050 Track 1) is built and statically verified on branch `feat/instrument-redesign` (cut off the release work). Nothing committed by the AI (T1). Owner reviews in-browser, then commits/merges.

**What landed this session (2026-07-21, D-052):**
- **Phase 0** — fixed the live hero copy regression at root (`content/site.ts` held the old rejected headline; hero reads the file, `site_settings` DB is write-only — documented) → `"I build intelligent systems."`; removed the dead "sound" toggle (LAW-008).
- **Phase 1** — `docs/DESIGN_SYSTEM.md` + the Instrument token layer (`globals.css`): dark-first stage/ink, Gemini accent gradient (energy-only), six-size type scale, Inter Tight display, two energy easings.
- **Phase 3** — site-wide reskin: glass nav with active gradient underline, 96/160 rhythm, six-token type migration on `/` + `/projects`, ProjectCard rebuilt (hover gradient underline, no tile imagery), detail page question-as-pull-quote, admin chrome quiet.
- **Phase 2** — the 3D hero (`features/hero-scene/neural-face/`): pipeline v2 (`hero-face-3d.json` 43.8 kB gz, posters 86 kB, `--depth-map` flag), custom-shader particle relief → CatmullRom dive → inner network with meshline pulses + bloom; poster-first SSR LCP; fallback ladder (reduced-motion/tier-0/no-WebGL/context-loss → poster); lazy `next/dynamic({ssr:false})` mount. `/` First Load **154 kB** (≤170); lazy 3D chunk **253.5 kB gz** (≤500); three.js absent from `/` First Load.
- **Phase 4** — `check-bundle-budget.mjs` extended (170 kB ceiling, lazy chunk ≤500 kB, 3D-asset + poster existence & budgets); CI step relabelled D-052; D-052 logged in `DECISIONS.md`.
- **Phase 5** — 15-item tester pass: static/code items PASS; live-browser items (fps, context-loss, LCP timing, memory ×10, mobile emulation) flagged as owner sign-off (no browser in the build env — not faked).

**Owner sign-off before commit (D-052):** `npm run dev` → `/` desktop (poster → face → dive → network); reduced-motion (poster only); mobile (2500-node tier, no bloom); light theme (hero stays a dark stage); DevTools (3D chunks load post-idle only). Owner git block is in `AI_HANDOFF.md`.

---

## Prior phase (release/v0.9.0-alpha) — RELEASE-READY

The pre-D-052 release work (below) remains valid on its branch. D-052 builds on top of it.

**RELEASE-READY — pending owner deploy click.**

All engineering gates are GREEN. The working tree is clean to commit and merge to `main`. Owner triggers the first Render deploy per `docs/DEPLOY_RUNBOOK.md`.

**What cleared in this final session (2026-07-21):**
- G3 (deploy-blocking gate) cleared: `content/asmos.ts` rewritten with owner-ratified ASMOS content (ownership-based multi-agent routing; 24% context token reduction); `draft: false` flipped.
- D-050 Arrival act-0 sub-line owner-ratified: "Me, rendered as a network of the work." All four sub-lines now owner-ratified.
- `apps/web/src/instrumentation.ts` added: loud startup check for `SESSION_SECRET` / `ADMIN_PASSWORD_HASH` at `next start` in production.
- `docs/10-DEPLOYMENT.md §8a`: deploy-day env var sheet with raw-vs-escaped note.
- `docs/DEPLOY_RUNBOOK.md`: single-page click-by-click deploy sequence.
- `brief.tsx`: 1-line fix to self-hide empty gist fields (LAW-008 — avoids blank "Formed" row).
- Arrival HEIGHT_FRAC mobile shrink (0.62 at ≤640px → 0.82 at ≥900px) ready to commit.
- `content/asmos.ts` `gist.formed` is `""` (self-hiding) — owner to fill the year ASMOS began.

**Remaining owner actions (ordered):**
1. Commit + push on `release/v0.9.0-alpha` (git commands below in AI_HANDOFF).
2. Review Final Gate Table in AI_HANDOFF — all gates GREEN.
3. Merge to `main` → confirm CI green → Render Blueprint deploy.
4. Post-deploy smoke test per `docs/DEPLOY_RUNBOOK.md` Step 4.
5. Fill `gist.formed` in `content/asmos.ts` (year ASMOS began — single string).
6. R4 copy tests + visual look-dev sign-off on live production URL.

---

### D-050 Track 1 — "Neural Face Lite" hero shipped (Canvas2D, zero runtime deps).

The public landing `/` has a new dependency-free **Canvas2D particle-portrait hero**. An offline `sharp` pipeline (`apps/web/scripts/generate-hero-face.mjs`, `npm run hero:generate`) turns a personal source photo into a quantized constellation (`public/hero-face.json`: ≤3,000 nodes, ≤6,000 KNN edges, pulse paths, luminance-derived pseudo-depth — no ML) that a `"use client"` `<NeuralFaceHero />` **fetches** (never imports) and renders as dim nodes + sub-perceptual edges + a rare accent pulse + pointer parallax + ambient breathing. Feature folder: `apps/web/src/features/neural-face/`.

**D-050 amendment (owner-ratified):** the ambient **R3F scene was removed from `/`** — `HeroSceneRegion` now lives **only at `/dev/hero`**. `features/hero-scene/` was **not touched**. The Arrival sub-line's old `useHeroStore` scene-act coupling was replaced by a **self-contained, dependency-free** `useScrollAct` driver (native scroll → act index; no GSAP/Lenis). One-commit reversible for v1.5 (swap `NeuralFaceHeroRegion`→`HeroSceneRegion ambient` in `page.tsx`, repoint `arrival.tsx` import).

**Budgets (D-050, CI-enforced):** `/` First Load JS ceiling amended **152 → 164 kB** (≤ +12 kB for Track 1). `hero-face.json` ≤ **60 KB gzipped** (pipeline prints raw+gz, fails over budget after one auto-retry; synthetic-image validation measured ≈28 KB gz at the 3,000-node cap). New CI guard (`scripts/check-bundle-budget.mjs`) fails on three/gsap/lenis/sharp in `/`'s First Load JS, on `/` > 164 kB, or if the hero-face dataset is bundled instead of fetched.

**No-fake-data / graceful absence:** there is **no real owner photo in the repo**, so **no `hero-face.json` is committed** — the hero copy stands alone until the owner drops `apps/web/scripts/assets/portrait-source.jpg` and runs `npm run hero:generate`. Missing photo = the pipeline fails loudly with the exact drop path; missing JSON = the component renders nothing. `scripts/assets/` is gitignored (README kept tracked). Zero-DB + zero-asset public build verified.

**Owner copy ruling pending:** the Arrival ambient **sub-line** was rewritten (old lines narrated the now-removed 3D scene + Dex → dishonest to keep, LAW-008). New lines are authored dev copy, flagged for owner ratification; the ratified identity + support lines were untouched.

---

### v0.9.0-alpha — Rich metadata + media sprint complete (Phases 1–3).

D-048 (rich typed field matrix) + D-049 (Cloudflare R2 media) ratified & implemented (`docs/28`). Every content type gained a generous set of **optional, typed, self-hiding** fields — no JSONB bag, no custom-field builder (D-043 upheld). Projects (the one live public page) render cover / duration / context / role / collaborators / overview / gallery / outcomes / "What I learned" / live+video+PDF evidence, each self-hiding; an empty project renders identically to before. Media pipeline: `media`/`content_media`/`content_links` tables + migration 0002, R2 S3 client (server-only), magic-byte + size + EXIF-strip validation, auth-gated upload with alt-text-required, `/admin/media` library, reference-checked delete, `npm run media:backup` bucket mirror. Version history extended to all new fields + media (round-trip verified). **Budgets:** `/` 152 kB, `/projects` 106 kB (both unchanged); `/projects/[slug]` 106→111 kB (+5 kB next/image, the required optimization path). three.js + admin + aws-sdk absent from all public First Load JS (CI guards pass). Typecheck + build green, zero warnings.

**Media activation is owner-gated:** set `R2_ACCOUNT_ID`/`R2_ACCESS_KEY_ID`/`R2_SECRET_ACCESS_KEY`/`R2_BUCKET` + `MEDIA_PUBLIC_BASE_URL` (README → "Media / R2 setup"). Until then the Media page shows an honest disabled state — nothing faked. Text fields work immediately in DB mode.

### v0.8.0-alpha — Admin CMS complete (Phases 1–3). Acceptance ritual passed.

D-046 (collocation) and D-047 (iron-session Option A) ratified. Admin CMS fully implemented: auth (iron-session + bcrypt, in-memory rate-limiter, constant-time compare), admin shell, Projects editor (all 18 drafts editable, question publish-gate, lifecycle state machine, abandoned branches, version history + restore), site-copy editor (DB-mode only, single-writer banner), `content_versions` + `site_settings_versions` tables (with origin provenance field), scheduled-publish cron with SKIP LOCKED, CI admin bundle isolation guard (hard failure), security headers in next.config.ts, robots.ts disallows /admin, render.yaml cron stub.

**Acceptance ritual:** draft → write question → publish → appears on /projects in **1.9s** (limit: 10 min ✓). Build: `/` = 152 kB unchanged. Typecheck clean.

## DB Sprint — all three phases complete + ingest (latest)

`docs/09-DATABASE.md` authored and fully implemented. D-043/D-044/D-045 all ratified.

**Phase 1 — Schema design:** Decade-horizon relational schema. CTI pattern (`content_items` base + type tables). Full schema: `content_items`, `abandoned_branches`, `content_stages` + `stage_items`, `projects`, `publications`, `posts`, `timeline_entries`, `skills`, `gallery_items`, `content_versions`, `relations`, `site_settings`, `users`, `sessions`, `github_cache`, `embeddings` (pgvector, chunk-based, sync_status).

**Phase 2 — Migrations + local dev:**
- `apps/web/src/db/schema.ts` — Drizzle TypeScript schema (9 tables implemented)
- `apps/web/src/db/migrations/0000_fair_silver_surfer.sql` — single migration: tables + FKs + D-043 binding conditions (all merged here; 0001 was manually-created and not in the journal, so it was merged into 0000 before first apply)
- `apps/web/src/db/index.ts` — lazy DB client (never instantiated in file mode)
- `apps/web/drizzle.config.ts` — drizzle-kit config (loads `.env.local` via dotenv — WSL/Windows interop fix)
- `docker-compose.dev.yml` — local Postgres (pgvector/pgvector:pg17, **port 5433** — avoids Windows Postgres on 5432)
- Updated `.env.example` — `DATABASE_URL`, `CONTENT_SOURCE` documented
- `apps/web/scripts/db-ingest.ts` — idempotent ingest from `content/site.ts` → DB (loads `.env.local` via dotenv)
- `apps/web/package.json` — `db:generate`, `db:migrate`, `db:ingest` scripts

**Phase 3 — DB-backed ContentService:**
- `apps/web/src/services/db-content.ts` — full ContentService impl via Drizzle (all 8 methods, 3 queries per collection call, no N+1)
- `apps/web/src/services/index.ts` — source selector: `CONTENT_SOURCE=db → dbContent`, else `localContent`
- Pages updated: `projects/page.tsx` + `projects/[slug]/page.tsx` now import `contentService` from `@/services` (not `localContent` directly)

**Verified:** typecheck clean (zero errors), build green: `/` = 152 kB, three.js absent from all First Load JS, 7 static pages. File mode works with no DB present — `CONTENT_SOURCE` unset = file mode by default.

## Launch-readiness sprint (session 22–26 — release gates · content fill · 18 project drafts)

The repo is now in a state where the owner can deploy Tier 0 the moment `content/site.ts` is filled. Three phases, all green (`typecheck` + `build`, zero warnings; three.js absent from First Load JS across `/`, `/projects`, `/projects/[slug]`):

- **Release readiness:** `OWNER_CONTENT_CHECKLIST.md` + `RELEASE_CHECKLIST.md` at repo root (every owner content field with R4 protocol + guiding questions; the ASMOS `content/asmos.ts` draft is a hard deploy gate). **Graceful-absence nav + footer** via one shared `BUILT_ROUTES` registry (`constants/routes.ts`) — chrome shows only built routes, nothing 404s, no dead code. `/` held at 152 kB, LCP = headline.
- **Deployment:** `docs/10-DEPLOYMENT.md` authored (Render primary, pending owner ratification — D-041; Railway + Vercel+Neon compared; DB-future not painted into a corner). Config committed: `render.yaml`, `.github/workflows/ci.yml` (typecheck+build+three.js guard), `.env.example`, README "Deployment". **No deploy run — owner triggers the first one.**
- **`/projects` Work pages** (route is `/projects`, label "Work" — D-021 upheld; brief's "/work" = the Work lane): index reads the ContentService and renders an honest empty state at zero content; detail carries the cognitive spine — question (LAW-003), abandoned branches (LAW-004, self-hides empty), evidence (Law 6, built-route relations + repoUrl only). `Project` type extended additively (D-042: `question` required, `abandonedBranches?`); Project↔Memory convergence deferred to docs/09. New primitive: `EmptyState`.

**Decisions:** D-040 (v1.5 deferral — 3D/Twin/Dex frozen; `features/hero-scene/` untouched, stays at `/dev/hero`), D-041 (Render, pending ratification), D-042 (Project spine extension).

**Owner's next actions:** fill `OWNER_CONTENT_CHECKLIST.md` → clear `RELEASE_CHECKLIST.md` gates → ratify the deploy vendor → trigger the first Render deploy.

**Identity copy wired (session 23):** the Arrival `<h1>` is now single-sourced from `site.ts.identitySentence` (hardcoded string removed) with a companion `identitySupport` line; owner-ratified copy is in. Checklist items 1–2 ✅. Two honest copy observations reported to the owner (subject-verb "learns and enjoy", first→third-person voice / LAW-002, duplicated "Deepak" in eyebrow+`<h1>`) — left for the owner to rule on, not auto-corrected.

**Content fill (session 25):** `currentFocus`, `contactSentence`, `contactEmail`, `outbound.github`, `outbound.linkedin`, `outbound.scholar` (null, self-hides), `outbound.x`, `outbound.instagram` all inserted. X and Instagram wired in `evidence.tsx` + `footer.tsx` with graceful-absence guards (additive outbound extension — no closed set in docs/14 or docs/24). Checklist items 7, 8, 9 ✅ DONE. Build: `/` 152 kB, zero warnings, three.js absent from First Load JS.

**Project corpus inserted (session 26):** all 18 projects in `content/site.ts` as `status: "draft"`. None published — LAW-003 requires `question` first. `/projects` shows EmptyState (correct). `getProjects()` now sorts newest-first (was missing before). `context` → `problem`, `stack` → `tags` field mapping documented. Featured flag already existed. Checklist updated: per-project list with 6 featured first. Publishing flow: write question → flip status → project appears.

**Known follow-ups (out of scope):** other lanes (Research/Posts/About + Publications/Skills/Timeline/Contact/Search) still unbuilt (correctly hidden from chrome); docs/09 must answer the Project↔Memory convergence question.

## V2 · Landing Experience rebuilt (latest — product-experience sprint)

The landing (`/`) is rebuilt as a four-beat story around the live scene: **Arrival** (identity inside the scene, scroll-choreographed sub-line) → **Mission** (researcher-engineer thesis, large editorial type + Build/Research/Explain) → **Evidence** (six domains as a hover-alive system + honest status + graceful trust seeds) → **Collaborate** (close). The scene is integrated in **`ambient` mode** (no placeholder labels leak; runtime unchanged). Five thin self-hiding sections removed and merged. No fake data, no dead internal links, curiosity over listing. Build green: `/` 152 kB, three.js still absent from First Load JS, LCP = headline. New files: `sections/{arrival,mission,evidence,collaborate}.tsx`, `ui/sound-toggle.tsx` (placeholder); `content/site.ts` gains `mission` + `domains`.

**Known follow-ups (out of this sprint's scope):** global NavShell lanes still link to unbuilt pages (404) — a page-build concern; visual/spacing look-dev on `/` is the human acceptance gate.

## V2 · Sprint HS-1 shipped (`v0.5.0-alpha`, D-039)

**Design tokens are now V2 and DARK-FIRST** (`globals.css`): committed palette (graphite ramp + Signal-Azure `#3E8EFF`/`#0A66E0`), light "Paper" as a first-class equal, new `--scene-*` tokens, motion tokens per bible §12.2 (+ `settle` easing). `next-themes defaultTheme="dark"`. The shipped landing re-themes automatically.

**Hero Scene brought to V2** (`features/hero-scene/`, still at `/dev/hero`):
- **Boot sequence** (Act I): new headless `SceneDirector` + `bootProgressRef` — the workspace "comes online" (once/session, ≤1.1s, skippable, RM-instant).
- **Luminance-not-hue graph**: unlit nodes (brightness = recency), accent only on the active node, staggered draw-in outward from the Twin, group illumination by act, Dex awakening (resting→curious→active). Still 2 draw calls; calm at rest.
- **Tokenized light rig + Twin/bench** — no hex in scene code now (cool key + one warm task-light).
- Verified: typecheck + build clean; **three.js still absent from First Load JS**; GLB swap contract unchanged (every object is still a swap).

**Next V2 sprints:** implement remaining pages per the bible's 5-archetype system (Landing composition, Work index/detail, Research/Publications, Posts, About/Timeline/Skills, then tools/admin). Any public knowledge-graph surface is gated on real content (no-fake-data); the placeholder graph stays on `/dev/hero`.

---

## (Pre-V2 history below)

Phase 5 begun — **Sprint 1 (landing) implemented**; Phase 4 items (database plan, deployment, component guidelines) still open in parallel.

## Completed

**Documentation (docs 01–16):** PRD · System · XA · DSVL + Animation · IA · Wireframes · Brand · Tokens · Landing spec v1.1 (review-approved 84/100). Decisions D-004…D-027.

**Sprint 0 (D-028):** `apps/web` foundation — ratified stack, tokens as Tailwind v4 `@theme`, layout system, motion recipes, primitives, contracts. Build verified.

**Sprint 1 (D-029):** Landing implemented per `specs/landing.md` v1.1 —
- Hero: server-rendered text + CSS-only entrance (LCP never waits on JS); **graph motif** (9 nodes, R2 guardrails, Motion pathLength, once-per-session, reduced-motion = pre-drawn); R5 staleness rule; CV CTA renders only when a CV file exists
- S2–S5 data-driven with **graceful self-hiding** (no fake data anywhere); S4 has no animation (data is still)
- S7 contact = v1.0 resolution beat (R3); real Footer = sitemap-of-record + **build-date freshness stamp** (the quiet reveal)
- Dex Preview (v1.5) and News slot (v2) not rendered — graceful absence
- New reusables: CopyButton, ThemeToggle, `animate-entrance` CSS utility, local ContentService, 404 page
- **Build verified:** static prerender, 150 kB first-load on `/`

## Major direction change (this session)

**The hero is now an interactive 3D scene** (owner directive, D-030; architecture ratified as D-031 / [`../docs/17-HERO_SCENE_ARCHITECTURE.md`](../docs/17-HERO_SCENE_ARCHITECTURE.md)):
- Scene graph: data-driven knowledge graph + **the Twin** (stylized 3D Deepak at a workbench — vocabulary: Twin = 3D figure, Dex = the AI) + Dex as a luminous spatial entity
- Scroll-scrubbed camera rail, five acts, DOM-overlay text always (identity legible at scroll-zero in every tier)
- **Tier ladder:** Full 3D / Lite 3D / **Tier 0 = the shipped Sprint 1 hero (retained verbatim)**; reduced-motion = composed keyframe stations
- Hard budgets as release criteria; asset pipeline with two owner sign-off gates (concept → blockout) before production spend
- D-020 partially superseded (stylized only — photoreal/AI-imagery bans survive); D-026/D-027 superseded in hero scope; `specs/landing.md` → v1.2

## In Progress

- Landing (Tier 0) implemented but release-gated: real content in `content/site.ts`, R4 copy tests
- Hero scene: architecture approved; awaiting engine ratification + concept gate #1

## Hero Scene Bible (this session)

Creative direction complete — [`../docs/18-HERO_SCENE_BIBLE.md`](../docs/18-HERO_SCENE_BIBLE.md) (D-032): recency-as-proximity spatial thesis; Twin style system (matte-ceramic, eyes-suggested, no eye contact, no close-ups) with a **likeness gate — reference images of Deepak do not exist in the repo yet and are required for gate #1**; Dex life cycle incl. citation-trail illumination; luminance-not-hue graph logic + growth-on-publish; five-shot camera grammar, no idle camera; particles-as-information (4 data-event types, ambient sparkle refused); 5%-step scroll bible; cut-order documented for scope pressure.

## Personal OS Runtime architecture (latest — docs only)

**[`../docs/23-PERSONAL_OS_RUNTIME.md`](../docs/23-PERSONAL_OS_RUNTIME.md) (D-038):** the permanent runtime spine. A two-plane **Kernel** — Event Bus (facts/choreography) + Capability Registry (typed queries) — coordinates ten runtimes; no module imports another (only kernel-owned contracts). Overrode the brief's "event-bus-only" instruction with reasons (queries ≠ fire-and-forget). Single-writer law; Accessibility is the one runtime that never degrades (the floor). **Explicitly a target skeleton adopted incrementally — not a rewrite**; the shipped Hero Runtime becomes an unmodified client; existing stores (`ui-store`, `hero-store`, `ContentService`, next-themes, MotionConfig) become runtime faces by rename-and-formalize. No code this session.

## Sprint H-01 shipped: hero runtime foundation

**`features/hero-scene/` is real, building code** (D-037, `v0.4.0-alpha`): tier gate → scroll/pointer bridges → camera rail (code-authored 5-station stand-in, manifest-swappable for `cam_rail.glb`) → perf governor (DPR-first + shedding + recovery) → anchor projector → focus proxies/overlay → error ladder (boundary + context-loss guard) → asset manifest/loader contracts → placeholder objects (instanced graph in 2 draw calls, Twin capsule, breathing Dex, particles-render-nothing with emitter API). Verified: build clean, zero warnings, **three.js absent from all First Load JS**, landing untouched. Lives at **`/dev/hero`** (404s in production). Every future object is a swap, not a rework.

## Runtime architecture ratified + engine chosen

**[`../docs/22-HERO_RUNTIME_ARCHITECTURE.md`](../docs/22-HERO_RUNTIME_ARCHITECTURE.md) (D-036):** engine = **React Three Fiber** (closes the docs/06 queue item). The scene is an enhancement layer — DOM complete before/without the canvas; tier gate before any 3D byte; refs-not-state for 60fps values; native scroll scrubs the baked Blender rail; graph in 2 draw calls; error ladder resolves every failure to a designed lesser tier. **The hero implementation sprint is now unblocked on the engineering side** — only assets (photo-gated Twin) and budget remain owner-gated; bench/rail/procedural-scene work can begin.

## Blender pipeline ratified

**The artist's handbook** — [`../docs/21-HERO_BLENDER_PIPELINE.md`](../docs/21-HERO_BLENDER_PIPELINE.md) (D-035): the .blend is NOT the scene — Blender makes only Twin + bench set + camera rail (everything else is runtime/procedural). Rig contract 23 bones, 5 clips, LOD 60k/25k/8k, textures ≤8MB, glTF→Draco→KTX2 chain, QC lint. **Production can start today on the bench set and camera rail** (gate #2 blockout needs no owner inputs); the Twin remains photo-gated.

## Moodboard spec ratified

**Look-dev contract** — [`../docs/20-HERO_MOODBOARD.md`](../docs/20-HERO_MOODBOARD.md) (D-034): materials with roughness targets, lighting in Kelvin, 35mm lens, governed absences (no bloom / no mirrors / no in-scene glass), ≥55% negative space, licensed micro-details, 16-tile reference list, 8-point acceptance checklist. Gate #1 frames are judged against this checklist.

## Art direction ratified

**"The Drafted Laboratory"** — [`../docs/19-HERO_ART_DIRECTION.md`](../docs/19-HERO_ART_DIRECTION.md) (D-033): the Warm Lab drawn by the Drafting Space's hand. Solids carry hairline construction lines; new content is drawn into existence; accent = "the live line"; **the Twin is exempt from construction lines (the human is never a diagram)**; ≥80%-solid-at-rest guard. Decisive: **tier continuity** — Tier 0's 2D motif is the same world at its drawing layer. Eight directions explored and ranked; C and E rejected on named law collisions. Gate #1 packet defined (5 frames incl. tier-continuity proof).

## Next Steps

1. **Owner (blocking gate #1):** supply reference photos of Deepak → Twin style frames *in the Drafted Laboratory direction* → gate #1 review (uncanny check on drawings); also size the 3D asset budget
2. Engine/library ratification into `docs/06` (R3F-class vs vanilla WebGL-class) before any scene code
3. **Owner content pass** — fill `content/site.ts` TODO(copy) fields + first real projects/posts (feeds page and scene graph alike)
4. `docs/09-DATABASE_PLAN.md` + real content layer behind the existing interface
5. Next page sprints: Projects index/detail (shared-element pattern), then Posts
6. `docs/07`, `docs/10` + vendor ratification → first deploy (Tier 0 can deploy before the scene exists)

## Notes

Version: **`v0.3.0-alpha`**. Still pending with owner: Dex name veto, monogram, accent hue sign-off (provisional values in `globals.css` tier-1). Lighthouse audit deferred to first deploy environment (local numbers are not the release evidence).
