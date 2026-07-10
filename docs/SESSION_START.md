# DEEPAK LABS — MASTER SESSION START
> **This is the single file every AI assistant reads first.** It is the complete context for continuing work. Everything here is derived from the docs/ and memory/ system — when in doubt, those files are authoritative. Last compiled: 2026-07-10 · Version `v0.5.0-alpha`

---

## TABLE OF CONTENTS
1. [Executive Summary](#1-executive-summary)
2. [Project Vision & Goals](#2-project-vision--goals)
3. [Evolution Timeline](#3-evolution-timeline)
4. [The Constitution — 10 Immutable Laws](#4-the-constitution--10-immutable-laws)
5. [Design Philosophy & Creative Direction](#5-design-philosophy--creative-direction)
6. [Product Philosophy](#6-product-philosophy)
7. [Knowledge Engine & Reconstruction Design](#7-knowledge-engine--reconstruction-design)
8. [Dex — AI Assistant Architecture](#8-dex--ai-assistant-architecture)
9. [The Digital Twin Philosophy](#9-the-digital-twin-philosophy)
10. [The Knowledge Graph](#10-the-knowledge-graph)
11. [Admin CMS Architecture](#11-admin-cms-architecture)
12. [System Architecture](#12-system-architecture)
13. [Technology Stack](#13-technology-stack)
14. [Folder Structure](#14-folder-structure)
15. [Data Schema](#15-data-schema)
16. [Design System](#16-design-system)
17. [Animation Language](#17-animation-language)
18. [Brand Guidelines](#18-brand-guidelines)
19. [Component Philosophy](#19-component-philosophy)
20. [Coding Standards](#20-coding-standards)
21. [AI Workflow](#21-ai-workflow)
22. [Current Implementation Status](#22-current-implementation-status)
23. [Development Roadmap](#23-development-roadmap)
24. [Open Tasks & Blockers](#24-open-tasks--blockers)
25. [All Architectural Decisions (D-001 → D-039)](#25-all-architectural-decisions-d-001--d-039)
26. [Lessons Learned](#26-lessons-learned)
27. [Glossary](#27-glossary)
28. [Prompting & Repository Conventions](#28-prompting--repository-conventions)
29. [How to Start a New AI Session](#29-how-to-start-a-new-ai-session)

---

## 1. EXECUTIVE SUMMARY

**Deepak Labs** is a Personal Operating System — not a portfolio. It is the canonical record of one AI engineer's research, projects, publications, writing, and experience, rendered as a living digital workspace that a visitor walks into, not a brochure they scroll through.

**The core metaphor (final, `docs/26`):** **The Living Memory.** The site doesn't load pages — it *recalls memories*. The graph is semantic memory. Dex is the act of recall. The Twin is attention. The visitor enters a mind and watches it think.

**The governing question:** *Does this feel like exploring a living memory?* If no — cut it, no matter how good it looks.

**Version:** `v0.5.0-alpha` · **One maintainer** (Deepak) · **Decade horizon** · **Personal budget**

**What makes it defensible:** anyone can copy the aesthetic. Nobody can copy Deepak's actual thinking — the structure, connections, abandoned branches, and specific texture of these memories are downstream of one real mind. The value is the contents, which are unrepeatable.

---

## 2. PROJECT VISION & GOALS

### The Vision (`docs/01`)
> A single, permanent digital home where everything Deepak produces — research, engineering, publications, writing, and experience — lives as one coherent, continuously current system, owned outright rather than rented from platforms, and equally legible to a hiring manager skimming for 90 seconds, a researcher verifying a citation, and an AI answering on Deepak's behalf.

### The Problem
Deepak's professional record is fragmented across rented platforms (LinkedIn, GitHub, Scholar), each telling a partial, platform-shaped story. Generic portfolios cannot express the researcher–engineer dual identity, decay because updating them is painful, and are illegible to AI systems that increasingly mediate discovery.

### What Success Looks Like
- All external profiles link here; this site is newer and deeper than any of them
- A first-time evaluator understands who Deepak is and why it matters in under 2 minutes
- The system is never more than a week behind Deepak's real life
- Dex answers accurately from the corpus only and declines everything else
- Any future human or AI can resume development from this repository's documentation alone

### Time Horizon
- **Years 1–2:** the canonical record — complete, current, discoverable
- **Years 3–5:** the knowledge graph — densely interlinked, navigable trajectories
- **Years 5+:** the agent-era presence — the authoritative structured source AI intermediaries consult about Deepak

### Product Principles
1. **Canonical or nothing** — this is where the truth lives; external platforms are mirrors
2. **Signal in 90 seconds** — depth is available, never required
3. **Alive by design** — every surface updatable in minutes from admin, or it doesn't ship
4. **Machine-readable by default** — humans and AI consume the same structured record
5. **One maintainer, forever** — recurring effort must justify itself or be cut
6. **Restraint is the aesthetic** — fewer surfaces, deeper content

### Target Audience (ordered by strategic importance)
1. **Evaluators** — recruiters, hiring managers, admissions committees, grant reviewers. Highest stakes, shortest attention.
2. **Researchers & academics** — verifying publications, exploring research lineage, seeking collaboration.
3. **Peer engineers & collaborators** — assessing technical depth via projects, posts, GitHub activity.
4. **Deepak (admin)** — the daily CMS user. If updating is painful, the product dies.
5. **AI systems** — crawlers and assistants that increasingly mediate how people are discovered.

---

## 3. EVOLUTION TIMELINE

| Session | What happened | Version |
|---------|--------------|---------|
| 1 | Repository initialization — directory structure, docs/ templates, memory/ context system | v0.1.0-alpha |
| 2 | Full PRD authored (`docs/02`) — product definition, feature tiers, personas | v0.1.0-alpha |
| 3 | System architecture (`docs/11`) — modular monolith, PostgreSQL + pgvector, all D-007→D-014 | v0.1.0-alpha |
| 4 | Experience Architecture (`docs/12`) — visitor journey, motion doctrine, Dex design, D-015→D-017 | v0.1.0-alpha |
| 5 | Design System (`docs/03`) + Animation Guidelines (`docs/08`) — Graphite & Paper, Dex named, D-018→D-020 | v0.1.0-alpha |
| 6 | Information Architecture (`docs/04`) — 4-lane nav, route map, relation taxonomy, D-021→D-022 | v0.1.0-alpha |
| 7 | Wireframe Specification (`docs/13`) — 5-archetype system, ~26 screens, D-023 | v0.1.0-alpha |
| 8 | Brand Identity (`docs/14`) — wordmark-first, plain-names vocabulary, D-024 | v0.1.0-alpha |
| 9 | Design Tokens (`docs/15`) — three-tier architecture, component contracts, D-025 | v0.1.0-alpha |
| 10 | Landing Page Spec (`specs/landing.md`) — typographic hero, drawn graph motif, D-026 | v0.1.0-alpha |
| 11 | Landing Review (`docs/16`) — adversarial review, 84/100, amendments R1–R6, D-027 | v0.1.0-alpha |
| 12 | **Sprint 0 — First code** (`apps/web`) — Next.js 15, Tailwind v4, token system, foundation, D-028 | v0.2.0-alpha |
| 13 | **Sprint 1 — Landing page implemented** — CSS-only LCP, graph motif, graceful absence, D-029 | v0.3.0-alpha |
| 14 | **Owner supersession** — hero becomes interactive 3D scene. D-030/D-031, `docs/17` | v0.3.0-alpha |
| 15 | Hero Scene Bible (`docs/18`) — per-object bible, Twin style, Dex lifecycle, D-032 | v0.3.0-alpha |
| 16 | Hero Art Direction (`docs/19`) — "The Drafted Laboratory" (G×H hybrid), D-033 | v0.3.0-alpha |
| 17 | Hero Moodboard (`docs/20`) — look-dev contract, 8-point checklist, D-034 | v0.3.0-alpha |
| 18 | Blender Pipeline (`docs/21`) — artist handbook, .blend is not the scene, D-035 | v0.3.0-alpha |
| 19 | Hero Runtime Architecture (`docs/22`) — engine = React Three Fiber, D-036 | v0.3.0-alpha |
| 20 | **Sprint H-01 — Hero runtime foundation shipped** (`features/hero-scene/`), D-037 | v0.4.0-alpha |
| 21 | Personal OS Runtime (`docs/23`) — kernel + 10 runtimes, two-plane Kernel override, D-038 | v0.4.0-alpha |
| — | V2 Design Bible (`docs/24`) frozen — dark-first, committed palette, 5-archetype system, D-039 | — |
| — | Creative Direction docs — `docs/17-CREATIVE_DIRECTION.md` (The Instrument), `docs/25-PROJECT_ORIGIN.md`, `docs/26-THE_LIVING_MEMORY.md` | — |
| — | **Sprint HS-1 — Hero Scene V2 + V2 tokens shipped** | v0.5.0-alpha |
| — | **Landing V2 rebuilt** — four-beat story (Arrival/Mission/Evidence/Collaborate) | v0.5.0-alpha (unreleased) |

---

## 4. THE CONSTITUTION — 10 IMMUTABLE LAWS
> Source: `docs/CONSTITUTION.md`. These override any brief, any design, any feature request. A change that violates a law is rejected — not debated.

| Law | Statement |
|-----|----------|
| **LAW-001** | **Nothing is presented. Everything is reconstructed.** Pages never open. Content never loads. Knowledge reconstructs from its own structure, in front of the visitor. |
| **LAW-002** | **Identity is discovered. Never introduced.** Deepak is the last thing a visitor learns. The work introduces the person. |
| **LAW-003** | **Every artifact answers: "What question created me?"** No project, paper, or skill exists without the question that caused it. The question is a required field, not a nicety. |
| **LAW-004** | **Every conclusion exposes its abandoned branches.** Failure is a first-class entity. A shipped system that hides dead ends is dishonest and incomplete. |
| **LAW-005** | **The graph is not navigation. The graph is memory.** Relationships are not links between pages; they are the associative structure of a mind. Generated from relationships — never drawn by hand. |
| **LAW-006** | **Dex recalls. It never invents.** Retrieval is grounded, cited, honest. If the memory does not contain it, Dex says so. One fabricated answer poisons the entire system. |
| **LAW-007** | **Stillness is the default. Motion exists only when meaning changes.** The resting state is quiet. Movement is reserved for a change in understanding — never decoration. |
| **LAW-008** | **Honesty over completeness.** An empty shelf beats a fabricated one. `verified: false` beats an invented metric. Unformed is a legitimate, honest state. |
| **LAW-009** | **The 90-second Brief is sacred.** Every artifact has a fast path. A recruiter must understand it in under 90 seconds. The immersive path never blocks the fast path. |
| **LAW-010** | **Every interaction teaches how Deepak thinks.** If an interaction does not reveal reasoning — a question, a choice, a correction — it does not earn its place. |

---

## 5. DESIGN PHILOSOPHY & CREATIVE DIRECTION

### The Core Metaphor: Living Memory (`docs/26`)
The definitive north star. Everything is a memory: projects are conclusions/deployments, publications are crystallized ideas, research experiments are hypotheses under test, failures are abandoned branches honestly kept, posts are reflections, the timeline is consolidation history, skills are procedural memory, the graph is semantic memory, Dex is working memory/recall, the Twin is attention.

**The cognitive spine:** `Question → Hypothesis → Experiment → (Failure → Iteration)* → Insight → Publication → Deployment`

### The Instrument Direction (`docs/17-CREATIVE_DIRECTION.md`)
The V1 DSVL was a trust engine with no wonder engine. The owner directive required wonder → curiosity → confidence → engineering → precision → calm → sophistication (in that order). The resolution: **the Instrument** — a personal research operating system that feels *running*, aware, precise. Wonder through aliveness, not through spectacle.

**Key shifts from V1 → V2:**
- Lab notebook (read) → Instrument (operated)
- Past tense (a record) → Present tense (currently working)
- Trust first → Wonder grounded in trust
- Implied depth → Disciplined Z-axis (3 planes: Deck / Readout / Focus)
- No glass → Glass as readout material, with a strict rule
- Silence → Optional physical sound layer (off by default)

### The Drafted Laboratory Art Direction (`docs/19`)
Direction G (Drafting Space) × Direction H (Warm Lab) = **The Drafted Laboratory**: matte solids carrying hairline construction-line edges. New content enters as ink lines resolving into form. The accent means "the live line." At rest ≥80% of the scene is fully solid. **The Twin is exempt from construction lines — the human is never rendered as a diagram.**

**Tier continuity** is the decisive argument: Tier 0's 2D drawn motif is the same world at its drawing layer — one art direction, honest at every fidelity.

### V2 Seven Experiential Laws (`docs/24` §0.3)
1. **Alive, not animated.** Motion from state/physics, never decoration.
2. **Calm at rest.** Default frame is still and quiet.
3. **The room survives the ceiling.** Every rich layer is enhancement over a complete DOM floor.
4. **One accent is signal; two accents are noise.**
5. **Numbers are truth; they settle, they never spin.**
6. **Every claim links to its evidence.**
7. **The instrument never brags.**

### Project ORIGIN Philosophy (`docs/25`) — retained ~80%
Three psychological commitments:
1. **Discovery over announcement** — we remember places we *found*, not pitches we *received*
2. **The world precedes the visitor** — it was running before you arrived; it keeps running after you leave
3. **Identity is earned, never given** (The Golden Rule — Deepak is discovered last)

Emotional arc: **Stillness → Curiosity → Recognition → Intimacy → Conviction**

---

## 6. PRODUCT PHILOSOPHY

### What This Product Is Not
- Not a portfolio template
- Not a social network (no reactions, comments, followers)
- Not a news product (Radar is personal tracking only, v2)
- Not multi-tenant, not monetized
- Not an experiments playground

### The 90-Second Fast Path is Sacred
Even a memory has a summary. A permanent, obvious, quiet affordance collapses the whole mind into **the consolidated gist**: who Deepak is, current focus, top work, publications, CV, contact — in 90 seconds on the fast path. This *is* the recruiter surface, the SEO surface, and the accessibility surface. Deep recall is the reward for the curious; the gist is the right of everyone.

### The Honesty Engine
- No publications? The shelf is **visibly, unashamedly empty**
- A project unfinished? It is marked **In Progress**, you can watch it be unfinished
- An experiment failed? It is in the notebook, **labeled as failure, with what was learned**
- A quiet week? The room is quiet — never manufactured motion
- A busy Deepak who doesn't touch the site for a month leaves behind "a calm lab," not "a dead site"

This is not a disclaimer. It is the source of trust the entire experience runs on.

### The No-Fake-Data Law
**Absolute.** Empty sections self-hide. An "empty-looking" page in dev is correct behavior, not a bug. No placeholder statistics, no dummy projects, no fake node counts. Every number is real or it doesn't render.

---

## 7. KNOWLEDGE ENGINE & RECONSTRUCTION DESIGN

### The Reconstruction Interaction (`docs/26` §4)
When a memory is recalled, it does not simply appear — it **assembles from its associations**: the related memories surface first (the context that gives them meaning), then the memory reconstructs before you. This mirrors how human memory *and* retrieval-augmented systems actually work — recall is reconstruction from associated fragments, never a file fetch.

- **Navigation is association.** You move memory-to-memory along edges of meaning — "this reminds me of that"
- **Search is a retrieval cue.** A query lights the neighborhood it triggers; the graph reconstructs
- **The forgetting curve is honest, not destructive.** Old, unrecalled memories recede — dimmer, further, cooler — but are never deleted. A recall cue can re-activate them

### The Memory Palace / Space as Consequence (`docs/26` §5)
The method of loci — using space to hold memory — is the 2,000-year-old cognitive technique behind the "lab" metaphor. The desk is where **attention is dwelling on the freshest memory** — warm, bright, near. The "distant dark" is long-term memory, consolidated and cool. Space is a consequence of memory's structure, never the other way.

### The Cognitive Ontology (`docs/26` §3)
| Content | Cognitive object | Why |
|---------|-----------------|-----|
| Publications | Crystallized ideas | A published result is thought hardened into knowledge |
| Projects | Conclusions / deployments | Shipped system = where reasoning became real |
| Research/experiments | Hypotheses under test | The open questions, mid-thought |
| Failures | Abandoned branches | Pruned reasoning, honestly kept |
| Posts | Reflections | Working a thought through in the open |
| Timeline | Consolidation history | Biography of a mind, not a résumé |
| Skills | Procedural memory | What the mind can now *do* |
| Gallery | Episodic memory | The felt, remembered instants |
| Reading/Radar | Perception / encoding | The mind's current intake from the world |
| Knowledge graph | Semantic memory | Meaning *is* the connections |
| Dex | Working memory / recall | Traverses the memory graph to reconstruct |
| The Twin | Attention | Where cognition is currently focused |

### Time as Consolidation (`docs/26` §8)
- **Recent memories** = working memory: bright, near, warm
- **Old memories** = long-term: settled, distant, cool
- A new commit or paper = **a memory forming** — encoding beat, then it settles and connects
- **Between visits**, the memory consolidates; Dex surfaces what consolidated while you were gone
- A quiet week = honest quiet mind — never faked

---

## 8. DEX — AI ASSISTANT ARCHITECTURE

### What Dex Is
The resident intelligence of the OS. The act of recall and association, given a quiet voice. It doesn't "know about Deepak" — **it knows Deepak's memory**, and it answers by *traversing the graph*, not searching a page. Ask about ShortcutScore and Dex *recalls* it: walks the memory, surfaces associated hypotheses, abandoned branches, crystallized result, reconstructs with citations lighting up along the path.

### The Hard Rules
- Dex speaks **about** Deepak, never **as** Deepak (an error in his voice = fabricated testimony)
- Every answer is **fully cited** with links into the corpus
- Dex **answers only about Deepak's work** — politely declines everything else, in-character: *"I only know what happens in this room"*
- **Never fabricates** — one invented answer poisons the entire feature. Gating is the primary guard, not the prompt
- ≥95% grounded-answer rate and 100% correct off-topic declines are the release gates before Dex goes live

### Technical Architecture (`docs/11` §11, D-009)
- **RAG** grounded in published content + resume + future docs
- Vectors in **pgvector** (same Postgres as the rest of the data)
- **Event-driven re-embedding on publish** — knowledge is always current
- **Three-layer domain restriction:** retrieval gating (decline before LLM call if nothing clears threshold) → system prompt → optional classifier
- **Source-cited answers** — every claim links to its corpus entry
- Provider-agnostic behind an interface (the LLM model is a pluggable detail)

### Dex's Body
No face. No avatar. **The presence dot** is the whole body: a small Signal-luminance circle with sub-perceptual breathing (~2.4s period). Breathing deepens while thinking (amplitude, not speed — calm under load). In the 3D scene, Dex is the luminous graph-dweller. In flat UI, Dex is the dot in the nav + the glass panel. **The dot is the product's only permitted ambient loop.**

### The Conversation Surface
- **Entry points:** ⌘K → "Ask Dex" · persistent dot in nav · Act-V affordance in the hero scene · context chips on any page ("Ask about this project")
- **Form:** glass side-panel (desktop) / bottom sheet (mobile) — **rides over the current page, never navigates away**
- **The signature behavior:** Dex answers by **operating the interface** — cited nodes illuminate in the graph, relevant content resolves, the answer assembles with citations you watch land. Answer and interface are one act.
- **States:** `resting` · `listening` · `thinking` (breath deepens) · `streaming` (text in chunks, citations as real links) · `declining` (calm, in-character) · `unavailable` (v1.0 pre-corpus: entry points quietly reduce, site fully usable — graceful absence)
- **v1.5 feature** — ships only after the corpus is populated

### Dex Trust Rules
- Scope statement always visible: "I know everything Deepak has published here, as of ⟨date⟩"
- No per-character typewriter effects (terminal cosplay — banned)
- Streaming text renders in sensible chunks; citations are real links
- Answer testing in admin before Dex goes live (Part 11.6)

---

## 9. THE DIGITAL TWIN PHILOSOPHY

### The Twin is Attention
Mostly **invisible**. The visitor perceives attention as movement in the memory: a node brightens, an edge forms, a cluster reorganizes — something is thinking here. Rarely, and only when earned by depth, attention **resolves into a figure at the heart of the memory**, glimpsed, then gone.

### Vocabulary Rule
**"The Twin"** = the stylized 3D representation of Deepak at the workbench in the hero scene. **"Dex"** = the AI entity. **Never conflate.** This distinction is load-bearing and must be preserved in every conversation, every file, every comment.

### The Twin's Rules (`docs/18`, `docs/24` §7)
- Stylized-sculptural. Not photoreal, not cartoon, not anime. Target: Apple-WWDC/Arc-grade clean sculptural forms
- Matte ceramic-like skin (roughness ≈0.8) — no subsurface scattering, no pores, no photoreal specular
- Hair as sculpted mass, not strands
- **Eyes suggested, not simulated** — no eye contact with camera, ever. No close-ups, ever.
- Expression: calm, fixed, focused on work
- Graphite-neutral materials — the only warmth is the task-light falling on him
- **Exempt from construction lines** — the human is never rendered as a diagram
- States: `resting` (idle breath loop) · `attended` (subtle head glance, once) · `working` (focused on bench) · `handoff` (Act V, leans back as Dex takes focus)
- No talking, no gesturing at the camera, no waving. **Dignity over demo.**

### The Likeness Gate ⟨GATE — OWNER REQUIRED⟩
No reference photos of Deepak exist in the repo. Gate #1 = owner supplies reference photos → style frames commissioned → uncanny check. If references never arrive, a **clean silhouette/abstracted figure ships** — the scene works without a face.

### Blender Production Pipeline (`docs/21`, D-035)
The `.blend is NOT the scene.` Blender authors only:
- **The Twin** (LOD0/1/2 at 60k/25k/8k tris + 23-bone rig + 5 animation clips: 4s breath, two weight-shifts, 0.8s head glance, hand-adjust — all returning to base pose)
- **The bench set** (bench + tools + dock)
- **The camera rail** (keyed 0–100 = scroll 0–100% with named framing markers)

Everything else (graph nodes/edges, Dex, atmosphere, lighting, signature shaders — construction-line pass, halos, vellum) is **runtime/procedural**.

Export chain: Blender glTF → gltf-transform (Draco 14-10-12 + KTX2) → validator zero-errors. Textures ≤8MB.

---

## 10. THE KNOWLEDGE GRAPH

### In-Scene Graph (`docs/24` §6.4)
- **Real data, luminance-not-hue.** All nodes are graphite; importance/recency = **brightness and proximity**, never color (upholds one-accent discipline). Accent marks only the active/hovered node's neighborhood.
- **Physics that settle and stop.** Force layout resolves on load and *halts*. Never a writhing particle field.
- **Focus behavior:** hover/focus a node → it and neighbors brighten in Signal, rest rack out of focus into depth (real DoF)
- **Growth on publish:** a newly published node is *drawn into existence* (construction-line → solid) with a single birth pulse
- **Particles-as-information:** every particle is a real datum (birth, commit, citation, selection). **Ambient sparkle is permanently banned.**
- Recency-as-proximity: freshest work floats near the Twin in warmer light; older work recedes into cooler atmosphere

### In the Runtime (`docs/22`)
- Instanced graph: nodes = 1 `InstancedMesh` with per-instance attributes, edges = 1 merged geometry
- **Target: 2 draw calls** for the entire graph
- Per-instance `instanceId` for hover detection
- `bootProgressRef` drives the staggered draw-in (outward from Twin, ordered by recency)

### The Graph as Navigation Substrate (`docs/26` §5, `docs/17-CREATIVE_DIRECTION` §7.2)
The graph is **not** a hero ornament — it is the semantic memory of the OS. Navigation *is* traversal. Focus a node → its neighborhood illuminates in Signal while everything else racks out of focus into depth. A query reorganizes the constellation to answer. Edges are relationships you can walk.

### Relation Taxonomy (closed set — additions require a decision entry)
| Kind | Meaning |
|------|---------|
| `implements` | project → publication |
| `writes-about` | post → project or publication |
| `produced` | timeline_entry → any artifact |
| `evidences` | skill → project, publication, or post |
| `depicts` | gallery_item → any |
| `references` | any → any (use sparingly) |

---

## 11. ADMIN CMS ARCHITECTURE

### Philosophy (`docs/24` Part 11)
The admin is the product's heartbeat — if updating is painful, the product dies. The target update loop is ≤10 minutes from finished work to published. Compact-density, keyboard-first, single-user. Mobile admin is triage-grade by design (review/publish, not deep authoring).

### The Universal Content Editor
One editor for all content types (only fields differ):
- **Two-pane:** left = form + Markdown body (live preview toggle); right = metadata (slug, status, dates, tags, relations)
- **Relations UI:** typed relation builder — pick kind → search target → link. Bidirectional links created automatically. This is how the graph is authored.
- **Lifecycle:** `draft → scheduled → published → archived`, each transition versioned
- **Version history** with diff and restore; **schedule** future publish; **preview** as the live page
- **Publish bar** (sticky bottom): Save draft · Preview · Schedule · Publish

### Content Sections
Projects · Research · Publications · Posts · Timeline · Skills · Gallery · News/Radar · Media · Analytics · AI Knowledge Base · Settings

### Freshness Engine (§11.2)
Overview cards show **content freshness warnings** ("Skills not updated in 47 days — amber"). Freshness is surfaced because staleness is the brand's mortal enemy — the admin nags Deepak to stay current.

### AI Knowledge Base (§11.6)
- Corpus view: what Dex knows, per item, with embedding status (synced / pending / stale)
- Sync: automatic re-embedding on publish (event-driven); manual "re-sync" button
- Gap review: questions Dex declined weakly → prompts content gaps
- **Answer testing:** ask Dex a question, see retrieved chunks + citations, verify grounding before public relies on it
- **Dex does not go live until answer-testing passes** (≥95% grounded, 100% correct declines)

### Settings (§11.7)
Identity fields, outbound links, CV upload, theme defaults, SEO/OG, RSS, **full content export (JSON + Markdown)** — content is owned and portable by construction — and a clearly-fenced danger zone.

---

## 12. SYSTEM ARCHITECTURE

### Shape: Modular Monolith (D-007)
One deployable application, internally partitioned into strongly-bounded modules. Background work (GitHub sync, news ingestion, embeddings, digests, scheduled publishing) runs as scheduled jobs/async workers on the same codebase and datastore.

```
apps/web      → public site (SSR/SSG, SEO-first) — only app built so far
apps/admin    → admin console (authenticated CMS) — planned
packages/     → ui · content · config · sdk — planned

Shared core: content service · media service · auth · caching
Data: PostgreSQL (+ pgvector + full-text search)
Media: object storage + image CDN
Runtime: app tier + background workers (cron + job queue)
External: GitHub API · LLM API · News sources
```

### Data Layer (D-008)
**PostgreSQL** as single relational system of record (also hosting pgvector + FTS). One managed system covers content + search + vectors. No separate vector DB, no headless CMS SaaS, no NoSQL. Decade-safe, boring, ACID.

### AI Architecture (D-009)
RAG with pgvector. Retrieval-gated domain restriction. Source-cited answers. Event-driven re-embedding on publish. Provider-agnostic behind an interface.

### GitHub Data (D-010)
Cached with scheduled refresh (not live per-request). Public pages read from the cache only.

### Search (D-011)
Postgres FTS first, behind a swappable `SearchIndex` interface. Dedicated engine only on evidence of need.

### Deployment (D-012)
Managed PaaS + managed Postgres + object storage + CDN. No Kubernetes, no self-managed VPS as the core. Specific vendors TBD in `docs/10`.

### Media (D-013)
Originals in S3-compatible object storage (references in Postgres), served via image CDN. No blobs in the database.

### Auth (D-014)
One strongly-authenticated admin identity (MFA-ready). `users/roles` modeled in schema. No RBAC UI yet. Public site has zero visitor accounts.

### Personal OS Runtime — Two-Plane Kernel (D-038, `docs/23`)
**Target skeleton, NOT a rewrite** — the architecture the product grows *into*, incrementally.

The kernel has two planes:
- **Event Bus** — pub/sub, fire-and-forget, past-tense facts. For choreography, notifications, side-effects. `domain.thing.happened` naming.
- **Capability Registry** — typed request→response interfaces. For queries, reads, commands with results. Never forced through the bus.

Ten runtimes: Experience · Knowledge · Motion · Navigation · AI/Dex · Content · Analytics · Theme · Accessibility · + Bus inside the Kernel.

**The single-writer law:** exactly one runtime writes any datum. **The floor principle:** Accessibility is the one runtime that never degrades. **The hero runtime (D-037) is a client — unmodified.**

Adoption: new modules (Dex v1.5, News v2, Admin) are born OS-native. Existing stores become runtime faces by rename-and-formalize. Never retrofit a single-consumer module for its own sake.

---

## 13. TECHNOLOGY STACK

### Frontend (ratified D-028, D-036)

| Concern | Choice | Notes |
|---------|--------|-------|
| Framework | **Next.js 15 App Router** | Hybrid SSG/ISR/SSR per route |
| Language | **TypeScript strict** + `noUncheckedIndexedAccess` | Decade-maintainability |
| Styling | **Tailwind CSS v4** | CSS-first `@theme` — tokens in CSS, NOT `tailwind.config` |
| Motion (DOM) | **Motion (`motion/react`)** | NOT `framer-motion` — `MotionConfig reducedMotion="user"` |
| Draw-ins | **GSAP** (lazy-loaded, DOM only) | SVG stroke; never on reading path; never inside the scene |
| 3D engine | **three.js via React Three Fiber** + drei subset | ≈220–280KB gz, lazy after LCP, Tier 1/2 only |
| In-scene tweens | **GSAP** (lazy, inside scene chunk) | One-shot events on uniforms; Motion never touches canvas |
| Icons | **Lucide** | Outline 1.5px stroke — matches icon charter |
| Theming | **next-themes** | Class-strategy, `defaultTheme="dark"`, system selectable |
| Primitives | **Radix-based, hand-rolled** (Dialog, Tooltip) | Radix behavior + CVA patterns; NOT stock shadcn skin |
| State | **Zustand** | Overlay state only; content state = server |
| Lint | ESLint 9 + `eslint-config-next` | |

### Camera / 3D Assets
- Camera rail: baked Blender `cam_rail.glb`, runtime-scrubbed (authored cinematography)
- Asset formats: glTF + Draco + KTX2, self-hosted decoders, versioned CDN manifest

### Backend (ratified at architecture level, vendors TBD)
| Concern | Decision |
|---------|----------|
| Datastore | PostgreSQL + pgvector + FTS |
| ORM/access | TBD with `docs/09` |
| LLM + embedding | TBD with Dex sprint; behind a provider-agnostic interface |
| PaaS | Managed, TBD with `docs/10` |
| Object storage + CDN | S3-compatible, TBD with `docs/10` |
| Auth | Managed vs self-rolled, TBD with admin sprint |
| Markdown pipeline | Renderer + syntax highlighting, TBD with posts sprint |
| Error tracking / analytics | TBD with `docs/10` |

### Critical Import Rules
```typescript
// CORRECT
import { motion } from "motion/react";          // NOT framer-motion
import { useCssColor } from "@/hooks/useCssColor"; // tokens from CSS, no hex in scene code

// Tailwind v4 — semantic utilities only:
// bg-canvas, text-ink, z-(--z-nav)
// NOT bg-[#0B0C0E], NOT custom classes

// Run from repo root:
// npm run dev / npm run build / npm run typecheck
```

---

## 14. FOLDER STRUCTURE

```
deepak.ai/                          ← monorepo root
├── apps/
│   └── web/                        ← the only deployed app (Next.js 15)
│       ├── content/
│       │   ├── site.ts             ← ALL real content lives here (TODO(copy) fields need fill)
│       │   └── asmos.ts            ← ASMOS project content
│       ├── src/
│       │   ├── app/
│       │   │   ├── (site)/         ← new V2 route group
│       │   │   ├── dev/hero/       ← /dev/hero (notFound() in prod — dev only)
│       │   │   ├── memory/         ← new
│       │   │   ├── layout.tsx      ← root layout (theme provider, nav)
│       │   │   └── page.tsx        ← DELETED (replaced by (site)/ structure)
│       │   ├── features/
│       │   │   ├── hero-scene/     ← THE hero 3D scene (Sprint H-01 + HS-1)
│       │   │   │   ├── HeroSceneRegion.tsx       ← mounts the scene
│       │   │   │   ├── overlay/
│       │   │   │   │   └── SceneOverlay.tsx      ← DOM buttons from anchors
│       │   │   │   ├── scene/
│       │   │   │   │   ├── HeroCanvas.tsx        ← R3F canvas with tier gate
│       │   │   │   │   ├── objects/
│       │   │   │   │   │   ├── DexPlaceholder.tsx    ← breathing Dex
│       │   │   │   │   │   ├── GraphPlaceholder.tsx  ← 2 draw call instanced graph
│       │   │   │   │   │   ├── LightRig.tsx          ← tokenized lights
│       │   │   │   │   │   └── TwinPlaceholder.tsx   ← capsule stand-in for GLB
│       │   │   │   │   └── systems/
│       │   │   │   │       └── scene-director.tsx    ← boot sequence (SceneDirector)
│       │   │   │   └── shared/
│       │   │   │       ├── constants.ts
│       │   │   │       ├── ease.ts                   ← smoothstep / node-reveal
│       │   │   │       ├── hero-store.ts             ← Zustand hero slice
│       │   │   │       ├── refs.ts                   ← scroll/pointer bridges
│       │   │   │       └── types.ts
│       │   │   ├── landing/
│       │   │   │   └── sections/
│       │   │   │       ├── arrival.tsx      ← V2 section 1 (identity inside scene)
│       │   │   │       ├── mission.tsx      ← V2 section 2 (researcher-engineer thesis)
│       │   │   │       ├── evidence.tsx     ← V2 section 3 (six domains, hover-alive)
│       │   │   │       ├── collaborate.tsx  ← V2 section 4 (quiet close)
│       │   │   │       ├── contact-strip.tsx   ← DELETED
│       │   │   │       ├── current-focus.tsx   ← DELETED
│       │   │   │       ├── featured-work.tsx   ← DELETED
│       │   │   │       ├── latest-posts.tsx    ← DELETED
│       │   │   │       └── research-highlight.tsx ← DELETED
│       │   │   ├── dex/            ← graceful-absence boundary (stub, v1.5)
│       │   │   └── memory/         ← new
│       │   ├── components/
│       │   │   └── ui/
│       │   │       └── sound-toggle.tsx    ← placeholder (no audio yet)
│       │   ├── providers/
│       │   │   └── theme-provider.tsx
│       │   ├── types/
│       │   │   └── content.ts      ← content model (the TypeScript contract)
│       │   └── styles/
│       │       └── globals.css     ← ALL tokens live here (@theme) — THE one file to retune
│       ├── public/                 ← static assets
│       └── tsconfig.json
├── packages/                       ← planned (ui, content, config, sdk)
├── docs/                           ← ALL documentation (01–26 + CONSTITUTION + this file)
│   ├── SESSION_START.md            ← this file
│   ├── CONSTITUTION.md
│   ├── 01-VISION.md
│   ├── 02-PRODUCT.md               ← PRD (authoritative product scope)
│   ├── 03-DESIGN_LANGUAGE.md       ← DSVL (some parts superseded by docs/24)
│   ├── 04-INFORMATION_ARCHITECTURE.md
│   ├── 05-FEATURES.md
│   ├── 06-TECH_STACK.md            ← frontend ratified; backend TBD
│   ├── 07-COMPONENT_GUIDELINES.md  ← TBD (template only)
│   ├── 08-ANIMATION_GUIDELINES.md
│   ├── 09-DATABASE_PLAN.md         ← TBD (template only)
│   ├── 10-DEPLOYMENT.md            ← TBD (template only)
│   ├── 11-SYSTEM_ARCHITECTURE.md
│   ├── 12-EXPERIENCE_ARCHITECTURE.md
│   ├── 13-WIREFRAME_SPEC.md
│   ├── 14-BRAND_IDENTITY.md
│   ├── 15-DESIGN_TOKENS.md
│   ├── 16-LANDING_REVIEW.md
│   ├── 17-CREATIVE_DIRECTION.md    ← "The Instrument" — led to V2 direction
│   ├── 17-HERO_SCENE_ARCHITECTURE.md
│   ├── 18-HERO_SCENE_BIBLE.md
│   ├── 19-HERO_ART_DIRECTION.md
│   ├── 20-HERO_MOODBOARD.md
│   ├── 21-HERO_BLENDER_PIPELINE.md
│   ├── 22-HERO_RUNTIME_ARCHITECTURE.md
│   ├── 23-PERSONAL_OS_RUNTIME.md
│   ├── 24-DESIGN_BIBLE_V2.md       ← THE frozen V2 spec — implement exactly
│   ├── 25-PROJECT_ORIGIN.md        ← experience philosophy (~80% retained)
│   ├── 26-THE_LIVING_MEMORY.md     ← THE definitive north star metaphor
│   └── generated/                  ← auto-generated summaries
├── memory/                         ← AI context system
│   ├── MASTER_CONTEXT.md           ← entry point for new sessions
│   ├── CURRENT_STATE.md            ← update after every significant session
│   ├── AI_HANDOFF.md               ← session log (most recent first) — update before ending
│   ├── DECISIONS.md                ← all ADRs D-001 → D-039
│   ├── FEATURE_STATUS.md
│   ├── ARCHITECTURE.md
│   └── KNOWN_LIMITATIONS.md
├── specs/                          ← feature specs (most are templates pending build)
│   ├── landing.md (v1.2)
│   └── [projects, posts, etc. — template stubs]
├── CHANGELOG.md
├── VERSION.md                      ← v0.5.0-alpha
└── CONTRIBUTING.md
```

---

## 15. DATA SCHEMA

### Content Types (`apps/web/src/types/content.ts`)

```typescript
// The closed relation set — additions require a decision entry
type RelationKind =
  | "implements"   // project → publication
  | "writes-about" // post → project | publication
  | "produced"     // timeline_entry → any artifact
  | "evidences"    // skill → project | publication | post
  | "depicts"      // gallery_item → any
  | "references";  // any → any (use sparingly)

type ContentType =
  | "project" | "publication" | "post" | "timeline_entry"
  | "skill" | "gallery_item" | "news_item" | "document" | "page";

// Every content entity inherits:
interface ContentBase {
  slug: string;
  title: string;
  status: "draft" | "scheduled" | "published" | "archived";
  publishedAt: string; // ISO 8601
  updatedAt: string;
  relations: Relation[];
}

// Project — the central content type
interface Project extends ContentBase {
  type: "project";
  problem: string;      // one-line problem (required — LAW-003)
  year: number;
  projectStatus: "active" | "archived";
  tags: string[];
  featured: boolean;
  repoUrl?: string;
}

// Publication
interface Publication extends ContentBase {
  type: "publication";
  authors: string[];
  venue: string;
  year: number;
  abstract: string;
  plainSummary: string; // researcher→engineer bridge
  pdfUrl?: string;
  bibtex?: string;
}

// Post (technical publishing only — no social mechanics D-005)
interface Post extends ContentBase {
  type: "post";
  dek: string;
  readingMinutes: number;
  tags: string[];
}

// TimelineEntry
interface TimelineEntry extends ContentBase {
  type: "timeline_entry";
  organization: string;
  role: string;
  startDate: string;
  endDate?: string; // absent = current
  summary: string;  // one-line what-it-produced
}

// Skill
interface Skill extends ContentBase {
  type: "skill";
  context: string;  // one-line context ("currently using for …")
  current: boolean; // Currently / Previously split
}
```

### Knowledge Schema (Cognitive Ontology)
Every content type maps to a cognitive state (see §7). The schema is the memory's structure. Relations are the edges of semantic memory. **No content type without the question that created it** (LAW-003).

### Database Schema (planned — `docs/09` TBD)
Same entity model as TypeScript types, implemented in PostgreSQL. `pgvector` extension for embeddings. FTS via Postgres `tsvector`. Slug = permanent URL (kebab-case, never changes after publish).

---

## 16. DESIGN SYSTEM

### Token Architecture (`docs/15`, `docs/24` Part 3/4/5/17)
Three tiers: **primitive → semantic → component** (primitives are private). Dot-notation naming (`category.concept.property.variant.state`). Delivered as Tailwind v4 `@theme` CSS variables in `globals.css`. One-file retune — touching only primitives in one file recolors the entire product.

### Color System (ratified V2, D-039)

**Dark mode (default identity):**
| Token | Hex | Role |
|-------|-----|------|
| `canvas` | `#0B0C0E` | The page — deep graphite |
| `surface` | `#131519` | Cards, panels |
| `surface-raised` | `#1B1E24` | Overlays (palette, Dex, dialogs) |
| `surface-recessed` | `#08090B` | Inputs, code wells |
| `hairline` | `rgba(255,255,255,.09)` | Default border |
| `text` | `#F3F5F7` | Primary (≈15.8:1) |
| `text-muted` | `#A2A9B0` | Secondary (≈6.9:1) |
| `text-faint` | `#6A7178` | Metadata (≈4.6:1) |

**Light mode ("Paper" — first-class equal):**
| Token | Hex | Role |
|-------|-----|------|
| `canvas` | `#FBFBF9` | Warm paper-white |
| `surface` | `#FFFFFF` | Cards |
| `hairline` | `rgba(16,18,22,.10)` | Border |
| `text` | `#16181C` | Primary (≈15:1) |

**The accent — Signal Azure (⟨GATE: owner sign-off⟩):**
| Token | Dark | Light |
|-------|------|-------|
| `signal` | `#3E8EFF` | `#0A66E0` |
| `signal-glow` | `#5AA0FF` @ radial low alpha | — |
| `signal-weak` | `rgba(62,142,255,.14)` | `rgba(10,102,224,.10)` |

**Rules:** any view ≥92% neutral. One accent. Never washes backgrounds, never gradients, never flair. It appears as *interaction* or as *light*.

**Semantic colors (state only, reserved):**
- `success #34C759 / #1E934A` · `warning #FFB020 / #B26B00` · `danger #FF5A5F / #D22D2D` · `info` = the accent

**Glass (exactly three surfaces — command palette · Dex panel · scene HUD):** heavy blur (24–32px), high surface-tint, hairline edge. Liquid glass permanently banned.

**Scene tokens:** `--scene-*` light/material tokens read live by the scene via `useCssColor` — no hex in scene code ever.

### Typography
| Role | Family | Fallback |
|------|--------|---------|
| **Display** (hero, page titles) | Neue Montreal ⟨GATE license⟩ | Geist → Inter Display |
| **Body/UI** | Inter (variable) | system-ui |
| **Editorial** (publications, long-form) | Newsreader (variable) | Source Serif 4 |
| **Mono** (code, data, telemetry) | JetBrains Mono | ui-monospace |

**Type scale:** `display-xl` 72→120px · `display-l` 48→64px · `h1` 34→40px · `h2` 26→28px · `h3` 20→21px · `body-l` 18px · `body` 16px · `small` 14px · `micro` 12.5px · `mono-code` 14px.

**Mono charter (strict):** machine-truth only — code, commands, paths, API names, versions, telemetry. **Never** headings, never "techy vibes."

**Measure:** 45–75 chars, 66 optimal. Long-form locked to ≈680px column.

### Spacing & Grid
- **4px unit** — off-scale values are defects. Scale: `4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96 · 128 · 160 · 224`
- 12-column fluid grid; gutters 24px desktop / 16px mobile
- Containers: **content** max 1200px · **reading** 680px · **wide** 1440px
- Section rhythm: 96–160px between major sections (48–96 mobile)
- **≥55% negative space at every rest frame** — when a layout feels empty, fix hierarchy, not add ornament

### Depth (three planes, never four)
- **z0 Deck** — content at rest
- **z1 Readout** — floating glass (palette, Dex, scene HUD)
- **z2 Focus** — the single thing being operated

One shadow token: `0 16px 48px -12px rgba(0,0,0,.55)` dark / `0 16px 40px -12px rgba(16,18,22,.18)` light.

Radii: `4` (inputs, tags) · `8` (cards, buttons) · `12` (overlays) · `full` (pills, the dot).

---

## 17. ANIMATION LANGUAGE

### The Settle Curve (the ownable signature)
Approach (fast, ease-out) → Converge (decelerate near target) → Settle (one critically-damped micro-correction, <2% overshoot, one oscillation) → **Absolute stillness.** Values land; they never spin, bounce, or idle.

### Motion Tokens (V2, D-039)
| Token | ms | Use |
|-------|-----|-----|
| `instant` | 80 | Press feedback, toggles |
| `fast` | 130 | Hover, icon morphs, tooltip-in |
| `base` | 220 | Palette/menu open, filters, most UI |
| `slow` | 320 | Page transitions, Dex panel, dialogs, shared-element |
| `narrative` | 480–640 | Landing/scene reveals, timeline draw — **≤3 per session** |

Easings: `ease-out` (90% of motion) · `ease-in-out` (cross-fades, theme toggle) · `settle-spring` (gentle, <2% overshoot — shared-element only) · `linear` (progress only).

### Per-Element Doctrine
- **Scroll:** native scroll owns truth — **no scroll hijack, ever**. The scene rail is scrubbed by real scroll. Reveals fire once, never re-trigger.
- **Hover:** in at `fast`, out at `instant` (leaving must feel weightless)
- **Cards:** hover = one tone step + hairline brighten (no jump); click = shared-element grow into detail
- **Camera/Lighting (scene):** rail-driven on scroll; parallax head damped from mouse; **no idle drift**
- **Numbers:** single fade-in + settle; never count-up
- **Theme toggle:** cross-fade at `ease-in-out`, not a jarring flip
- **Timeline / SVG draw-ins:** once at `narrative`, then permanently drawn

### Reduced Motion (designed experience, release criterion)
`prefers-reduced-motion` → `MotionConfig reducedMotion="user"`: scene → Tier-0 still or five composed stations, ambient systems unmounted, reveals become instant, settle = plain fade. **Full experience, zero meaning lost.** The reduced experience is designed, not degraded.

### What's Banned
- 3D as decoration (hero scene is the single sanctioned exception)
- Liquid glass (simulated refraction)
- Horizontal-scroll pages
- Magnetic interactions
- Cursor effects
- Per-character typewriter text (terminal cosplay)
- Ambient sparkle particles
- Spinning/counting numbers
- Idle camera drift
- Scroll hijacking
- Full-page spinners

---

## 18. BRAND GUIDELINES

### The Wordmark
`Deepak Labs` set in the Display face, medium weight, lowercase "labs," optical tracking −1.5%. No logo glyph competing with it.

### The Monogram (favicon, avatars, OG)
`dL` in a 1px hairline square frame, or a minimal node-and-edge glyph. The frame reads as "a workspace / a viewport." Owner pending decision: `dL` vs `D.`

### The Presence Dot
Belongs to **Dex only**. A small Signal-luminance circle with sub-perceptual breathing. **Never the site favicon. Never decorative.** Over years, the dot alone should mean "the twin is here."

### Recognition Devices (used relentlessly, never diluted)
Wordmark · The presence dot · The single accent as *light* · The hairline · The drawn/graph line · **The workbench task-light** (the one warm element in a cool world)

### Voice & Tone
- Declarative, first-person where personal, plain everywhere
- Precise counts, never vague quantities ("6 publications," never "several papers")
- Microcopy is calm and honest ("Couldn't reach GitHub — showing last sync")
- **Banned vocabulary:** passionate · journey · seamless · blazing · revolutionary · cutting-edge · leverage (as verb) · ninja/rockstar/guru · "let's build something amazing"
- Dex speaks as itself, about Deepak, with citations — **never first-person-as-Deepak**

### Vocabulary Rule (D-024)
Plain names for places, coined names only for inventions. "Work" not "Engineering." "About" not "My Story." "Posts" not "Writing." Radar and Dex are the two coined names.

### Photography Ethics
No generative fill, no AI enhancement on any imagery. Photography is the only likeness medium. No AI-generated or retouched portraiture anywhere.

### Illustration Language
Exactly one language — **the drawn SVG line** (hand-plotted character): diagrams, empty states, timeline stroke, redrawn research figures, the 404. Never stock, never AI-generated, never clip-art.

### Icons
One outline set (Lucide-class), 1.5px stroke, 24px grid, rounded caps. Sizes 16/20/24. Filled variants exist *only* as the active state of the same glyph. Never mix sets.

---

## 19. COMPONENT PHILOSOPHY

### The Two Content-Display Families
**Cards** (Work/Gallery) and **Rows** (Posts/Research) — these are the only two. No mixing, no third family.

### One Overlay Contract (D-025)
All modal surfaces (command palette, Dex panel, dialogs, sheets) share one behavior implementation (Radix): focus-trapped, Esc always closes, return-focus-to-trigger, scrim ~50% canvas-ink, glass treatment, one primary action. A second modal implementation is a defect.

### `Portrait` not `Avatar` (D-025)
The `Portrait` component is the only identity image component. Never `Avatar`.

### Component Contracts (`docs/15` §6–7)
- Universal state set: default · hover · focus-visible · active · disabled · error (where applicable)
- Universal overlay behavior: exactly one at a time (enforced in Zustand overlay store)
- Composition hierarchy: primitives → atoms → molecules → templates

### What `docs/07` Will Specify (TBD against working codebase)
- File layout and co-location conventions
- Naming: `PascalCase` components, `kebab-case` files
- State: local vs. Zustand vs. server; data flows down
- Styling: CVA (class-variance-authority) patterns on Radix
- A11y: baseline accessibility for every component
- Testing strategy

---

## 20. CODING STANDARDS

### Critical Rules (in force)
1. **Tokens in CSS, never hex in code.** Scene code reads CSS variables via `useCssColor` + MutationObserver. Theme swaps propagate automatically.
2. **`motion/react`** import (not `framer-motion`)
3. **Tailwind v4** — tokens in CSS `@theme`, NOT `tailwind.config`; semantic utilities only
4. **Semantic utilities:** `bg-canvas`, `text-ink`, `z-(--z-nav)` — never raw hex or Tailwind arbitrary values for design tokens
5. **Run from repo root** — `npm run dev`, `npm run build`, `npm run typecheck`
6. **three.js must stay out of First Load JS** — the tier-gated lazy chunk is a verified release criterion
7. **No fake data anywhere** — empty sections self-hide; that is correct, not a bug
8. **Leva** (3D debug) is dead-code-eliminated in production via literal `NODE_ENV` check at the import site
9. **Particles render nothing by design** — every particle must be a real datum; no data events yet = empty render is correct
10. **Camera rail stand-in** is a CatmullRom spline over 5 act stations — same sampler contract as the future `cam_rail.glb` (manifest swap, not rework)
11. **`/dev/hero` is dev-only** — `notFound()` in production. Never link to it from public pages.
12. **One property, one owner:** GSAP never touches DOM (Motion owns DOM); Motion never touches canvas (GSAP/fiber own canvas); scroll never hijacked (native scroll owns camera)

### Accepted Patterns (D-029)
- **CSS-only entrance for LCP content** — hero text animates via CSS keyframe (`animate-entrance`), zero hydration on LCP path; ScrollReveal for below-fold
- **`sessionStorage` for once-per-session** — draw-ins, boot sequence
- **Data-driven graceful absence** — empty sections self-hide; no `empty-states` on previews
- **Footer stamp = build date** — `new Date()` at build time; honest freshness stamp by construction
- **Motion `pathLength` for SVG draw-ins** — not GSAP (JS budget on landing)

### Gotchas
- Content lives in `apps/web/content/site.ts` (relative imports from features — path alias only covers `src/`)
- Footer build stamp re-stamps on every rebuild — this is intentional
- NavShell global nav links go to unbuilt pages (404) — known, out of landing sprint scope
- Font licences (Display/editorial serif) are a build gate — Inter is documented interim

---

## 21. AI WORKFLOW

### Models Used in This Project
- **Claude Sonnet 4.6** (`claude-sonnet-4-6`) — primary coding/architecture/design sessions (current model in this session)
- **Claude Opus** — for deep architecture documents, creative briefs, and adversarial reviews
- Model IDs (as of 2026-07-10): Fable 5: `claude-fable-5` · Opus 4.8: `claude-opus-4-8` · Sonnet 4.6: `claude-sonnet-4-6` · Haiku 4.5: `claude-haiku-4-5-20251001`

### How AI Assists This Project
1. **Architecture design** — full system architecture, runtime design, data modeling, ADR writing
2. **Documentation authoring** — all docs/01–26 were authored by AI in specialized roles
3. **Code implementation** — Sprint 0, Sprint 1, Sprint H-01, Sprint HS-1, landing V2 rebuild
4. **Design direction** — creative briefs, art direction, moodboard specs
5. **Adversarial review** — `docs/16` (landing review), design critique, constraint checking
6. **Continuity** — this memory system is the mechanism for AI-to-AI handoff

### Prompting Conventions
When starting an AI session on this project, always specify:
- The **role** the AI is playing (e.g. "you are a Lead Systems Architect")
- The **docs to read first** (always point to this SESSION_START.md)
- The **constraint set** (reference the Constitution, the V2 bible, the specific decision IDs)
- The **scope** of the session (what's in / what's out)
- The **one decision you need** rather than "explore options"

### Anti-Patterns in AI Prompting (from experience)
- Don't ask for "options" if you want a decision — it generates paralysis
- Don't let an AI override decisions without surfacing the conflict first (D-030 is the model for this)
- Always surface conflicts with existing decisions explicitly before ruling — "I noticed this contradicts D-020"
- The AI will drift toward completeness; the Constitution enforces honesty over completeness

---

## 22. CURRENT IMPLEMENTATION STATUS

### Version: `v0.5.0-alpha`

### Shipped and Building (code, verified, green build)
| Area | Status | Location |
|------|--------|---------|
| `apps/web` frontend foundation | ✅ Shipped | Sprint 0, D-028 |
| Three-tier token system (V2, dark-first) | ✅ Shipped | `globals.css` |
| Hero scene infrastructure | ✅ Shipped (Sprint H-01 + HS-1) | `features/hero-scene/` |
| Hero boot sequence (SceneDirector) | ✅ Shipped | `scene/systems/scene-director.tsx` |
| Luminance-not-hue graph (2 draw calls) | ✅ Shipped | `scene/objects/GraphPlaceholder.tsx` |
| Tokenized light rig | ✅ Shipped | `scene/objects/LightRig.tsx` |
| Twin/bench placeholder (capsule) | ✅ Shipped | `scene/objects/TwinPlaceholder.tsx` |
| Dex placeholder (breathing dot) | ✅ Shipped | `scene/objects/DexPlaceholder.tsx` |
| Tier gate (WebGL2, RM, save-data, memory) | ✅ Shipped | `scene/gate.ts` |
| Scroll/pointer bridges (refs) | ✅ Shipped | `shared/refs.ts` |
| Camera rail (CatmullRom stand-in) | ✅ Shipped | |
| Perf governor (DPR-first + shedding) | ✅ Shipped | |
| Anchor projector + focus proxies | ✅ Shipped | |
| Scene error boundary + context-loss guard | ✅ Shipped | |
| Landing V2 (four-beat story) | ✅ Shipped (release-gated) | `features/landing/sections/` |
| Content file (`site.ts`) with mission + domains | ✅ Shipped | `content/site.ts` |
| Sound toggle (placeholder, no audio) | ✅ Shipped | `components/ui/sound-toggle.tsx` |

**Verified:** three.js absent from all First Load JS · typecheck clean · build clean zero warnings · `/` at 152 kB first-load · LCP = headline text

### Release Gates (not yet shipped to production)
- Landing V2 — needs **owner content fill** (`site.ts` TODO(copy) fields) + R4 copy tests + visual look-dev sign-off
- Hero scene — lives at `/dev/hero` only (404 in prod); needs owner asset gate

### Not Built (planned/docs only)
| Area | P-tier | Blocker |
|------|--------|---------|
| All pages (Work, Research, Posts, About, Timeline, Skills) | P0 | Next sprints |
| Database (PostgreSQL layer) | P0 | `docs/09` not authored |
| Deployment config | P0 | `docs/10` not authored |
| Admin CMS | P0 | Needs DB first |
| Search | P0 | Needs DB first |
| Real Digital Twin GLB | P0 | Owner reference photos (Gate #1) |
| Real camera rail GLB | P0 | Blender artist (Gate #2) |
| Dex / AI Assistant | P1 | Needs corpus first; corpus needs content first |
| Gallery | P1 | — |
| Graph explorer | P1 | — |
| News / Radar | P2 | Gated on curation habit |

---

## 23. DEVELOPMENT ROADMAP

### V1.0 (P0) — The Canonical Record
Build order per `docs/24` Part 19 (each layer independently shippable):
1. **Owner content pass** — fill `content/site.ts` TODO(copy) fields; first real projects/posts; this unblocks the landing release and the scene graph
2. **Component library** — Cards, Rows, nav, palette, overlays, editor primitives (archetypes from `docs/24` Part 10)
3. **Public pages** via archetypes: `/work` (Projects index/detail) → `/research` → `/posts` → `/about` → `/timeline` → `/skills` → `/contact`
4. **Database** — `docs/09`, PostgreSQL schema, content layer behind existing `ContentService` interface
5. **Deployment** — `docs/07`, `docs/10`, vendor ratification; Tier 0 can deploy before the scene exists
6. **Admin CMS** — the update loop (Part 11 of bible)

### V1.5 (P1) — Differentiation
- Full 3D scene + the Digital Twin (post likeness-gate)
- Dex AI assistant live (once corpus populated)
- Gallery + graph explorer
- Deep GitHub integration
- Full analytics

### V2.0 (P2) — Expansion
- Radar (News) — gated on proven ≥2 month curation habit
- Bookmarks (anonymous/local)
- Weekly digest

### V3+ Visions (unscheduled, need dedicated specs)
- Graph as primary navigation for power users
- Public read-only agent API over the corpus
- Voice Dex
- Seasonal/time-of-day scene themes
- "Cite this site" academic export
- Twin reflecting real-time GitHub activity in scene

### The Definition of Done (for the whole product)
A recruiter understands "Deepak builds intelligent systems" in 20 seconds and can find the proof in two. A researcher verifies a citation without friction. An engineer reads a real decisions-and-trade-offs write-up. Dex answers three questions accurately with citations and declines one politely. The whole thing is never more than a week behind Deepak's real work.

---

## 24. OPEN TASKS & BLOCKERS

### Owner-Required Gates (nothing proceeds without these)
| Gate | What's blocked |
|------|---------------|
| ⟨GATE⟩ **Reference photos of Deepak** | Twin likeness calibration — Gate #1 (5-frame style packet). Silhouette ships if photos never arrive. |
| ⟨GATE⟩ **3D asset budget** | How much to spend on the Blender Twin pipeline |
| ⟨GATE⟩ **`content/site.ts` content fill** | All TODO(copy) fields, first real projects/posts. Landing release gate. |
| ⟨GATE⟩ **Accent hue sign-off** | `#3E8EFF` dark / `#0A66E0` light is provisional |
| ⟨GATE⟩ **Dex name veto** | Owner may still veto "Dex" before implementation |
| ⟨GATE⟩ **Monogram choice** | `dL` vs `D.` |
| ⟨GATE⟩ **Display font license** | Neue Montreal — Geist is the fallback until licensed |

### Engineering Tasks (no owner input needed)
| Task | Priority |
|------|---------|
| Projects index + detail page sprint | High — V2 first page after landing |
| `docs/09` — database plan + schema | High |
| `docs/10` — deployment plan + vendors | High |
| H-02 — retune rail stations against scroll bible acts, GSAP one-shot seam, Act captions | Medium |
| OS kernel first concrete step — contracts package + EventBus routing (D-038 §11 step 1) | Low-risk, low-urgency |
| Research/Publications pages | After Projects |
| Posts pages | After Research |
| About/Timeline/Skills pages | After Posts |
| Admin CMS | After DB + at least one page type |

### Known Follow-ups (in scope, not in any active sprint)
- NavShell global nav links go to unbuilt pages (404) — page-build concern, not landing concern
- Visual/spacing look-dev on `/` — human acceptance gate for V2 landing
- meshopt/KTX2 decoder wiring — documented but not imported until first real GLB

---

## 25. ALL ARCHITECTURAL DECISIONS (D-001 → D-039)

| ID | Title | Status |
|----|-------|--------|
| D-001 | Monorepo structure (apps/ + packages/ + docs/ + memory/ + specs/) | Accepted |
| D-002 | Documentation-first workflow | Accepted |
| D-003 | Semantic Versioning starting at v0.1.0-alpha | Accepted |
| D-004 | Phased delivery: P0 (v1.0) canonical record; P1 (v1.5) AI + gallery; P2 (v2.0) Radar. AI sequenced after corpus exists. | Accepted |
| D-005 | Posts = technical publishing, not social. No comments, reactions, followers, visitor accounts. | Accepted |
| D-006 | News rescoped as "Radar" (personal tracking), deferred to v2.0. Gated on ≥2 month curation habit. Auto-hides when stale. | Accepted |
| D-007 | Modular monolith (not microservices). Modules extractable along boundaries if needed. | Accepted |
| D-008 | PostgreSQL as single relational system of record (+ pgvector + FTS). | Accepted |
| D-009 | AI = RAG with pgvector, retrieval-gated domain restriction, three-layer guard, source-cited answers. | Accepted |
| D-010 | GitHub data cached with scheduled refresh (not live per-request). Public pages read from cache only. | Accepted |
| D-011 | Postgres FTS first; dedicated search engine only on evidence of need. `SearchIndex` interface swappable. | Accepted |
| D-012 | Managed PaaS + managed services. No Kubernetes, no self-managed VPS as the core. | Accepted |
| D-013 | Object storage + CDN for media. No DB blobs. | Accepted |
| D-014 | Single admin auth now; RBAC schema future-ready (dormant). No visitor accounts. | Accepted |
| D-015 | Dex speaks *about* Deepak, never *as* him. Named presence; cites every claim. Declines off-domain in-character. | Accepted |
| D-016 | Motion doctrine: teach-structure yes, perform no. Rejected: 3D (default), liquid glass, horizontal-scroll, magnetic, cursor effects. Amended for hero scene only. | Accepted (amended) |
| D-017 | Navigation: persistent slim nav + ⌘K command palette + contextual graph as primary layer. | Accepted |
| D-018 | Design language: "Graphite & Paper" + exactly one accent hue. 25 binding design laws. | Accepted |
| D-019 | Dex named "Dex" (owner may veto). Visual = breathing accent presence dot. No face, no avatar, ever. | Accepted (name pending veto) |
| D-020 | Glass on two surfaces only (palette + Dex panel). Liquid glass permanently banned. Photoreal/AI-imagery banned everywhere. Partially superseded by D-030 (hero scope only). | Partially superseded |
| D-021 | IA ratified: 4-lane nav (Work · Research · Posts · About), 3-level depth max, closed relation taxonomy (6 kinds), priority-order = DOM-order. | Accepted |
| D-022 | Landing = 8 sections max. Mission merged into hero. News deferred to v2. | Accepted |
| D-023 | Wireframe spec: 5 screen archetypes (Index/Detail/Single-surface/Tool/Overlay) for ~26 screens. Closed sticky-region list. | Accepted |
| D-024 | Brand identity: wordmark-first, `dL` monogram, plain-names vocabulary rule (Radar and Dex are the only coined names), drawn SVG line = entire illustration range, no AI imagery. | Accepted |
| D-025 | Token system: three-tier architecture, closed sets, no per-domain colors, no second hue, `Portrait` not `Avatar`. | Accepted |
| D-026 | Landing spec: typographic hero + drawn graph motif. Superseded in hero scope by D-030/D-031. S2–S8 unchanged. | Superseded (hero scope) |
| D-027 | Landing review 84/100. Applied R1–R6 amendments. Hero-scope findings superseded by D-030/D-031. | Accepted (amended) |
| D-028 | Frontend stack ratified. Sprint 0 foundation shipped. Next.js 15 / TS strict / Tailwind v4 / Motion / GSAP lazy / R3F / Zustand / next-themes / Radix-based. | Accepted |
| D-029 | Sprint 1 implementation patterns: CSS-only LCP; Motion pathLength for SVG draw-ins (not GSAP); data-driven graceful absence; build-date freshness stamp; once-per-session via `sessionStorage`. | Accepted |
| D-030 | Owner supersession: hero becomes interactive 3D scene. Stylized only (photoreal ban survives). Tier 0 hero retained verbatim as fallback. Vocabulary: Twin = 3D figure, Dex = AI. | Accepted (owner directive) |
| D-031 | Hero scene architecture: scene-graph, Twin at workbench, Dex as spatial entity, scroll-scrubbed camera rail (5 acts), hard perf budgets, 3-tier ladder, 2 owner sign-off gates. | Accepted |
| D-032 | Hero scene bible: recency-as-proximity, Twin style system with likeness gate, Dex citation-trail illumination, luminance-not-hue graph, 5-shot camera grammar, no idle camera drift ever, particles-as-information (every particle is a real datum, ambient sparkle banned). | Accepted |
| D-033 | Art direction: "The Drafted Laboratory" (G×H hybrid). Matte solids + hairline construction lines. Twin exempt from construction lines. At-rest ≥80% solid. Tier continuity = the decisive argument. | Accepted |
| D-034 | Moodboard: uber-material family with roughness targets, lighting in Kelvin, 35mm lens, governed absences (no bloom/no reflections/no in-scene glass), ≥55% negative space, 8-point acceptance checklist. | Accepted |
| D-035 | Blender pipeline: .blend is NOT the scene. Twin + bench + camera rail only. 23-bone rig, 5 clips, LOD 60k/25k/8k, glTF→Draco→KTX2 chain, per-GLB budgets. | Accepted |
| D-036 | Engine = React Three Fiber. Scene is enhancement layer. DOM complete before/without canvas. Three state domains (continuous=refs, discrete=Zustand, content=server). Instanced graph in 2 draw calls. | Accepted |
| D-037 | Sprint H-01: hero runtime foundation shipped. `/dev/hero` only (404 in prod). CatmullRom rail stand-in. Particles render nothing. Leva stripped in prod. Build clean. three.js absent from First Load JS. | Accepted |
| D-038 | Personal OS Runtime: two-plane Kernel (Event Bus + Capability Registry, overriding "event bus only" brief). 10 runtimes. Single-writer law. Floor principle. Incremental adoption — NOT a rewrite. | Accepted |
| D-039 | V2 Design Bible frozen. Dark-first. Colors committed. Motion tokens + settle easing. Sprint HS-1 ships Hero V2 + V2 tokens. Landing rebuilt as four-beat V2 story. | Accepted (owner: "implement exactly") |

---

## 26. LESSONS LEARNED

### Architecture
- **Lock data layer early, defer vendor picks late.** The database shape is hard to reverse; the PaaS vendor is easy to swap. (D-001–D-014 reflect this.)
- **"Event bus only" is wrong for queries.** The two-plane Kernel (bus + capability registry) is the correct resolution. The brief said "event bus only" but that anti-pattern was caught and overridden with reason. (D-038)
- **The "room survives the ceiling" principle is the single best architectural idea in the repo.** Every rich layer is enhancement over a complete DOM floor. Kill any layer and the product still works.
- **Incremental adoption of OS architecture.** Never retrofit a single-consumer module. The kernel earns itself when a module has its second consumer.

### Design
- **A wonder engine and a trust engine are not in conflict.** They just require different tools. The DSVL was all trust; it needed wonder added, not replaced. (D-039, `docs/17`)
- **Tier continuity was the decisive argument** for the Drafted Laboratory art direction — one direction, honest at every fidelity. (D-033)
- **The graph motif was risky as a hero centerpiece.** The R2 guardrails saved it in V1. In V2, the graph was promoted to the navigation substrate where it belongs.
- **Kill criteria before you build wonder moments.** Gate #1, Gate #2, the hallway test — define how you kill something before you commit to building it.
- **Dark-first required the owner to override V1 light-first.** It was the right call because the 3D scene only breathes in dark.

### Product
- **No fake data is non-negotiable** — it was nearly violated twice (placeholder graphs, stub stats). Every time, standing law killed it.
- **A stale product is worse than no product.** The ≤10-minute update loop in the admin, the freshness engine, the honesty mechanics — all exist because the moment a "living" product goes stale, it reads as *abandoned*, not calm.
- **Scope gravity is real.** The act-structure fence in D-031 exists because the hero's creative scope was threatening to absorb everything. Name the scope and the fence explicitly.
- **Content precedes every other feature.** The AI assistant, the knowledge graph, the scene graph — all are gated on real content existing first. Not "placeholder content," real content.

### Working with AI
- **Role-casting works.** Telling Claude "you are the Chief Software Architect" or "you are the Art Director" produces dramatically better output than "help me design this."
- **Surface conflicts explicitly before ruling.** D-030 is the model: owner directive conflicted with D-020. The AI surfaced the conflict with all three options; the owner ruled. Never override decisions silently.
- **The Constitution prevents scope drift.** When an AI session generated a brief that would have violated three laws, having named laws meant a one-line rejection, not a debate.
- **Memory across sessions requires discipline.** Update CURRENT_STATE.md and AI_HANDOFF.md before ending every session. Skipping once breaks continuity.

---

## 27. GLOSSARY

| Term | Definition |
|------|-----------|
| **The Twin** | The stylized 3D representation of Deepak at the workbench in the hero scene. Never conflate with Dex. |
| **Dex** | The AI assistant entity. Named presence. Speaks *about* Deepak, never *as* him. Visual = the breathing presence dot. |
| **The Living Memory** | The core product metaphor (`docs/26`). Everything is a memory. The site recalls, not presents. |
| **The Instrument** | The design direction from `docs/17` — a personal research OS that feels *running*, not a brochure. |
| **Tier 0** | The fully-designed static hero — the typographic identity + SVG graph + server-rendered content. The permanent floor for no-3D paths (RM, save-data, low-power). Never delete this. |
| **Tier 1 (Lite)** | The 3D scene pre-shed: no particles, no drifts, no parallax, reduced nodes. Mobile-capable. |
| **Tier 2 (Full)** | The complete 3D scene on desktop + WebGL2. |
| **The Settle** | The motion signature. Approach → Converge → single micro-correction (<2% overshoot) → absolute stillness. |
| **The Drafted Laboratory** | The ratified art direction (D-033). H's warm lab (matte solids) drawn by G's hand (hairline construction lines). |
| **The Fast Path** | The 90-second recruiter path — a permanent, obvious, quiet affordance that collapses the whole experience into the gist. Sacred. Never hidden by the immersive experience. |
| **Recency-as-proximity** | Freshest work floats near the Twin in warmer light; older work recedes into cooler atmosphere. The scene's spatial thesis. |
| **Luminance-not-hue** | Graph nodes are all graphite; importance/recency = brightness and proximity, never color. Upholds one-accent discipline. |
| **Single-writer law** | Exactly one runtime writes any datum. No two runtimes own the same state. |
| **The floor principle** | Every runtime degrades to a designed lesser state. Accessibility is the one runtime that never degrades. "The ceiling disappears; the room remains." |
| **Gate #1** | Owner supplies reference photos of Deepak → style frames in the Drafted Laboratory direction → uncanny review. |
| **Gate #2** | Blockout review — primitive Twin stand-ins in the engine, rail tuned to scroll bible. Bench set and rail can start now; Twin is photo-gated. |
| **Particles-as-information** | Every particle is a real datum (birth, commit, citation, selection). Ambient sparkle is permanently banned. |
| **The Presence Dot** | Dex's only body in flat UI. Small Signal-luminance circle with sub-perceptual breathing. Never the favicon. Never decorative. |
| **GLB swap contract** | Every placeholder object is a manifest swap — when a real GLB arrives, swap the manifest entry; no code rework. |
| **`useCssColor`** | Hook that reads CSS token values live (+ MutationObserver for theme changes). All scene colors go through this — no hex in scene code. |
| **Two-plane Kernel** | Event Bus (pub/sub, choreography) + Capability Registry (typed request→response). Together they let runtimes communicate without knowing each other. |
| **Cognitive spine** | `Question → Hypothesis → Experiment → (Failure → Iteration)* → Insight → Publication → Deployment` — the true navigation model |
| **Abandoned branches** | Failures, dead ends, rejected approaches — first-class entities in the knowledge system. The most trust-building and least copyable element. |

---

## 28. PROMPTING & REPOSITORY CONVENTIONS

### Repository Conventions
- **Monorepo root** — run all commands from here (`npm run dev`, `npm run build`, `npm run typecheck`)
- **Documentation is the source of truth** — update docs before (or alongside) code changes
- **Decision log is binding** — any architectural change requires a new `D-0XX` entry in `memory/DECISIONS.md`
- **`CURRENT_STATE.md`** — update after every significant session
- **`AI_HANDOFF.md`** — update before ending every session; most recent entry at the top
- **Semantic versioning** — every sprint ships a version bump in `VERSION.md` and `CHANGELOG.md`
- **No dead code stubs** — if a feature is v1.5, there's a graceful-absence boundary, not a commented-out scaffold
- **Content in `content/`** — not in components, not in markdown files scattered around, not in env vars

### Prompting Conventions (for starting AI sessions)
```
You are [role]. Read docs/SESSION_START.md first.

Context:
- Version: v0.5.0-alpha
- The V2 Design Bible (docs/24) is frozen — implement exactly as specified
- The Constitution (docs/CONSTITUTION.md) governs all decisions
- Today's task: [specific, bounded task]
- In scope: [explicit list]
- Out of scope: [explicit list]
- This session does NOT change architecture — any architectural decisions must surface as a conflict before I rule.

Start by confirming you've understood [one specific thing that would verify you read the context].
```

### How to Hand Off Between AI Sessions
Before ending any session:
1. Update `memory/CURRENT_STATE.md` — what changed, what's next
2. Add a session log entry to `memory/AI_HANDOFF.md` (top of file, most recent first) — what/why/state/next/gotchas
3. Log any new architectural decisions to `memory/DECISIONS.md` with the next ID
4. Update `CHANGELOG.md` if anything shipped
5. Bump `VERSION.md` if the version changed

---

## 29. HOW TO START A NEW AI SESSION

### Step 1 — Orient (read this file)
You're reading it now. This document is the complete context.

### Step 2 — Check current state
Read `memory/CURRENT_STATE.md` for the latest snapshot and `memory/AI_HANDOFF.md` for the most recent session log entry.

### Step 3 — Know the frozen documents
- **`docs/CONSTITUTION.md`** — 10 laws. Override requires amending the Constitution.
- **`docs/26-THE_LIVING_MEMORY.md`** — the core metaphor. The one governing question.
- **`docs/24-DESIGN_BIBLE_V2.md`** — the V2 frozen design spec. Implement exactly.
- **`memory/DECISIONS.md`** — every ADR. Any change to architecture needs a new entry.

### Step 4 — Understand the vocabulary
The most common mistake: confusing **The Twin** (3D figure) with **Dex** (AI assistant). They are different entities with different laws. Never conflate. See §27 Glossary.

### Step 5 — Know what's actually built
The code lives in `apps/web/src/`. The hero scene is at `features/hero-scene/`. The landing sections are at `features/landing/sections/`. See §22 for the full status table.

### Step 6 — Know the gates
Nothing requiring owner input (reference photos, content, accent hue sign-off, name veto, font license, asset budget) should be assumed to be resolved. See §24 Open Tasks.

### Step 7 — Pick up where we left off
The most likely next task is one of:
1. Owner fills `content/site.ts` → landing V2 release + scene graph populated
2. Projects page sprint (`/work` index + detail)
3. Database plan (`docs/09`)
4. H-02 in-engine hero blockout

### What Every AI Must Know (tl;dr)
- **The product metaphor:** Living Memory. Not a portfolio. Not a lab. A mind you walk into.
- **The governing question:** Does this feel like exploring a living memory?
- **The Twin ≠ Dex.** The Twin is the 3D figure. Dex is the AI entity.
- **Tier 0 is sacred.** Never delete the static typographic hero. It's the no-3D fallback.
- **No fake data, ever.** Empty = correct behavior.
- **three.js must stay out of First Load JS.** This is a verified release criterion.
- **All tokens in `globals.css`.** No hex in scene code. No hex in component code.
- **Documents before code.** Update `memory/` files every session.
- **One accent. One light. Three depth planes.** Never add a second of any of these.
- **The floor always survives.** Every rich layer degrades gracefully. Kill the ceiling; keep the room.

---

*This document was compiled from `memory/` + `docs/` on 2026-07-10. When anything conflicts with the files it was compiled from, trust the source files. This document is a map; the territory is the repository.*
