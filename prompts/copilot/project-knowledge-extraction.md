# Project knowledge extraction (for Dex)

**Target.** Copilot **Chat** — repository-scoped. Use it on `github.com` with the repo
open, or in VS Code with `@workspace`. Not for inline completion.

**Intent.** Point GitHub Copilot at one of Deepak's project repositories and have it
read the actual code, tests, and commit history to answer the questions a recruiter or
technical interviewer would ask — producing draft Dex knowledge cards and FAQ entries,
plus an explicit list of what the repo could *not* answer.

**Expected output.** A single JSON object matching the Dex content schema
(`apps/web/src/lib/dex/types.ts`), where every factual claim carries evidence, and
everything unproven lands in `unknowns` instead of being invented.

**Why this exists.** Dex answers only from approved memory. Its weakest area is
project-level technical depth, because that evidence lives in the repos rather than in
interviews. Copilot can read those repos; Deepak should not have to summarise 400 tests
by hand. The `/admin/dex` gap list shows which questions are actually going unanswered —
work that list alongside this prompt.

**Non-negotiable.** Copilot output is a *draft*. Nothing reaches Dex without Deepak's
review. An AI-invented benchmark in a portfolio is far worse than a missing one.

---

## 1. The question bank

These are the questions Dex should be able to answer about any project. Personas match
`apps/web/content/dex/interview-questions.json`; audiences match `DexAudience`.

### Framing — recruiter, first 30 seconds
1. In one sentence a non-engineer understands, what is this project?
2. What problem does it solve, for whom, and why did it need solving?
3. What did Deepak personally build, versus what came from libraries or teammates?
4. What is its honest status — experiment, research prototype, working tool, deployed product, or abandoned?
5. Why should this project make a hiring manager shortlist him?

### Evidence — the "is this real?" test
6. How large is it, actually? Files, modules, lines of code.
7. What tests exist — how many, what kind, and what do they actually cover?
8. Can someone run it? What are the setup steps, dependencies, and entry commands?
9. Is there a demo, screenshots, sample output, or saved artifacts?
10. Over what period was it built, and how actively? (commit history)

### Depth — technical interviewer
11. What is the architecture — the main components and how they interact?
12. What was the hardest technical problem, and how was it solved?
13. What significant design tradeoffs were made, and why those choices?
14. What data does it use — source, size, licence, and preprocessing?
15. What algorithms, models, or techniques are used, and why those?
16. What are the performance numbers, how were they measured, and against what baseline?
17. Where does it break? What are the known limitations and failure modes?
18. What would Deepak do differently if starting over today?

### Honesty — the skeptical reviewer *(LAW-004, LAW-008)*
19. What was tried and abandoned, and what did that teach?
20. Which README claims are aspirational rather than shipped?
21. Which stated metric is weakest or least reproducible, and why?
22. Which parts are original work versus adapted from a tutorial, paper, or template?

### Collaboration and growth
23. Solo or team? If team, who did what?
24. What did building this actually teach Deepak? *(feeds the empty `skillsLearned` field — see §4)*
25. What would he need help with to take it further?

### Onboarding — student or peer
26. How would a newcomer start with this repository?
27. What should they read first to understand it?

---

## 2. The prompt to paste into Copilot

Run this **one repository at a time**, in GitHub Copilot Chat on `github.com` with the
repo open, or in VS Code with `@workspace`. Replace `<PROJECT_SLUG>` with the slug used
on deepak.ai (for example `asmos`, `turb-detr`, `shortcutscore`).

````text
You are analysing this repository to build a factual knowledge base about its author,
Deepak (C S Deepak), for a portfolio assistant called Dex. Dex recalls approved facts and
must never invent. Treat this as a technical due-diligence audit, not marketing copy.

## Evidence rules — these override everything else

1. EVERY factual claim must cite evidence: a file path, a file path with line numbers, a
   command and its real output, or a commit SHA. No citation means it does not go in.
2. If the repository does not prove something, put the question in "unknowns". Do NOT
   guess, do NOT extrapolate, and do NOT restate the README's claims as verified fact.
3. Distinguish SHIPPED from ASPIRATIONAL. READMEs frequently describe intent, roadmap, or
   ambition. If code does not back a README claim, say so explicitly.
4. All numbers must come from real counts you performed — test counts, file counts, line
   counts, benchmark output. Never estimate a number and present it as measured.
5. If a metric appears without reproducible methodology (script, seed, dataset, baseline),
   flag it in "weakClaims" rather than reporting it as established.
6. Report abandoned approaches, dead code, reverted work, and failed experiments as
   valuable findings. They are wanted, not hidden.

## Tone rules

- Plain, concrete, verifiable. Write for a skeptical senior engineer.
- BANNED words: passionate, journey, seamless, blazing, revolutionary, cutting-edge,
  leverage (as a verb), ninja, rockstar, guru, game-changing, state-of-the-art
  (unless quoting a paper), production-ready (unless it is genuinely deployed).
- Never claim publication or peer-review status. If you find a paper draft, report that a
  draft exists — nothing about its acceptance.
- Prefer "reduced token usage by about 22% across 50 questions and 10 seeds
  (see <file>)" over "dramatically reduces cost".

## What to investigate

Read the code, tests, configs, CI, and commit history — not just the README. Answer:

FRAMING
1. One sentence a non-engineer understands: what is this?
2. What problem does it solve, for whom, why does it need solving?
3. What did the author build vs. what came from libraries or other contributors?
   (check git history for other authors)
4. Honest status: experiment / research prototype / working tool / deployed / abandoned?

EVIDENCE
5. Size: count source files, modules, and lines of code per language.
6. Tests: exact count, framework, types (unit/integration/e2e), and what is actually
   covered vs. untested.
7. Runnability: setup steps, dependencies, entry commands, Docker, required env vars.
8. Demos or artifacts: notebooks, saved outputs, screenshots, result tables.
9. Commit history: first commit date, last commit date, total commits, active periods.

DEPTH
10. Architecture: main components, their responsibilities, and how data flows between
    them. Cite the files where each lives.
11. Hardest technical problem solved — with the code that solves it.
12. Significant design tradeoffs and the reasoning, if recoverable from code or commits.
13. Data: source, size, licence, preprocessing steps.
14. Algorithms, models, or techniques used, and why those (if stated anywhere).
15. Performance: every benchmark number, how it was produced, and against what baseline.
16. Known limitations, TODOs, FIXMEs, open issues, and obvious failure modes.

HONESTY
17. README claims NOT backed by code.
18. The weakest or least reproducible claim, and why it is weak.
19. Original work vs. adapted from tutorial, paper, or template (check comments, licences,
    and attribution).
20. Abandoned or reverted approaches visible in history, and what they suggest was learned.

LEARNING
21. Concrete technical skills this project demonstrates — only ones the code actually
    proves. These populate a "skillsLearned" field, so be specific: "PyTorch custom
    Dataset/DataLoader", not "machine learning".

## Output format

Return ONE JSON object, nothing else. Use this exact shape:

{
  "projectSlug": "<PROJECT_SLUG>",
  "analysedAt": "<ISO date>",
  "repoFacts": {
    "sourceFiles": <number>,
    "linesOfCode": { "<language>": <number> },
    "testCount": <number|null>,
    "testFramework": "<string|null>",
    "firstCommit": "<ISO date>",
    "lastCommit": "<ISO date>",
    "totalCommits": <number>,
    "contributors": ["<name>"],
    "runnable": <true|false>,
    "hasDocker": <true|false>
  },
  "knowledgeCards": [
    {
      "id": "<kebab-case-id>",
      "title": "<short title>",
      "summary": "<2-4 factual sentences>",
      "tags": ["<lowercase tag>"],
      "evidence": ["<file path, command output, or commit SHA>"],
      "confidence": "proven|partial"
    }
  ],
  "faqs": [
    {
      "id": "<kebab-case-id>",
      "audience": "recruiter|technical|collaborator|student|general",
      "question": "<the question as a visitor would ask it>",
      "aliases": ["<2-4 natural rephrasings>"],
      "answer": "<answer in plain prose, no marketing language>",
      "evidence": ["<citation>"],
      "confidence": "proven|partial"
    }
  ],
  "skillsLearned": ["<specific, code-proven skill>"],
  "abandonedBranches": [
    { "tried": "<what>", "whyAbandoned": "<why>", "learned": "<what it taught>",
      "evidence": ["<commit SHA or file>"] }
  ],
  "weakClaims": [
    { "claim": "<the claim>", "whyWeak": "<missing baseline / no seed / not reproducible>",
      "where": "<file>" }
  ],
  "unknowns": [
    { "question": "<question from the list above>",
      "whyUnknown": "<what evidence would be needed>" }
  ]
}

Set "confidence": "partial" whenever you are inferring rather than reading a fact
directly. Put anything you cannot verify in "unknowns" — a long unknowns list is a
GOOD result, far better than a confident wrong one.
````

---

## 3. What to do with the output

1. **Read `unknowns` first.** That list is the interview Deepak still needs to answer
   himself — the things no repository can prove (motivation, tradeoff reasoning, what he'd
   change). Answer them in his own words.
2. **Check `weakClaims` before anything else reaches the site.** A weak metric that ships
   publicly is the one a technical interviewer will find.
3. **Verify every `confidence: "partial"` entry.** Those are inferences, not readings.
4. **Translate approved entries** into `apps/web/content/dex/knowledge-cards.json` and
   `faq-cache.json`. Add a source entry in `sources.json` recording which repo and commit
   the analysis came from, so answers stay traceable.
5. **Run the guards:**
   ```bash
   npm run check:dex --workspace=web
   ```
   plus the JSON validation and `npm run typecheck` from the repo root.

Nothing here is automatic. The extraction is the draft; approval stays with Deepak — the
same rule that governs his AI employees (`memory/DECISIONS.md` D-053).

---

## 4. Two things this unlocks beyond Dex

**`skillsLearned` is empty on every project.** The hero's 3D network wants to cluster
projects by shared skills, and currently falls back to `tags` because that field was never
filled (D-052.7, FIX 4). Populating it from `skillsLearned` in the output makes the hero
graph reflect real project↔skill topology.

**`abandonedBranches` is a first-class part of the content model** (LAW-004) and is barely
used. Recovering real abandoned approaches from commit history is honest, unusual in a
portfolio, and exactly the kind of thing a strong interviewer responds to.
