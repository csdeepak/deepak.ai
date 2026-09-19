# CLAUDE.md

Working notes for AI assistants on this repo. Short on purpose — it points at
the real sources rather than restating them, because a summary that drifts is
worse than no summary.

## Read first

1. [`memory/CURRENT_STATE.md`](memory/CURRENT_STATE.md) — where things actually stand.
2. [`docs/CONSTITUTION.md`](docs/CONSTITUTION.md) — ten laws that override any brief. Short; read it in full.
3. [`memory/KNOWN_LIMITATIONS.md`](memory/KNOWN_LIMITATIONS.md) — the honest gap list.

[`docs/SESSION_START.md`](docs/SESSION_START.md) is the ~1,200-line compiled
context. Genuinely worth reading before a large piece of work; not worth
reading to change a button.

## What this is

**Deepak Labs** — a "Personal Operating System", not a portfolio template. One
canonical record of research, projects, publications, posts and experience,
plus **Dex**, an AI assistant that answers about Deepak from a grounded corpus.
One maintainer, decade horizon, personal budget.

**Vocabulary that is load-bearing:** *Dex* is the AI. *The Twin* is the
stylized 3D figure of Deepak in the hero. Never conflate them.

## The laws that bite most often

- **LAW-003** — every project needs the question that created it. This is why
  12 of 18 projects sit unpublished.
- **LAW-006** — Dex recalls, never invents. One fabricated answer poisons it.
- **LAW-008** — honesty over completeness. Empty sections self-hide. **No fake
  data, ever.** An empty-looking page in dev is correct behaviour, not a bug.
- **LAW-009** — the 90-second recruiter path is sacred.

## Stack

Next.js 15 App Router · TypeScript strict · Tailwind v4 (tokens in
`globals.css` `@theme`, **not** `tailwind.config`) · `motion/react` (**never**
`framer-motion`) · React Three Fiber, lazy, never in `/`'s first load ·
Drizzle + Neon Postgres · iron-session admin auth · Cloudflare R2 media ·
Zustand for overlay state only.

Deployed on **Vercel**, auto-deploys on push to `main`.
[`docs/DEPLOY_RUNBOOK.md`](docs/DEPLOY_RUNBOOK.md) is current;
`docs/10-DEPLOYMENT.md` is Render-era history and is **wrong** about today.

## Gates — run before pushing

```bash
npm run typecheck
```
```bash
CONTENT_SOURCE=file npm run build
```
```bash
npm run check:bundle --workspace=web
```

Plus the guards, all wired into CI: `check:dex` (34 matcher cases),
`check:dex-v2` (offline guardrails + Phase 4 wiring), `check:typography`.

`/` First Load JS must stay under **170 kB**, and three/gsap/lenis/sharp must
never reach `/`'s client bundle.

## House conventions

- **Conventional Commits.** Feature branch → PR → `main`. Don't commit or push
  unless asked, and don't commit onto `main` directly.
- **Decisions get a D-number** in [`memory/DECISIONS.md`](memory/DECISIONS.md).
  Currently at D-062. Nothing architectural lands undocumented.
- **Update `memory/` and `CHANGELOG.md` as part of finishing**, not after.
- **Measure, don't estimate.** The handoff log is full of "browser-MEASURED",
  "ported the real scoring against the real JSON", "proven to fail when the fix
  is reverted". Match that bar, and say plainly when something *couldn't* be
  verified rather than letting a green suite imply it was.
- **Guard scripts are plain `tsx`, no test runner** — mirror
  `scripts/check-dex-matcher.ts`. A new guard should be proven to fail when its
  fix is reverted.

## Traps that have already cost time

- **Writing files with Python on Windows converts LF to CRLF**, which turns a
  three-line edit into a whole-file diff. Pass `newline=''`, or normalise
  afterwards.
- **The dev server holds a lock on `.next`** — stop it before `npm run build`,
  or the build fails with no useful error.
- **`apps/web/.env.local` vs the repo-root `.env.local`.** `next dev` runs in
  `apps/web` and reads only the former; the six Dex v2 vars live in the latter,
  so Dex v2 is inert in local dev until you copy them across.
- **The admin never reads through `contentService`** — it queries Drizzle
  directly. That is the seam the public-only typography normalization relies
  on; don't collapse it.
- **Fail-closed guardrails hide misconfiguration.** Dex v2's LLM path was off
  in production for weeks and nothing looked broken, because every guard
  degraded exactly as designed. When you add one, log *why* it fired.

## Owner preferences

Do a real exploration pass before starting a new engineering lane, summarise
back, and wait for a go-ahead before writing code — even when a handoff doc
suggests a "recommended next step".

**Dex / AI-employee boundaries, permanent unless Deepak says otherwise:**
owner-provided exports only. No Gmail, no saved credentials, no DMs, and never
auto-publish without review.
