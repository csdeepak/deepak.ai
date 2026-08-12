# V2 Landing Redesign — Session Handoff, 2026-08-13

This is a self-contained continuation brief. Read this before touching code.
If you're a fresh session with no prior context on this conversation, this
file plus `docs/30-V2-LANDING-REDESIGN.md` is everything you need.

---

## Start here

You are continuing **V2**, a restructure of the landing page (Posts, Timeline,
Gallery re-enable) plus two hero-scene defects the owner reported. The plan,
written 2026-08-12, lives at **`docs/30-V2-LANDING-REDESIGN.md`** — read its
§1–§3 before doing anything. This handoff tells you exactly where execution
against that plan currently stands and what to do next; it does not repeat
the full plan.

**Do not restart from scratch. Do not re-litigate decisions already made and
verified in `memory/DECISIONS.md` D-058.**

## Current reality (verify before trusting older docs)

- **Deployed on Vercel**, not Render. Database is **Neon** Postgres. Object
  storage is **Cloudflare R2**. `render.yaml`, `docs/DEPLOY_RUNBOOK.md`, and
  older `memory/` entries above the 2026-08-13 line still describe Render —
  that is stale, not current. Reconciling those docs is V2 Phase G, not
  started.
- Branch: `main`. Everything in this handoff is committed and pushed there.
- Before this V2 work started this same session, two live Vercel deploy bugs
  were found and fixed (commits `153aa63`, `d860371`): a doubled
  `outputDirectory` path in `vercel.json`, and `generateStaticParams` failing
  the whole build when Postgres was unreachable at build time. Both fixed;
  not expected to recur, but if a deploy ever fails with "output directory
  not found" or "Failed to collect page data," read those two commits first.

## What is actually done (V2 Phase A + B)

Full reasoning, every measurement, and the wrong hypotheses ruled out along
the way: **`memory/DECISIONS.md` → `## D-058`**. Summary:

**Phase A — hero didn't render on mobile. DONE, owner-confirmed on a real
device.**
Commits `c9ffa79`, `9701128`, `1e2be0d`, `1bb9a1c`. Root cause was not the
`svh`/`vh` hypothesis in the original plan — it was `failIfMajorPerformanceCaveat: true`
false-rejecting real mobile GPUs, plus the mobile surface portrait rendering
at ~10% of desktop's visual density (arithmetic, not broken). Fixed
iteratively against real-device evidence via a `?herodebug=1` overlay (still
in the code — visit `<site>/?herodebug=1` on any device to self-diagnose the
tier decision).

**Phase B — guided flight showed skills instead of projects, no order, too
fast. DONE, structurally verified, feel not yet re-confirmed.**
Commits `518b0df`, `04af8a8`. The rail now walks projects chronologically
(by `content_items.publishedAt`) instead of nearest-neighbour-by-distance;
labels are restricted to projects plus two named bookend skill nodes
(`Data Structures & Algorithms` / `Operating Systems`); skill vocabulary is
now real, owner-provided data (`HERO_SKILL_ADDITIONS` /
`FOUNDATIONAL_SKILLS` / `GENERAL_AI_SKILLS` in
`apps/web/scripts/enrich-hero-network.ts`); dwell/pacing went through two
rounds after the owner reported the first attempt still too fast, the
second measured at +92% total rail arc length.

**⚠️ Immediate next step, before anything else:** the owner has not yet
confirmed in-browser that the *second* dwell pass actually feels right, or
that the ambient-glow brightness increase (also in `04af8a8`) looks correct.
Ask for that confirmation before starting a new phase. If they report it's
still off, **do not guess again** — read D-058's Phase B section 5–6 first;
it explains exactly what was tried and measured, so the next adjustment can
build on real numbers instead of repeating a guess.

## What is not done

Nothing else in `docs/30` has been started:

- **Phase C (Posts data + admin CRUD).** `/admin/posts` is a genuine stub —
  it literally renders the text "Posts editor — ships in the next sprint."
  `/admin/posts/new` 404s. There is no `actions/posts.ts`. This is the
  biggest remaining chunk of V2 — a real build, not a wire-up.
- **Phase D (Posts on landing + `/posts`).** Depends on C.
- **Phase E (Timeline section).** Blocked: the owner said they'd share a
  reference image for the visual design (Open Question 8 in `docs/30`) —
  check whether that's arrived before starting.
- **Phase F (Gallery re-enable).** Blocked on an owner copy pass (alt text,
  captions) — not engineering work. `/gallery` currently 404s in production
  on purpose.
- **Phase G (docs reconciliation).** Render → Vercel, whenever convenient.

Recommended order remains A→B→C→D→E→F→G per `docs/30` §3. B is functionally
done pending the confirmation above, so **C is very likely the next real
phase** unless the owner has since sent the Timeline reference image.

## Hard-won gotchas from this session — read before repeating them

1. **This session's browser pane does not reliably composite frames when
   backgrounded.** Screenshots time out, and — more seriously —
   `IntersectionObserver` never fires on a non-rendering tab, which can make
   a perfectly working mount look completely broken. This was confirmed by
   reproducing an apparent "the hero never mounts, on any tier, even
   desktop" failure on **unmodified `main`** via `git stash`, before
   concluding it was the test harness, not the code. **Do not trust a
   negative result from this browser tool for hero-scene motion/mount
   behaviour.** Use the `?herodebug=1` overlay and ask the owner to check on
   a real device instead.
2. **Never run a production build (`npm run build`) while a dev server is
   running.** It corrupts `.next` and produces confusing stale-state
   failures — this has happened multiple times across this project's
   history. Always `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000`
   first; if you get a response, stop the dev server before building.
3. **Verify every rail/motion change by direct measurement, not estimation.**
   Twice this session a hand-estimate would have been wrong or incomplete:
   the dwell-arc-length calculation needed a real script against the actual
   dataset to get right, and that same script caught a real ~9%
   smoothness-ceiling violation that "looked fine" by eye. Write a small
   Node script against the real `hero-face-3d.json`/`content/site.ts` data
   rather than reasoning it out on paper.
4. **`hero-face-3d.json`'s `meta` fields (e.g. `mobileCount`) can be
   hand-patched directly** with a plain string replace — the position/
   brightness arrays for all nodes are always fully embedded regardless of
   what `mobileCount` says; it's purely a client-side slice threshold. No
   need to run the full photo pipeline (`hero:generate`) for a metadata-only
   change. Verify the byte-length delta is 0 (or expected) after patching.
5. **`npm run hero:enrich`** (not `hero:generate`) rebuilds `network`/`inner`
   from `content/site.ts` project data — cheap, fast, does not touch the
   face surface. Re-run this after any change to `enrich-hero-network.ts` or
   to a project's `tags`/`publishedAt` in `content/site.ts`.
6. **Long shell heredocs with lots of unicode/punctuation (em-dashes, →, ↔,
   ², smart quotes) can fail to parse** through this tool's command
   wrapping ("unexpected EOF" errors) even when correctly quoted. Prefer the
   `Edit` tool for large prose blocks with special characters over
   `bash <<'EOF'` heredocs.
7. **A doc that states an exact numeric value (not just a description) is a
   ratified spec, and must be updated when the code changes.**
   `docs/DESIGN_SYSTEM.md` documented the ambient-glow opacity as an exact
   "~12–15%" — when that value changed in code, the doc was updated in the
   same commit. This project has already been bitten once by doc/code drift
   (the Render/Vercel deploy docs); don't add to it.

## Verification commands (all still valid, unchanged)

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

Current bundle numbers (as of `04af8a8`): `/` First Load JS ≈151.7 kB (≤170 kB
budget), `hero-face-3d.json` ≈45.5 kB gz (≤160 kB budget). Both have healthy
headroom for Phases C–F, but re-check after each phase per `docs/30` §5.

## Files most relevant to continuing this work

- `docs/30-V2-LANDING-REDESIGN.md` — the plan, sequencing, acceptance gates,
  open questions, progress log. **The source of truth for what to do next.**
- `memory/DECISIONS.md` → `D-058` — the full reasoning and every measurement
  behind Phase A/B, including ruled-out hypotheses.
- `apps/web/src/features/hero-scene/gate.ts` — tier decision + `?herodebug=1`
  diagnostics.
- `apps/web/src/features/hero-scene/neural-face/NeuralFace3DScene.tsx` — the
  guided rail (`buildFlightRail`, `nearestNeighbourWalk`), label logic
  (`updateLabels`), ambient glow shader.
- `apps/web/scripts/enrich-hero-network.ts` — skill vocabulary
  (`HERO_SKILL_ADDITIONS`/`FOUNDATIONAL_SKILLS`/`GENERAL_AI_SKILLS`),
  `publishedAt` threading.
- `apps/web/src/app/(admin)/admin/posts/page.tsx` — the stub Phase C
  replaces.
- `apps/web/src/features/admin/actions/projects.ts` — the CRUD pattern
  Phase C's `actions/posts.ts` should follow (create/save/publish/unpublish/
  schedule/restoreVersion, CTI write pattern, `content_versions` snapshots).

## One-shot prompt for a new session

```text
Read memory/V2_LANDING_SESSION_HANDOFF_2026-08-13.md first, then
docs/30-V2-LANDING-REDESIGN.md. Continue V2 on branch main. Do not restart —
Phase A is done and owner-confirmed; Phase B is done and structurally
verified but needs the owner's in-browser confirmation on the second dwell
pass and the glow brightness before you touch hero-scene code again. If
that's confirmed, the next real work is Phase C (Posts data model + admin
CRUD — /admin/posts is currently a stub). Ask the owner which phase they
want before starting.
```
