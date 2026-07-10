# Deepak Labs

**A Personal Operating System — the canonical, machine-readable record of one engineer's research, code, and writing, engineered to last a decade.**

> Generated engineering-showcase documentation. Derived from the repository's own source, specs, decision log, and commit history — not marketing copy. Status is reported honestly: this is an early-stage (`v0.4.0-alpha`) project whose distinguishing quality is the *rigor of its engineering and architecture*, not the size of a running product.

---

## One-paragraph summary

Deepak Labs is not a portfolio website. It is a long-lived software product — a *Personal Operating System* — designed to hold the authoritative record of a researcher-engineer's work (projects, publications, posts, timeline, skills) as a single interconnected graph, explorable by both humans and AI. It is built documentation-first: every significant decision is recorded as a lightweight ADR before code is written, so that any future human or AI collaborator can resume the work from the repository alone. The shipped foundation is a Next.js 15 / React 19 application with a production-grade, tier-gated 3D hero runtime (React Three Fiber) engineered as a pure enhancement layer that never blocks or bloats the core page. The backend — a modular monolith on PostgreSQL with a RAG-grounded AI assistant — is fully architected and awaiting implementation. The project's real subject is engineering judgment: what to build, what to defer, and why.

---

## The problem

A serious researcher-engineer's professional record is **fragmented across rented platforms** — LinkedIn, GitHub, Google Scholar, loose files — each telling a partial, platform-shaped story, each subject to algorithm and format changes outside the owner's control. Three specific failures follow:

1. **No canonical source.** No single place tells the whole story; every platform tells a different fragment of it.
2. **The researcher–engineer legibility gap.** Generic portfolios surface *either* papers *or* projects, rarely both as one coherent narrative. That dual identity is the differentiator, and no template is built for it.
3. **Illegibility to machines.** As discovery shifts from search pages to AI intermediaries, an unstructured portfolio cannot be faithfully consumed, retrieved, or attributed by the systems that increasingly mediate who gets found.

And the quiet killer: **static portfolios decay**, because editing them is a project. A Personal OS that is out of date is worse than a résumé.

## The solution

One owned, permanent system that is **canonical, alive, and machine-readable by default**:

- **Canonical** — external profiles become mirrors; the truth lives here, newer and deeper than any of them.
- **Alive** — every surface updatable in minutes from one admin surface; freshness is treated as a first-class, publicly-visible property, not an afterthought.
- **Machine-readable** — the same structured content serves the human reader, the search index, and an AI assistant ("Dex") that answers questions about the work *strictly from the corpus, with citations, and declines everything else*.
- **Graph, not pages** — publications link to the projects that implement them; projects link to the posts about them; timeline entries link to everything they produced. The interconnections are the product.

The architecture is deliberately shaped by one constraint above all others: **one maintainer, one decade, one personal budget.** That constraint — not scale — drives every decision.

---

## What actually exists today (honest status)

| Layer | Status | Evidence |
| --- | --- | --- |
| **Product & architecture definition** | ✅ Complete | 23 numbered docs (PRD → system architecture → design system → runtime spine); 38 decisions logged |
| **Frontend foundation** | ✅ Shipped | `apps/web`: Next.js 15 App Router, React 19, TS strict, Tailwind v4 token system, motion infra, UI primitives, typed content model |
| **Landing page (Tier 0)** | ✅ Shipped | Server-rendered, CSS-only LCP path, graph-motif draw-in, graceful self-hiding sections, build-date freshness stamp |
| **3D hero runtime foundation** | ✅ Shipped (dev route) | `features/hero-scene`: tier gate, camera rail, perf governor, error ladder, instanced graph — three.js **absent from First Load JS** |
| **Real content** | ⛔ Empty by design | `content/site.ts` collections are empty; sections self-hide (no-fake-data discipline) |
| **Backend / CMS / database** | 📐 Architected, not built | Modular monolith + PostgreSQL + pgvector fully specified; `ContentService` is interface-only over a local implementation |
| **AI assistant (Dex)** | 📐 Designed (v1.5) | RAG architecture + persona + runtime seam specified; body ships before mind, no rework seam |
| **3D Twin assets** | 📐 Pipelined, gated | Art direction, moodboard, Blender pipeline all ratified; blocked on owner reference photos |

**Read this table as the point, not a disclaimer.** The project is a study in doing the expensive, irreversible thinking first (data model, module boundaries, design laws) and deferring the cheap, reversible choices (vendors, exact hues) until evidence demands them.

---

## Who it is for

Ordered by the product's own strategic priority:

1. **Evaluators** (recruiters, hiring managers, admissions, grant reviewers) — highest stakes, ~90-second attention. The site must answer "who is this and why does it matter" fast.
2. **Researchers** — verifying a citation, exploring research lineage, seeking collaboration.
3. **Peer engineers** — gauging real depth via project write-ups (decisions and trade-offs, not screenshots) and live GitHub signal.
4. **Deepak (admin)** — the daily maintainer; if updating is painful, the product dies.
5. **AI systems** — a deliberate, first-class audience. The machine-readability principle is a bet on the agent era.

---

## The maker

**C S Deepak** — Computer Science student; aspiring AI Engineer and Research Engineer. Interests span **agentic AI, deep learning, computer vision, machine learning, large language models, explainable AI, and autonomous systems**, with an orientation toward research, publication, and open source. Deepak Labs is the system built to hold that trajectory as it grows.

---

## Why this repository is worth a careful look

Not for lines of code — the shipped surface is intentionally small. For **the discipline visible in the process**:

- A **38-entry decision log** where every architectural choice states its context, decision, and consequences — including the ones that *override the brief with a documented reason*.
- A **documentation-first methodology** with a dedicated `memory/` system built so an AI assistant can resume the project with full context.
- A **tier-gated 3D runtime** that treats a heavy, beautiful feature as a strict enhancement — the DOM page is complete before the canvas exists and remains complete if it dies.
- **Restraint as engineering**: no-fake-data graceful absence, a single-accent design system, features deliberately deferred to protect a one-maintainer budget.

See [`ARCHITECTURE.md`](ARCHITECTURE.md) for how it's built, [`TECHNICAL_DECISIONS.md`](TECHNICAL_DECISIONS.md) for why, and [`PORTFOLIO.json`](PORTFOLIO.json) for the machine-readable summary.
