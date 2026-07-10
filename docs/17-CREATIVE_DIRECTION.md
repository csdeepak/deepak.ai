# 17 — Creative Direction: THE INSTRUMENT

> **Status:** Proposed new creative direction (a fork under challenge, not an approved decision).
> **Posture:** This document deliberately challenges [`03-DESIGN_LANGUAGE.md`](03-DESIGN_LANGUAGE.md) (DSVL v1.0). It does not discard the DSVL's *mechanics* — it re-aims its *emotional target*. Where the two conflict, this document states the conflict openly and proposes the resolution.
> **Prompt origin:** Owner directive — "you are no longer designing a portfolio website; you are designing the flagship digital product of an AI Engineer. Make them remember me. It must feel like entering a modern AI laboratory — a living system, a digital twin."
> **A change of this magnitude requires a `../memory/DECISIONS.md` entry before any of it binds.**

---

## 0. The Verdict — why the current direction cannot hit the stated goal

The DSVL's emotional goals, in its own words, are: **trust → clarity → quiet delight**, where delight is "precision encountered repeatedly … never from spectacle."

The new directive's emotions, in the owner's order, are: **wonder → curiosity → confidence → engineering → precision → calm → sophistication.**

**Wonder and curiosity are #1 and #2. In the current system they do not exist at all.** The DSVL is a magnificent *trust* engine. It has no *wonder* engine — by design, it treats wonder as a synonym for spectacle and bans it. That is the core miscalibration.

Named plainly, four structural problems follow:

1. **Restraint is a defensive identity.** The five "recognition devices" (wordmark, presence dot, single accent, hairline, drawn line) are all *subtractive marks* — quiet by construction. You cannot build a memorable identity out of a list of things you refuse to do. Apple has restraint **and** moments: the boot chime, the pinch, the notch, the click wheel. The current system is all restraint, zero *moment*. A founder who skims forty portfolios will **respect** this site and **forget** it.

2. **It forecloses exactly the tools you love.** Your "things I love" list is: meaningful animations, glass, depth, real lighting, physics, procedural motion, interactive scenes, knowledge visualization. The DSVL rejects 3D (§9 dormant), rejects glass everywhere but two surfaces (§7), makes depth "surface + hairline, *not* shadow" (§3), and rations motion to feedback + a few reveals (§8). It threw out the *capability* along with the *cliché*. The clichés are real — but the fix is discipline, not abstinence.

3. **The hero is a design that pre-plans its own failure.** The Landing Review scored Originality **7/10** and gave the hero graph-motif a **kill criterion** — "if it reads as a particle background to fresh eyes, cut it to pure typography." A centerpiece you are already rehearsing the funeral for is not a centerpiece. It is the tell that the current direction has no confident wonder-moment and knows it.

4. **A lab notebook is the wrong metaphor for the stated feeling.** The DSVL's governing sentence is: "look the way a well-kept lab notebook *reads*." But a notebook is **read** — it is passive, closed, past-tense, a record. You asked for a **laboratory** — a place you **enter and operate**, present-tense, running, alive. Those are different products. The notebook aesthetic produces a beautiful document. You asked for a living system.

**None of this means starting over.** The DSVL's *honesty mechanics* — the freshness architecture, claims-quarantined-to-evidence, tabular truth, machine-readable-by-default, the single-accent discipline, the no-stock/no-uncanny laws — are the best things in the project and this direction keeps every one. What changes is the **emotional thesis** and the **capabilities we allow ourselves** to deliver it.

---

## 1. The Thesis — one sentence that governs everything

> **Deepak Labs is not a portfolio you read. It is an instrument you operate — a personal research operating system that is genuinely *running*, aware of context, and honest about its state, built to the physical precision of laboratory equipment.**

The wonder does not come from spectacle. It comes from **aliveness**: the unmistakable sense that a real system is running underneath — that it has state, that it responds with the exact physicality of a precise instrument, that if you leave and come back it will have changed, that it *knows what it is showing you*.

This is the Apple / Nothing / Teenage Engineering / LoveFrom move, stated exactly: **the magic is that it feels real.** Engineered. Alive. Like holding a beautifully made tool. Wonder *through* precision, not wonder *instead of* it. That single reframing dissolves the false choice between "trustworthy" and "wondrous" — a real instrument is both, and it is both *because* it is real.

This also aligns with where the codebase is already going: the recent runtime work (D-037, D-038 — "personal OS runtime: kernel and ten runtimes," "hero runtime foundation: gate, rail, governor"). The metaphor is not imposed from outside. **It is already being built.** This document names it and makes it the soul.

---

## 2. The Shift — from Notebook to Instrument

Every mental model changes. This table is the whole redesign in miniature.

| Dimension | DSVL v1.0 — The Notebook | This direction — The Instrument |
| --- | --- | --- |
| **Core metaphor** | A well-kept lab notebook (read) | A running research OS (operated) |
| **Tense** | Past — a record of work done | Present — a system currently working |
| **Primary emotion** | Trust, then quiet delight | Wonder grounded in trust |
| **Identity built from** | Refusals (what it won't do) | A signature *behavior* + refusals |
| **Depth** | Flat: surface + hairline | A disciplined Z-axis: real optical depth |
| **Light** | Implied, none | One honest, physically-consistent key light |
| **Motion** | Feedback + a few reveals | Procedural physics: values *settle* |
| **Glass** | Two surfaces, apologetically | Instrument readouts at defined depths |
| **The graph** | A risky hero decoration | The living navigation substrate |
| **Dex** | A dot that opens a chat panel | The kernel — it *operates the instrument for you* |
| **Sound** | Silent | An optional, exquisite, physical sound layer |
| **The hero** | Type + a motif it may have to kill | The system coming online — a boot, not a banner |
| **What it deposits** | "This person is careful." | "This person is careful — *and I have never seen this before.*" |

**We keep the right column's discipline and the left column's ethics.** That is the synthesis.

---

## 3. The Emotional Spine — each emotion to a concrete mechanism

Emotions are not vibes; each one is engineered by a specific device. If a device does not serve one of these seven, it is cut.

| Emotion | The mechanism that produces it |
| --- | --- |
| **Wonder** | The boot sequence (§7.1); the living graph racking into focus (§7.2); Dex operating the interface in front of you (§7.3). Wonder = "a real system is running." |
| **Curiosity** | Unexplained-but-legible state — a heartbeat dot before you know what it is, a "3 things changed" badge, telemetry in the margins that invites a second look. Curiosity is *engineered questions with honest answers*. |
| **Confidence** | The settle motion (§6): every value approaches, converges, and lands with the certainty of a measurement. Nothing wobbles. Nothing is unsure. |
| **Engineering** | Honest materials under one consistent light (§5); real telemetry, not decoration; tabular truth; visible system-ness (kernel, subsystems, state). |
| **Precision** | The 4px grid, tabular figures, the focus ring, hairlines — all inherited from the DSVL, all kept. Precision is the floor everything else stands on. |
| **Calm** | Restraint inherited: ≥95% neutral, one accent, generous silence, slow settle periods, sound off by default. Wonder is *rationed* so calm survives. |
| **Sophistication** | The refusal to explain the magic. No tooltips bragging about the physics. The instrument simply behaves beautifully and never mentions it. |

The ordering matters: **Wonder is delivered first, Calm protects it from becoming spectacle.** That tension — a system that is astonishing *and* quiet — is the entire aesthetic.

---

## 4. The Central Metaphor — the Personal Research OS

The site is structured as an operating system for one mind. This is not skin-deep chrome; it is the organizing principle.

- **The Kernel** — the always-present intelligence. This is **Dex**, elevated from "chatbot dot" to "the thing the system is running." Its heartbeat (the presence dot) is the OS's pulse. It has privileged access: it can highlight, navigate, assemble, and answer *by operating the visible interface*, not by printing into a sidebar.
- **The Runtimes** — the domains of work (research, engineering, publications, writing, learning). Already scaffolded in code (D-038's "ten runtimes"). Each is a subsystem the OS can bring to the foreground.
- **The Substrate** — the knowledge graph: the real, load-bearing map of how everything connects (papers → projects → posts → learning). Not a hero ornament. The *ground* the whole system stands on. Navigation *is* traversal of the substrate.
- **The Telemetry** — real, live signals of a working researcher: current focus, last sync, reading now, commit cadence, what changed since your last visit. The OS's vital signs, shown honestly.
- **The State** — the system remembers (locally, respectfully): are you new or returning? What changed? A living system has a felt changelog.

Every page is a **view into a running system**, never a static page in a brochure. That is the difference the visitor feels without being told.

---

## 5. Material & Light — what this thing is made of

The DSVL is "ink on paper." This direction is **matte instrument, under one honest light.** The reference is not a website; it is a Teenage Engineering product render, a Leica top-plate, a Nothing device, a Braun measuring tool.

**The single light law.** There is exactly one key light in the entire product, from a consistent direction (soft, high, slightly to one side), with a gentle ambient fill. *Every* surface, edge, glass panel, and shadow is lit by that one source. This is the antidote to "huge gradients everywhere": we don't paint light, we *cast* it, once, consistently. Coherent light is what makes depth and glass read as **real** instead of gimmicky. Break this law and everything collapses into the cyberpunk mush you hate.

**Materials — a closed set of four:**
1. **Deck** — the matte body of the instrument. The canvas. Graphite-neutral (DSVL's ramp kept), lit by the key light so large planes have an almost-imperceptible tonal gradient *from the light*, never from a gradient tool.
2. **Readout** — the glass screens. This is where glass earns its place: displays that float above the deck at a defined depth, frosted, edge-lit by the one light, showing live information (Dex, the palette, the graph overlay, telemetry panels). Glass = "this is a screen showing live state," never decoration.
3. **Etch** — the hairline layer. The DSVL's hairlines, kept exactly — engraved lines on the deck. Labels, dividers, the drawn-line illustration language (§1 of DSVL, kept).
4. **Signal** — the one accent, kept, but promoted: it is now the color of *live data and active energy* — the indicator LED, but also the trace of a value being measured, the illuminated edge of the focused graph node. Still ≥95% neutral. Signal is rarer *and* more alive.

**Depth — the disciplined Z-axis.** The DSVL is flat by decree. This direction introduces **three real depth planes** and no more:
- **Deck plane (z0)** — content at rest. Where reading happens.
- **Readout plane (z1)** — glass instruments floating above: Dex, palette, graph, telemetry.
- **Focus plane (z2)** — the single thing you are operating right now, brought forward with the rest racked slightly out of focus (real depth-of-field blur on z0 when z2 is active).

Moving between planes feels like **racking focus on optical equipment** — the DSVL's "shared-element transition" reborn as an optical instrument behavior. This is depth with a *reason* (an instrument has screens at distances), which is precisely what keeps it from being the "too much glass / parallax diorama" anti-pattern. Three planes. Never four.

---

## 6. Motion & Physics — the signature behavior: *settle*

This is the single most ownable thing in the entire direction. **Deepak Labs is recognizable by how its values land.**

**The settle curve.** Everything that resolves — a number arriving, a node focusing, a panel opening, a filter applying — follows the physics of a precise instrument taking a reading:

1. **Approach** — fast, confident motion toward the target (ease-out, quick).
2. **Converge** — a brief deceleration as it nears the value.
3. **Settle** — a single, tiny, critically-damped micro-correction (< 2% overshoot, one oscillation, never a bouncy spring).
4. **Stillness** — then **absolute rest.** Nothing idles. Nothing loops. (The one permitted loop remains Dex's heartbeat, per DSVL.)

This is *not* springs-for-fun. It is the difference between a slot-machine odometer (banned by DSVL, rightly) and a needle finding true. Values do not "count up" — they **land**. A gauge doesn't animate its truth; it *settles* on it. That distinction honors DSVL Law on numbers while giving them life.

**Procedural, not scripted.** Where the DSVL choreographs specific reveals, this direction prefers *systems* that produce motion from state: the graph's force layout settling and stopping; telemetry needles responding to real values; the focus-rack responding to what you operate. Procedural motion is cheaper to maintain (one system, infinite content) and reads as *alive* rather than *animated* — the exact distinction you drew between "meaningful animations" (loved) and "random particles" (hated).

**The budget survives.** The DSVL's numeric motion budget (≤3 narrative moments/session, nothing blocks on choreography, reduced-motion parity as a release criterion) is **kept in full.** Wonder is rationed. The settle physics apply to micro-motion (already within feedback timing); the *narrative* moments are still counted on one hand. Aliveness is a *quality* of motion, not a *quantity* of it.

---

## 7. The Signature Moments — what makes them remember you

An identity needs *moments*, not just marks. Here are the ownable scenes. Each is impossible for a template to have, because each is generated by the real system underneath.

### 7.1 The Cold Start — the instrument comes online
The site does not fade in a hero. **The instrument powers on.** In under one second, the interface *assembles itself* with the physical timing of real equipment waking: the deck settles into place, the key light comes up, subsystems report ready, the kernel heartbeat begins, the first values settle into their gauges. Then stillness, and the identity statement is simply *there*.

This is **not terminal cosplay** (banned by DSVL, correctly) — there is no fake typing, no `> whoami`, no green-on-black. It is the *actual UI* arriving with the choreography of a device booting: a Leica switching on, a synth's LEDs sequencing, a camera's readout illuminating. It must be < 1s, skippable, respect reduced-motion (instant assembly), and it plays **once per session**. It replaces the risky graph-hero as the first-impression wonder-moment — and unlike that motif, it cannot read as a cliché, because no developer portfolio boots like an instrument.

### 7.2 The Living Substrate — the knowledge graph, done right
The graph is **removed from the hero** (where it is the genre's single most exhausted trope) and **promoted to the navigation substrate** (where it is substance). It is a real, operable instrument you summon — the *spatial* sibling of the command palette.

- Nodes are real content; edges are real relations (`implements`, `cites`, `extends`, `references`).
- Force-physics **settle and stop** (DSVL §11, kept). It is never a writhing particle field.
- **The wonder:** focus a node and its neighborhood *illuminates in Signal* while everything else **racks out of focus into depth** (real z-axis blur, §5). You are not looking at dots; you are looking *into* a structured mind, one region at a time. Depth-of-field does the storytelling the constellation never could.
- Guardrails from the Landing Review's R2 survive and transfer: asymmetric/organic layout, drawn character, hard node caps per view, zero idle motion, no pointer-reactive jitter. The difference: those rules were a *safety net for a weak hero*; here they are the *craft spec for a strong instrument*.

### 7.3 Dex operates the instrument — the digital twin, literally
Dex stops being a chat panel that prints text beside the page. Dex becomes the **kernel that drives the interface in front of you.** Ask Dex a question and the *system responds*: the relevant runtime surfaces, the graph reorganizes to the neighborhood in question, the nodes that answer light up, and the reply **assembles from real citations you watch resolve into place**. The answer and the interface are the same act.

*That* is the "digital twin" and "living system" feeling made concrete — not a mascot, not a face (DSVL's no-face law kept absolutely), but an intelligence you can watch *think by moving the instrument*. A chatbot interrupts; the kernel *operates*. This is the difference the Landing Review already intuited ("Dex is introduced, not embedded") taken to its logical, wondrous end.

### 7.4 The Diff — a living system has a felt changelog
The freshness architecture (the DSVL/Landing Review's genuinely best idea) becomes **experiential.** The system knows, locally and respectfully, when you last visited. A returning visitor is met with a quiet, honest signal: *"3 things changed since you were here."* Open it and you get a **diff of the mind** — new publications, a shipped project, a fresh post — rendered as the system's own changelog, values settling into their new state. Staleness (the brand's "mortal enemy," per the review) is inverted into the recurring reason to return. Nobody's portfolio can fake this, because it requires the system to actually be alive.

### 7.5 The Telemetry Margins — real vital signs
In the margins and the footer, honest live signals of a working researcher, rendered as instrument readouts with settling needles and tabular truth: current focus, last sync stamp, reading-now, commit cadence, a "now" state. **Real signals only** — never invented metrics (that would violate the honesty ethic and instantly cheapen everything). The site has a pulse because it is showing a real one. Subtle, ambient, never shouting — the DSVL's "≥95% neutral" holds; telemetry lives in Etch and Signal, quietly.

### 7.6 The Sound Layer — the dimension no portfolio has
Instruments have sound. The current spec is silent — a missed dimension. Proposal: an **optional, off-by-default, exquisitely restrained** sound layer — the soft power-on tone at cold start, the settle-*thunk* of a value landing, the click of a plane racking into focus. Physical, mechanical, never musical, never gamey (the Teenage Engineering / Nothing / OP-1 register, not the notification-jingle register). A single clear toggle, remembered locally, silent until invited. It is a whole ownable sense that every competing portfolio ignores. **Gated:** ships only if it can be done to this standard; a mediocre sound layer is worse than none, and it is the first thing cut under time pressure.

### 7.7 The One-Light Signature — recognizable from a screenshot
Because the entire product is lit by a single consistent key (§5), a screenshot with the logo cropped is **still identifiable** — the matte deck, the edge-lit glass readouts, the one Signal hue glowing like an LED, the honest shadow all agree with each other. The DSVL wanted "recognizable from a cropped screenshot" and tried to get there with hairlines alone. Coherent light + material + the settle physics get there with far more force.

---

## 8. Typography — evolve, do not replace

The DSVL's typography is genuinely excellent and stays almost entirely. **Inter + JetBrains Mono, weight-not-color hierarchy, tabular figures, the strict mono charter, the reading column — all kept.** Type is still the load-bearing wall.

Three refinements for the instrument register:
- **Display type becomes a readout, not a banner.** The landing identity statement sits *on the deck under the key light*, with the material weight of an engraved plate — the same words, a more physical presence.
- **Numbers settle (§6), they never count up.** This *strengthens* the DSVL's anti-odometer law rather than breaking it: the ban was on slot-machine jiggle; a needle finding true is the honest opposite.
- **Mono earns a promotion within its charter.** As the voice of live telemetry (machine-truth in motion), mono now labels the vital signs — fully consistent with "mono means machine-truth," never "mono means techy vibes."

No new families. Coherence over warmth, exactly as the DSVL argued.

---

## 9. The Hero — replaced

**Kill:** the graph-motif hero and its pre-planned typographic fallback. A hero designed with an escape hatch is not a hero.

**Replace with:** the **Cold Start (§7.1)** resolving into a still, engraved identity statement on the lit deck, the kernel heartbeat alive in the corner, and — instead of a decorative motif — **one real, settling telemetry line** (current focus + last-sync, the Landing Review's own favorite element) as the single living detail. The graph moves to where it belongs (§7.2, the substrate you summon).

First frame still answers *who / what* in under a second (DSVL/XA §2, kept). LCP is still a text node; CLS is still 0 (Landing Review performance floor, kept). The wonder is now *behavioral* (it booted) rather than *decorative* (it drew a constellation) — which is both more original and more defensible.

---

## 10. The Ledger — Keep / Kill / Add

**KEEP (the DSVL was right):**
- The single-accent discipline and ≥95%-neutral law.
- Typography system in full (§8 above).
- Hairlines as structure; the drawn-line illustration language.
- The freshness architecture and every honesty mechanic — *these become the spine of the aliveness.*
- Machine-readable-by-default; claims-quarantined-to-evidence; every-claim-a-link.
- No stock anything; no uncanny digital-Deepak; Dex has no face.
- The numeric motion budget; reduced-motion parity as a release criterion.
- Accessibility floors (contrast, focus ring as brand feature, keyboard grammar, touch targets).
- Both-modes-or-neither.

**KILL (the DSVL over-corrected):**
- "Depth is surface + hairline, *not* shadow" → replaced by the disciplined three-plane Z-axis (§5).
- Glass confined to two surfaces, apologetically → glass is the Readout material, with a clear rule (§5).
- 3D as a dormant, near-banned charter → replaced by the one-light material model (which is not "3D scenes," it is *lit 2.5D instrument*).
- The graph-motif hero and its fallback (§9).
- Silence → the optional sound layer (§7.6).
- "Emotional goals: trust → clarity → quiet delight" → **wonder (grounded in trust) → curiosity → confidence** as the top of the spine.

**ADD (the wonder engine the DSVL lacks):**
- The Cold Start (§7.1).
- The living substrate with depth-of-field focus (§7.2).
- Dex-operates-the-instrument (§7.3).
- The Diff for returning visitors (§7.4).
- Real telemetry margins (§7.5).
- The one-light material and the settle physics (§5, §6) — the true signature devices.

---

## 11. Anti-Patterns — so wonder never becomes spectacle

This direction opens doors the DSVL nailed shut. These rules keep the room from flooding. They are as binding as the DSVL's original 15.

1. **One light, always.** Any surface lit from a second direction is a defect. Coherent light is the whole trick; violate it and you are back in gradient-mush cyberpunk.
2. **Values settle; they never count up, spin, or bounce.** Overshoot > 2% or more than one oscillation is a bug. The needle finds true; it does not celebrate.
3. **Three depth planes. Never four.** Deck, Readout, Focus. A fourth plane is a parallax diorama — the thing you hate.
4. **Glass is a screen showing live state. Never decoration.** If a glass panel isn't a readout, it's a solid surface.
5. **Telemetry is real or absent.** An invented metric is a lie in ink; it detonates the entire honesty ethic. No fake pulses, ever.
6. **The boot is behavior, not theater.** No fake typing, no terminal, no `> whoami`, no progress-bar drama. The UI assembles; that's all. < 1s, skippable, once per session.
7. **Sound is invited, physical, and rationed.** Off by default, mechanical not musical, cut before anything else. A jingle is a failure.
8. **Wonder is rationed so calm survives.** The narrative motion budget (≤3/session) is inviolate. Aliveness is a *quality*, not a *quantity*. If a page has two wonder-moments competing, one is a bug (DSVL Law 15, kept).
9. **The instrument never brags.** No tooltip explains the physics; no copy says "beautiful" or "cutting-edge." Sophistication is the refusal to point at the magic.
10. **Everything in the DSVL's anti-pattern table (§15) still holds** — gradient text, terminal cosplay, odometer numbers, badge inflation, scroll hijacking, uncanny Deepak, too-much-glass-*as-decoration*. This direction *widens the material palette*; it does not repeal a single one of those bans.

---

## 12. The Honest Trade-off

This is a **more ambitious and more expensive** direction than the DSVL, and intellectual honesty requires naming the cost against your own principles:

- **"One maintainer, forever" is stressed.** Physics, a living graph, a sound layer, and a real telemetry pipeline are more to build and sustain than a borders-first document. *Mitigation:* the aliveness is **procedural** (systems that generate motion from real state) and **built on data you already maintain** (the freshness architecture). One settle system, one light model, one graph — infinite content flows through them. Craft is front-loaded, not recurring. But the front-load is real; do not pretend otherwise.
- **Wonder is harder to execute than restraint.** Restraint fails gracefully (worst case: plain and tasteful). Wonder fails loudly (worst case: gimmick). Every signature moment in §7 therefore ships with a **kill-to-restraint fallback** — if the boot, the sound, or the graph can't be made *exquisite*, it degrades to the DSVL's tasteful baseline rather than shipping mediocre. The DSVL is not the enemy; it is the **floor** this direction stands on and falls back to.
- **Risk is higher; so is the ceiling.** The DSVL's ceiling is "the most tasteful portfolio the evaluator has seen." This direction's ceiling is "the thing they show other people." You asked to be *remembered*. Remembering costs risk. This document accepts that trade openly and builds the safety nets in.

---

## 13. The Test — how to know it worked

Replace the DSVL's implicit test ("does this deposit trust?") with a **two-part** test, because trust alone was never the goal:

1. **The trust test (kept):** *Does this deposit trust, or is it cut?*
2. **The wonder test (new):** *In the first ten seconds, does a fresh visitor feel they are operating a real, living system they have never encountered before — and can they still find the work in under two?*

A moment must pass **both.** Wonder that costs trust is spectacle (cut it). Trust that costs wonder is the current problem (that is why we are here). The whole craft is holding both at once — an instrument that is astonishing *and* honest, alive *and* calm, unforgettable *and* legible in ninety seconds.

That is the lab you asked to build. Not a notebook about a researcher — **the running system of one.**

---

## Appendix — Relationship to existing docs

- **Supersedes:** the *emotional target* and *material/motion/depth/glass posture* of [`03-DESIGN_LANGUAGE.md`](03-DESIGN_LANGUAGE.md) §1, §3 (depth), §7, §8 (amplitude), §9. Requires a DECISIONS.md entry to bind.
- **Preserves:** DSVL §2 (typography), §4 (layout/grid), §6 (icon DNA), §10 (photography ethics), §11 (data-viz honesty), §12 (accessibility), §14 (most laws), §15 (all anti-patterns) — plus [`01-VISION.md`](01-VISION.md) in full.
- **Rewrites downstream:** [`specs/landing.md`](../specs/landing.md) (new hero, §9), [`08-ANIMATION_GUIDELINES.md`](08-ANIMATION_GUIDELINES.md) (settle physics, §6), and demands a new material/light token set alongside [`15-DESIGN_TOKENS.md`](15-DESIGN_TOKENS.md).
- **Aligns with:** the in-flight runtime architecture (D-037, D-038) — this document is that architecture's *soul*, not a departure from it.
