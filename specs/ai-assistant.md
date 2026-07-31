# Spec - AI Assistant / Dex

> Status: **D-053 v1 implemented.** v1 is a cached, grounded recall layer. Do not build live RAG until v1 proves the question patterns.

## Purpose

Dex helps visitors understand Deepak through a constrained conversational surface. It answers questions about Deepak's projects, skills, experience, research direction, tools, posts, and portfolio memories. It does not act as a general chatbot.

The product metaphor is recall, not chat: Dex reads from the approved Deepak Knowledge Space and cites what it uses. If a memory does not exist, Dex says so.

## Product Goals

- Give recruiters, collaborators, students, and peers a fast way to ask about Deepak.
- Protect API credits by serving most public answers from cached data.
- Keep all public answers grounded in approved facts, not model memory.
- Let the owner manually refresh the knowledge base from projects, LinkedIn posts, interviews, CV updates, and notes.
- Make Codex useful as a private interviewer that extracts missing knowledge from the owner.

## Non-Goals

- No general-purpose assistant behavior.
- No visitor access to arbitrary LLM calls.
- No scraping LinkedIn automatically in v1.
- No fine-tuning.
- No uncited claims.
- No automation that updates the public knowledge base without owner approval.

## System Shape

```text
Owner trigger
  -> import source
  -> AI/Codex extraction
  -> owner review
  -> approved knowledge cards
  -> cached FAQ answers
  -> public Dex recall
```

## Functional Requirements

### Public Dex

- Landing page has one entry point: "Ask Dex about Deepak" or equivalent owner-ratified copy.
- Dex opens as a panel on desktop and a bottom sheet on mobile.
- Empty state shows suggested questions grouped by audience:
  - recruiter
  - collaborator
  - student
  - technical interviewer
  - curious visitor
- Suggested questions return prewritten cached answers with citations.
- Free-text questions first match cached FAQ aliases, then knowledge-card tags/text.
- Off-topic questions are declined before any model call.
- If the question is about Deepak but no approved memory exists, Dex gives an honest "I do not have that memory yet" response.
- Answers should cite source routes or source records whenever possible.

### Admin / Owner Knowledge Space

- Owner can manually trigger knowledge refreshes.
- Trigger types:
  - Codex interview
  - new project
  - LinkedIn post paste/import
  - CV/resume update
  - manual memory note
  - future source type
- Every trigger creates a draft extraction, never a public answer directly.
- Owner approves or edits extracted facts before they enter public memory.
- Approved facts generate:
  - knowledge cards
  - suggested questions
  - cached FAQ answers
  - source metadata

### Codex Interview Trigger

Codex should interview the owner from several perspectives:

- recruiter
- AI engineer colleague
- student
- professor or research mentor
- startup founder
- internship interviewer

The output of an interview should be structured into facts, skill evidence, project evidence, FAQs, and missing-data prompts.

## Non-Functional Requirements

- Runtime cost: zero for suggested questions and cached answers.
- Optional model calls: private/admin only in v1 unless explicitly enabled later.
- Latency: cached answer target below 300 ms after panel opens.
- Accessibility: keyboard usable, focus trapped/restored, cached answers announced via sensible live regions.
- Security: API keys never reach the browser.
- Abuse protection: question length limits, topic gate, rate limit if public LLM fallback is ever enabled.
- Honesty: no answer without approved memory or citation path.

## Knowledge Sources

Initial v1 sources:

- `apps/web/content/site.ts`
- `apps/web/content/asmos.ts`
- README files
- project pages and project metadata
- owner-provided LinkedIn post text
- owner-provided CV/resume text
- owner answers from Codex interview sessions
- manual notes added by owner

### Owner Interview Round 1 - 2026-07-27

Approved interview memory now positions Deepak for Agentic AI Engineer roles, names ASMOS as the flagship project and Deepak.ai as the second strongest current project, and records his debugging and learning approach. ASMOS is represented as a research-grade working prototype with routing, ownership scoring, memory, 400+ passing tests, Docker support, and experiments against real AI models on Stack Overflow Q&A data. The corrected final token-reduction figure is about 22%, with question-level results roughly 18-26%; the earlier 24% figure came from a smaller early test and should not be used as the canonical public claim. The approved explanatory example is a three-agent online-store helpdesk where billing, shipping, and product agents build verified checkpoints, ownership scores, and narrower memory prompts. Humanizer AI is retained as an honest work-in-progress, not a flagship claim.

### Owner Interview Round 2 - 2026-07-30

Approved interview memory expands Deepak's target role from a single label into a broader AI-building direction: agent infrastructure, applied AI automation, AI research engineering, developer tools, and product AI. The approved AI employee example is a daily research/content assistant that finds new AI developments, drafts a LinkedIn post in Deepak's style from prior writing, and prepares it for owner review. Deepak defines an agent skill as a reusable workflow capability learned from structured examples, such as an Excel sheet, so an agent can repeat a task later. Deepak.ai should prove to recruiters that Deepak loves agents, automation, model experimentation, and building AI products that remove repeated manual work.

Approved planned AI employee workflows:

- LinkedIn assistant: study strong LinkedIn posts, organize patterns in Excel, turn those examples into a reusable `skill.md`, and use the skill with fresh AI research to draft posts in Deepak's style for review.
- Instagram assistant for Deepak AI: research AI topics and coordinate visual-content production ideas, images, short videos, voice/audio assets, and drafts using tools such as HeyGen, Suno, ElevenLabs, image generation, and writing assistants, with Deepak reviewing outputs.

Review boundary: AI employees may prepare and schedule content, but Deepak approves before publishing.

LinkedIn note: v1 uses manual paste/import because member post retrieval through LinkedIn APIs can require restricted permissions. Automatic LinkedIn sync is a future enhancement only after owner approves the integration path.

## Data Model - File-Backed V1

Start with file-backed data so the feature can ship before full RAG:

```text
apps/web/content/dex/
  sources/
    projects.json
    linkedin-posts.json
    interviews.json
    resume.json
    manual-notes.json
  knowledge-cards.json
  faq-cache.json
  suggested-questions.json
```

Knowledge card shape:

```json
{
  "id": "skill-agentic-ai",
  "title": "Agentic AI",
  "summary": "Approved owner-written or owner-approved summary.",
  "tags": ["agentic-ai", "llm", "memory"],
  "sources": ["/projects/asmos"],
  "visibility": "public",
  "updatedAt": "2026-07-27"
}
```

FAQ cache shape:

```json
{
  "id": "recruiter-ai-fit",
  "question": "Is Deepak suitable for an AI engineering internship?",
  "aliases": ["Should I hire Deepak for AI?", "What makes Deepak useful for AI roles?"],
  "audience": "recruiter",
  "answer": "Approved cached answer.",
  "sources": ["/projects/asmos"],
  "updatedAt": "2026-07-27"
}
```

## API Notes

V1 can avoid a public LLM endpoint entirely:

- `GET /api/dex/suggested` returns suggested questions.
- `POST /api/dex/answer` accepts a visitor question and returns:
  - cached answer match, or
  - knowledge-card template answer, or
  - scoped refusal.

Future v1.5/v2 may add:

- embeddings with `text-embedding-3-small`
- Postgres `pgvector`
- Vercel AI SDK `useChat`
- streamed model answers using retrieved, approved context only

## UI Notes

- Dex uses the presence dot identity already defined by the design system.
- It should feel like a recall surface, not a chatbot clone.
- No mascot, no face, no fake personality.
- Every answer shows sources.
- The scope note is always visible: Dex only knows approved memories about Deepak.

## Future Ideas

- Admin approval UI for extracted facts.
- Embedding-powered semantic search.
- Cached answer invalidation when source content changes.
- Per-audience mode: recruiter, collaborator, student, interviewer.
- "Ask about this project" contextual entry point.
- Conversation analytics: unanswered questions become owner review prompts.

## Status

Implemented on branch `codex/ai-development-process` as D-053 v1. Owner interview round 1 is integrated; next is a second interview round and a review of the expanded cache in-browser.
