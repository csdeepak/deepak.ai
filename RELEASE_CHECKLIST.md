# Release Checklist — Landing V2 (Tier 0 to production)

> The exact remaining **human gates** and the **deploy sequence** for
> shipping the Tier 0 landing to production. Engineering readiness is
> done; what remains is content, sign-off, and pulling the trigger.
>
> Tier 0 is the static, no-3D path — it can (and should) deploy before
> the full 3D hero exists. The 3D hero, the Twin, and Dex are deferred to
> v1.5 (see `memory/DECISIONS.md` D-040) and are **not** gating this
> release. `/dev/hero` stays dev-only (404s in production).

---

## Gate 1 — Content fill ⟨owner-only⟩

Replace every field in **`OWNER_CONTENT_CHECKLIST.md` Part 1** with real
copy in your voice. Until then the affected sections either self-hide
(honest) or show draft copy that has not passed R4.

- [ ] All Part 1 items written (identity headline, mission, domains,
      evidence, collaborate, contact, outbound, CV/currentFocus as
      desired).
- [ ] No `TODO(copy)` / `TODO(asset)` markers remain in
      `apps/web/content/site.ts`.
      Verify: `grep -rn "TODO(copy)\|TODO(asset)" apps/web/content apps/web/src`
      returns nothing.

## Gate 2 — R4 copy tests ⟨owner-only⟩

Source: `specs/landing.md` §6.5, D-027. Applies to every headline /
identity line flagged ⟨R4⟩ in the content checklist.

- [ ] **10-second test** passed on the identity headline (Arrival `<h1>`)
      and the mission statement — an unfamiliar reader can say what you do.
- [ ] **Read-aloud test** passed on all ⟨R4⟩ lines — nothing makes you
      cringe or stumble.
- [ ] Banned-vocabulary sweep: none of *passionate / journey / seamless /
      blazing / revolutionary / cutting-edge / leverage(v) / ninja /
      rockstar / guru / "let's build something amazing"* appears.
      (Re-check the Collaborate heading specifically.)

## Gate 3 — The ASMOS memory is real ⚠ DEPLOY-BLOCKING

The `/memory` slice ships a **draft scaffold** that must be replaced
before any deploy (`OWNER_CONTENT_CHECKLIST.md` items 12–13).

- [ ] `apps/web/content/asmos.ts` holds your **real** ASMOS content
      (gist, stages, Dex Q&A) — no fabricated metrics, venues, or dates;
      abandoned branches are real (LAW-004).
- [ ] `draft: true` flipped to `draft: false` (`asmos.ts` line 180).
- [ ] Every `memoryNodes` entry is real work; no node is
      `reconstructable: true` without real content behind it.

## Gate 4 — Visual / spacing look-dev sign-off ⟨owner-only⟩

- [ ] `/` reviewed at mobile + desktop widths: rhythm, negative space
      (≥55% at rest, docs/24), and the scene's calm-at-rest behavior read
      as intended.
- [ ] Light ("Paper") and dark (default) both sign off — dark is the
      identity, light is a first-class equal (D-039).
- [ ] Reduced-motion pass: with `prefers-reduced-motion` on, the scene
      falls to its still/station state and the page loses no meaning.

---

## Engineering readiness — already GREEN (re-verify before deploy)

These were verified this sprint; re-run them on the release commit.

- [ ] `npm run typecheck` — clean.
- [ ] `npm run build` — clean, **zero warnings**, all routes static.
- [ ] **three.js absent from First Load JS** (release criterion):
      ```bash
      cd apps/web && npm run build
      node -e 'const fs=require("fs"),cp=require("child_process");
        const m=JSON.parse(fs.readFileSync(".next/app-build-manifest.json","utf8"));
        const home=m.pages["/(site)/page"]||[];
        const three=cp.execSync("grep -rl WebGLRenderer .next/static/chunks || true").toString().trim().split(/\s+/).filter(Boolean).map(p=>p.replace(/^\.next\//,""));
        const leak=home.filter(c=>three.includes(c));
        console.log(leak.length===0?"three.js absent from / First Load JS ✓":"LEAK: "+leak);'
      ```
- [ ] `/` First Load JS within budget (~152 kB baseline; treat a jump as a
      regression to investigate before shipping).
- [ ] Global nav / footer show only built routes — nothing 404s from
      chrome (driven by `BUILT_ROUTES` in `apps/web/src/constants/routes.ts`).

---

## Deploy sequence

> The concrete vendor commands are defined in **`docs/10-DEPLOYMENT.md`**
> and the `apps/web` README (authored in the deployment phase — D-041).
> Once Gates 1–4 pass and engineering is green, follow that document's
> "first deploy" steps. High-level order:

1. Merge the release branch to `main` (CI runs typecheck + build + the
   three.js check on `main`).
2. Confirm the CI pipeline is green.
3. Trigger the first production deploy per `docs/10-DEPLOYMENT.md`
   (**owner triggers the first deploy** — it is not automated on your
   behalf).
4. Smoke-test production: `/` renders, LCP is the headline text, nav/footer
   have no dead links, `/memory` reconstructs, theme toggle works, and
   `/dev/hero` returns 404.
5. Point external profiles (GitHub / Scholar / LinkedIn) at the live site.

---

*Nothing on this page is automated for you. The gates are yours; the first
deploy is yours to trigger.*
