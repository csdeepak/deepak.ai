# Known Limitations

> Known gaps, constraints, and open risks. Keep this honest and current so no one is surprised.
>
> **Last reviewed:** 2026-09-18.

This file had drifted badly — until this review it still read "No application
code exists. Tech stack undecided. Product scope undefined." for a site that is
deployed, has a working admin CMS, and serves real content. It was the one
memory file that would actively mislead a fresh session, which is the opposite
of its job.

## Current Limitations

| # | Limitation | Impact | Notes |
| --- | --- | --- | --- |
| 1 | **Dex v2's LLM path does not run in production.** The Turnstile widget renders but never produces a token, so every question fails closed to the v1 cached matcher. | Dex answers are the older lexical-match quality, on every page. | Diagnosed 2026-09-18: the sitekey is set and Cloudflare is reached, but the challenge never completes. Top suspect is the hostname allowlist (`docs/32` Step 4) — owner-side, needs the Cloudflare dashboard. The error code is now logged to the console to identify it. |
| 2 | Only four public routes exist: `/`, `/projects`, `/posts`, `/gallery` (+ detail pages). | `/about`, `/research`, `/publications`, `/timeline`, `/skills`, `/contact`, `/search` are specified but unbuilt. | Correctly hidden via `BUILT_ROUTES` — nothing 404s. The nav is two lanes as a result. |
| 3 | No CV is published. `siteContent.cvUrl` is `null`. | The single most common recruiter action — download the CV — is unavailable. `Collaborate` offers email only. | Owner content decision, not an engineering gap. |
| 4 | Dex's curated corpus has real recruiter-facing holes. | Internships, availability, notice period, relocation, graduation date, open source, certifications, cloud/CI-CD experience are absent entirely. | `docs/31` §7.2. Phase 4 now threads live projects and posts in, which closes the "what has he built lately" half but not these. Deliberately absent and should stay absent: salary, visa, anything personal. |
| 5 | Gallery photos have empty `alt`/`caption`/`info`/`place`. | Tiles announce as "Open photo g03" to a screen reader. | It self-hides rather than fabricating labels (LAW-008), but an owner copy pass is needed. `specs/gallery.md` §9. |
| 6 | Gallery photo IDs are positional (`g01…gNN` by sorted filename). | Inserting an earlier-sorting photo silently renumbers the set and breaks `/gallery#g03` deep links. | Needs an owner ruling — `specs/gallery.md` §9. |
| 7 | Three font families ship (~132 KB): Inter, Inter Tight, JetBrains Mono. | JetBrains Mono alone is ~48 KB and sets only micro-labels and eyebrows. | Measured on production 2026-09-18. Subsetting or dropping one is the cheapest remaining page-weight win. |
| 8 | `/projects` has no filtering or sorting. | Fine at six projects; will not be at twenty. | Tags now render on the cards (D-061), so filtering is the natural next step once the corpus grows. |
| 9 | Local dev cannot exercise Dex v2 without setup. | `npm run dev` renders no Turnstile widget and `getDexLlmConfig()` returns null. | The six v2 vars live in the **repo-root** `.env.local`, but `next dev` runs in `apps/web` and reads `apps/web/.env.local`. Copy them across, or load the root file from `next.config.ts`. |
| 10 | The `develop` branch is 122 commits behind `main` and untouched since the initial commit. | `CONTRIBUTING.md` describes a Git Flow model the project does not actually follow. | Either revive `develop` or amend `CONTRIBUTING.md` to match reality: feature branch → PR → `main`. |
| 11 | License is provisional ("All Rights Reserved"). | May change before public release. | Unchanged from the original entry. |

## Open Risks

- **Documentation drift.** This file is the proof it happens. The update protocol in [`AI_HANDOFF.md`](AI_HANDOFF.md) exists precisely to prevent it and was not followed here for roughly a year of work.
- **Silent degradation.** Limitation #1 is the pattern to watch: every Dex guardrail failed closed exactly as designed, so the product looked healthy while its best path was off. Fail-closed behaviour hides misconfiguration — anything that degrades silently needs a log line or a guard, not just correct behaviour.
- **Scope creep** for a "Personal Operating System" — keep priorities disciplined.
- **Single maintainer.** Every recurring cost must justify itself or be cut (product principle #5).

_Update this file whenever a limitation is added, resolved, or changes impact._
