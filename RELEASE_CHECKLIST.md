# Release Checklist - First Production Deploy

> **Historical — this checklist is complete.** It records the gates for the
> first production deploy, which has happened. The site is live on **Vercel +
> Neon + Cloudflare R2**, not the Render setup the original text described
> (corrected 2026-08-13, D-058 Phase G).
>
> **For ongoing deploys, migrations, incidents and rollback, use
> [`docs/DEPLOY_RUNBOOK.md`](docs/DEPLOY_RUNBOOK.md)** — not this file.
>
> Kept because the Owner gates below (content fill, copy tests, visual
> sign-off) are the reusable part, and because the engineering gates are still
> the right pre-merge checks.

## Gate 1 - Content Fill (Owner)

- [ ] Identity, mission, evidence, collaborate, contact, outbound, and current
      focus copy are acceptable to ship.
- [ ] Known recruiter-facing absence accepted: `cvUrl` is currently `null`, so
      the CV CTA self-hides.
- [ ] No public copy relies on fabricated content; empty sections self-hide.

## Gate 2 - R4 Copy Tests (Owner)

Source: `specs/landing.md` section 6.5 and D-027.

- [ ] 10-second test passed on the identity headline and mission statement.
- [ ] Read-aloud test passed on all launch copy.
- [ ] Banned-vocabulary sweep passed:
      `passionate`, `journey`, `seamless`, `blazing`, `revolutionary`,
      `cutting-edge`, `leverage` as a verb, `ninja`, `rockstar`, `guru`,
      and "let's build something amazing" do not appear in public launch copy.

## Gate 3 - ASMOS Memory

- [x] `apps/web/content/asmos.ts` contains real ASMOS content.
- [x] `draft: false` is set.
- [x] `/memory` is allowed into the production smoke test.

## Gate 4 - Gallery Deferred ~~(superseded 2026-08-13 — gallery is live)~~

This gate held for v1 and has since been lifted by D-058 Phase F. Photos are
now curated in `/admin/gallery` from the media library, where alt text is a
required field — which is what the deferral was waiting on. `/gallery` is
reachable, `GalleryStrip` is mounted on the landing page, and the footer link
is present. All three self-hide while there is nothing published.

- [x] ~~Gallery is deferred from v1~~ — lifted; alt text is enforced at the
      point of entry instead of being a manual pre-launch pass.
- [x] ~~Landing does not include `GalleryStrip`~~ — now mounted, self-hiding.
- [x] ~~Footer has no Gallery link~~ — now present via `BUILT_ROUTES`.
- [x] ~~`/gallery` 404s in production~~ — now renders, with an honest empty
      state at zero published photos.

## Gate 5 - Production Environment ✅ done (on Vercel, not Render)

- [x] `SESSION_SECRET` and `ADMIN_PASSWORD_HASH` set in Vercel → Settings →
      Environment Variables (`npm run admin:password --workspace=web` for the
      hash; paste it raw/unescaped).
- [x] Hosted on Vercel — project `deepak-ai-web`, config in `vercel.json`.
      Database is **Neon** Postgres, not a host-provisioned one.
- [x] `NEXT_PUBLIC_SITE_URL` set to the live URL
      (`https://deepak-ai-web.vercel.app`) until a custom domain is live.
- [x] Cloudflare R2 variables set and smoke-tested — media upload and public
      read-back both work.

## Gate 6 - Production Database ✅ done (Neon)

- [x] Migrations applied against Neon:
      `DATABASE_URL=<neon-connection-string> npm run db:migrate --workspace=web`.
- [x] Content ingested.
- [x] Tables include `dex_visitor_intake` and `dex_question_log`.
- [x] `CONTENT_SOURCE=db` set in Vercel.

Ongoing migration practice now lives in `docs/DEPLOY_RUNBOOK.md` §2.

## Gate 7 - Visual / Spacing Sign-Off (Owner)

- [ ] `/` reviewed at mobile and desktop widths.
- [ ] Light and dark themes both acceptable.
- [ ] Reduced-motion path keeps all meaning and readability.
- [ ] The six published projects read correctly; twelve draft projects remain
      unpublished.

## Engineering Readiness

Run before PR/merge:

```bash
npm run typecheck
cd apps/web
npx cross-env CONTENT_SOURCE=file npm run build
npm run check:bundle
npm run check:dex
```

- [ ] Typecheck clean.
- [ ] Build clean, zero warnings.
- [ ] `/` First Load JS under 170 kB.
- [ ] three.js absent from `/` First Load JS.
- [ ] Admin bundle absent from public First Load JS.
- [ ] Dex matcher guard passes.

## Production Smoke Test

After DB mode is enabled:

- [ ] `/` renders; no console errors. Posts, Timeline and Gallery sections
      each appear only with content and self-hide otherwise.
- [ ] `/projects` renders published projects from DB.
- [ ] `/projects/asmos` renders.
- [ ] `/posts` renders published posts; a draft slug 404s.
- [ ] `/memory` renders ASMOS memory.
- [ ] `/gallery` renders (published photos, or an honest empty state).
- [ ] `/dev/hero` returns 404.
- [ ] `/sitemap.xml` lists only built public routes.
- [ ] `/robots.txt` references the production sitemap and blocks `/admin`.
- [ ] `/admin/login` works with the owner passphrase.
- [ ] `/admin/dex` renders Dex analytics.
- [ ] Dex panel answers a suggested question and handles rejected/rate-limited
      requests gracefully.

The owner triggers merge, Render deploy, production migrations, the DB-mode
flip, and DNS/custom-domain work.
