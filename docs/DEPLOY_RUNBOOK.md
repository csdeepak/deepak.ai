# Deploy Runbook - Deepak Labs First Production Deploy

> Owner-executed steps for the first Render deploy. Repo-side prep happens on
> `codex/ai-development-process`; the owner controls merge, Render secrets,
> deploy clicks, production migrations, and DNS.

## Current Deploy Shape

- Host: Render Blueprint from `render.yaml`.
- First public URL: `https://deepak-labs-web.onrender.com`.
- Database: Render Postgres is provisioned with the first deploy.
- First boot: `CONTENT_SOURCE=file`, so the public site builds before the new
  production database has schema/content.
- DB flip: after migrations + ingest, change `CONTENT_SOURCE=db` in Render and
  redeploy.
- R2 media: deferred until the owner finishes Cloudflare setup and smoke-tests
  upload/read-back.
- Gallery: deferred from v1; `/gallery` is dev-review only and 404s in
  production until the owner writes alt text/captions and reviews it live.

## 1. Before Merge

Run the repo checks locally on `codex/ai-development-process`:

```bash
npm run typecheck
cd apps/web
npx cross-env CONTENT_SOURCE=file npm run build
npm run check:bundle
npm run check:dex
```

Expected result: typecheck, build, bundle guard, and Dex matcher guard all pass
with no build warnings. `/` First Load JS stays under the 170 kB D-052 ceiling.

## 2. PR and CI

Push `codex/ai-development-process`, open a PR into `main`, and wait for CI.

Expected result: GitHub Actions passes typecheck, build, public bundle guards,
and `check:dex`. Do not proceed to Render while CI is red.

## 3. Owner Secrets

Before creating or redeploying the Render service, generate:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64'))"
npm run admin:password --workspace=web
```

Use the first value for `SESSION_SECRET`. Use the bcrypt hash printed by the
script for `ADMIN_PASSWORD_HASH`.

Render value rule: paste bcrypt hashes raw/unescaped. `.env.local` is the only
place where `$` must be escaped.

## 4. Create the Render Blueprint

1. Render dashboard -> New -> Blueprint.
2. Select the `deepak.ai` repository.
3. Render reads `render.yaml`.
4. Confirm it plans:
   - web service `deepak-labs-web`
   - Postgres `deepak-labs-db`
   - `CONTENT_SOURCE=file`
   - `NEXT_PUBLIC_SITE_URL=https://deepak-labs-web.onrender.com`
   - `autoDeploy: false`
5. Enter `SESSION_SECRET` and `ADMIN_PASSWORD_HASH` when Render prompts.
6. Apply/deploy.

Expected result: the first build completes and the service boots on the Render
subdomain. If auth env vars are missing, `instrumentation.ts` refuses to serve
with a named startup error.

## 5. Production DB Setup

After the first service deploy is live, run migrations against the Render
Postgres connection string from the owner machine:

```bash
DATABASE_URL=<Render connection string> npm run db:migrate --workspace=web
```

Then seed the production DB from the file-backed source of truth:

```bash
DATABASE_URL=<Render connection string> npm run db:ingest --workspace=web
```

Verify the DB has the expected tables, including:

- `content_items`
- `projects`
- `dex_visitor_intake`
- `dex_question_log`

Expected result: migrations `0000` through `0004` are applied and the 18 project
records exist in production Postgres.

## 6. Flip to DB Mode

In Render, change:

```text
CONTENT_SOURCE=db
```

Redeploy the service.

Known limitation: landing hero/site copy still reads from
`apps/web/content/site.ts`; admin settings writes to `site_settings`, but public
hero copy does not consume that table yet. This is a known pre-existing gap,
not a deploy blocker.

## 7. Production Smoke Test

Run these against `https://deepak-labs-web.onrender.com`:

| Check | Expected result |
| --- | --- |
| `/` | Hero and landing render; no Gallery strip; no console errors. |
| `/projects` | Published projects render from DB after ingest. |
| `/projects/asmos` | ASMOS project detail renders. |
| `/memory` | ASMOS memory page renders real content. |
| `/gallery` | 404s in production. |
| `/dev/hero` | 404s in production. |
| `/sitemap.xml` | Lists only built public routes. |
| `/robots.txt` | References the production sitemap and blocks `/admin`. |
| `/admin/login` | Owner passphrase logs in and redirects to `/admin/overview`. |
| `/admin/dex` | Dex analytics page renders without DB errors. |
| Dex panel | Suggested question returns a cached answer; overlong/rate-limited errors degrade gracefully. |
| Theme/reduced motion | Light/dark and reduced-motion paths stay readable. |

Expected result: all smoke checks pass before sharing the URL externally.

## 8. R2 Media Follow-Up

When Cloudflare R2 setup is complete, add these Render env vars and redeploy:

- `R2_ACCOUNT_ID`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_BUCKET`
- `MEDIA_PUBLIC_BASE_URL`

Smoke-test Admin -> Media upload and public read-back before treating media as
active. Do not make R2 a blocker for the first deploy unless the owner chooses.

## 9. Later Custom Domain

After the Render subdomain is healthy:

1. Add the custom domain in Render.
2. Create the DNS record Render provides.
3. Wait for TLS.
4. Change `NEXT_PUBLIC_SITE_URL` to the custom domain.
5. Redeploy.
6. Re-check OG tags, `/sitemap.xml`, and `/robots.txt`.

## 10. Maintenance Notes

Dex question logs are intentionally not joined to visitor identity. Until a
retention job exists, prune manually if needed:

```sql
DELETE FROM dex_question_log
WHERE created_at < now() - interval '180 days';
```

Keep `autoDeploy: false` until the first production smoke test passes. Enable
auto-deploy in a later commit only after the owner is comfortable with main
deploying automatically.
