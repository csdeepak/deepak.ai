# Dex AI Assistant Continuation Brief - 2026-07-31

This is the full continuation context for the Dex / AI chatbot work. Give this file to a new Codex session or another account and ask it to read this before touching code.

## Start Here For The Next Assistant

You are continuing work on Deepak's portfolio website, `deepak.ai`. The active feature is **Dex**, a constrained AI assistant on the landing page that answers questions about Deepak for recruiters, colleagues, students, and visitors.

Do not restart the project from scratch. The repo already contains a partially implemented Dex v1, a file-backed knowledge base, API routes, UI panel, source docs, and session memory. Your job is to continue from the current branch and preserve all existing work.

The most important product rule:

Dex is **not a general chatbot**. It answers only about Deepak, his projects, skills, experience, research direction, tools, and work. It refuses visitor task requests such as writing assignments, generating posts, scheduling content, or creating videos.

## What This Repo Is

`deepak.ai` is Deepak's personal portfolio / personal operating system. It is a Next.js monorepo with a public web app under `apps/web`.

The project already includes:

- public landing page
- project/memory content
- a design system and 3D/hero work from earlier sessions
- a future CMS/data layer
- the new Dex assistant feature

Dex should feel like a **grounded recall surface**, not a chat toy. It should help a recruiter understand Deepak faster and should cite approved memory.

## Tech Stack And Commands

Root package:

- Node: `>=20`
- monorepo workspaces: `apps/*`, `packages/*`
- web app: `apps/web`

Useful commands from repo root:

```powershell
npm.cmd run dev
npm.cmd run typecheck
$env:CONTENT_SOURCE='file'; npm.cmd run build
npm.cmd run check:bundle --workspace=web
```

Useful direct Dex matcher probe:

```powershell
.\node_modules\.bin\tsx.cmd -e "import { answerDexQuestion } from './apps/web/src/lib/dex/search.ts'; for (const q of ['What is ASMOS?', 'How did ASMOS reduce tokens?', 'What does Deepak mean by an AI employee?', 'Can you write my assignment?']) { const a = answerDexQuestion(q); console.log('Q:', q); console.log(a.kind, a.matchedQuestion ?? ''); console.log(a.answer); console.log('sources', a.sources.map(s=>s.id).join(',')); console.log('---'); }"
```

JSON validation:

```powershell
node -e "const fs=require('fs'); for (const f of ['apps/web/content/dex/sources.json','apps/web/content/dex/knowledge-cards.json','apps/web/content/dex/faq-cache.json','apps/web/content/dex/suggested-questions.json']) JSON.parse(fs.readFileSync(f,'utf8')); console.log('Dex JSON OK')"
```

## Current Branch And Workspace

## Current Branch

- Branch: `codex/ai-development-process`
- Project root: `C:\Users\csdee\OneDrive\Desktop\Portfolio\deepak.ai`
- Main feature: Dex, a constrained AI assistant for Deepak's portfolio.

The worktree is dirty. Do not revert unrelated files. There are older hero/design changes in the same working tree along with Dex changes.

Before editing, run:

```powershell
git branch --show-current
git status --short
```

Expected branch:

```text
codex/ai-development-process
```

## High-Level Goal

Build a portfolio chatbot entry point, "Know about Deepak using AI", that helps recruiters, colleagues, students, and visitors ask about Deepak.

Important rule: Dex should answer only questions about Deepak, his projects, skills, experience, research direction, tools, and work. It must refuse unrelated user tasks so visitors cannot use it as a free general chatbot or burn API credits.

## Current Product Decision

Dex v1 is not live RAG.

Dex v1 is a file-backed, cached, grounded recall layer:

- Suggested questions return cached answers.
- Free-text questions match approved FAQ aliases and knowledge cards.
- Off-topic or task-like requests are refused before any model call.
- Public runtime cost is zero.
- Future RAG / embeddings can come later after real visitor questions prove cached matching is insufficient.

Do **not** add public LLM calls yet.

Do **not** build live RAG from scratch yet.

The current approach is intentionally low-cost and beginner-friendly:

```text
owner interview / source import
  -> approved file-backed knowledge
  -> cached FAQ answers
  -> public Dex recall
  -> refusal for off-topic tasks
```

## Implemented Feature Shape

Important files:

- `apps/web/content/dex/sources.json`
- `apps/web/content/dex/knowledge-cards.json`
- `apps/web/content/dex/faq-cache.json`
- `apps/web/content/dex/suggested-questions.json`
- `apps/web/src/lib/dex/types.ts`
- `apps/web/src/lib/dex/content.ts`
- `apps/web/src/lib/dex/search.ts`
- `apps/web/src/app/api/dex/suggested/route.ts`
- `apps/web/src/app/api/dex/answer/route.ts`
- `apps/web/src/features/dex/dex-panel.tsx`
- `apps/web/src/features/dex/dex-trigger.tsx`
- `specs/ai-assistant.md`
- `memory/AI_HANDOFF.md`
- `memory/CURRENT_STATE.md`
- `memory/DECISIONS.md`

Dex UI is already integrated into the landing page with a CTA like "Know about Deepak using AI".

### How Dex Works

The runtime is server-side and file-backed:

1. `sources.json` defines source metadata.
2. `knowledge-cards.json` stores approved factual cards.
3. `faq-cache.json` stores common questions, aliases, cached answers, source IDs, and related cards.
4. `suggested-questions.json` controls suggested prompts in the UI.
5. `content.ts` loads the JSON.
6. `search.ts` does matching, refusal, and fallback behavior.
7. `/api/dex/suggested` returns suggested prompts.
8. `/api/dex/answer` returns cached answer / knowledge answer / unknown / refusal.
9. `dex-panel.tsx` renders the panel.
10. `dex-trigger.tsx` opens Dex from the landing page.

### Matching Behavior To Preserve

Dex should:

- return cached answers for exact/alias FAQ matches
- return card-based answers for public knowledge-card matches
- return unknown if a question is about Deepak but missing approved memory
- refuse off-topic or visitor-task requests

Visitor-task guard lives in:

- `apps/web/src/lib/dex/search.ts`

It checks task verbs and task objects so Dex refuses questions like:

- "Can you write my assignment?"
- "Can you write my LinkedIn post?"
- "Can you generate my Instagram video?"
- "Can you schedule my post?"

But it should still answer:

- "What LinkedIn AI employee does Deepak want to build?"
- "Can Deepak's AI employee schedule posts?"
- "What is Deepak's review boundary for AI employees?"

Difference:

- Visitor asks Dex to do the work -> refuse.
- Visitor asks about Deepak's planned system -> answer.

## Current UI / Dev Server Note

In earlier work, a dev server was started at:

```text
http://localhost:3000
```

If a server is still running, Next may hold `.next/trace` and a file-mode production build may fail with a file lock. Typecheck and matcher probes still passed. If build is needed and it fails only because `.next/trace` is locked, stop the dev server first or retry after closing it.

## Owner-Provided Sources Used

The initial knowledge base was built from:

- `Deepak_LinkedIn_Recruiter_Audit.xlsx`
- `Deepak_GitHub_Portfolio_Analysis.xlsx`
- `DEEPAK__RESUME.pdf`
- Repo docs and README files
- Owner interview answers in this session

The resume is not fully current, but the owner said it covers useful factual information.

## Current Project Rating / Direction

Assistant rating given to owner:

- Current project rating: **8.2/10**

Reason:

- The strongest part is that the portfolio is becoming proof of how Deepak thinks, not just a design showcase.
- Dex and ASMOS make the website feel like an actual AI engineering artifact.
- To move closer to 9+, the project needs stronger evidence packaging: diagrams, benchmark details, demos, and polished narratives.

## Interview Memory Captured

### Target Role

Deepak is targeting Agentic AI Engineer roles.

He is interested across:

- agent infrastructure
- applied AI automation
- AI research engineering
- developer tools
- product AI

He is especially interested in:

- building agents
- working with agent skills
- training AI employees
- making AI employees useful for real workflows
- automating workflows, including Gmail-style automation and information updates
- researching new AI tools
- experimenting with models
- turning research into AI products

### Strongest Projects

1. ASMOS / Oshmosh
2. Deepak.ai

ASMOS is the flagship project.

Deepak.ai is second strongest because it integrates AI into the portfolio and involves agentic workflows.

### ASMOS Canonical Description

ASMOS stands for Adaptive Semantic Memory Operating System.

It is a research-grade working prototype, not just a paper idea.

Owner-stated evidence:

- actual code for routing, scoring, and memory
- 400+ passing tests
- Docker support
- experiments against real AI models
- final version used Stack Overflow Q&A data
- not yet a deployed commercial product with live customers

ASMOS problem framing:

- Multi-agent systems using MCP-style workflows can consume many tokens and cost more.
- RAG has a useful trade-off, but it does not fully solve memory management.
- Ordinary workflows often load too much context "just in case."

ASMOS approach:

- Main task or question is broken into checkpoints.
- Verified answers become checkpoints.
- Checkpoints record who answered, what topic it was, and whether the answer was correct.
- Over time, checkpoints create topic ownership.
- New questions route to the owner agent for that topic.
- Only the owner agent's relevant memory is loaded.
- If no clear owner exists, ASMOS falls back to broader memory search.

### ASMOS Helpdesk Example

Example: a 3-person AI helpdesk for an online store.

Agents:

- Priya handles billing questions.
- Rahul handles shipping questions.
- Meera handles product or technical questions.

Without ASMOS:

- Every customer question loads a huge prompt with old billing, shipping, and product context.
- This is wasteful but "safe" because the system does not know who is good at what.

With ASMOS:

- Each verified interaction creates a small checkpoint.
- Example: "Rahul answered a shipping question - correct."
- After enough correct shipping checkpoints, Rahul becomes the shipping owner.
- A question like "where is my package?" routes to Rahul.
- The prompt loads Rahul's relevant shipping memory only.
- Billing and product history are skipped.
- Fewer words in the prompt means fewer tokens, lower cost, and faster responses.

Loop:

answer -> verify -> checkpoint -> ownership updates -> next question routes smarter -> fewer tokens spent per answer

### ASMOS Correct Token Result

Important correction:

- Early small test showed about 24%.
- Larger, more careful re-test settled around about 22%.
- Question-level results ranged roughly 18-26%.

Canonical public claim:

Use "about 22% token reduction", not 24%.

Measurement method:

- For each question, actual prompt text sent to the AI was measured with a real tokenizer.
- Compared old "load everything" approach vs ASMOS "load only owner memory" approach.
- Used 50 different questions.
- Re-run 10 times with different random seeds.
- Checked with a statistical significance test.
- This was token counter + experiment table, not manual eyeballing.

### ASMOS Ownership Score

Owner agent score:

- 60% trust: how often the agent's past answers were confirmed correct
- 40% contribution share: what fraction of correct answers on that topic came from that agent

New agents:

- Start with a modest default trust score, not zero.
- This gives them a fair chance.

If two agents are equally good:

- Higher score wins if there is a clear winner.
- If no one stands out clearly, fall back to searching everyone's memory.
- In fair tests, topics where two people were genuinely both experts were left out of the dataset because there was no clear ownership.

### ACM Publication Status

The owner said ACM journal details will be updated later.

Current rule:

- Do not claim ACM publication status publicly.
- Current Dex pitch should omit publication status or say publication details are intentionally left out until confirmed.

### ASMOS Recruiter Pitch

Current safe pitch:

"Built a multi-agent AI memory system that learns which agent actually knows each topic and routes questions to them, cutting AI token costs by about 22% in repeated experiments. Publication details are intentionally left out until Deepak confirms the current ACM status."

## AI Employee Vision

Deepak defines an AI employee as an AI system trained to work for him on repeated workflows:

- collect information
- use his context
- draft useful output
- update him on a schedule
- prepare/schedule content
- keep Deepak in the approval loop

Review boundary:

- AI employees may prepare and schedule content.
- Deepak approves before anything is published.
- They should not fully auto-publish public content without review.

### LinkedIn AI Employee Workflow

Deepak is a LinkedIn enthusiast and wants to post consistently about AI.

Workflow:

- Research strong LinkedIn posts and people who post well.
- Scrape or collect information carefully into an Excel sheet.
- Use the Excel sheet as training/example data for an agent skill.
- Build a reusable `skill.md`.
- Use the `skill.md` with fresh internet/AI research.
- Draft and schedule LinkedIn posts in Deepak's style.
- Deepak approves before publishing.

Important wording:

- Say "study / collect / organize patterns" when possible.
- Be careful with "scrape" because platform rules may apply.

### Instagram AI Employee Workflow

Deepak started an Instagram page called Deepak AI.

Workflow:

- Research AI topics from the internet.
- Turn those topics into post ideas, images, short videos, voice/audio assets, and drafts.
- May coordinate tools such as:
  - HeyGen
  - Suno
  - ElevenLabs
  - image-generation tools
  - writing assistants
- AI employee can coordinate production and scheduling.
- Deepak approves before publishing.

### Agent Skill Definition

Deepak defines an agent skill as a reusable workflow capability an AI agent learns for a repeated task.

Example:

- Give the agent an Excel sheet of strong LinkedIn examples.
- Ask it to build a `skill.md`.
- Reuse that skill when fresh AI research needs to become a post draft.

In Deepak's framing, a skill is closer to a reusable workflow capability than a one-off prompt.

## Deepak.ai Recruiter Goal

Deepak.ai should prove to recruiters that Deepak:

- is worth considering for AI roles
- loves automation
- loves building agents
- experiments with AI models
- walks through and tests many tools on the internet
- builds AI products to remove repeated manual work
- does not only talk about AI systems, but builds with them

## Deepak's Work Style

Dex should portray Deepak as:

- adaptive
- accepting of real constraints
- research-oriented
- experimental
- persistent
- interested in new tools and models
- willing to backtrack and understand what a tool does
- focused on turning research and experimentation into working systems

His loop:

research -> experiment -> understand context/setup -> build

Debugging strategy:

- backtrack the tool
- understand what it does
- understand the impact of what it does
- use AI assistants such as ChatGPT or Claude as reasoning partners

Hard learning story:

- While building a website from YouTube videos, many tutorials were about a year old and used outdated tools.
- Some tools had become paid.
- Tool search became complicated.
- This pushed him toward building his own tools rather than only copying workflows.

## Humanizer AI Skill

Deepak has built a Humanizer AI skill, but:

- it is currently underperforming
- it should not be presented as a flagship project yet
- he wants to improve it for research writing and paper-publishing workflows

## Dex Safety / Refusal Rules

Dex should answer about Deepak only.

It should refuse visitor task requests such as:

- "Can you write my assignment?"
- "Can you write my LinkedIn post?"
- "Can you generate my Instagram video?"
- "Can you schedule my post?"
- "Can you prepare my report?"

It can explain Deepak's planned AI employee workflows, but should not perform the visitor's work.

Recent implementation added a visitor-task guard in:

- `apps/web/src/lib/dex/search.ts`

The guard checks task verbs and task objects, including:

- write
- draft
- generate
- make
- prepare
- schedule
- post
- video
- report
- assignment
- LinkedIn

If future probes find loopholes, update `OFF_TOPIC_TASK_TERMS` and `TASK_VERBS` in `apps/web/src/lib/dex/search.ts`, then rerun matcher probes.

## Verification Already Run

These passed during the session:

- Dex JSON parse check
- `npm.cmd run typecheck`
- `git diff --check`
- Direct matcher probes with `tsx`

Important matcher results:

- "What does Deepak mean by an AI employee?" -> cached answer
- "What LinkedIn AI employee does Deepak want to build?" -> cached answer
- "What Instagram AI employee does Deepak want to build?" -> cached answer
- "What is Deepak's review boundary for AI employees?" -> cached answer
- "Can Deepak's AI employee schedule posts?" -> cached answer about approval boundary
- "Can you schedule my post?" -> refusal
- "Can you generate my Instagram video?" -> refusal
- "Can you write my LinkedIn post?" -> refusal
- "Can you write my assignment?" -> refusal
- "What is ASMOS?" -> cached answer
- "How did ASMOS reduce tokens?" -> cached answer with ~22% correction
- "How does ASMOS choose the owner agent?" -> cached answer
- "Is ASMOS a working prototype?" -> cached answer

After any new content edit, rerun:

```powershell
node -e "const fs=require('fs'); for (const f of ['apps/web/content/dex/sources.json','apps/web/content/dex/knowledge-cards.json','apps/web/content/dex/faq-cache.json','apps/web/content/dex/suggested-questions.json']) JSON.parse(fs.readFileSync(f,'utf8')); console.log('Dex JSON OK')"
npm.cmd run typecheck
git diff --check
```

Then run a direct matcher probe for the newly added questions and one off-topic refusal.

## Known Worktree Notes

The worktree is dirty and contains both Dex work and older hero/design work.

Do not revert unrelated files.

Current branch at handoff:

- `codex/ai-development-process`

Known modified/untracked areas include:

- `apps/web/content/dex/`
- `apps/web/src/lib/dex/`
- `apps/web/src/app/api/dex/`
- `apps/web/src/features/dex/`
- `apps/web/content/asmos.ts`
- `specs/ai-assistant.md`
- `memory/AI_HANDOFF.md`
- `memory/CURRENT_STATE.md`
- `memory/DECISIONS.md`
- older hero/design files from previous work

Important: Do not clean, reset, or revert the worktree unless Deepak explicitly asks. The dirty state includes owner/previous-session work.

## What Is Already Good Enough

Do not spend the next session re-brainstorming these unless Deepak asks:

- Dex v1 should be cached and file-backed.
- Public LLM/RAG is deferred.
- ASMOS canonical token claim is about 22%, not 24%.
- ACM publication status is not confirmed and should not be claimed.
- AI employee workflows are owner-reviewed and not auto-published.
- Dex should refuse visitor task requests.

## What Needs Continuation

The next session can continue in two possible lanes:

### Lane A - More Interview Memory

Keep interviewing Deepak and expand cached facts.

Recommended next questions are below.

### Lane B - Engineering The Owner Trigger Flow

Build a simple owner-only workflow to add new knowledge:

```text
owner adds note / LinkedIn post / project update
  -> draft extraction
  -> owner reviews
  -> write/update knowledge-cards.json and faq-cache.json
  -> run verification
```

Start simple. A script or local admin-only form is enough. Do not add complex RAG yet.

## Next Questions To Ask Deepak

Continue with these, one at a time:

1. Preferred companies or teams:
   - What kind of company/team do you want: AI startup, research lab, agent infrastructure team, developer tools company, product AI team, or something else?

2. Privacy/tool boundaries for AI employees:
   - What data can the AI employees access?
   - What data should they never access?
   - Should they store browser cookies, Gmail data, LinkedIn data, or only owner-provided exports?

3. LinkedIn skill evidence:
   - What columns should the Excel sheet contain?
   - Example: hook, topic, structure, tone, CTA, length, target audience, why it worked.

4. Instagram Deepak AI page:
   - What is the audience?
   - Students, AI beginners, recruiters, builders, or general tech followers?

5. Deepak.ai next build step:
   - Should the next implementation be an admin knowledge-space editor, more cached FAQs, or a simple local trigger command that imports new notes?

Suggested order:

1. Ask privacy/tool boundaries next.
2. Ask LinkedIn Excel columns next.
3. Ask Instagram audience next.
4. Then ask which engineering lane he wants.

## Recommended Next Engineering Step

Before adding live RAG:

1. Keep expanding cached FAQ and knowledge cards from owner interviews.
2. Add an owner-only "knowledge import" workflow:
   - paste LinkedIn post text
   - paste new project note
   - generate draft knowledge cards/FAQs
   - owner approves before public memory updates
3. Add tests for `answerDexQuestion()` refusal and matching behavior.
4. Consider a small admin UI after the file-backed flow stabilizes.

Do not add public LLM calls yet.

## One-Shot Prompt For A New Session

Deepak can paste this into a new account/session:

```text
Read `memory/DEX_SESSION_HANDOFF_2026-07-31.md` first. Continue the Dex AI assistant feature in this repo from branch `codex/ai-development-process`. Do not restart from scratch. Preserve the dirty worktree. Dex v1 is a file-backed cached recall layer, not live RAG. Continue from the latest owner interview memory and either ask the next interview question or build the owner-triggered knowledge import flow.
```
