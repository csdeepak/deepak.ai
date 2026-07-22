# Deploy Runbook — Deepak Labs first production deploy

> One-page, ordered, click-by-click. Each step has an **Expected result**
> line — if you don't see it, stop and diagnose before proceeding.
> Authoritative refs: `docs/10-DEPLOYMENT.md` · `render.yaml` · `RELEASE_CHECKLIST.md`.

---

## Step 1 — Merge feature branch → `main` and confirm CI green

```bash
git checkout main
git merge release/v0.9.0-alpha --no-ff
git push origin main
```

Then open **GitHub → Actions** and watch the CI run triggered by the push.

**Expected result:** All three CI jobs pass (Typecheck ✓, Build ✓,
Guard — three.js ✓, Guard — admin isolation ✓, Guard — neural-face
budgets & banned deps ✓). No red Xs. Time: ~60–90 s.

If CI fails: do NOT proceed to Render. Fix the failure on the feature
branch, push again, re-merge.

---

## Step 2 — Create the Render Blueprint (the first-deploy click)

1. Go to [render.com](https://render.com) → **New** → **Blueprint**.
2. Connect your GitHub account if not already connected.
3. Select the `deepak.ai` repository.
4. Render reads `render.yaml` from the repo root and shows you the planned
   service: `deepak-labs-web` (type: web, branch: main).
5. Review the plan — confirm service name and build/start commands match.
6. Click **Apply** / **Deploy**.

**Expected result:** Render starts a build. You see logs streaming:
`npm ci` → `npm run build` (the Next.js build, ~60–90 s) → `npm run start`.
Build should complete without errors.

> `autoDeploy: false` in `render.yaml` means this is the only manual
> deploy. Step 6 of this runbook flips it to auto-deploy after you
> confirm production is healthy.

---

## Step 3 — Set environment variables

**In Render:** service → **Environment** → **Add Env Var** (or Add Secret).

Paste these **in order**, values **raw / unescaped** (Render does not run
dotenv-expand — `$` is literal, no backslashes needed):

| Variable | Value | Field type |
|----------|-------|------------|
| `NODE_VERSION` | `20` | Plain env var — already in render.yaml, skip if shown |
| `NODE_ENV` | `production` | Plain env var — already in render.yaml, skip if shown |
| `SESSION_SECRET` | *(generate: `node -e "console.log(require('crypto').randomBytes(48).toString('base64'))"`)* | **Secret** |
| `ADMIN_PASSWORD_HASH` | *(generate: `node -e "const b=require('bcryptjs'); b.hash('yourPassphrase',12).then(h=>console.log(h))"`)* | **Secret** |

**R2 media vars — OMIT for now.** The media pipeline stays in its honest
disabled state until R2 setup is smoke-tested. Add them in a follow-up
deploy (no site rebuild needed, just a Render env var update + redeploy).

> **⚠ Escape note for `.env.local` only:** if you copy these values into
> `apps/web/.env.local` for local dev, bcrypt hashes contain `$` which
> dotenv expands — wrap in single quotes: `ADMIN_PASSWORD_HASH='$2b$12$...'`.
> On Render's dashboard you paste them raw; no escaping.

After adding env vars, Render may prompt a redeploy — approve it.

**Expected result:** Service shows "Live" status. The startup check
(`src/instrumentation.ts`) validates `SESSION_SECRET` and
`ADMIN_PASSWORD_HASH` at boot and throws a named error if either is
missing or using the dev fallback — so a silent-credential deploy is
impossible.

---

## Step 4 — Post-deploy smoke test

Open the production URL Render assigned (e.g. `deepak-labs-web.onrender.com`).
Run each check in order:

| Check | Action | Expected result |
|-------|--------|----------------|
| **Landing** | Open `/` | Headline renders; constellation hero visible (or canvas silently absent if JSON fetch fails — copy stands alone either way); no console errors |
| **/memory** | Open `/memory` | ASMOS memory map loads; clicking ASMOS node shows reconstruction with 3 stages (The question / The experiment / What it showed); Brief panel shows all filled fields |
| **Project index** | Open `/projects` | Projects list renders (or honest EmptyState if none published in DB mode) |
| **Project detail** | Open `/projects/asmos` | ASMOS project detail page renders |
| **/admin login** | Open `/admin/login` → enter your passphrase | Redirects to `/admin/overview`; session persists on refresh |
| **404 behaviour** | Open `/dev/hero` | Returns 404 (not-found page, not a crash) |
| **Reduced motion** | Enable OS reduced-motion setting → open `/` | Neural face canvas shows one static frame or no canvas; all copy readable; no animation loops |
| **Theme toggle** | Toggle light/dark on `/` | Theme switches cleanly; no flash |

**Expected result:** All eight checks pass. If the admin login fails,
check that `ADMIN_PASSWORD_HASH` was pasted correctly (bcrypt compare
is case-sensitive and whitespace-sensitive).

---

## Step 5 — Custom domain + DNS

1. In Render: service → **Settings** → **Custom Domains** → **Add Custom Domain**.
2. Enter your apex domain (e.g. `deepaklabs.com`).
3. At your DNS registrar, add the record Render shows:
   - Apex: `ALIAS` or `ANAME` record pointing to the Render hostname.
   - `www`: `CNAME` → apex redirect (Render handles `www → apex`).
4. Wait for TLS — Render issues a Let's Encrypt cert automatically (up to 10 min).

**Expected result:** `https://deepaklabs.com` serves the site with a valid
TLS cert. HTTP and `www` redirect to the apex HTTPS URL.

> Keep DNS at your registrar (not pointed to Render's nameservers) so
> the domain is portable if you change PaaS vendors.

---

## Step 6 — Enable auto-deploy on `main`

Once the smoke test passes and the domain is live, flip `autoDeploy`:

```bash
# In your local repo:
git checkout main
```

Edit `render.yaml` line with `autoDeploy: false` → `autoDeploy: true`, then:

```bash
git add render.yaml
git commit -m "chore(deploy): enable auto-deploy on main after successful first deploy"
git push origin main
```

**Expected result:** CI runs on the push; Render auto-deploys on green.
From this point forward: merge to `main` → CI green → Render auto-deploys.

---

## After deploy — immediate follow-ups (not blockers)

- **Point external profiles** (GitHub bio, LinkedIn, Scholar) at the live domain.
- **Set R2 env vars** when ready: `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`,
  `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`, `MEDIA_PUBLIC_BASE_URL` → redeploy.
  Smoke-test upload + read-back in the admin before going live.
- **Add `DATABASE_URL`** when the Render Postgres instance is created
  (docs/09 → add the managed Postgres in render.yaml, wire the env var,
  run `npm run db:migrate` on first boot).
- **Fill `gist.formed`** in `content/asmos.ts` — the year ASMOS work began;
  currently empty and self-hiding in the Brief panel.

---

*This runbook covers Tier 0 static launch. The DB era additions are in
`docs/10-DEPLOYMENT.md §7`.*
