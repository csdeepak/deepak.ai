# Release Checklist - First Production Deploy

> Human gates and engineering checks before Deepak Labs goes live on Render.
> The first deploy provisions Postgres, starts public reads in file mode, then
> flips to DB mode after production migrations and ingest.

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

## Gate 4 - Gallery Deferred

- [x] Gallery is deferred from v1 until owner alt text/captions/place copy and
      live review are complete.
- [x] Landing does not include `GalleryStrip`.
- [x] Footer has no Gallery link.
- [x] `/gallery` 404s in production and remains available in dev for review.

## Gate 5 - Production Environment

- [ ] Owner generated and entered `SESSION_SECRET` in Render.
- [ ] Owner generated and entered `ADMIN_PASSWORD_HASH` in Render using
      `npm run admin:password --workspace=web`.
- [ ] Render Blueprint provisions `deepak-labs-web` and `deepak-labs-db`.
- [ ] First Render deploy starts with `CONTENT_SOURCE=file`.
- [ ] `NEXT_PUBLIC_SITE_URL` is set to `https://deepak-labs-web.onrender.com`
      until a custom domain is live.
- [ ] Cloudflare R2 variables are deferred until the owner finishes object
      storage setup and smoke-tests upload/read-back.

## Gate 6 - Production Database

- [ ] Run migrations against Render Postgres:
      `DATABASE_URL=<Render connection string> npm run db:migrate --workspace=web`.
- [ ] Run ingest:
      `DATABASE_URL=<Render connection string> npm run db:ingest --workspace=web`.
- [ ] Verify tables include `dex_visitor_intake` and `dex_question_log`.
- [ ] Flip `CONTENT_SOURCE=db` in Render and redeploy.

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

- [ ] `/` renders; no gallery strip; no console errors.
- [ ] `/projects` renders published projects from DB.
- [ ] `/projects/asmos` renders.
- [ ] `/memory` renders ASMOS memory.
- [ ] `/gallery` returns 404.
- [ ] `/dev/hero` returns 404.
- [ ] `/sitemap.xml` lists only built public routes.
- [ ] `/robots.txt` references the production sitemap and blocks `/admin`.
- [ ] `/admin/login` works with the owner passphrase.
- [ ] `/admin/dex` renders Dex analytics.
- [ ] Dex panel answers a suggested question and handles rejected/rate-limited
      requests gracefully.

The owner triggers merge, Render deploy, production migrations, the DB-mode
flip, and DNS/custom-domain work.
