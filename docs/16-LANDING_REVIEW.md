# 16 — Landing Page Design Review

> **Status:** Review complete — verdict at end.
> **Reviewer role:** Principal Design Reviewer (independent posture; the spec is treated as a proposal under challenge, not a decision to validate).
> **Artifact under review:** [`../specs/landing.md`](../specs/landing.md) v1.0 (D-026), against PRD `02`, XA `12`, DSVL `03`, IA `04`, Wireframes `13`, Brand `14`, Tokens `15`.
> **Outcome handling:** accepted findings are applied to the spec as tracked amendments (see Appendix); rejected recommendations are recorded with reasons.

---

## Executive Summary

The specification is disciplined, internally consistent, and unusually honest about its own trade-offs. Its strongest quality is restraint-with-a-spine: the motion budget is a number, the claims/evidence separation is a rule, and the persona shortcuts are structural. Its weakest points are (1) an **originality exposure in the hero** — the graph motif sits one bad art-direction decision away from the most tired cliché in developer portfolios, (2) a **dramaturgy gap in v1.0** — the page's emotional climax (S6, the Dex reveal) doesn't exist for the product's first six-plus months and the spec hand-waves the gap, and (3) several **redundancies the spec's own philosophy should have caught** (the scroll chevron being the clearest). None of these require redesign. All of them require changes before build.

**Verdict: Approved with Changes** — six required, four minor. Score: **84/100.**

## Scorecard

| Category | Score | One-line judgment |
| --- | --- | --- |
| First Impression | 8 | Text-first ≤1s paint is elite; hinges entirely on an unwritten sentence and an undrawn motif |
| Visual Hierarchy | 9 | Priority=DOM law + bimodal density is textbook; S2/S5 sameness risk (minor) |
| Content Strategy | 8 | Claims-in-S1-only is the best single rule in the spec; identity sentence is an untested single point of failure |
| Storytelling | 8 | 8-beat arc is genuinely good; **v1.0 loses its climax and the spec doesn't re-choreograph** |
| User Journey | 9 | Persona shortcuts ≤2 interactions, structurally guaranteed |
| Navigation | 8 | 4-lane + palette holds; palette discovery on landing left unplaced |
| Interaction Design | 9 | One overlay contract, honest states, copy-email flagship — mature |
| Motion Design | 9 | A *numeric* budget with a kill rule; rare and correct |
| Accessibility | 9 | Checklist-as-release-criteria; reduced-motion is designed, not degraded |
| Performance | 9 | LCP=text, CLS=0, no fetch above S6 — enforceable, not aspirational |
| Scalability | 8 | Reserved slots are real; "live motif" future idea is a scope-creep magnet |
| Brand Consistency | 9 | Hero as document-not-poster is the brand argued correctly |
| AI Integration | 8 | The reveal arc is real product design; v1.0 absence is managed but under-dramatized |
| Technical Feasibility | 9 | Everything maps to ratified tokens/contracts; SVG draw needs a node cap |
| Originality | **7** | The *system* is original; the hero visual is one art-direction failure from particles.js déjà vu |
| Overall Product Quality | 8 | Strong spec; ships stronger after the changes below |

**Total: 135/160 → 84/100**

## Deep Review — section by section

Format: *exists-why / simplify / merge / slows? / distracts? / memorable? / would Apple·Linear·Anthropic keep it?*

- **S1 Hero** — Exists: the 10-second answer. Simplify: **yes — cut the chevron** (below). Merge: n/a. Slows: no. Memorable: only if the motif lands (below). Apple: keeps structure, kills the chevron on sight. Linear: keeps; would push type even larger. Anthropic: keeps; would demand the sentence carry more specificity. **Keep, with changes.**
- **S2 Featured Work** — Exists: first proof. Simplify: already minimal (2 cards). Merge: no — merging proof into hero rebuilds the overloaded-hero anti-pattern. Slows: no; it's the designed pause. Memorable: the `implements` chip is quietly the most original element on the page — *a project card citing its paper* is something none of the reference companies' sites do. All three keep it. **Keep.**
- **S3 Research Highlight** — Exists: the thinker proof. Simplify: watch the motif — if S1's motif already said "graph," S3's must say something *else* (a theme figure, not another constellation) or it's repetition wearing rhyme's clothes. Merge: the pubs stat strip is already a merge (brief's §5+§6) — correct. Slows: intentionally, one paragraph. Apple: keeps. Linear: might cut the motif, keep the question. Anthropic: keeps — it's the most Anthropic section on the page. **Keep; sharpen the two-motifs rule.**
- **S4 Current Focus** — Exists: the anti-staleness engine; the page's most *product-like* idea. Simplify: no — density is the message. Merge: no. Slows: no (designed fast). Memorable: yes — "last synced ⟨stamp⟩" as public UI is a trust move competitors won't copy because they can't keep the promise. All three keep it; Stripe would be jealous. **Keep. This is the page's best section.**
- **S5 Latest Posts** — Exists: judgment proof + return hook. Simplify: already 3 rows. Merge: no. Distracts: no. Memorable: no — and that's fine; it's connective tissue. All keep. **Keep.**
- **S6 Dex Preview (v1.5)** — Exists: the climax. Simplify: no. The centered ceremony is earned *because* it's the only one. Memorable: potentially the most memorable moment on the page — an AI introduced *after* the evidence, referencing what you just scrolled, is the reveal done right. Apple: keeps (it's their kind of theater — restrained until it isn't). Anthropic: keeps, would tighten the scope copy further. **Keep — but see Critical Issue C2 for what happens when it's absent.**
- **S7 Contact** — Exists: the close. Simplify: no (three elements). Merge: no. All keep. **Keep.**
- **S8 Footer** — reference chrome; the timestamp sign-off is a lovely last word. **Keep.**

## Hero Review — everything challenged

- **Headline placement:** left-anchored, cols 1–9 — correct and defended well (document vs poster). *Challenge survives.*
- **3D portrait:** already rejected by law; the review board *concurs* — and goes further: the spec's argument (lab opens on work, not face) should be quoted in the hi-fi brief so no future iteration relitigates it.
- **Background:** flat canvas, ambient field declined — correct. The board notes with approval that the spec declined an *approved* option. Restraint exercised, not just legislated.
- **The graph motif — the review's biggest challenge.** Node-and-edge hero visuals are the single most exhausted trope in technical portfolios (particles.js, constellation canvases, "connected dots" as universal tech-signifier). The spec's differentiators (hairline plotter aesthetic, real content semantics, draws-once-then-still, irregular layout) are *plausible* but entirely execution-dependent — the spec ships the risk to the hi-fi phase without a safety net. **Required change R2:** binding art-direction guardrails (asymmetric/organic layout — no radial or grid symmetry; visible drawn character per Brand §9; node count 7–12 hard cap; zero post-draw motion; never any pointer reactivity) **plus a kill criterion**: if the motif reads as "particle background" to fresh eyes in a 5-person hallway test, it is cut to pure typography without debate. A typographic-only hero is the *already-approved fallback*, which makes the kill cheap — the spec should say so.
- **Animation (draw-in):** justified, once, ≤2s. Add a technical cap: stroke-draw on many paths can jank low-end mobiles — compositor-friendly implementation is a release criterion, not a hope. *(Folded into R2.)*
- **CTAs:** "View work" primary — correct. "Download CV" secondary — the board debated whether a CV button in the hero frames the site as job-seeking (Brand: canonical record, not application). **Resolved: keep** — the PRD's highest-stakes persona (evaluator, 90s) justifies it, and "Download CV" is a record-offering, not a plea. Tension noted for the record.
- **Scroll transition:** the 85vh peek is the spec's smartest small decision. **Which convicts the chevron:** the spec's own D-026 language calls the peek "the honest scroll cue" — then adds a chevron anyway. Belt and suspenders is exactly the duplication DSVL Law 21 exists to kill. **Required change R1: cut the chevron.** The hero loses an element and loses nothing.
- **Spacing/density/reading order:** clean; priority=DOM verified in spec. No findings.
- **Loading experience:** "none visible" backed by architecture — the strongest kind of design decision. No findings.
- **Trust signals:** the current-focus line + stamp is excellent *when fresh* — and a self-inflicted wound when stale. The spec couples the hero to maintenance discipline **without defining the failure mode**. **Required change R5:** define staleness behavior — recommendation: stamp renders only while fresh (≤30d); past threshold the line persists (it's content) but the stamp yields to the admin's amber warning driving an update. Showing "Currently: X — updated 4 months ago" at the top of the page is the *museum* anti-pattern (Brand §13) self-installed.

## Motion Review

| Motion | Why exists / problem solved | Removable? | Understanding? | A11y? | GPU? | Better without? |
| --- | --- | --- | --- | --- | --- | --- |
| Hero draw-in | Thesis-as-animation; the one arrival moment | Yes (kill criterion R2) | Yes — if legible as *his* graph | Parity mapped | Cheap if compositor-safe (R2 cap) | No — but better with guardrails |
| S3 draw-in | Rhymes the language on the "thinking" claim | Yes | Moderate — weakest of the three | Parity | Cheap | **Borderline** — survives only if S3's figure differs in *kind* from S1's (theme figure, not second constellation). Recorded as the budget's first candidate for death if anything new ever needs the slot. |
| Section entrances | Uniform reveal grammar; teaches page rhythm | Could be | Mild | Parity | Trivial | No — uniformity is the value |
| Card hover / micro | Affordance; premium-in-the-small | No | Yes | Retained under RM | Trivial | No |
| Shared-element (S2→detail) | Teaches the IA through motion | No | **Highest of all** | Instant fallback | Moderate, scoped | No |
| Dex breath + S6 deepen | The one living thing; discovery beat | v1.5 only | Yes (presence semantics) | Static+text mapped | Trivial | No — it *is* the AI's body |
| Copy→check | State confirmation | No | Yes | Announced | Trivial | No |

**Board position:** the budget (≤3 narrative/session) is the best motion governance this reviewer has seen in a spec of this class. Finding: the *second draw-in* is the weakest tenant — put it on notice (above), don't evict it yet.

## AI Review

- **Visibility / discovery:** the unexplained-dot → S6-naming arc is genuine product storytelling — curiosity engineered structurally, paid off honestly. This is *not* an embedded chatbot; a chatbot interrupts, Dex is *introduced*. The distinction is the whole game and the spec understands it.
- **Trust:** scope statement + freshness stamp + chips-referencing-just-scrolled-content is a strong stack. The chips are the subtle masterstroke: context awareness *demonstrated* before a single message is sent.
- **Conversation entry:** chip → panel-over-page (not navigation) correctly teaches "Dex rides alongside." Correct.
- **Knowledge transparency:** "knows everything published here, as of ⟨date⟩" — good; the board suggests the /ai page's fuller scope note is the ceiling, this is the right landing dose.
- **Failure handling:** inherited from XA §7 (resting note, affordance reduction) — adequate; landing-specific: if Dex is down, S6 must degrade to... what? The spec doesn't say. **Minor issue M4:** define S6's Dex-offline state (recommendation: section renders with dot static + intro line + `/ai` door; chips hidden — never dead chips).
- **The structural critique — Critical Issue C2:** the page's dramaturgy climaxes at S6, but v1.0 ships without S6 *for months*. The spec's treatment — "S5's exhale flows to S7" — is a shrug where a design should be. The v1.0 landing is not a lesser page; it needs its own resolution. **Required change R3:** re-choreograph the v1.0 ending explicitly — recommendation: in v1.0, S7 absorbs modest ceremony (the increased whitespace S5 already builds lands on the collaboration close; the page's "reveal" becomes the *freshness stamp in the footer* — quiet, on-brand, true). One paragraph in the spec; a real difference on the shipped page.

## Performance Review

- **Heavy sections:** none by design — S4's data is build-time; gallery-class weight doesn't exist here. ✓
- **Bottlenecks:** SVG draw-in on low-end (addressed, R2 cap); view-transition shared-element on older browsers → spec already degrades to instant nav. ✓
- **Expensive animations / unnecessary effects:** none post-R1. The declined ambient field deserves note as a *pre-review* performance save.
- **Large assets:** none above S6; fonts are the largest payload — subsetting is specced, loading strategy correctly deferred to stack ratification.
- **Mobile assumptions:** independent design, same budget on mid-range — correct. One gap: **minor M2** — the 85vh peek needs viewport clamps (very tall viewports can swallow the peek; very short can over-expose S2); specify min-peek behavior.
- **Hydration:** palette/Dex code-split on intent; the landing's above-fold is effectively static — the hydration story is as good as the architecture allows. Flag for build: ensure the S6 chips don't force early Dex-bundle load.
- **Scalability risk:** the "live graph motif" future idea is charming and dangerous — a real-time data-driven hero animation is a maintenance organism (XA §12 bespoke-moment risk). Correctly gated behind amendment; the board adds: *not before v2, and only with a dedicated spec.*

## Accessibility Review

Keyboard: full path specced, skip-link first, no traps — ✓. Reduced motion: parity-mapped per element, page complete without motion — exemplary. Contrast: token-governed with motif-never-under-text rule — ✓. Screen readers: the "8-beat story audible in order" checklist item is the right *kind* of criterion (narrative parity, not just label coverage). Touch: 44px + stacked CTAs — ✓. Focus: one ring, never suppressed — ✓. Semantics: one-H1 with name-as-styled-element noted — implementers must not "fix" this into two H1s.
**One finding (minor M3):** the palette's existence is undiscoverable to landing visitors who don't know ⌘K — XA promised a "gentle hint once per first visit" and the landing spec never placed it. Place it (recommendation: one-time hint chip near the nav trigger, dismissible, never repeats).

## Originality Review

Does it resemble a **generic developer portfolio**? The *structure* — no (no skills-bars, no "about me" hero selfie, no terminal cosplay; the claims/evidence rule alone kills the genre's grammar). The *hero visual* — **at risk**: connected-nodes is the genre's most recycled asset (C1/R2 covers this).
An **AI-generated website**? No — the spec's specificity (85vh, numeric budgets, staleness rules) is precisely what template output lacks.
A **startup landing page**? No — no social proof strips, no pricing rhythm, claims quarantined to S1.
A **template**? The system says no; the S2/S5 both-typographic sameness could *feel* templated in the middle scroll — **minor M1**: hi-fi must differentiate Card and Row treatments visibly (the families exist for this; use them).
**What's genuinely original here:** the freshness architecture as public UI (S4, stamps, footer sign-off), the `implements` chips, the Dex reveal arc, and the claims/evidence separation. The board's summary: *the page's originality lives in its honesty mechanics, not its visuals — protect the mechanics, and don't let the one risky visual undermine them.*

## Strengths

1. Claims-in-S1-only / evidence-only-after — the best content rule in the project.
2. Numeric motion budget with named tenants and an eviction rule.
3. Freshness as public UI (S4 + stamps) — unfakeable trust, structurally enforced.
4. The Dex reveal arc — signature-feature introduction as narrative, not widget placement.
5. Performance budget that is *enforceable* (LCP=text node, CLS=0, no fetch above S6).
6. Persona shortcuts guaranteed structurally (≤2 interactions), not aspirationally.
7. The spec declines approved options (ambient field) — restraint as practice, not just law.

## Weaknesses

1. Hero motif's originality exposure (C1).
2. v1.0 dramaturgy gap (C2).
3. Redundant scroll chevron contradicting the spec's own peek argument.
4. Staleness failure mode undefined at the page's most visible point.
5. Identity sentence: single point of failure with no testing protocol.
6. S3's second draw-in is rhyme at risk of being repetition.

## Critical Issues

- **C1 — Motif cliché risk** → R2 (guardrails + kill criterion + compositor cap).
- **C2 — v1.0 ships without its climax, unchoreographed** → R3 (explicit v1.0 ending).

## Minor Issues

- **M1** S2/S5 visual sameness — hi-fi differentiation requirement. → R6
- **M2** 85vh peek viewport clamps unspecified. → R6
- **M3** Palette discovery hint unplaced on landing. → R6
- **M4** S6 Dex-offline state undefined. → R6

## Improvement Suggestions (accepted into amendments)

**R1** Cut the hero scroll chevron — the peek is the cue; the spec said so itself.
**R2** Graph motif: binding art-direction guardrails (asymmetric layout, drawn character, 7–12 node cap, zero post-draw motion, no pointer reactivity, compositor-safe draw) + hallway-test kill criterion with typographic fallback pre-approved.
**R3** Re-choreograph the v1.0 ending: S7 absorbs the resolution beat; footer freshness stamp named as v1.0's quiet reveal.
**R4** Identity-sentence release protocol: the 10-second test (5 fresh readers; who/what/why-different recalled) + read-aloud test as release criteria — copy is a component; test it like one.
**R5** Hero staleness rule: stamp renders ≤30d only; line persists; admin amber drives renewal.
**R6** Fold M1–M4 into the spec as one amendment block.

**Rejected recommendations (recorded):** moving Contact into the nav lanes (violates D-021 for marginal gain — footer/palette/S7 suffice); demoting the CV CTA (evaluator persona outranks the framing concern); removing S3's motif outright (put on notice instead — rhyme has value if execution differs in kind).

## Risk Analysis

| Risk | Likelihood | Impact | Owner action |
| --- | --- | --- | --- |
| Motif executes as cliché | Medium | High (first impression + originality) | R2 guardrails; cheap kill path |
| Staleness at hero | Medium (human factor) | High (brand's mortal enemy) | R5 + admin freshness loop |
| Identity sentence underperforms | Medium | Critical (everything hangs on it) | R4 protocol |
| v1.0 page feels incomplete | Low after R3 | Medium | R3 |
| Draw-in jank on low-end | Low | Medium | R2 technical cap |
| Live-motif scope creep | Medium (it's seductive) | Medium | Gated: v2+, dedicated spec |

## Revised Priority List (build order after amendments)

1. Identity sentence + R4 protocol (the page *is* this sentence)
2. Static structure S1–S8 with R1/R3/R5 applied
3. Graph motif under R2 — with the hallway test scheduled *early*, while the kill is cheapest
4. Reveal grammar + shared-element
5. S4 data contracts (freshness engine end-to-end)
6. Mobile pass + M2 clamps
7. A11y checklist as release gate
8. (v1.5) S6 insertion + M4 offline state

## Final Score: **84/100**

## Approval Decision: **APPROVED WITH CHANGES**

Conditions: R1–R6 applied to `specs/landing.md` before hi-fi begins; the hallway test (R2) scheduled in the build plan; re-review not required — amendments are within the spec's existing philosophy (indeed, most of them are the spec's own rules applied more ruthlessly, which is the finding that most recommends the underlying system).

---

## Appendix — Amendment Ledger

| # | Change | Spec section touched |
| --- | --- | --- |
| R1 | Chevron cut | §2.1 hierarchy + interactions |
| R2 | Motif guardrails + kill criterion + compositor cap | §2.1 visual concept + §8 |
| R3 | v1.0 ending choreography | §2.5→§2.7 transition + §3 |
| R4 | Identity-sentence test protocol | §7/§8 release criteria |
| R5 | Staleness rule for hero stamp | §2.1 content hierarchy |
| R6 | M1–M4 batch | §2.2/§2.6/§3/§6 |
