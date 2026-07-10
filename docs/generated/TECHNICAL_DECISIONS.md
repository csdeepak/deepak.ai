# Technical Decisions — Deepak Labs

> A distillation of the repository's 38-entry decision log (`memory/DECISIONS.md`, D-001→D-038), organized by theme and written to explain *why*. Each decision in the source log records Context / Decision / Consequences; this document adds the connective reasoning a reader needs to judge the engineering. Decisions marked **(overrides brief)** are cases where the maker consciously departed from the original instruction and documented the reason — the clearest signal of engineering judgment in the project.

---

## The meta-decision: documentation-first, decision-logged development

Two choices frame everything else:

- **D-001 — Monorepo** (`apps/` + `packages/` + docs/memory/specs/prompts/scripts/assets). Anticipates multiple apps (public site, admin) and shared packages, with disciplined one-way dependency flow.
- **D-002 — Documentation-first workflow.** Author documentation, conventions, and the memory system *before* application code. Slower start; far greater continuity. **This is the project's defining methodological bet:** the repository — including a `memory/` system explicitly built for AI continuity — is the single source of truth, so any future human or AI can resume from the docs alone (Goal G5).

*Why it matters for a showcase:* the decision log itself is the artifact. Thirty-eight ADRs on a solo alpha project is not overhead theater — it is the mechanism that makes a one-person, decade-horizon product survivable, and it demonstrates systems thinking more directly than any feature could.

---

## 1. Product-scoping decisions — the discipline of deferral

The strongest product engineering here is what was *cut or deferred*, and why.

| ID | Decision | The reasoning |
| --- | --- | --- |
| **D-004** | Phased delivery P0/P1/P2 | A solo maintainer cannot ship *and sustain* the whole mandated feature set at once. Tiers order the work by dependency and maintenance cost, not by enthusiasm. |
| **D-005** *(overrides brief)* | Posts are technical publishing, **not** social | The brief said "like LinkedIn but cleaner." Interpreted as a *content-quality* statement, not a *social-features* one. Cutting comments/reactions/followers removes moderation, spam surface, and an entire class of account infrastructure — for zero evaluator value lost. |
| **D-006** *(overrides brief)* | News rescoped as "Radar," deferred to v2 | A general news platform is effectively a second product with a *recurring weekly obligation*. A stale feed damages credibility more than no feed. Kept, but gated on a demonstrated ≥2-month curation habit, with auto-hide when stale. |

**The AI assistant's cold-start dependency (D-004):** the signature feature is deliberately sequenced *last among the core tiers*, because it answers from a corpus that must exist first. Launching it against thin content produces bad answers — the one failure mode this product genuinely cannot afford (trust is binary). This is sequencing as risk management, not timidity.

---

## 2. Architecture decisions — fewest moving parts

All ratified in `docs/11`; the unifying logic is *reversibility* — lock the expensive-to-change things now, defer the cheap-to-change things.

- **D-007 — Modular monolith, not microservices.** One deployable app with strong internal boundaries. Microservices multiply ops surface (deploys, network hops, distributed debugging) for zero benefit at personal scale. Boundaries make later extraction a refactor, not a rewrite.
- **D-008 — Single PostgreSQL as the system of record.** Content is inherently relational (the cross-link graph is exactly what foreign keys model); the lifecycle needs ACID; and *one* database also hosting vectors and full-text search eliminates two systems a solo maintainer would otherwise run. "Boring, decade-safe technology" is a feature.
- **D-009 — RAG with `pgvector`, not fine-tuning.** RAG updates instantly on publish, cites sources, and costs nothing to keep current. Fine-tuning is expensive, stale the moment content changes, and prone to hallucination. Vectors in the same Postgres keep retrieval joinable back to source records for attribution.
- **D-010 — GitHub data cached, not fetched live.** The decisive argument is *resilience*: GitHub's availability must never gate the site's. Also removes latency and rate-limit exposure. The data changes slowly and is supporting content — there is no user need for real-time.
- **D-011 — Postgres FTS first, behind a `SearchIndex` interface.** Don't run a search cluster for a personal corpus. The interface makes a later dedicated engine a contained change.
- **D-012 — Managed PaaS, no Kubernetes.** For one maintainer, operational simplicity *is* the priority; managed services absorb backups, patching, and recovery so they don't consume the maintenance budget. Boring infra also keeps the app portable across vendors.
- **D-013 — Object storage + CDN for media, never DB blobs.** Blobs bloat the DB and slow backups; object storage is cheap, durable, and edge-deliverable.
- **D-014 — Single admin auth now; RBAC schema dormant.** Model `users`/`roles` from day one (so multi-role is a later data/UI addition, not a re-architecture) but ship no RBAC UI — YAGNI for one user. The public site needs no visitor accounts, which is also a security win (minimal PII surface).

**D-015 — The Twin represents Deepak; it never impersonates him** *(overrides brief framing).* The brief framed the AI as "a digital extension of Deepak." Speaking first-person-as-Deepak would make every model error *fabricated testimony in his voice* — and assistant trust is binary. So the assistant is a named presence that speaks *as itself, about Deepak, always with citations.* This single reframing turned a branding idea into a functional trust requirement and made citation UX a core feature.

---

## 3. Design-system decisions — restraint as engineering

The visual system (`docs/03`, `docs/14`, `docs/15`) is engineered against two failure modes named explicitly: the *developer-portfolio look* and the *cyberpunk tax*. The strategy is **restraint as signature**.

- **D-018 — "Graphite & Paper" + exactly one accent.** A near-monochrome instrument with a single "indicator-LED" blue that is spent like ink — any given view is ≥95% neutral. Recognition comes from chromatic *discipline*, not a palette. Depth is surface-tiers + hairlines with one shadow token, not ambient shadow. Two type families only (Inter + JetBrains Mono, no serif). 25 binding design laws.
- **D-019 — The AI is named "Dex"; its body is a dot.** Dex = *Deepak + index*. Visual identity: a small accent-colored presence dot with sub-perceptual breathing — no face, no avatar, ever. A face invites uncanny judgment; a dot invites conversation. The breathing dot is the product's *only* permitted animation loop.
- **D-024 — Wordmark-first brand; plain-names vocabulary** *(overrides brief).* The brief proposed renaming navigation ("Projects"→"Engineering", "Timeline"→"Journey"). Rejected in favor of a rule: **plain names for places, coined names only for inventions** (only Radar and Dex earn coined names). Plus a photography honesty ethic — no generative fill or AI enhancement on any imagery, because on a product whose promise is honest evidence, a synthetic image is a trust contradiction.
- **D-025 — Three-tier token architecture; per-domain colors rejected** *(overrides brief).* The brief proposed per-domain color groups (Research/News/Analytics) and an Avatar component — both collide with immutable law (one accent; Dex owns the only "presence"). Tokens go primitive → semantic → component, all non-color values fixed, color architecture ratified with hex deferred.

*Why a showcase should care:* these decisions repeatedly choose a *worse-but-consistent* option over a *better-but-second* pattern, and they say so. That is design engineering — treating consistency as a system property to be enforced, not a preference.

---

## 4. The hero-scene arc — an owner override, engineered responsibly

This sequence (D-030→D-037) is the clearest case study in the repository: a late, expensive, risk-laden direction change absorbed *without* abandoning the project's principles.

- **D-030 — Owner supersession: the hero becomes an interactive 3D scene** *(overrides prior law).* The owner directed a stylized 3D representation of Deepak, overriding standing rejections (the likeness ban D-020, the typographic hero D-026, the review's concurrence D-027). The architect's response is the instructive part: **surface the conflict explicitly, record the risks on the record** (uncanny valley, maintenance-organism, performance, scope gravity), and lift the ban *narrowly* — stylized/non-photoreal only; the photoreal and AI-imagery bans survive everywhere.
- **D-031 / D-032 / D-033 / D-034 / D-035 — Design before spend.** Before any asset money is committed: a full scene architecture, a creative bible (with a *likeness gate* — no reference photos exist, so a silhouette ships if they never arrive), an art direction ("The Drafted Laboratory," chosen for *tier continuity* — Tier 0's 2D motif is the same world at its drawing layer), a moodboard with pass/fail acceptance criteria, and a Blender pipeline whose core ruling is **"the .blend is not the scene"** (Blender authors only the Twin, bench, and camera rail; everything else is procedural).
- **D-036 — Engine = React Three Fiber.** Chosen because the scene graph *is* a component tree, Suspense-native streaming matches the "lab furnishes itself" loading order, and it composes with the existing React/Zustand stack. Cost is stated honestly (~220–280 KB gz) and bounded: inside the ≤350 KB tier budget, lazy after LCP, Tier 1/2 only.
- **D-037 — The foundation shipped with stand-ins.** The runtime infrastructure is real, building code; the visuals are placeholders. Verified: **three.js absent from all First Load JS**, landing untouched, build clean. Every future object is a swap.

**The load-bearing principle across the whole arc (D-036):** the 3D scene is an *enhancement layer* — the DOM page is complete before the canvas exists and remains complete if it dies. This is what made a risky feature safe to pursue: the downside is strictly bounded to "the ceiling disappears; the room remains."

---

## 5. The runtime spine — overriding the brief with a reason

**D-038 — Personal OS Runtime: a two-plane kernel** *(overrides brief).* The single most sophisticated decision in the log. The brief mandated that every subsystem "communicate *only* through the Event Bus." The architect overrode it with an argument:

> A pure event bus is correct for **notifications** and wrong for **queries.** Search, retrieval, and relation-lookups are request→response; modeling them as fire-and-forget forces correlation-ID plumbing, invites races, and buries simple reads under choreography — precisely the unnecessary complexity the PRD forbids.

The resolution keeps the brief's *real* requirement (no module depends on another) fully intact — modules import only kernel-owned **contracts** — while adding a **Capability Registry** alongside the Event Bus. It then defines ten runtimes, a **single-writer law**, and a **floor principle** where Accessibility is the one runtime that never degrades. And it ends with the most mature line in the entire log: *this is a target skeleton adopted incrementally, not a rewrite — never retrofit a single-consumer module for its own sake.*

This is the decision to point evaluators to. It shows someone who can (a) understand a directive, (b) identify precisely where it breaks, (c) propose a design that satisfies the underlying intent better than the literal instruction, and (d) resist over-engineering their own idea.

---

## 6. Implementation-pattern decisions (the code-level craft)

- **D-028 — Frontend stack ratified.** Next.js App Router · TypeScript strict (with `noUncheckedIndexedAccess`) · Tailwind v4 (`@theme` maps tokens 1:1) · Motion (global reduced-motion parity) · GSAP lazy-only · Radix-based hand-rolled primitives · Zustand for overlay state only (content belongs to the server). Color primitives are *provisional*, isolated to tier-1 CSS variables for a one-file retune.
- **D-029 — Landing patterns that become defaults.** (1) **CSS-only entrance for LCP content** — the hero text animates via a CSS keyframe, zero hydration on the LCP path. (2) **Motion `pathLength` over GSAP** for the graph-motif draw-in — loading GSAP would violate the JS budget for no gain. (3) **Data-driven graceful absence** — sections self-hide when their content is empty; no fake data, no empty-states on previews. (4) **Footer stamp = build date** — for a statically generated site, build time *is* last-updated, an honest freshness stamp by construction.

These four patterns encode the same value the architecture does at small scale: never pay (in bytes, in hydration, in fake content) for something the user doesn't need yet.

---

## Appendix — the full decision index

| ID | Title | Theme |
| --- | --- | --- |
| D-001 | Monorepo structure | Foundation |
| D-002 | Documentation-first workflow | Foundation |
| D-003 | SemVer from v0.1.0-alpha | Foundation |
| D-004 | Phased delivery P0/P1/P2 | Product |
| D-005 | Posts = technical publishing, not social | Product *(overrides brief)* |
| D-006 | News rescoped "Radar," deferred to v2 | Product *(overrides brief)* |
| D-007 | Modular monolith | Architecture |
| D-008 | Single PostgreSQL system of record | Architecture |
| D-009 | RAG + pgvector | Architecture / AI |
| D-010 | GitHub data cached, not live | Architecture |
| D-011 | Postgres FTS first | Architecture |
| D-012 | Managed PaaS, no k8s | Architecture / Ops |
| D-013 | Object storage + CDN for media | Architecture |
| D-014 | Single admin auth; RBAC dormant | Architecture / Security |
| D-015 | Twin represents, never impersonates | AI / Trust *(overrides brief framing)* |
| D-016 | Motion doctrine: teach structure, don't perform | Design |
| D-017 | Slim nav + command palette + contextual graph | IA |
| D-018 | "Graphite & Paper," one accent | Design |
| D-019 | Twin named Dex; body is a dot | Design / Brand |
| D-020 | Glass on two surfaces; 3D dormant charter | Design *(partly superseded by D-030)* |
| D-021 | IA: 4 lanes, 3-level depth, closed relations | IA |
| D-022 | Landing = 8 sections | IA |
| D-023 | Wireframes on a 5-archetype system | Design |
| D-024 | Wordmark-first; plain-names vocabulary | Brand *(overrides brief)* |
| D-025 | Three-tier tokens; no per-domain colors | Design system *(overrides brief)* |
| D-026 | Landing spec: typographic hero + graph motif | Product *(superseded in hero scope)* |
| D-027 | Landing review 84/100, R1–R6 applied | Process |
| D-028 | Frontend stack ratified; Sprint 0 shipped | Implementation |
| D-029 | Sprint 1 landing patterns | Implementation |
| D-030 | Owner supersession → 3D hero scene | Direction *(overrides prior law)* |
| D-031 | Hero scene architecture | Architecture |
| D-032 | Hero scene bible | Creative |
| D-033 | Art direction: "The Drafted Laboratory" | Creative |
| D-034 | Hero moodboard (look-dev contract) | Creative |
| D-035 | Blender production pipeline | Pipeline |
| D-036 | Hero runtime architecture; engine = R3F | Architecture |
| D-037 | Sprint H-01: hero runtime foundation shipped | Implementation |
| D-038 | Personal OS Runtime: two-plane kernel | Architecture *(overrides brief)* |
