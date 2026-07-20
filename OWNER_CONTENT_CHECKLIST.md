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

### 1. The identity headline — the single most important line ⟨R4⟩ — ✅ DONE

- **Status:** ✅ **Complete (owner-ratified).** The public LCP `<h1>` is now
  **wired to `site.ts.identitySentence`** — one source of truth (the earlier
  hardcoded-string divergence is resolved; the Arrival component holds no
  copy). Current value: *"Deepak learns and enjoy building intelligent
  systems."*
- **File:** rendered by `apps/web/src/features/landing/sections/arrival.tsx`;
  edited in `apps/web/content/site.ts` (`identitySentence`).
- **Constraint check:** present tense ✓ · length ✓ · banned vocabulary ✓.
  Two honest observations flagged to the owner (not auto-corrected): a
  subject-verb agreement in "learns and enjoy" and a first→third-person
  voice shift. See the session note / AI_HANDOFF for detail.

### 2. `identitySentence` + `identitySupport` (the hero identity block) ⟨R4⟩ — ✅ DONE

- **Status:** ✅ **Complete (owner-ratified).**
- **File:** `apps/web/content/site.ts` — `identitySentence` (the `<h1>`) and
  the new companion **`identitySupport`** (the supporting line beneath the
  heading; docs/24 assigns no named field, so this one was added). Both are
  single-sourced and self-hide if emptied (graceful absence).
- **`identitySupport` value:** *"An adaptive mind working across agentic AI,
  memory, and software engineering — documenting not just what he builds,
  but how he thinks, learns, and evolves."*
- **Constraint check:** present tense ✓ · length ✓ (supporting-line measure)
  · banned vocabulary ✓.

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

### 7. Collaborate close — heading + `contactSentence` + `contactEmail` — ✅ DONE

- **Status:** ✅ **Complete (owner-ratified).**
  - `contactEmail` = `csdeepak2005@gmail.com` (live `mailto:` + copy button).
  - `contactSentence` = *"Working toward full-time AI engineering — open to
    roles, collaborations, and good questions."*
  - Heading ("Let's build something worth understanding.") left as-is — it
    passes the read-aloud test; no banned vocab.
- **File + lines:**
  - Heading — `apps/web/src/features/landing/sections/collaborate.tsx`
    **line 24**.
  - `contactSentence` / `contactEmail` — `apps/web/content/site.ts`.

### 8. `currentFocus` — what you're working on right now (optional, R5-gated) — ✅ DONE

- **Status:** ✅ **Complete (owner-ratified).**
  - Value: *"Building AI automation with agentic systems — exploring how
    agents plan, act, and adapt across real workflows."* · `updatedAt:
    "2026-07-11"`.
  - **R5 gate status (reported):** the freshness stamp (the "updated Jul 11"
    text) renders only while ≤ 30 days old — currently fresh, expires
    2026-08-10. The phrase itself renders whenever non-null. Note:
    `currentFocus` is wired only in `hero.tsx` (the `/dev/hero` dev-only
    route, 404 in production); the V2 landing (`arrival.tsx`) does not
    render this field. It will need wiring in `arrival.tsx` if you want it
    visible on `/`.
- **File + line:** `apps/web/content/site.ts` (`currentFocus`).

### 9. `outbound` links — GitHub · Scholar · LinkedIn · X · Instagram — ✅ DONE

- **Status:** ✅ **Complete (owner-ratified).** Outbound set extended additively
  with `x` and `instagram` (docs/14 + docs/24 define no closed set; see
  session note in `AI_HANDOFF.md`).
  - `github` = `https://github.com/csdeepak`
  - `linkedin` = `https://www.linkedin.com/in/c-s-deepak-b1b41228b`
  - `x` = `https://x.com/CSDeepak08`
  - `instagram` = `https://www.instagram.com/deep_in.ai/`
  - `scholar` = `null` — no Scholar profile yet; **self-hides everywhere
    (LAW-008)** — verified in `evidence.tsx` and `footer.tsx`.
- **File:** `apps/web/content/site.ts` (`outbound` object). Rendered in
  `evidence.tsx` (trust seeds) + `footer.tsx`. All five fields use the
  graceful-absence pattern — each link appears only when its URL is filled.

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

All 18 projects are now in `apps/web/content/site.ts` as `status: "draft"`.
**Drafts are invisible on `/projects` and generate no public URLs.** The
index shows the designed EmptyState (honest — correct until real questions exist).

**Publishing flow:** write the `question` → set `status: "published"` in
`apps/web/content/site.ts` → the project appears on `/projects` and its
detail page becomes accessible. You can publish one at a time.

**The six FEATURED projects make `/projects` launch-ready — write these first.**

> **Optional enrichment (D-048, not launch-blocking):** in DB mode each project
> can now also carry a **cover image**, a **gallery**, **PDF attachments**
> (report/paper/poster), an **overview** (decisions & trade-offs body),
> **start/end dates**, **context**, **role**, **collaborators**, **outcomes**,
> **"What I learned"** takeaways, and **live/video links** — all edited in
> Admin → Projects, all self-hiding when empty. None of these are required to
> publish; the only publish gate is still the `question`. Media requires R2 to
> be configured (README → "Media / R2 setup").

---

### Featured projects — write these first ⭐

> Publishing any one of these makes `/projects` non-empty. Publishing all
> six gives the site a credible, curated Work section at launch.

#### asmos · ASMOS — Multi-Agent Memory Management System (2026-06)
- [ ] **question** — What question created it? (LAW-003, required to publish)
- [ ] **abandonedBranches** — What did you try that didn't work? (LAW-004, optional — self-hides if empty)

#### shortcutscore · ShortcutScore (2026-04)
- [ ] **question** — What question created it?
- [ ] **abandonedBranches** — optional

#### docksmith-engine · Docksmith Engine (2026-03)
- [ ] **question** — What question created it?
- [ ] **abandonedBranches** — optional

#### turb-detr · Turb-DETR (2026-02)
- [ ] **question** — What question created it?
- [ ] **abandonedBranches** — optional

#### pesu-vault · PESU Vault (2026-01)
- [ ] **question** — What question created it?
- [ ] **abandonedBranches** — optional

#### dental-ai-pipeline · Dental AI Pipeline (2025-10 → 2026-05)
- [ ] **question** — What question created it?
- [ ] **abandonedBranches** — optional

---

### Remaining 12 projects — write after the featured six

> These publish independently. Order doesn't matter — publish whenever
> you're ready to document each one.

#### sahayai-club-website · SahayAI Club Website (2025-12)
- [ ] **question** · [ ] **abandonedBranches**

#### humanizer · Humanizer (2025-12)
- [ ] **question** · [ ] **abandonedBranches**

#### ml-hangman · Machine Learning Hangman (2025-11)
- [ ] **question** · [ ] **abandonedBranches**

#### recipe-ingredient-optimizer · Recipe Ingredient Optimizer / RIO (2025-11)
- [ ] **question** · [ ] **abandonedBranches**

#### sediment-particle-size-prediction · Sediment Particle Size Prediction (2025-10)
- [ ] **question** · [ ] **abandonedBranches**

#### gym-management-system · Gym Management System (2025-10)
- [ ] **question** · [ ] **abandonedBranches**

#### smart-door-lock · Smart Door Lock System (2025-03)
- [ ] **question** · [ ] **abandonedBranches**

#### amplify · Amplify (2024-10)
- [ ] **question** · [ ] **abandonedBranches**

#### flight-booking-app · Flight Booking App (2023-11)
- [ ] **question** · [ ] **abandonedBranches**

#### weather-app · Weather App (2023-10)
- [ ] **question** · [ ] **abandonedBranches**

#### bmi-calculator · BMI Calculator (2023-10)
- [ ] **question** · [ ] **abandonedBranches**

#### incrementor-app · Incrementor App (2023-09)
- [ ] **question** · [ ] **abandonedBranches**

---

### What each question looks like

`question` is distinct from `problem` (the one-line description already
pre-filled from your context). The **question** is what caused the project
to exist: *"What were you actually trying to find out or make possible when
this project started — phrased as a question?"*

For `abandonedBranches`, each entry is `{ tried, whyAbandoned, learned }`.
The dead ends are kept on purpose — they are where the design actually
happened. Leave empty if you don't remember clearly enough to be honest.

Also check and correct these pre-filled fields in `site.ts` before publishing:
- `problem` — currently maps from the brief's context summary; rewrite in
  your voice as the one-line problem statement for the card.
- `projectStatus` — all set to `"archived"` by default; flip to `"active"`
  for any project you are still actively working on.
- `tags` — currently the tech stack; edit to whatever labels you want on cards.

> Note: `question` + `abandonedBranches` added D-042. Full Project↔Memory
> convergence deferred to docs/09. `featured` flag exists in data; no
> visual distinction is rendered in the current index (docs/24 defines no
> featured card treatment; a future sprint can add one when requested).

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
