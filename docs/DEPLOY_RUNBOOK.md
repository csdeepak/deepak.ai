# Deploy Runbook — Deepak Labs

> Operational runbook for the **current** deploy. Rewritten 2026-08-13 (D-058
> Phase G): this file previously described a first-time Render deploy that has
> since been superseded — the site has run on Vercel + Neon + R2 for some time,
> and the old runbook would have actively misled anyone reaching for it during
> an incident.

## Current Deploy Shape

- **Host:** Vercel. Project `deepak-ai-web` (org `c-s-deepaks-projects`).
- **Public URL:** `https://deepak-ai-web.vercel.app`.
- **Config:** `vercel.json` at the repo root — `buildCommand:
  npm run build --workspace=web`, `outputDirectory: .next`, `installCommand:
  npm ci`, `framework: nextjs`. `outputDirectory` is relative to the project's
  **Root Directory** setting (`apps/web`), which is why it is `.next` and not
  `apps/web/.next`.
- **Database:** Neon Postgres (serverless; can be cold). `CONTENT_SOURCE=db`.
- **Media:** Cloudflare R2, public bucket. Keys are stored; public URLs are
  derived at read time from `MEDIA_PUBLIC_BASE_URL` (D-049) — the bucket or CDN
  can move with one env change and no data migration.
- **Deploys:** automatic on push to `main`. There is no manual gate.

## 1. Routine Deploy

Push to `main`. Vercel builds and promotes to production automatically.

Before pushing, run the same gates CI runs:

```bash
npm run typecheck
```
```bash
CONTENT_SOURCE=file npm run build
```
```bash
npm run check:bundle --workspace=web
```
```bash
npm run check:dex --workspace=web
```

`/` First Load JS must stay under the 170 kB D-052 ceiling, and
`check:bundle` also asserts three/gsap/lenis/sharp never reach `/`'s client
bundle.

**Never run a production build while a dev server is running** — it corrupts
`.next` and produces confusing stale-state failures. Check first:

```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000
```

Watch the deploy:

```bash
vercel ls
```

## 2. Database Migrations

Migrations are **not** run by the build. Generate locally, apply deliberately.

```bash
npm run db:generate --workspace=web
```
```bash
npm run db:migrate --workspace=web
```

`db:generate` needs a TTY when a change is ambiguous (e.g. an add + drop on the
same table, which it asks you to disambiguate as rename-vs-recreate). In a
non-interactive shell, split the change into two unambiguous migrations rather
than fighting the prompt — see migrations `0007`/`0008`.

Against production, pass the Neon connection string explicitly:

```bash
DATABASE_URL=<neon-connection-string> npm run db:migrate --workspace=web
```

Apply to local first, verify, then production. A schema change that reaches
production before the code that reads it will break the public site — the DB
service is used **unwrapped at runtime** (see §5).

## 3. Environment Variables

Set in Vercel → project → Settings → Environment Variables.

| Variable | Notes |
| --- | --- |
| `DATABASE_URL` | Neon connection string. Sensitive. |
| `CONTENT_SOURCE` | `db` in production. |
| `SESSION_SECRET` | ≥32 random chars. `instrumentation.ts` refuses to boot on the dev fallback. |
| `ADMIN_PASSWORD_HASH` | bcrypt hash. Paste **raw/unescaped**; `.env.local` is the only place `$` needs escaping. |
| `R2_ACCOUNT_ID` / `R2_ACCESS_KEY_ID` / `R2_SECRET_ACCESS_KEY` / `R2_BUCKET` | Media storage. |
| `MEDIA_PUBLIC_BASE_URL` | Public origin for the R2 bucket. Public value, not a secret. |
| `NEXT_PUBLIC_SITE_URL` | Drives `metadataBase`, sitemap, robots. |

Regenerate the two auth values with:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64'))"
```
```bash
npm run admin:password --workspace=web
```

**Note for agents/scripts:** `vercel env pull` returns **masked placeholders**
for variables marked Sensitive — an 11-character stub, not the real value. Code
that reads a pulled `.env` and tries to connect will fail with a confusing
`ENOTFOUND base`. Use the real connection string directly when you need one.

## 4. Smoke Test

Against `https://deepak-ai-web.vercel.app`:

| Check | Expected result |
| --- | --- |
| `/` | Hero renders; Posts carousels, Timeline and Gallery strip each appear **only** if they have content, and self-hide cleanly otherwise. |
| `/projects` · `/projects/asmos` | Published projects render from the DB. |
| `/posts` · a post detail | Published posts render; a draft slug 404s. |
| `/gallery` | Renders published photos, or an honest empty state. Never 404s. |
| `/memory` | Real content renders. |
| `/dev/hero` | 404s in production. |
| `/sitemap.xml` | Lists only routes in `BUILT_ROUTES`. |
| `/robots.txt` | References the production sitemap, blocks `/admin`. |
| `/admin/login` | Passphrase logs in and redirects to `/admin/overview`. |
| `/admin/gallery` | Media picker lists images; adding one succeeds (this exercises the credentialed R2 read + sharp blur path). |
| Dex panel | Suggested question returns a cached answer; overlong/rate-limited input degrades gracefully. |
| Theme / reduced motion | Light/dark and reduced-motion paths stay readable. |

## 5. Incident: "The database isn't reachable"

The admin surfaces this directly. What it means:

- **The admin is down, the public site usually is not.** Public pages are
  prerendered at build time, so visitors keep seeing the last good build.
  Newly published content will not appear until the DB is reachable.
- The build-time file fallback (`services/index.ts`) is **build-only and
  deliberately narrow**. At runtime the DB service is unwrapped, so a real
  outage surfaces as an error rather than silently serving stale content that
  looks fine.
- Check `DATABASE_URL` in Vercel, and that the Neon database is awake — Neon
  can scale to zero and be briefly unreachable exactly when a deploy runs.

Read production logs with:

```bash
vercel logs https://deepak-ai-web.vercel.app
```

Next.js hides server error detail in production builds; the real stack and the
Postgres error (constraint name, failing row) are in these logs, not the
browser.

## 6. Rollback

Vercel keeps every previous deployment. Promote a known-good one from the
dashboard (Deployments → ⋯ → Promote to Production) rather than reverting and
re-pushing, which is slower and rebuilds from scratch.

A rollback does **not** roll back the database. If the bad deploy included a
migration, decide explicitly whether the schema change is
backward-compatible with the older code before promoting.

## 7. Custom Domain

1. Add the domain in Vercel → Settings → Domains.
2. Create the DNS record Vercel provides.
3. Wait for TLS.
4. Update `NEXT_PUBLIC_SITE_URL`, then redeploy.
5. Re-check OG tags, `/sitemap.xml`, `/robots.txt`.

## 8. Maintenance Notes

Dex question logs are deliberately not joined to visitor identity. Until a
retention job exists, prune manually if needed:

```sql
DELETE FROM dex_question_log
WHERE created_at < now() - interval '180 days';
```

Scheduled publishing (`db:publish-scheduled`) has no cron wired on Vercel.
Scheduled posts stay scheduled until something runs it — either add a Vercel
Cron Job or run it manually. This is a known gap, not a bug.
