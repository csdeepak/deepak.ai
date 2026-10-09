# Known Limitations

> Known gaps, constraints, and open risks. Keep this honest and current so no one is surprised.
>
> **Last reviewed:** 2026-10-10 (D-071).

This file had drifted badly — until this review it still read "No application
code exists. Tech stack undecided. Product scope undefined." for a site that is
deployed, has a working admin CMS, and serves real content. It was the one
memory file that would actively mislead a fresh session, which is the opposite
of its job.

## Current Limitations

| # | Limitation | Impact | Notes |
| --- | --- | --- | --- |
| 1 | **Dex v2's LLM path does not run in production.** The Turnstile widget renders but never produces a token, so every question fails closed to the v1 cached matcher. | Dex answers are the older lexical-match quality, on every page. | Diagnosed 2026-09-18: the sitekey is set and Cloudflare is reached, but the challenge never completes. Top suspect is the hostname allowlist (`docs/32` Step 4) — owner-side, needs the Cloudflare dashboard. The error code is now logged to the console to identify it. |
| 2 | **`/timeline` and `/publications` render empty in production** (measured 2026-10-10), though `content/site.ts` holds the three roles and the survey paper. | The two shelves a recruiter checks first — experience and research — look empty. | Production reads Neon; public pages are static and refresh only on deploy or an admin `revalidatePath`, and `db-ingest` does neither. Owner: ingest (or create rows in the admin), then redeploy. The ingest upserts every project, so it overwrites admin edits. D-071. |
| 3 | **The public CV carries retired figures** ("502 tests", "97.7M"), and says ASMOS 23.84% where the site says about 22%. | The most-downloaded recruiter artifact disagrees with the site and with the owner's own profile. | It is a Sep 19 build of the resume system. Regenerate there and copy over `public/cv-c-s-deepak.pdf`; `check:profile` stays red until then. D-071. |
| 4 | **`check:profile` is local-only.** | CI cannot catch drift from the canonical profile. | By design: the profile is private (phone, SRN, notes) and never enters this repo. On CI the guard prints SKIP. Run it before shipping content. |
| 5 | **No visitor analytics.** | No page views, referrers or device mix, so no design change can be judged by outcome. `docs/02` lists privacy-respecting aggregate analytics as a requirement. | Owner decision: Vercel Web Analytics (cookieless, aggregate) needs a dashboard toggle. Dex's own question and intake logs are the only behavioural data today. |
| 6 | Dex's curated corpus has real recruiter-facing holes. | Availability, notice period, relocation, certifications are absent. | `docs/31` §7.2. Deliberately absent and should stay absent: salary, visa, anything personal. Two live-battery cases fail on `main` and on D-071 alike ("working on lately" phrasing pair, "what's he bad at"). |
| 7 | Gallery photos have empty `alt`/`caption`/`info`/`place`. | Tiles announce as "Open photo g03" to a screen reader. | It self-hides rather than fabricating labels (LAW-008), but an owner copy pass is needed. `specs/gallery.md` §9. |
| 8 | Gallery photo IDs are positional (`g01…gNN` by sorted filename). | Inserting an earlier-sorting photo silently renumbers the set and breaks `/gallery#g03` deep links. | Needs an owner ruling — `specs/gallery.md` §9. |
| 9 | Every page shares one Open Graph image. | Link previews now carry the right title, URL and description (D-071), but the same picture. | Per-page images via `opengraph-image` are the next step. |
| 10 | Production content that file edits cannot reach. | D-071's HandCode/Dental corrections and the PESU Vault URL fix ship only in `site.ts` and the Dex corpus until ingested; a post lives at `/posts/-`; one title reads "Summer Intership". | Owner, via the admin or the ingest. |
| 11 | `THREE.Clock` deprecation warning on `/`. | One console warning from inside the 3D stack. | Comes from three.js / R3F internals, not app code; clears with a dependency upgrade. |
| 12 | Local dev cannot exercise Dex v2 without setup. | `npm run dev` renders no Turnstile widget and `getDexLlmConfig()` returns null. | The six v2 vars live in the **repo-root** `.env.local`, but `next dev` runs in `apps/web` and reads `apps/web/.env.local`. Copy them across, or load the root file from `next.config.ts`. |
| 13 | License is provisional ("All Rights Reserved"). | May change before public release. | Unchanged from the original entry. |

Resolved since the last review: the CV now exists (D-068); `/about`,
`/skills`, `/publications` and `/timeline` are built (D-063–D-065); `/projects`
filters by tag (D-067); the font-weight item was withdrawn as not a real win
(D-067); `CONTRIBUTING.md` describes the real branch workflow (D-067); the
phone nav overflow, the AA contrast failures and the favicon 404 (D-071).

## Open Risks

- **Documentation drift.** This file is the proof it happens. The update protocol in [`AI_HANDOFF.md`](AI_HANDOFF.md) exists precisely to prevent it and was not followed here for roughly a year of work.
- **Silent degradation.** Limitation #1 is the pattern to watch: every Dex guardrail failed closed exactly as designed, so the product looked healthy while its best path was off. Fail-closed behaviour hides misconfiguration — anything that degrades silently needs a log line or a guard, not just correct behaviour.
- **Scope creep** for a "Personal Operating System" — keep priorities disciplined.
- **Single maintainer.** Every recurring cost must justify itself or be cut (product principle #5).

_Update this file whenever a limitation is added, resolved, or changes impact._
