# 12 — Experience Architecture (XA)

> **Status:** Approved draft — v1.0 of the experience definition.
> **Owner:** Deepak (Experience) · Authored in the role of Experience Design Director.
> **Upstream sources of truth:** [`02-PRODUCT.md`](02-PRODUCT.md) (PRD) · [`11-SYSTEM_ARCHITECTURE.md`](11-SYSTEM_ARCHITECTURE.md) (system).
> **Downstream:** this document binds [`03-DESIGN_LANGUAGE.md`](03-DESIGN_LANGUAGE.md), [`04-INFORMATION_ARCHITECTURE.md`](04-INFORMATION_ARCHITECTURE.md), and [`08-ANIMATION_GUIDELINES.md`](08-ANIMATION_GUIDELINES.md). No visual design, wireframe, or implementation decision may contradict it without a [`../memory/DECISIONS.md`](../memory/DECISIONS.md) entry.

---

## 0. Strategic Assessment

Three corrections shape this document:

1. **Immersion is subordinate to the 90-second goal.** The PRD's highest-stakes visitor (an evaluator) gives this site two minutes. Any "immersive" moment that delays comprehension works against the product. The experience is therefore **calm-premium**: the immersion of a well-designed instrument, not of a theme park. Roughly half of the proposed animation techniques are rejected below (§6) — not because they're unimpressive, but because they're impressive *at the visitor's expense*.
2. **The Twin represents; it never impersonates.** "A digital extension of Deepak" must not mean the AI speaks *as* Deepak. A first-person "I built this system" from a model is fabricated testimony — and one uncanny or wrong answer in Deepak's voice poisons the trust the entire product exists to create (PRD G4: trust is binary). The Twin speaks as itself — a knowledgeable guide *to* Deepak's work — warm, precise, and explicit about what it is.
3. **The experience must be whole before the Twin arrives.** The AI ships in v1.5 (PRD tier P1, D-004). This XA designs the Twin as an *elevation* of an already-complete experience, with graceful absence in v1.0: no dead buttons, no "coming soon" — the entry points simply appear when the Twin goes live.

---

## 1. Experience Vision

**Visiting Deepak Labs should feel like being welcomed into the working environment of a researcher-engineer — a place where things are *made* — and being handed the keys.**

Not a brochure about the work; the workspace itself, opened to visitors. Everything follows from that metaphor:

- An operating system is **calm, legible, and responsive**. It never performs for you; it responds to you.
- An OS **rewards fluency**: the first visit is effortless, the tenth is faster (command palette, keyboard paths, familiar structure).
- An OS is **honest about state**: things load, save, think, and fail visibly and gracefully.
- An OS has **one ambient intelligence**, not popups: the Twin is present the way an assistant is present — available, aware, silent until addressed.

**Experience pillars** (every design decision must serve at least one):

| Pillar | Meaning |
| --- | --- |
| **Clarity first** | Comprehension in 90 seconds is sacred. Nothing delays or obscures it. |
| **Depth on demand** | Every surface offers a deeper layer — never forces one. |
| **Quiet confidence** | Premium through precision (type, spacing, timing), not through spectacle. |
| **Alive, not animated** | The system feels responsive and current — freshness signals, real data, subtle state — rather than decorated. |
| **Timeless over trend** | If a technique will look dated in three years, it doesn't ship. |

## 2. Visitor Journey

The core narrative (*Who is Deepak? → What problems does he solve? → How does he think? → What has he built? → What research? → Can I trust him? → How do I collaborate?*) maps onto seven journey stages. The site must serve visitors who complete the arc in two minutes **and** those who spend an hour.

| Stage | What happens | Experience mechanics |
| --- | --- | --- |
| **1. First impression** (0–10s) | Landing answers *who* and *what* immediately: name, identity (researcher × engineer), current focus, one line of proof. | No loading theater, no scroll-jacked intro. Identity is legible before any animation completes. |
| **2. Curiosity** (10–60s) | The landing's narrative scroll reveals the *problems → thinking → proof* arc in compressed form: highlighted projects, publications count, live GitHub signal, freshness cues. | Each section is a door, not a wall: skimmable summary + clear path deeper. |
| **3. Exploration** (1–5 min) | Visitor picks a lane — Projects, Research, Posts — via nav, palette, or the Twin. | Consistent page grammar (index → detail) so the second page is already familiar. |
| **4. Discovery** (5–15 min) | Cross-links pull the visitor sideways: a publication links to its implementing project; a project links to the post about its hardest decision. The graph reveals *how Deepak thinks*. | "Related" trails on every detail page; the Twin proactively offers connections ("this paper became that system"). |
| **5. Trust** | Accumulated evidence: real dates, real code, real venues, current activity, honest write-ups (trade-offs, failures). | Freshness indicators; source-linked claims; the Twin cites everything it says. |
| **6. Engagement** | Contact, CV download, GitHub follow, or a conversation with the Twin. | The collaboration path is ≤2 clicks from anywhere; contact is a page, not a hunt. |
| **7. Return** | Visitors come back for new posts, Radar (v2), or to show someone else. | RSS, stable URLs, "what's new since" surface, palette recall for power visitors. |

**The evaluator shortcut:** stages 1→2→6 directly. The landing must let a recruiter reach the CV or contact within three interactions, bypassing all storytelling. Story is the default path, never a toll gate.

## 3. Page Purposes

Shared grammar first — every content page inherits it:
- **Index pages** answer "what's here and where do I start?" (scannable, filterable, freshness-visible).
- **Detail pages** answer "what is this, why does it matter, what did it take?" (narrative + evidence + related trail).
- Every page ends with a **forward path** — no dead ends, ever.

### Landing
- **Primary purpose:** 90-second comprehension — who, what, why it matters.
- **Secondary:** route each persona to their lane (evaluator → CV/contact; researcher → publications; engineer → projects).
- **Visitor mindset:** "Is this worth my time?" — skeptical, hurried.
- **Key actions:** enter a lane; download CV; open the palette/Twin.
- **From:** external (résumé link, search, social). Must work with zero context.
- **To:** any lane; contact.
- **Emotional objective:** *intrigued and oriented* — "this person is serious, and I know where to go."

### About
- **Primary:** the human narrative — trajectory, motivation, how Deepak thinks.
- **Secondary:** CV download; the canonical bio.
- **Mindset:** "Who is this, really?" — evaluating fit and character.
- **Key actions:** read; download CV; continue to timeline or projects.
- **From:** landing ("who is Deepak?" answered in depth).
- **To:** Timeline (the evidence of the narrative), Contact.
- **Emotional objective:** *connection* — a person, not a profile.

### Projects
- **Primary:** engineering evidence — decisions, trade-offs, outcomes (not screenshots).
- **Secondary:** demonstrate range and depth; link the graph (papers, posts, repos).
- **Mindset:** "Can this person build real things?" — technical scrutiny.
- **Key actions:** open a project; follow a cross-link; visit the repo.
- **From:** landing highlights, Twin recommendation, GitHub.
- **To:** related publication/post; GitHub; next project.
- **Emotional objective:** *respect* — "this is real work, honestly told."

### Research
- **Primary:** the research narrative — themes, questions, trajectory (the connective tissue publications alone can't show).
- **Secondary:** frame publications; show *how he thinks* as a researcher.
- **Mindset:** "What is his research about, and is it going somewhere?"
- **Key actions:** explore a theme; open its publications and projects.
- **From:** landing, publications, Twin.
- **To:** Publications (the records), Projects (the implementations).
- **Emotional objective:** *intellectual engagement* — ideas with direction.

### Publications
- **Primary:** the verifiable academic record — accurate metadata, venues, links.
- **Secondary:** citation-ready export; trajectory at a glance.
- **Mindset:** "Verify and assess" — precise, checking.
- **Key actions:** find a paper; copy citation; follow to venue/PDF; see the implementing project.
- **From:** external citation/search (often lands directly on a detail), Research.
- **To:** Research (context), Projects (implementation), Contact (collaboration).
- **Emotional objective:** *confidence* — "accurate, current, legitimate."

### Experience Timeline
- **Primary:** the chronological spine — roles, education, milestones, and what each produced.
- **Secondary:** connect every era to its artifacts (projects, papers, posts).
- **Mindset:** "What's the trajectory?" — evaluator due diligence.
- **Key actions:** scan; expand an era; jump to its artifacts.
- **From:** About, landing.
- **To:** any linked artifact; Skills.
- **Emotional objective:** *momentum* — a life moving somewhere deliberate.

### Gallery *(v1.5)*
- **Primary:** the visual record — moments, places, artifacts; the human texture.
- **Secondary:** breathing room in an otherwise dense site.
- **Mindset:** curious, relaxed — "who is this person beyond the work?"
- **Key actions:** browse; open an image; read its story.
- **From:** About, wandering.
- **To:** back to content lanes (gallery items may link to their context).
- **Emotional objective:** *warmth* — personhood without oversharing.

### Posts
- **Primary:** thinking in public — technical writing that shows judgment.
- **Secondary:** the return-visit engine (RSS, recency).
- **Mindset:** reading mode — focused, generous with time *if the writing earns it*.
- **Key actions:** read; follow cross-links; subscribe (RSS); share.
- **From:** external links (posts are the most-shared surface), landing, Twin.
- **To:** related project/publication; more posts.
- **Emotional objective:** *absorption* — clean, quiet, superb reading.

### Skills
- **Primary:** current capabilities — *currently working on* vs. *previously worked on* (doubles as the "Now" freshness signal).
- **Secondary:** route to the proof (each skill links to the work that evidences it).
- **Mindset:** "Does his toolkit match my need?" — checklist scanning.
- **Key actions:** scan; follow a skill to its evidence.
- **From:** landing, Timeline.
- **To:** Projects/Publications that prove the skill.
- **Emotional objective:** *credibility* — claims wired to evidence, never a tag cloud.

### GitHub
- **Primary:** live engineering signal — activity, repositories, languages (from cache, per D-010).
- **Secondary:** bridge to the external presence.
- **Mindset:** "Show me the code" — the most skeptical audience.
- **Key actions:** scan activity; open a repo; jump to the linked project write-up.
- **From:** Projects, landing signal.
- **To:** GitHub itself; project write-ups.
- **Emotional objective:** *verification* — "the commits are real and recent."

### AI (the Twin's home) *(v1.5)*
- **Primary:** the full conversation surface — ask anything about Deepak's work.
- **Secondary:** demonstrate, by existing, exactly the AI engineering competence the site claims.
- **Mindset:** playful-testing or genuinely-inquiring; some will try to break it.
- **Key actions:** converse; follow cited sources; accept suggested questions.
- **From:** anywhere (global access); landing introduction.
- **To:** every cited content page — the Twin is a router into the graph.
- **Emotional objective:** *delight with substance* — "this is what a personal AI should be."

### News / Radar *(v2)*
- **Primary:** what Deepak is tracking — curated, categorized, dated.
- **Secondary:** return-visit habit; taste as signal.
- **Mindset:** grazing — light, recurring.
- **Key actions:** scan; open items; bookmark; (later) subscribe to digest.
- **From:** returning visitors, nav.
- **To:** external sources; bookmarks.
- **Emotional objective:** *usefulness* — worth a weekly visit on its own.

### Contact
- **Primary:** frictionless collaboration start — form + direct channels.
- **Secondary:** set expectations (what kinds of contact are welcome).
- **Mindset:** decided — "I want to reach this person." Do not lose them now.
- **Key actions:** send message; copy email; download CV.
- **From:** everywhere (≤2 clicks); the journey's terminal.
- **To:** confirmation with a clear "what happens next."
- **Emotional objective:** *ease and closure* — the easiest page on the site.

### Admin (considered separately)
The admin is a **tool, not an experience** — its aesthetic is speed. Zero decoration, dense information, keyboard-first, optimized for the PRD's ≤10-minute update loop. It shares the design system's bones (type, color, components) but none of the public site's narrative motion. Its emotional objective is *flow* for one user: Deepak. The freshness dashboard greets him with what needs attention, not with vanity metrics.

## 4. Navigation Philosophy

**The stance: navigation is chrome, and chrome should be quiet.** The OS metaphor is expressed not by elaborate menus but by *fluency* — every destination reachable in ≤2 interactions from anywhere, by mouse or keyboard.

The brief's six questions, answered:

1. **Fixed navigation?** Yes — a slim, persistent top bar (identity mark, primary lanes, palette trigger, Twin presence). It **condenses** on scroll (recedes visually) and, in long-form reading (posts, project details), hides on scroll-down / returns instantly on scroll-up. It never fully disappears anywhere else: an OS does not hide its system bar.
2. **When should it disappear?** Only during focused reading (above) and within full-screen gallery viewing. Never on the landing — orientation outranks immersion.
3. **AI globally accessible?** Yes — one persistent, consistent entry point (the Twin's presence mark in the nav region) on every public page, plus contextual invitations on content pages ("ask about this project"). In v1.0, these affordances simply don't exist yet — graceful absence, no stubs.
4. **Global search?** Yes — but **merged into the command palette**, not a separate search box. One entry point for "find anything."
5. **Command palette?** Yes — **the signature navigation move.** `Cmd/Ctrl+K` (and a visible trigger for non-keyboard users) opens a palette combining navigation, full-text search, actions (copy citation, download CV), and a hand-off to the Twin ("ask instead"). Nothing expresses "Personal Operating System" more literally, it serves power visitors and accessibility simultaneously, and it's cheap relative to its impact. **Discoverability rule:** the palette is an accelerator, never the only path — everything in it is also reachable by visible UI.
6. **Contextual navigation?** Yes — this is where navigation actually lives. Related-content trails on every detail page, prev/next within collections, breadcrumbs on detail pages, skill→evidence links, and the Twin's suggestions. The graph *is* the nav (PRD: "the graph, not the pages, is the OS").

**Hierarchy of navigation** (in order of design investment): contextual cross-links → command palette → top bar → footer (sitemap, RSS, meta).

## 5. Motion Philosophy

**Motion is information.** Every animated frame must tell the visitor something true: where they are, what just happened, what's related to what, what the system is doing. Motion that only says "look at me" is rejected by definition.

**Where motion serves:**

| Job | Application |
| --- | --- |
| **Support understanding** | Shared-element continuity (card → detail: "this became that"); timeline drawing itself to show sequence; diagram builds in scrollytelling. |
| **Guide attention** | Section reveals on the landing narrative; a single focal motion per view — never competing motions. |
| **Create anticipation** | Sub-200ms hover/focus states that make targets feel touchable *before* the click. |
| **Communicate state** | The Twin thinking; content loading (skeletons, not spinners); saves confirming; palette opening; sync freshness. |
| **Celebrate success** | Exactly two places: contact-form sent, and first Twin conversation completed. Nowhere else — celebration inflation is noise. |
| **Reduce cognitive load** | Page transitions that preserve spatial context (where you came from) instead of hard cuts. |

**Where motion is intentionally absent:**

- **Reading surfaces.** Once reading begins, the page is still. No parallax under text, no elements drifting in the periphery, no scroll-triggered surprises mid-article.
- **Data and evidence.** Publications metadata, citations, dates, the CV — instant, static, precise. Truth doesn't fade in.
- **Navigation chrome.** The nav bar doesn't bounce, glow, or morph. Chrome is quiet.
- **The admin.** Motion is only state feedback (saved, publishing, error). Speed is the aesthetic.
- **Anything the visitor didn't cause**, with one exception: the Twin's idle presence (§7), which is deliberately sub-perceptual.

**The timing doctrine** (detailed curves in [`08-ANIMATION_GUIDELINES.md`](08-ANIMATION_GUIDELINES.md)): interface feedback ≤200ms; transitions 200–350ms; narrative moments ≤600ms; nothing the visitor waits on, ever. If a motion delays a click's outcome, the motion loses.

## 6. Animation Placement — Technique Verdicts

Judged against the pillars (clarity, timelessness, maintainability, accessibility). "It's impressive" is not a criterion; "it will impress at the visitor's expense" is a veto.

| Technique | Verdict | Placement & justification |
| --- | --- | --- |
| **Scrollytelling** | ✅ Selective | The landing narrative only (the *who → problems → proof* arc), and optionally one flagship research explainer. It's the right tool for sequenced argument. Everywhere else it's a toll gate — and it must degrade to a plain readable document (§11). |
| **Hero cinematic animation** | ⚠️ Restrained | One signature moment on the landing — but identity text is legible *from the first frame*; the cinematic layers in behind it, completes ≤2s, plays once. A skippable intro movie is a self-indulgence the 90-second goal can't afford. |
| **3D rendering** | ❌ No (default) | High cost in performance, accessibility, and maintenance; ages fast; a solo maintainer inherits a rendering pipeline. Rejected as decoration. Narrow future exception: if a research artifact is *genuinely* 3D (a model, a spatial dataset), an isolated viewer may be specced separately. |
| **SVG line drawing** | ✅ Yes | The workhorse of "intellectually engaging": timeline strokes drawing in, architecture diagrams assembling, research figures explaining themselves. Cheap, crisp, meaningful, timeless — invest here instead of 3D. |
| **Liquid glass** | ❌ No | Trend-marked (it will date the site to this exact era), costly to render, and hostile to text contrast. The opposite of timeless. |
| **Glass morphism** | ⚠️ Contained | Permitted for exactly two overlay surfaces — the command palette and the Twin panel — where translucency communicates "a layer *above* the workspace." As a system-wide style: rejected (readability, datedness). Final call belongs to [`03-DESIGN_LANGUAGE.md`](03-DESIGN_LANGUAGE.md). |
| **Page transitions** | ✅ Subtle | 200–300ms continuity between routes — enough to feel like one continuous system (an OS, not a stack of documents), never a curtain. Instant-feel beats theatrical. |
| **Shared element transitions** | ✅ Yes — highest-value technique | Card → detail across projects, posts, gallery, publications. It *teaches the information architecture* ("this item became this page") while feeling premium. Prioritize over every other transition effect. |
| **Horizontal scrolling** | ❌ As page pattern | Breaks scrollbars, keyboards, screen readers, and visitor expectations. Permitted only as an *optional, contained* filmstrip inside the gallery with full vertical fallback. |
| **Vertical storytelling** | ✅ Default | The native axis of the web. The landing and research narratives are vertical. This is the baseline, not a feature. |
| **Magnetic interactions** | ❌ No | Cursor-gravity buttons are decoration that excludes touch and trackpad users and adds nothing to comprehension. |
| **Animated icons** | ✅ Micro only | State communication: menu ↔ close, theme toggle, copy-confirmed, the Twin's presence states. Functional garnish, ≤200ms, never looping for attention. |
| **Cursor effects** | ❌ No | Custom cursors and trails are the fastest way to feel like a 2021 portfolio template. Desktop-only, accessibility noise, zero informational value. The system cursor is a solved problem. |
| **Micro-interactions** | ✅ Everywhere — the core investment | Hover/focus states, press feedback, copy confirmations, form validation, save states, palette interactions. This is where "premium" actually lives: a thousand 100ms moments of the interface feeling *made*. Most of the motion budget goes here. |
| **Ambient background motion** | ⚠️ Two instances only | (1) The Twin's idle presence — sub-perceptual, alive-not-distracting (§7). (2) Optionally, one barely-perceptible field on the landing hero. Nothing ambient anywhere else; stillness is the premium. Both instances disabled under reduced motion. |

**The pattern behind the verdicts:** invest in motion that *teaches structure* (shared elements, SVG explanation, state feedback); reject motion that *performs* (3D, liquid glass, cursor effects, magnetism). The first ages into craftsmanship; the second ages into embarrassment.

## 7. The Digital Twin — AI Experience

**Identity:** the Twin is a named presence (name chosen in the design-language phase), introduced as what it is: *"I'm [name] — Deepak's digital twin. I know his projects, research, and writing, and I can take you anywhere in here."* It speaks **as itself, about Deepak** — never first-person-as-Deepak (§0.2). Its personality is the product's personality: precise, warm, unhurried, honest about limits. It is the workspace's resident intelligence, not a support widget.

**Idle state — present, not performing.** A small presence mark in the nav region with sub-perceptual "breathing" motion — the visual grammar of *alive and listening*. It never bounces, never pops up, never toasts "Hi there! 👋". **Contextual presence:** on content pages it may surface one quiet, dismissible affordance — *"Ask me about this project"* — appearing after genuine engagement (meaningful scroll depth), at most once per page, remembering dismissal. The Twin is noticed the way a good assistant is: when you look for it.

**Activation — many doors, one room:** the presence mark; `Cmd/Ctrl+K` → "ask"; contextual affordances; the AI page itself. All routes open the same conversation surface — a side panel over the current page (preserving context) that can expand to full view. Opening is instant; the greeting is contextual: on a project page, *"Reading about [project]? I can explain the design decisions or show you the research it came from."*

**Conversation:** answers are grounded and **always cited** — every claim links to its source page (the RAG architecture, D-009, made visible as an experience feature: citations are trust made clickable). Responses stream. Long answers arrive structured. Each answer ends with 2–3 *suggested follow-ups* that deepen the narrative arc (who → how he thinks → what he built → collaborate), which double as guided navigation.

**Context awareness:** the Twin knows the current page and the session's trail (client-held, ephemeral) and uses them: *"You've seen the vision-language work — the systems side of it is in this project."* Context makes it a guide; without context it's a search box with manners.

**Guide behaviors:**
- **Explains** projects and research at the visitor's level (can simplify or go deeper on request).
- **Recommends** by intent: "I'm a recruiter" → highlights + CV + contact; "I work on X" → relevant work.
- **Navigates**: answers can end with *"take me there"* actions that move the visitor to the page.
- **Research-assists**: compares themes, summarizes papers, traces idea → publication → implementation.

**Fallback — the off-domain moment as brand.** Retrieval-gated (per architecture): out-of-scope questions get a graceful, personality-consistent decline that always redirects to what it *can* do: *"That's outside what I know — I'm only trained on Deepak's work. I can tell you how he approaches [nearest topic], though."* Never lecture, never repeat the same canned line twice in a session (variants), never a bare refusal. In-domain-but-unknown gets honesty plus a path: *"I don't have that yet — it may predate my knowledge. Here's the timeline for that period, or you can ask Deepak directly."*

**Error handling:** if the service is slow — honest state (*"still thinking…"*), then a graceful timeout with retry. If down — entry points quietly reduce to a note: *"The twin is resting. Everything it knows is still here on the site."* The site never depends on the Twin; the Twin depends on the site (§0.3). Repeated failures hide the affordances for the session rather than repeatedly disappointing.

**Session memory:** within-session — conversation + trail context, held client-side, gone on close (privacy-respecting by default, per PRD). **Future-ready:** the conversation surface is designed so an opt-in *"remember our conversation"* (resume later, notify-on-new-content) can be added in v2 without redesign; explicitly out of scope now.

## 8. Emotional Journey

The narrative arc, rendered as feeling — with the failure mode each stage must avoid:

| Stage | Target feeling | Designed by | Failure mode to avoid |
| --- | --- | --- | --- |
| Arrival | **Intrigue + instant orientation** | Legible identity in frame one; one confident signature moment | Confusion, loading theater |
| First scroll | **"This is different"** | The narrative arc; restrained craft everywhere | "Another animated portfolio" |
| Exploration | **Flow** | Consistent grammar; fast pages; palette fluency | Disorientation, hunting |
| Depth | **Respect** | Honest write-ups with trade-offs; accurate records | Marketing gloss |
| Twin encounter | **Astonishment that resolves into usefulness** | Grounded, cited, genuinely helpful answers | Gimmick; one wrong answer |
| Decision | **Confidence** | Accumulated evidence + freshness + effortless contact | Friction at the moment of intent |
| Return | **Familiarity** | Stable structure, visible newness, RSS/Radar | Staleness — the one unforgivable feeling |

The emotional throughline is **trust compounding**. Every stage either deposits trust (evidence, honesty, craft, currency) or withdraws it (staleness, gloss, gimmick, error). The XA's job is to make deposits structural and withdrawals impossible-by-design.

## 9. Information Flow

How understanding accumulates — the narrative mapped to surfaces:

```
                    WHO IS DEEPAK?
                    Landing (10-sec answer) ──▶ About (full answer)
                          │
                    WHAT PROBLEMS? HOW DOES HE THINK?
                    Landing narrative ──▶ Research themes ──▶ Posts (thinking in public)
                          │
                    WHAT HAS HE BUILT?  WHAT RESEARCH?
                    Projects ◀────── cross-links ──────▶ Publications
                          │         (the graph:            │
                          │    paper ↔ project ↔ post      │
                          │      ↔ timeline ↔ skill)       │
                          ▼                                ▼
                    CAN I TRUST HIM?
                    GitHub (live proof) · Timeline (trajectory) ·
                    Skills→evidence · freshness signals · cited Twin
                          │
                          ▼
                    HOW DO I COLLABORATE?
                    Contact / CV  (≤2 clicks from anywhere)
```

**Flow principles:**
- **Layered disclosure:** every fact exists at three depths — glance (landing/index), summary (card/intro), full (detail). Visitors choose their depth; no depth is mandatory.
- **The graph is the flow:** lateral cross-links (paper↔project↔post) are the primary information architecture; lanes are just entry points. Two visitors can traverse entirely different paths and both arrive at trust.
- **Three navigators, one structure:** self-directed (nav + links), accelerated (palette), guided (Twin). All traverse the same graph — the Twin is a *voice interface to the information flow*, not a separate silo.
- **No dead ends:** every page ends with a related trail or a forward action. The flow always continues.

## 10. Interaction Principles

The constitution for every future design and implementation decision:

1. **Content before chrome.** The work is the interface; UI recedes.
2. **Never delay intent.** A visitor who knows what they want gets it instantly — motion, narrative, and the Twin serve the undecided, never obstruct the decided.
3. **Respond in ≤200ms.** Every input acknowledges immediately, even when the full result takes longer. Honest state over frozen silence.
4. **One focal event per moment.** Never two things animating for attention at once.
5. **Teach through consistency.** One page grammar, learned once. Surprise is spent on content, never on interaction patterns.
6. **Every claim is a link.** Skills → evidence; Twin statements → sources; timeline → artifacts. Assertions the visitor can verify are the trust engine.
7. **Keyboard is a first-class citizen.** Everything reachable by keys; the palette makes fluency a pleasure, not an accommodation.
8. **Fail gracefully, honestly, in-character.** Errors are calm, human, and always offer a path forward.
9. **The visitor's device is a guest room.** Fast on mid-range hardware, respectful of battery and data, no unsolicited sound, nothing chasing the cursor.
10. **When in doubt, remove.** (PRD principle 6, restated as the tiebreaker for every interaction debate.)

## 11. Accessibility Strategy

Accessibility is a design input, not a compliance pass. Four binding commitments:

**Reduced motion — full experience parity.** `prefers-reduced-motion` yields a *complete, first-class* experience: every meaning-bearing motion has a static equivalent (shared-element transitions → instant navigation with clear headings; scrollytelling → a plain sequential document; SVG draw-ins → drawn diagrams; Twin breathing → static mark with text state). Nothing communicated only through motion; nothing gated behind scroll-triggered reveals — content exists in the DOM regardless.

**Keyboard-only — the fluent path, not the fallback.** Full traversal in logical order; visible, designed focus states (same craft as hover states); palette fully keyboard-native; skip-links; focus correctly managed across route changes, palette open/close, and Twin panel open/close (return-to-trigger on dismiss); reading-mode nav-hiding never traps focus.

**Screen readers — the narrative survives without the visuals.** Semantic landmarks and heading hierarchy mirror the information flow (§9); the Twin panel is a proper dialog with live-region streaming announcements, labeled suggested follow-ups, and citations as real links; state changes (loading, saved, sent, declined) are announced; images carry meaningful alt text (gallery alt text tells the image's story); the timeline and diagrams have textual equivalents.

**Structural guarantees:** color never the sole state carrier; contrast meets WCAG AA minimum (targets set in `03`); touch targets sized honestly; the site remains fully usable — every page, every content item, contact — with JavaScript-degraded rendering wherever the architecture's SSG output allows.

**Test discipline:** keyboard-only and reduced-motion passes are release criteria for every feature, not audit findings.

## 12. Experience Risks

| Risk | Severity | Mitigation |
| --- | --- | --- |
| **Immersion tax** — narrative/motion delays the 90-second goal | High | Identity legible in frame one; evaluator shortcut (§2); motion never blocks intent (§10.2); scrollytelling confined to landing. |
| **Twin overpromise** — "digital twin" sets expectations one bad answer destroys | High | Represents-not-impersonates (§0.2); citations on everything; retrieval-gated declines; honest introduction of what it knows; v1.5 launch only after corpus depth (D-004). |
| **Twin overshadows content** — visitors play with the AI, skip the work | Medium | The Twin routes *into* content (navigation actions, citations); its success metric is pages visited after conversing, not messages exchanged. |
| **Premium becomes slow** — craft moments accumulate into heaviness | High | Timing doctrine (§5); performance budgets as release criteria; mid-range hardware as the test target. |
| **Motion fatigue on return visits** — delightful once, tedious tenth time | Medium | Narrative moments play once per session; interface motion is fast and functional; returning visitors hit cached, instant pages. |
| **Bespoke-moment maintenance** — signature experiences rot under one maintainer | Medium | Few signature moments (landing, palette, Twin) built on the shared system; everything else is the consistent grammar. Kill-switch: any experience that can't be maintained gets simplified, not left broken. |
| **Palette invisibility** — the signature nav goes undiscovered | Low | Visible trigger in nav; palette is accelerator-not-sole-path (§4.5); gentle hint once per first visit. |
| **Graceful absence fails** — v1.0 feels like it's missing its centerpiece | Low | v1.0 is designed complete (§0.3); the Twin's arrival is an *event* (a "new resident" moment), not a filled hole. |

## 13. Future Experience Ideas

Unscheduled; each requires an XA amendment before design:

- **Ambient knowledge map** — an explorable visual of the content graph (papers↔projects↔posts) as an alternative navigation surface; the "OS desktop" fully realized.
- **Twin voice conversation** — spoken interaction for the AI page.
- **Visitor-intent lenses** — "I'm a recruiter / researcher / engineer" toggles that re-weight landing emphasis (explicitly *not* dark-pattern personalization; visitor-controlled, transparent).
- **Reading trails** — opt-in "continue where you left off" for returning readers (pairs with Twin session memory, v2).
- **Radar as morning surface** (v2) — a genuinely daily-usable reading view with the Twin summarizing the week.
- **Presence honesty** — a subtle "Deepak is currently working on…" live signal drawn from real activity (the freshness principle made ambient).
- **Print/PDF grace** — publications and CV surfaces designed to print beautifully (academia still prints).

---

## Appendix — Downstream Obligations

What this XA binds other documents to deliver:

| Document | Must specify |
| --- | --- |
| [`03-DESIGN_LANGUAGE.md`](03-DESIGN_LANGUAGE.md) | Visual system serving "quiet confidence"; the Twin's name and visual identity; glass-morphism final call (§6); contrast targets (≥ WCAG AA). |
| [`04-INFORMATION_ARCHITECTURE.md`](04-INFORMATION_ARCHITECTURE.md) | Routes, content model, and cross-link (relation) taxonomy realizing the graph (§9); palette content sources. |
| [`08-ANIMATION_GUIDELINES.md`](08-ANIMATION_GUIDELINES.md) | Concrete durations/easings per the timing doctrine (§5); technique implementations per verdicts (§6); reduced-motion equivalents per §11. |
| [`../specs/ai-assistant.md`](../specs/ai-assistant.md) | The Twin's behaviors (§7) as functional requirements: persona rules, citation UX, fallback copy system, context awareness, graceful-degradation states. |
| [`../specs/admin-dashboard.md`](../specs/admin-dashboard.md) | Speed-first tool experience (§3, Admin); freshness-forward dashboard. |
