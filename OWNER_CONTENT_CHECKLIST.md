# Owner Content Checklist — Landing V2

> **Who this is for:** Deepak (owner). This is the single, ordered list of
> every piece of copy or asset you must write before the Tier 0 site can
> deploy. Work top to bottom — items are ordered release-blocking first.
>
> **The law that makes this a checklist and not pre-filled text
> (LAW-008 / No-Fake-Data):** *An empty shelf beats a fabricated one.* No
> placeholder copy was written into your content for you. Every field
> below is either empty (self-hiding) or an honest structural draft you
> must confirm in your own voice. Nothing here is a fabricated claim.
>
> **Where copy lives today:** most landing copy is in
> `apps/web/content/site.ts` (the owner-editable content file). A few
> landing headlines are still authored inline in the section components
> (noted per-item with exact line refs) until the CMS lands — you edit
> them in place.

---

## How to pass each copy field (the R4 release protocol)

Source: `specs/landing.md` §6.5, D-027. Every headline / identity line
must pass **both** before it ships:

1. **The 10-second test.** Show the top of the page to someone unfamiliar
   for 10 seconds, then hide it. Can they say what you do? If not, the
   line is too clever or too vague.
2. **The read-aloud test.** Read it out loud. If you stumble, soften a
   consonant cluster, or feel a cringe — rewrite it. It must sound like
   you talking, not like marketing.

### Voice constraints (docs/24 §18 · brand voice — apply to every item)

- **Declarative, first-person where personal, plain everywhere.**
- **Present tense** — the site is an instrument that is *running now*, not
  a résumé of the past ("I build…", not "I have built…").
- **Precise counts, never vague quantities** — "6 publications," never
  "several papers." If you don't have the count yet, the section stays
  empty (it self-hides).
- **The instrument never brags** (docs/24 §0.3, law 7). State what is
  true; let the work carry the weight.
- **Banned vocabulary — do not use, anywhere:** *passionate · journey ·
  seamless · blazing · revolutionary · cutting-edge · leverage (as a
  verb) · ninja / rockstar / guru · "let's build something amazing."*
- **Measure:** headlines read best at ~45–75 characters.

---

## Part 1 — Landing copy (blocks the Landing V2 release)

### 1. The identity headline — the single most important line ⟨R4⟩

- **File + line:** `apps/web/src/features/landing/sections/arrival.tsx`
  **lines 38–41** (the public, LCP `<h1>`), currently:
  *"I build intelligent systems. / And I publish the research behind
  them."*
- **What it's for:** the first thing every evaluator reads; it *is* the
  90-second brief's opening (LAW-009) and the page's LCP element.
- **Constraints:** present tense, ≤ ~12 words across the two lines, plain,
  no banned vocabulary. **Must pass the R4 10-second + read-aloud tests.**
- **Guiding question:** *If a hiring manager read only this line and
  nothing else, what is the one true thing about you they must leave
  with?*
- **⚠ Note (wiring divergence to resolve):** `site.ts` also has an
  `identitySentence` field (item 2) that currently feeds **only** the
  `/dev/hero` Tier-0 preview, **not** this public headline. Decide whether
  these two should say the same thing. If yes, tell the engineer to wire
  the Arrival `<h1>` to `site.ts` so there is one source of truth; until
  then, **edit both** so they agree.

### 2. `identitySentence` (metadata + Tier-0 preview) ⟨R4⟩

- **File + line:** `apps/web/content/site.ts` **line 22–23**.
- **What it's for:** the one-sentence identity string. Feeds the
  `/dev/hero` Tier-0 preview headline today; the natural home for your
  SEO / social-share identity line.
- **Constraints:** one sentence, present tense, plain, no banned vocab.
  R4 tests apply.
- **Guiding question:** *In one breath, what do you do and why does it
  matter — with no adjectives?*

### 3. `mission.statement` — the beat that makes them stop scrolling ⟨R4⟩

- **File + line:** `apps/web/content/site.ts` **lines 55–57** (`mission`
  object). Rendered by `mission.tsx`.
- **What it's for:** the landing's memorable core — *what you are building
  and why you are different*, as one confident editorial sentence (not a
  feature list).
- **Constraints:** 1–2 sentences, present/future tense, declarative, no
  bragging, no banned vocab. This is large display type — every word is
  visible.
- **Guiding question:** *What do you believe about AI engineering that
  most people building it don't yet act on — and how does your work
  embody that belief?*

### 4. `mission.pillars[]` — the three supports (Build · Research · Explain)

- **File + line:** `apps/web/content/site.ts` **lines 58–62**.
- **What it's for:** three one-line proofs of the mission statement.
- **Constraints:** each `body` ≤ ~10 words, parallel grammar, concrete.
  Keep or rename the three `label`s — but three is the count the layout
  expects.
- **Guiding question:** *For each of Build / Research / Explain, what is
  the single sharpest true sentence that proves you do it?*

### 5. `domains[]` — the intellectual territory (Evidence section)

- **File + line:** `apps/web/content/site.ts` **lines 70–77**. Rendered by
  `evidence.tsx`.
- **What it's for:** the *fields your work lives in* (real focus areas,
  **not** projects and **not** results). Six today.
- **Constraints:** each `note` is a short lowercase descriptor of the
  field, never a claimed outcome or metric. Add/remove freely — the list
  self-sizes. If a domain isn't genuinely yours, cut it.
- **Guiding question:** *Which areas would you be comfortable being
  questioned on for an hour by an expert? Those are your domains — no
  aspirational ones.*

### 6. Evidence section copy (headings + honest status line) ⟨R4 on the H2⟩

- **File + lines:** `apps/web/src/features/landing/sections/evidence.tsx`
  — kicker **line 27** ("The work"), **H2 lines 33–34** ("The territory:
  …"), status line **lines 58–60** ("The systems and papers are being
  documented here — this is where they will live.").
- **What it's for:** frames the domains and sets an honest expectation
  that the work is *being documented here*.
- **Constraints:** the status line must stay honest — it promises the work
  will live here; keep it true. Plain, present tense.
- **Guiding question:** *What is the most honest one-line promise you can
  make about what a curious visitor will find here as it fills in?*

### 7. Collaborate close — heading + `contactSentence` + `contactEmail`

- **File + lines:**
  - Heading — `apps/web/src/features/landing/sections/collaborate.tsx`
    **line 24** ("Let's build something worth understanding.") ⟨R4⟩
  - `contactSentence` — `apps/web/content/site.ts` **lines 38–40**
    (what's-welcome sentence).
  - `contactEmail` — `apps/web/content/site.ts` **line 35** (currently
    `null` → the email block self-hides until filled).
- **What it's for:** the page's final breath — one honest invitation, one
  real action (the email is both copyable and a `mailto:` link).
- **Constraints:** the heading must not use "let's build something
  amazing" (banned) — the current draft is close to that pattern, so give
  it a read-aloud pass. `contactSentence` = one honest sentence about what
  is genuinely welcome. `contactEmail` = a real address you check.
- **Guiding question:** *What kind of message would you actually be glad
  to receive — and what should someone know before sending it?*

### 8. `currentFocus` — what you're working on right now (optional, R5-gated)

- **File + line:** `apps/web/content/site.ts` **line 30**
  (`{ phrase, updatedAt } | null`). Feeds the `/dev/hero` Tier-0 preview.
- **What it's for:** a single "currently…" line. **Self-hides when
  `null`, and the freshness stamp only renders while ≤ 30 days old (R5)** —
  so leaving it `null` is honest if you won't keep it fresh.
- **Constraints:** `phrase` = one present-tense clause; `updatedAt` = an
  ISO date (`"2026-07-11"`). Only fill this if you will update it.
- **Guiding question:** *Is there one thing you're actively working on
  this month that you'll remember to refresh? If not, leave it empty.*

### 9. `outbound` links — GitHub · Scholar · LinkedIn

- **File + lines:** `apps/web/content/site.ts` **lines 42–46**. Rendered
  in `evidence.tsx` (trust seeds) and `footer.tsx` — **each link appears
  only when its URL is filled** (graceful absence).
- **What it's for:** the real external profiles that corroborate the work.
- **Constraints:** full `https://` profile URLs, or leave `null`. Never a
  placeholder or a profile that isn't really yours.
- **Guiding question:** *Which of your external profiles is current enough
  that you'd want an evaluator to land on it today?*

### 10. `cvUrl` — the CV asset (optional)

- **File + line:** `apps/web/content/site.ts` **line 33** (`null` hides the
  CV CTA). Consumed by the Tier-0 hero.
- **What it's for:** links a downloadable CV. The CTA self-hides until a
  real file exists.
- **Constraints:** drop the file in `apps/web/public/` and set `cvUrl` to
  its path (e.g. `"/deepak-cv.pdf"`). No stub file.
- **Guiding question:** *Is your CV current enough to be the canonical
  copy? If not, leave it `null` — an absent CV beats a stale one.*

### 11. Arrival scroll sub-lines (`ACT_LINE`) — the choreographed captions

- **File + lines:** `apps/web/src/features/landing/sections/arrival.tsx`
  **lines 19–25** (five lines, keyed to scene acts 0–4).
- **What it's for:** the sub-line under the headline that changes as the
  camera travels the scene rail — it makes the pinned first screen read as
  progression. Line 4 references **Dex** ("soon you'll be able to ask it
  anything about the work").
- **Constraints:** short (≤ ~46 chars each), present tense, calm. **The
  Twin ≠ Dex** — line 4 is about *Dex* (the AI), not the Twin (the 3D
  figure); keep that correct. Only the Dex line makes a future promise —
  keep it honest ("soon"/"will").
- **Guiding question:** *As the camera moves from your current work out to
  the research and then to Dex, what quiet one-line narration fits each
  step?*

---

## Part 1b — Project content (the `/projects` Work pages)

The `/projects` index and detail pages are built and live, reading the
`projects` array in `apps/web/content/site.ts` (empty today → the index
shows an honest empty state, which is correct). When you add a real
project, each entry is a `Project` object with these **content** fields:

### P1. `question` — REQUIRED per project ⚠ (LAW-003)

- **Where:** each object in `projects` (`apps/web/content/site.ts`), field
  `question`. Rendered as the detail page's lead section ("The question
  that created it").
- **The rule:** *every artifact answers "what question created me?"* — a
  real project **without a `question` is not publishable.** This is
  distinct from `problem` (what it solves); the question is what caused it
  to exist.
- **Guiding question:** *What were you actually trying to find out or make
  possible when this project started — phrased as a question?*

### P2. `abandonedBranches` — optional but expected (LAW-004)

- **Where:** each project's `abandonedBranches?: { tried, whyAbandoned,
  learned }[]`. Rendered as the "Abandoned branches" section; **empty or
  absent = the section self-hides** (honest, LAW-008).
- **The rule:** *every conclusion exposes its abandoned branches.* Failure
  is first-class. Keep the real dead ends — do not sanitize them away, and
  do not invent them either.
- **Guiding question:** *What did you try that didn't work, why did you
  drop it, and what did that teach you?*

### P3. The rest of each project

- `title`, `problem` (one-line), `year`, `projectStatus` (`active` /
  `archived`), `tags`, `featured`, optional `repoUrl`, and typed
  `relations` (evidence links — only relations to **built** pages render;
  the rest self-hide, so no dead links). No fabricated metrics or counts.
- **Guiding question:** *Is every field here something you can stand
  behind as true today? If not, leave it out — empty beats invented.*

> Note on schema: `question` + `abandonedBranches` were added additively
> this sprint (D-042); the full Project↔Memory content-model convergence
> is deferred to the docs/09 database sprint.

---

## Part 2 — The ASMOS memory (blocks deploy — see RELEASE_CHECKLIST.md)

### 12. Replace the ASMOS draft scaffold with your real content ⚠ DEPLOY-BLOCKING

- **File:** `apps/web/content/asmos.ts` (flagged `draft: true`,
  line 180; header warning lines 1–10).
- **What it's for:** the one fully-reconstructable memory in the `/memory`
  vertical slice — it proves the Question → Hypothesis → Experiments →
  Abandoned branches → Architecture → Results → Publication → Future
  spine (LAW-003, LAW-004). The current text is a *representative
  thinking-shape*, not your real words.
- **Constraints (honesty spine, docs/26 §9):**
  - Every stage (`gist`, `stages[]`, `dex[]`) must become **your real
    ASMOS content**, in your voice.
  - **No fabricated metric, benchmark, result, venue, or date.** The
    `results` and `publication` stages must stay honest in-progress states
    until they are genuinely real — do not invent numbers or a citation.
  - Keep the **abandoned branches** real (LAW-004) — the dead ends are
    where the design actually happened; they are required, not optional.
  - When the content is real, set `draft: false` (line 180).
- **Guiding question:** *Tell the true story of ASMOS the way you'd tell a
  fellow researcher: what question started it, what you tried, what
  failed, where it actually stands today — with nothing rounded up.*

### 13. The memory graph seeds (`memoryNodes` / `memoryEdges`)

- **File + lines:** `apps/web/content/asmos.ts` **lines 188–247**.
- **What it's for:** the semantic-memory graph for the slice. ASMOS is the
  one formed node; the others (ShortcutScore, Dental AI, etc.) are **real
  but undocumented** — shown honestly as `unformed` (`reconstructable:
  false`), never faked into detail.
- **Constraints:** node labels must be real work of yours. Leave a node
  `unformed` until you actually write its memory — do not promote a node
  to `reconstructable: true` without real content behind it.
- **Guiding question:** *Which of these nodes are genuinely yours, and
  which one is next in line to become a fully-written memory?*

---

## Also worth a glance (not release-blocking)

- **`apps/web/src/config/site.ts` line 5–6** — `siteConfig.description`
  (the meta / social description). It's honest today; confirm it reads the
  way you want when the site is shared. (The `version` field there is
  cosmetic and maintained by the engineer.)

---

*When every Part 1 item passes R4 and Part 2 is real, return to
`RELEASE_CHECKLIST.md` for the human sign-off gates and the deploy
sequence.*
