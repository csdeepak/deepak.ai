# 02 — Product Requirements Document (PRD)

> **Status:** Approved draft — v1.0 of the product definition.
> **Owner:** Deepak (Product) · Authored in the role of Chief Product Officer.
> **This document is the single source of truth for what Deepak Labs is.** Design, architecture, and specs must trace back to it. Changes to product scope require an entry in [`../memory/DECISIONS.md`](../memory/DECISIONS.md).

---

## 0. Executive Summary & Strategic Assessment

Deepak Labs is a **Personal Operating System**: one durable platform that holds the canonical record of Deepak's research, engineering, writing, and professional history — explorable by humans and by AI.

This PRD accepts the mandated feature set but **does not treat all features as equal**. Three strategic corrections shape everything below:

1. **The News Platform is a second product.** Aggregating AI/tech/hackathon/jobs/conference news with weekly updates and bookmarks is an ongoing editorial and operational commitment, unrelated to the core job of representing Deepak. A stale news feed damages credibility more than no news feed. It stays in scope — but as a **v2.0 expansion**, scoped as a *personal radar* (what Deepak is reading/tracking), not a general news product.
2. **The AI Assistant has a cold-start dependency.** It answers from Deepak's projects, publications, posts, and documentation. Until that corpus exists and is well-structured, the assistant has nothing trustworthy to say. It ships in **v1.5**, after the content system is populated. This is sequencing, not deprioritization — the assistant is the product's signature feature.
3. **Posts must not imitate LinkedIn's mechanics.** "Like LinkedIn but cleaner" is a content-quality statement, not a social-features statement. No reactions, comments, or feeds-of-others in v1. Posts are **technical publishing**, not social networking. This removes moderation burden, spam surface, and an entire class of complexity that adds no evaluator value.

**Missing features identified and added:** site-wide search, résumé/CV download, RSS, SEO/structured data as a first-class requirement, privacy-respecting analytics, and content freshness signals ("last updated"). These are cheap, high-leverage, and expected by the exact audiences this product serves.

---

## 1. Product Vision

A single, permanent digital home where everything Deepak produces — research, engineering, publications, writing, and experience — lives as one coherent, continuously current system, owned outright rather than rented from platforms, and equally legible to a hiring manager skimming for 90 seconds, a researcher verifying a citation, and an AI answering on Deepak's behalf.

## 2. Mission Statement

**Own the canonical record of Deepak's work, and make it effortless to explore — for people and for machines.**

## 3. Product Identity

| Attribute | Definition |
| --- | --- |
| **Name** | Deepak Labs |
| **Category** | Personal Operating System (portfolio · research hub · knowledge platform · AI interface) |
| **Personality** | Precise, technical, calm, confident. A lab notebook with excellent typography — not a billboard. |
| **What it is** | The authoritative source about Deepak's work; a living system updated continuously from one admin surface. |
| **What it is not** | A portfolio template. A social network. A blog platform for others. A SaaS product. |
| **Tone** | First-person where personal, third-person where archival. Technical without jargon-signaling. Zero marketing fluff. |

## 4. Product Principles

1. **Canonical or nothing.** If it's about Deepak's work, this is where the truth lives. External platforms (LinkedIn, Scholar, GitHub profiles) become mirrors, not sources.
2. **Signal in 90 seconds.** Every public surface must let a first-time evaluator extract "who is this and why does it matter" fast. Depth is available; it is never required.
3. **Alive by design.** A Personal OS that is out of date is worse than a static résumé. Every feature must be updatable in minutes from the admin surface, or it doesn't ship.
4. **Machine-readable by default.** Content is structured so the AI assistant, search engines, and future agents can consume it faithfully. Human-readable and machine-readable are the same artifact.
5. **One maintainer, forever.** Every feature is weighed against the cost of one person maintaining it for years. Recurring-effort features must justify themselves or be cut.
6. **Restraint is the aesthetic.** Fewer surfaces, deeper content. When in doubt, remove.

## 5. Target Audience

Ordered by strategic importance:

1. **Evaluators** — recruiters, hiring managers, admissions committees, grant reviewers. Highest stakes, shortest attention.
2. **Researchers & academics** — verifying publications, exploring research lineage, seeking collaboration.
3. **Peer engineers & collaborators** — assessing technical depth via projects, posts, and GitHub activity.
4. **Deepak (admin)** — the daily user of the CMS; if updating is painful, the product dies.
5. **AI systems** — assistants and crawlers that increasingly mediate how people are discovered. A deliberate audience, not an afterthought.

## 6. User Personas

### P1 — "Priya," Senior Technical Recruiter
- **Context:** Screens 40 profiles a day; opens the site from a résumé link; gives it under two minutes.
- **Needs:** Immediate clarity on current role/focus, standout projects, publications count, and a downloadable CV.
- **Success:** Leaves able to champion Deepak internally without a follow-up email.

### P2 — "Prof. Rao," Researcher
- **Context:** Found a citation; wants to verify the publication and see what else the author has done.
- **Needs:** Accurate publication records with venues, years, links; research trajectory; a way to contact.
- **Success:** Cites confidently; considers reaching out for collaboration.

### P3 — "Arjun," Staff Engineer / Potential Collaborator
- **Context:** Saw a post or repo; wants to gauge real engineering depth.
- **Needs:** Project write-ups with decisions and trade-offs (not screenshots), live GitHub signal, technical posts.
- **Success:** Concludes "this person builds real things" and stars/follows/reaches out.

### P4 — Deepak, Administrator
- **Context:** Finishes a paper, project, or milestone; has 15 minutes to record it.
- **Needs:** One dashboard where any content type is added or edited quickly; confidence the AI assistant picks it up.
- **Success:** The system is never more than a week behind his real life.

### P5 — An AI Assistant (non-human persona)
- **Context:** A user asks an LLM "who is Deepak and what has he worked on?"
- **Needs:** Structured, unambiguous, current content it can retrieve and attribute.
- **Success:** Machine-mediated answers about Deepak are accurate because this system is the source.

## 7. Problems This Product Solves

1. **Fragmentation.** Deepak's record is scattered across LinkedIn, GitHub, Scholar, and files. No single place tells the whole story; each platform tells a partial, platform-shaped one.
2. **Platform dependency.** Rented profiles change algorithms, formats, and terms. A canonical, owned record removes that risk permanently.
3. **The researcher–engineer legibility gap.** Generic portfolios show either papers or projects, rarely both as one narrative. Deepak's dual identity is the core differentiator and needs a purpose-built structure.
4. **Repeated explanation.** The same questions about background, projects, and papers get answered manually, over and over. The AI assistant automates this with grounded, controlled answers.
5. **Update friction.** Static portfolios decay because editing them is a project. The admin CMS reduces the cost of staying current to near zero — the single biggest predictor of this product's long-term survival.

## 8. Product Goals

| # | Goal | Definition of Done |
| --- | --- | --- |
| G1 | Become the canonical source | All external profiles link here; content here is newer and deeper than any mirror. |
| G2 | 90-second comprehension | A first-time evaluator can state Deepak's identity, focus, and top 3 credentials in ≤2 minutes. |
| G3 | Near-zero update friction | Any content type updatable via admin in ≤10 minutes, end to end. |
| G4 | Trustworthy AI representation | Assistant answers only from Deepak's corpus, declines off-topic gracefully, and never fabricates. |
| G5 | Built to last a decade | Documentation-first repo; any future human or AI can resume work from the docs alone. |

## 9. Non-Goals

Explicitly out of scope — permanently or until revisited by a logged decision:

- **Not a social network.** No comments, likes, followers, or user accounts for visitors (bookmarks in v2 use lightweight local/anonymous mechanisms, not public identity).
- **Not a multi-tenant platform.** One person, one instance. No "sign up to make your own."
- **Not a general news product.** The News section serves Deepak's audience insight into what *he* tracks; it does not compete with newsletters or aggregators.
- **Not a monetized property.** No ads, sponsorships, or paywalls.
- **Not an experiments playground.** Visual gimmicks that don't serve comprehension are rejected by principle #6.

## 10. Feature Prioritization

Phased by dependency and maintenance cost. **All mandated features remain in scope**; tiers define order, not doubt.

### P0 — Foundation (v1.0): *the canonical record*

| Feature | Rationale |
| --- | --- |
| Landing Page | The 90-second comprehension surface. Everything hangs off it. |
| About | Identity and narrative. |
| Projects | Core engineering evidence. Write-ups with decisions, not thumbnails. |
| Research Publications | Core academic evidence. Accurate metadata is non-negotiable. |
| Experience Timeline | Chronological spine connecting roles, education, milestones. |
| Skills (Current / Previous) | The current/previous split is genuinely good — it doubles as a "Now" page and freshness signal. Keep it. |
| Posts | Technical publishing. Tags, dates, RSS. No social mechanics. |
| Contact + CV download | Table stakes for P1/P2 personas. |
| GitHub Integration (display) | Read-only signal on landing/projects: activity, pinned repos. Deep integration deferred. |
| Admin: manage all of the above | The CMS ships with the content it manages, or the content rots on day one. |
| SEO, structured data, RSS, search | Added by this PRD. Cheap, expected, and they serve persona P5 directly. |
| Basic analytics (privacy-respecting) | Page views and referrers; enough to learn, not surveil. |

### P1 — Differentiation (v1.5): *the intelligent layer*

| Feature | Rationale for sequencing |
| --- | --- |
| AI Assistant | Ships once the corpus (projects, publications, posts, about, timeline) exists and is structured. Launching it against thin content produces bad answers and reputational risk — the one failure mode this product cannot afford. |
| Admin: AI Knowledge Base management | Curate what the assistant knows; review gaps; test answers. Ships with the assistant, not before. |
| Gallery | Valuable but not evaluative — no persona decides based on it. Ships when the foundation is solid. |
| GitHub Integration (deep) | Repo-to-project linking, contribution narratives. |
| Analytics (full dashboard) | Content-level insight once there is traffic worth analyzing. |

### P2 — Expansion (v2.0): *the platform*

| Feature | Rationale for sequencing |
| --- | --- |
| News Platform ("Radar") | Rescoped: a curated feed of what Deepak tracks (AI, tech, hackathons, jobs, conferences, research) with admin-assisted curation and weekly cadence. Deferred because it is the only feature with a *recurring weekly obligation* — it must not be allowed to threaten the core product's freshness guarantee. |
| Save / bookmark functionality | Depends on News; anonymous/local persistence, no visitor accounts. |
| Weekly digest | An output of Radar, once Radar has proven sustainable for ≥2 months. |

**Recommendation record:** If any P2 feature still feels essential at v1.5, the correct move is to revisit this PRD with usage data — not to pull it forward on instinct.

## 11. Success Metrics

| Metric | Target | Why it matters |
| --- | --- | --- |
| Content freshness | No core surface older than 30 days without intent | The OS's core promise is being alive. |
| Admin update time | ≤10 min per content update | Predicts long-term survival. |
| Evaluator depth | Median session ≥2 pages for résumé-referred traffic | Are evaluators finding a path beyond the landing page? |
| CV downloads / contact events | Directional growth | The evaluator funnel's end state. |
| Assistant grounded-answer rate | ≥95% answers cite corpus; 100% off-topic correctly declined | Trust is binary; one fabricated answer poisons the feature. |
| Canonicality | All external profiles link in; site outranks them for name queries | Goal G1, measurable. |
| Documentation sync | Every merged change updates docs/memory | Goal G5, enforced by process. |

## 12. User Journey

### Evaluator (P1) — the 90-second path
Résumé link → **Landing** (identity, current focus, highlights) → one of **Projects / Publications** (skims 1–2 items) → **CV download or Contact**. Every step must be reachable in ≤2 clicks from landing.

### Researcher (P2) — the verification path
Search or citation → **Publication detail** (metadata, links) → **Publications index** (trajectory) → **About / Timeline** (context) → **Contact**.

### Peer engineer (P3) — the depth path
Post or repo → **Post / Project detail** (decisions, trade-offs) → **GitHub signal** → **Other projects / posts** → follows or reaches out.

### Curious visitor — the exploration path
Landing → **Gallery / Posts / Radar (v2)** → serendipitous discovery → returns. The AI assistant (v1.5) serves this journey best: "ask anything about Deepak" collapses navigation into conversation.

### Deepak (P4) — the maintenance loop
Event happens → **Admin dashboard** → add/edit content → published everywhere it's relevant (site, feed, assistant corpus) from one action → done in minutes. This loop is the product's heartbeat.

## 13. High-Level Information Architecture

Detailed IA belongs in [`04-INFORMATION_ARCHITECTURE.md`](04-INFORMATION_ARCHITECTURE.md); this defines the product-level shape.

```
PUBLIC
├── Landing            — synthesis of everything below; 90-second surface
├── About              — narrative + CV
├── Projects           — index → detail
├── Publications       — index → detail
├── Posts              — index → detail (tags, RSS)
├── Timeline           — experience & milestones
├── Skills             — currently / previously working on
├── Gallery            — visual record            (v1.5)
├── Assistant          — conversational interface (v1.5)
├── Radar (News)       — curated tracking feed    (v2.0)
├── Search             — site-wide
└── Contact

ADMIN (private)
├── Dashboard          — overview + freshness warnings
├── Analytics
├── Content managers   — posts · projects · publications · gallery ·
│                        skills · timeline · news
└── AI Knowledge Base  — corpus curation, gap review, answer testing (v1.5)
```

Cross-linking is a first-class product behavior: publications link to the projects that implemented them; projects link to posts about them; timeline entries link to everything they produced. The graph, not the pages, is the OS.

## 14. Product Philosophy

- **The system is the résumé.** Not a page that describes work — a system that *contains* it, interconnected and current.
- **Write once, surface everywhere.** A single content action updates the site, the feeds, and the assistant's knowledge. Duplication is a design failure.
- **Calm software.** No engagement mechanics, no urgency patterns, no dark patterns. The product respects visitor attention the way it wants Deepak's work to be respected.
- **Documentation is part of the product.** This repository's docs/memory system is not overhead; it is what makes a one-person, decade-long product possible.

## 15. Long-Term Vision

Over a 5–10 year horizon, Deepak Labs evolves from a *record* into an *interface*:

- **Year 1–2:** The canonical record — complete, current, and discoverable. The assistant answers reliably from it.
- **Year 3–5:** The knowledge graph — content types interlink densely enough that trajectories (research themes, skill evolution, project lineage) become first-class, navigable views.
- **Year 5+:** The agent-era presence — as discovery shifts from search pages to AI intermediaries, Deepak Labs is the structured, authoritative source those intermediaries consult. The product's machine-readability principle is a bet on this future.

## 16. Future Expansion Ideas

Deliberately unscheduled; each requires a PRD amendment before work begins:

- **Talks & media** section (recordings, slides, mentions).
- **Newsletter** built from the Radar digest, if Radar proves sustainable.
- **Reading list / library** — books and papers with notes.
- **Programmatic access** — a public, read-only way for external tools and agents to query the corpus.
- **"Uses" page** — tools, setup, workflow.
- **Multilingual content** — if audience data justifies it.

## 17. Risks and Trade-offs

| Risk | Severity | Mitigation |
| --- | --- | --- |
| **Solo-maintainer abandonment** — the product decays if updating lapses | High | Ruthless P0 scoping; ≤10-min update loop; freshness warnings in admin dashboard. |
| **Scope creep** — "Personal OS" invites infinite features | High | This PRD's tiers are binding; changes require a logged decision. |
| **AI assistant misrepresentation** — fabricated or off-brand answers | High | Corpus-only grounding, polite refusal outside scope, admin testing tools before launch, v1.5 sequencing. |
| **News/Radar staleness** — a dead feed signals a dead site | Medium | Deferred to v2; launch requires a proven 2-month curation habit; auto-hide when stale. |
| **Over-building admin** — a CMS more elaborate than the content needs | Medium | Admin features ship only alongside the content types they manage. |
| **Analytics vs. values** — surveillance-grade tracking conflicts with the calm-software stance | Low | Privacy-respecting, aggregate-only analytics from day one. |
| **Identity risk** — "Labs" implies output; a thin site undercuts the name | Low | Don't launch publicly until P0 content is genuinely populated. |

## 18. Product Constraints

1. **One maintainer.** Every recurring cost lands on Deepak. Features with weekly obligations are guilty until proven innocent.
2. **Everything editable from admin.** No content update may require a developer workflow once v1.0 ships.
3. **Assistant boundary is absolute.** Deepak-related questions only; graceful, polite refusal otherwise; no exceptions, no "general knowledge" mode.
4. **Documentation-first.** No feature is built without a spec in `specs/`; no scope change without a decision log entry.
5. **Longevity over novelty.** Choices favor durability and low upkeep over trend-driven features (binding on later technical decisions; this document intentionally names no technologies).
6. **Budget-conscious.** Recurring costs must stay proportionate to a personal product.
7. **Privacy-respecting.** Visitor analytics are aggregate and anonymous; no tracking that Deepak wouldn't accept on sites he visits.

---

## Appendix — Disposition of Mandated Features

Every feature from the product brief, with its PRD disposition:

| Mandated feature | Disposition |
| --- | --- |
| Landing, About, Projects, Publications, Timeline, Skills, Posts, Contact | **P0 (v1.0)** as specified. |
| GitHub Integration | **Split:** display-level in P0; deep integration in P1. |
| Gallery | **P1 (v1.5)** — kept, sequenced after evaluative surfaces. |
| AI Assistant (+ knowledge base admin) | **P1 (v1.5)** — signature feature, sequenced after corpus exists. |
| News Platform (+ save/bookmark, weekly updates) | **P2 (v2.0)** — kept, rescoped as "Radar," gated on sustainable curation. |
| Admin: dashboard, analytics, all content managers | **Phased with their content types** — P0 core, P1/P2 additions. |
| Posts "like LinkedIn but cleaner" | **Reinterpreted** as technical publishing; social mechanics explicitly excluded (see §0, §9). |
