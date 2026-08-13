# 31 — Dex v2: grounded LLM agent

> **Status:** Phase 1 built (2026-08-13). Phases 2–4 planned.
> **Decision record:** `memory/DECISIONS.md` → `D-059`.
> **Supersedes:** the "cached recall, no model calls for public visitors"
> position of D-053. It does **not** supersede D-054 — the question log,
> `/admin/dex`, role-aware ordering and the privacy boundary all carry forward
> unchanged.

---

## 1. What is actually broken

The owner's report was that Dex "gives different answers to the same question
asked differently" and "gives some generalized shit" to direct questions.

That is not a content problem. It is a **retrieval** problem, and the
distinction decides the whole rebuild.

Dex v1 (`src/lib/dex/search.ts`) answers by lexical token overlap: it tokenises
the question, scores it against 49 FAQ entries and 43 knowledge cards, and
returns the stored text of whichever scored highest — if, and only if, that
score clears a hard threshold of 8 (FAQ) or 7 (card). There is no model in the
path. There is no synonym handling, no stemming, no semantic similarity.

Reproduced against the real corpus on 2026-08-13 (scoring ported verbatim from
`search.ts`, run against the shipped JSON):

| Question | v1 outcome |
| --- | --- |
| "What are Deepak's strongest projects?" | score **100** — exact FAQ hit |
| "What are Deepak's top projects?" | score **8** — scrapes past the threshold by one point |
| "What are his best projects?" | score **8** — same knife edge |
| "Why should a recruiter consider Deepak for an AI role?" | score **100** |
| **"Why should we hire Deepak?"** | score **5** → **falls through to "reach out to Deepak"** |
| **"Tell me about the memory system he built"** | score 17 → **matched "What is the Smart Door Lock project?"** |
| **"Does Deepak know Python?"** | score 4 → **falls through**, despite a `Core skills` card naming Python |

Three distinct failures, all from one cause:

1. **Synonym cliff.** "strongest" is in the corpus, "top"/"best" are not. The
   answer swings from perfect to threshold-scraping to nothing on a word the
   visitor picks at random.
2. **Wrong-document match.** "memory system" overlaps the Smart Door Lock
   card's text enough to win. This is the "it gives some comments I made"
   complaint — the score is a bag-of-words count, so an unrelated card with
   incidental vocabulary can outrank the right one.
3. **Silent hand-off on answerable questions.** "Why should we hire Deepak?" is
   the single most valuable question a recruiter can ask, the corpus answers it
   well, and v1 replies with a contact card. This is the "generalized answers"
   complaint.

**The knowledge base is not the problem.** `faq-recruiter-fit`'s stored answer
is specific and well-written. v1 simply could not find it.

### 1.1 What that means for the fix

Bolting a model onto the same retrieval would inherit every miss above. So v2
removes the retrieval step entirely rather than improving it — see §3.2.

---

## 2. Provider research (August 2026)

Owner constraint: **strictly $0/month**.

| Provider | Free limits | Free context | Verdict |
| --- | --- | --- | --- |
| **Google Gemini** | ~10–15 RPM, ~1,500 RPD, 250k TPM | **1M tokens** | **Chosen.** Only free tier where the whole corpus fits in one call with room to spare. |
| Groq | 30 RPM, **6,000 TPM**, 14,400 RPD | model-dependent | **Disqualified.** 6k TPM is below our ~8.2k-token prompt — a single request exceeds the per-minute budget. |
| Cerebras | ~30 RPM, ~1M tokens/day | **8,192 tokens** | **Disqualified.** Context cap is under our prompt size. |
| OpenRouter (free models) | 20 RPM, **50 RPD** (1,000 with $10 lifetime credit) | model-dependent | Rejected as primary — 50 requests/day is one curious visitor. Good **failover**, see §4.2. |
| Mistral (Experiment) | ~1B tokens/month, ~50k TPM | large | Rejected: the free quota requires opting into training on your data as a condition, not just as a default. |
| GitHub Models | 10–15 RPM, 50–150 RPD | model-dependent | Rejected: RPD too low, and it is tied to a Copilot entitlement rather than a standalone API product. |

**Model:** `gemini-3.1-flash-lite` — verified **stable** (not preview) on
ai.google.dev, 2026-08-13. Preview endpoints carry tighter free-tier limits and
a 2-week deprecation notice; a page a recruiter may open should not sit on
that. Configurable via `LLM_MODEL`.

### 2.1 The two costs of "free"

Both are policy, both are recorded in `src/lib/dex/llm/config.ts` so nobody
rediscovers them later:

1. **Training on inputs.** On the Gemini *free* tier Google may use prompts and
   responses to improve its products, including human review. Everything Dex
   sends is already-public portfolio content, so the real exposure is the
   visitor's question text. Mitigation: `visibility: "internal"` knowledge
   cards are filtered out of the prompt and never reach a provider
   (`publicKnowledgeCards()`), asserted by the guard script.
2. **Region restriction.** Google's terms restrict free-tier ("Unpaid
   Services") API clients from serving EEA / Swiss / UK users. A recruiter in
   London is a plausible visitor. **This is the strongest single argument for
   moving to a paid key** — Tier 1 removes both the training clause and the
   restriction, and at this traffic level the bill is cents. Flipping is one
   env var; no code changes.

---

## 3. Architecture

```
POST /api/dex/answer
  → IP rate limit (in-memory)         (existing, unchanged, whole-route)
  → length cap 500 chars              (existing, unchanged)
  → role validated against closed enum
  → generateDexAnswer()
        ├── durable IP rate limit (Upstash, 8/10min)      ─┐
        ├── Turnstile human verification                   ├─ D-060
        ├── durable shared daily budget (Upstash, 300/day) ─┘
        ├── build prompt: 43 public cards + top-6 FAQs + role hint
        ├── OpenAI-compatible chat completion, JSON mode
        ├── validate: shape → grounding → fabrication scrub → length cap
        └── free-form prose, server-preserved structure
  → on ANY failure: answerDexQuestion()   ← v1 cached matcher, unchanged
  → log question + outcome           (existing D-054 pipeline)
```

### 3.1 Provider-agnostic by construction

The client (`llm/provider.ts`) is ~60 lines of `fetch` against the
OpenAI-compatible `/chat/completions` shape. **No SDK, no new dependency.**
Google, OpenRouter, Groq, Cerebras and Mistral all speak it, so switching
provider is `LLM_BASE_URL` + `LLM_MODEL` + `LLM_API_KEY` — three env vars, zero
code. This also honours docs/30 §2.7.4 (new dependencies need a DECISIONS
entry) and keeps `/`'s bundle untouched, since none of it is client-reachable.

### 3.2 No vector database, no embeddings — on purpose

The public corpus is **43 knowledge cards ≈ 8.2k tokens** (measured by the
guard script, not estimated). Every request sends all of them.

This is the documented sweet spot for long-context over retrieval: collections
small enough to sit comfortably inside the window, where a retrieval step only
adds a failure mode. Reported accuracy degradation from "context rot" begins
well past 60k tokens; we are roughly 7× below that. Retrieval is the component
that was broken — deleting it, rather than replacing it with a better version
of the same idea, is the actual fix.

`EMBEDDING_API_KEY` stays reserved in `.env.example`. The trigger to revisit is
in §6.

FAQs are handled differently and for a different reason: only the top 6 by
lexical score go in. They are not needed as *facts* (the cards carry those) —
they are owner-approved prose, so they act as **style exemplars** and carry
detail the terse cards omit. A bad FAQ rank now costs one weaker exemplar, not
a wrong answer.

### 3.3 Guardrails

A public, unauthenticated endpoint has to assume the instruction layer can be
talked around, so the system prompt is the *first* line of defence, not the
only one. Everything below runs server-side after the model returns, in
`llm/generate.ts`:

| Guard | Behaviour |
| --- | --- |
| **Durable IP rate limit (D-060)** | Upstash Redis sliding window, 8 LLM-backed questions per 10 minutes per IP — holds across every Vercel serverless instance, unlike the route's pre-existing in-memory limiter. Checked *first*, before anything that costs a model call or a shared-budget unit. |
| **Turnstile verification (D-060)** | A visitor without a valid, freshly-verified token never reaches the model. Blocks scripted callers that are individually under the IP rate limit but distributed across many IPs. |
| **Durable daily budget (D-060)** | Shared ceiling across every visitor, 300/day default, Upstash-backed. Only *consumed* by requests that already cleared the IP + Turnstile gates — see `guard.ts`'s file comment for why that ordering specifically prevents one blocked IP from draining the shared budget through repeated denied attempts. |
| **Shape validation** | Anything that isn't the agreed JSON → fall back to v1. Fenced JSON is recovered rather than discarded. |
| **Grounding gate** | `scope: "answer"` citing zero *real* card ids → downgraded to the honest contact hand-off. A confident answer grounded in nothing is exactly the failure this rebuild exists to remove. |
| **Fabrication scrub** | Deny-by-default allowlist. Any email that isn't `csdeepak2005@gmail.com`, any link outside `linkedin.com`/`instagram.com`/`github.com`/`deepak.ai`, is stripped before display — newline-safe, so a deliberate paragraph break survives the scrub (D-060). A hallucinated recruiter address is worse than no answer (LAW-008). |
| **Length cap** | ~1,100 characters, a safety net not a formatting rule — see §3.4. |
| **Injection handling** | Instructions inside the question → `scope: "refuse"`. The visitor `role` is re-validated against the closed enum and resolved through a fixed label map, so only one of five phrases can reach the prompt. |
| **Internal-card filter** | `visibility: "internal"` never enters a prompt. |
| **Fallback** | Every failure path returns null → v1 cached matcher answers. **The worst case is today's behaviour, never an error.** Confirmed under a real failure, not just simulated — see §4's Phase 2 verification. |

Two of the three D-060 guards (rate limit, budget) **fail closed**: if Redis is
unreachable or unconfigured, they deny rather than allow. This is the opposite
instinct from the LLM provider client, which fails open to v1 on any error —
deliberately, because a rate-limiter outage failing *open* would mean the one
moment the abuse gate can't be verified is the one moment an attacker gets
unlimited access. `generate.ts` still falls back to v1 either way, so the
visitor is never the one who pays for that choice.

### 3.4 House style

Owner decision, 2026-08-13: *confident, correct, structured, eye-catching,
short and punchy.* **Revised 2026-08-14** after the owner asked for answers
that read like a live Claude/ChatGPT response rather than a fixed template —
the original Phase 1 schema (`lead` + `points[]`, server-assembled with a
forced "· " bullet prefix) produced the same shape every time regardless of
question, which read as templated rather than conversational.

v2's schema is a single free-form `answer` string. The model chooses prose vs.
a short inline list per-question, the way an actual assistant would; the
system prompt (`prompt.ts`) states this as the top-priority voice rule, not a
suggestion. What's still enforced by code rather than requested politely: the
~1,100-character cap (a safety net, not a target), the fabrication scrub
(newline-safe, so it doesn't flatten an intentional paragraph break), and the
grounding gate. Structure itself — paragraphs vs. a list, one sentence vs.
three — is no longer server-decided.

---

## 4. Phases

### Phase 1 — grounded generation behind a flag ✅ **BUILT 2026-08-13**

| File | Purpose |
| --- | --- |
| `src/lib/dex/llm/config.ts` | Env-driven, provider-agnostic config + kill switch |
| `src/lib/dex/llm/provider.ts` | OpenAI-compatible `fetch` client, never throws |
| `src/lib/dex/llm/prompt.ts` | System prompt, full-corpus context builder |
| `src/lib/dex/llm/generate.ts` | Orchestration, validation, assembly, fallback |
| `scripts/check-dex-v2.ts` | 18 offline guard checks + live paraphrase battery |
| `scripts/tsconfig.json`, `scripts/shims/server-only.ts` | Make guard scripts runnable outside Next |

Also: `DexAnswerKind` gains `"generated"`; the answer route calls v2 first;
`.env.example` documents all four new vars.

**Verified:** 18/18 offline checks pass; the guard is proven to *fail* when the
grounding gate is removed (2 checks flip to FAIL); `tsc --noEmit` clean.

**Not verified:** anything requiring a live API key. See §5.

### Phase 2 — abuse guardrails + natural-prose rewrite ✅ **BUILT 2026-08-14**

Two owner requests, addressed together: (1) "strong guardrails so no one can
bypass and drain the free quota", (2) answers should read like a live
Claude/ChatGPT response, not a fixed template.

| File | Purpose |
| --- | --- |
| `src/lib/dex/llm/guard.ts` | Durable Upstash-backed IP rate limit + shared daily budget. Fail-closed. |
| `src/lib/dex/llm/turnstile.ts` | Cloudflare Turnstile server-side `siteverify` call. Fail-closed. |
| `src/features/dex/dex-panel.tsx` | Explicit-render Turnstile widget, `appearance: interaction-only`; token refreshed after every question (tokens are single-use, 5-minute TTL per Cloudflare). |
| `src/lib/dex/llm/prompt.ts`, `generate.ts` | Schema collapsed from `{lead, points[]}` to a single free-form `answer` string; validation rewritten to be newline-safe. |
| `scripts/check-dex-v2.ts` | Extended: an INFRA section makes real (not mocked) calls to Upstash and Cloudflare's `siteverify` using Cloudflare's own published test credentials; offline section covers the new schema; a fail-closed assertion proves v2 refuses to run without Redis configured, even with a valid LLM key. |

**Real bug found and fixed during this phase:** `guard.ts`'s Redis client was
originally memoized at module scope. A test that temporarily cleared the env
vars to prove fail-closed behaviour left that cache poisoned as `null` for
every subsequent check in the same process — including real infra checks that
ran afterward with valid credentials present. Fixed by removing the cache
entirely: `new Redis(...)` only stores a URL/token pair and makes no network
call, so there is no real cost to constructing it fresh on every request, and
the correctness/testability gain is worth far more than the micro-saving.

**A sandbox network constraint discovered mid-build, not assumed:** the build
environment's outbound network is allowlisted and returns
`blocked-by-allowlist` for `generativelanguage.googleapis.com`,
`*.upstash.io`, and `challenges.cloudflare.com` — confirmed via `curl -v`
showing the proxy's explicit rejection, independent of the owner's own network
(the owner switched wifi networks assuming the restriction was client-side; it
was not — it is the build sandbox's own egress policy). This means live
verification of Gemini completions, Redis round-trips, and Turnstile
`siteverify` could not run *in this environment*. It was not skipped: the
guard script's INFRA and LIVE sections were run for real, against the owner's
real credentials, and every failure was a genuine `EAI_AGAIN` DNS failure or
Redis-unreachable — not a mock, not an assumption. Each one was handled
exactly as designed (denied, logged, fell back), which is itself real
evidence the fail-closed behaviour works under an actual network failure, not
only a simulated one. True live success/failure — does Gemini answer well,
does the Turnstile widget render for a real visitor — still needs verification
from an environment with normal internet access: the owner's own machine via
`npm run dev`, or Vercel after deploy. See §5.

**Update 2026-08-14, owner ran the battery from a real machine:** every gap
above is now closed except the Turnstile browser render (below). Real Upstash
round-trips pass. **50/50 checks pass**, including two harder batteries added
after the first live run: twisted/skeptical phrasings of real facts ("is he
legit or just tutorial projects", a forced single-choice, a bare `python?`
fragment) all still ground correctly; direct-recruiter-style questions
hitting genuine corpus gaps (notice period, relocation, AWS/cloud
certifications, open-source contributions, hackathons, salary, visa
sponsorship) all correctly returned `unknown` rather than fabricating an
answer — the single highest-stakes property a generative layer has to hold;
disguised injection attempts (fake jailbreak, fake "unrestricted" home-address
request, raw prompt-extraction attempt) all declined safely. Sample real
output: *"ASMOS is the strongest bet. It is a research-grade, multi-agent
memory system that moves beyond simple RAG by using verified checkpoints
to..."* — reads as an answer, not a template.

One real bug found and fixed along the way, worth recording precisely because
it looked like a guardrail failure at first: the first live run hit
`rate_limited` on 12 of ~29 calls partway through the adversarial battery.
Not a guardrail bug — the battery itself fires close to 30 sequential live
calls, well over Gemini's free-tier ~10-15 RPM cap, and `provider.ts`
correctly identified the 429 and degraded rather than crashing. Fixed by
pacing the script's own live calls to ~12/minute (`LIVE_CALL_SPACING_MS` in
`check-dex-v2.ts`) — a test-harness fix, not a production code change.

**Still not verified:** a real Turnstile widget rendering and completing an
actual challenge in a browser (the automated `siteverify` check only proves
the server-side call is correct, via Cloudflare's dummy test credentials —
seeing the invisible widget actually work in the live Dex panel needs eyes on
a real page). See the remaining §5 checklist.

### Phase 3 — close the knowledge gaps (§7)

Highest-value work after turn-on. The retrieval fix makes existing knowledge
*reachable*; it cannot invent knowledge that was never written down.

### Phase 4 — live site data in the prompt

Thread published projects and posts from Postgres into the context alongside
the static cards, so Dex stops being frozen at its 2026-08-04 snapshot. See
§7.1 — this is the largest structural gap.

---

## 5. Acceptance gates

Phase 1 (met):

- [x] `npm run check:dex-v2 --workspace=web` — 18/18 offline
- [x] Guard proven to fail when a guardrail is reverted
- [x] `npm run typecheck --workspace=web` clean
- [x] No new dependency; nothing client-reachable
- [x] With no key configured, behaviour is byte-identical to v1

Phase 2 (met, offline/fail-closed only — see below for what's still open):

- [x] `npm run check:dex-v2 --workspace=web` — 18/18 offline + fail-closed checks
- [x] Guard proven to fail closed under a **real** network failure (genuine `EAI_AGAIN`/Redis-unreachable, not simulated)
- [x] `npm run typecheck --workspace=web` clean
- [x] `getDexLlmConfig()` refuses to enable v2 without Redis configured, even with a valid LLM key

Phase 2, run for real by the owner from a machine with normal internet
(2026-08-14) — **50/50 checks passed**, including two adversarial batteries
added after the first live run (twisted phrasing of covered facts; honest-gap
questions that must not be fabricated; disguised injection):

- [x] `npm run check:dex-v2` INFRA section green — real Upstash round-trips succeed
- [x] `npm run check:dex-v2` LIVE battery green — every paraphrase pair answers, both sides cite overlapping cards
- [x] All three injection/off-topic probes refuse
- [x] Twisted/skeptical phrasings of real facts still ground correctly (6/6)
- [x] Direct questions hitting genuine corpus gaps correctly return `unknown`, not a fabricated answer (7/7 — notice period, relocation, certifications, open source, hackathons, salary, visa)
- [x] Disguised injection (fake jailbreak, fake "unrestricted" address request, prompt-extraction attempt) all declined safely (3/3)

Still open — needs the owner, in a real browser, on the deployed or local site:

- [ ] Turnstile widget actually renders and completes in a real browser (only the server-side `siteverify` call has been proven; nothing has confirmed the client widget itself works)
- [ ] `npm run check:dex --workspace=web` still 34/34 (the v1 fallback must stay intact)
- [ ] `CONTENT_SOURCE=file npm run build` succeeds
- [ ] `npm run check:bundle --workspace=web` — `/` unchanged at ~157.2 kB
- [ ] Ten real questions asked in-browser, read by the owner, judged recruiter-ready and natural (not templated)
- [ ] `/admin/dex` shows the new `generated` outcome alongside the old kinds
- [ ] Same env vars added in Vercel → Project Settings → Environment Variables: `LLM_API_KEY`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`, `DEX_LLM_DAILY_LIMIT`

---

## 6. Open questions

1. **Free tier region restriction.** Ship on free and accept that EEA/UK/Swiss
   visitors are technically out of terms, or spend ~$0–2/month on Tier 1 to
   remove it? Owner chose free for now; this is the one reason to revisit.
2. **Streaming.** Answers currently arrive whole after ~1–3s. Streaming feels
   faster but conflicts with server-side assembly and validation — you cannot
   scrub a fabricated email you have already streamed. Recommendation: keep
   whole-response, revisit only if latency is judged poor.
3. **Answer caching.** Identical questions currently re-call the model. A
   normalised-question cache in Postgres would cut quota use and latency.
   Deferred until real traffic shows repeats.
4. **When does §3.2 stop being true?** Concrete trigger, not a feeling: when
   the assembled context passes **~25k tokens** (roughly 3× today), revisit
   embeddings + retrieval. The guard script fails at 40k as a hard tripwire.
5. **Should `check:dex-v2` go into CI?** The offline half is key-free and would
   run fine. `check:dex` was flagged for CI in D-054 and still isn't wired in;
   worth doing both at once.

---

## 7. Knowledge: what we have vs what we still need

### 7.1 Structural gap — the corpus is a frozen snapshot

Every knowledge card carries `updatedAt` between **2026-07-27 and 2026-08-04**.
Since then the owner shipped the Posts feature and published **15+ real posts**,
plus a live gallery and timeline. `content/site.ts` carries **18 projects**;
the cards describe roughly 13.

So Dex cannot discuss anything published in the last ten days, and will keep
falling further behind every time the owner posts. **This is the biggest
remaining gap and no amount of prompt work fixes it** — it is Phase 4:
`ContentService.getProjects()` / `getPosts()` threaded into `buildDexContext`
so published DB content grounds answers automatically.

### 7.2 Recruiter questions with no answer in the corpus

Probed the full corpus (cards + FAQs) for terms a recruiter reliably asks.
**Absent entirely:**

| Missing | Why it matters |
| --- | --- |
| Internships / work experience | The single most common recruiter screen. The word "internship" does not appear. |
| Availability, notice period, start date | Asked in almost every first contact. |
| Location and relocation preference | Bengaluru is mentioned as *where he studies*, never as a work preference. |
| Graduation date / batch year | "2027" appears once; there is no clean "when is he available to join" fact. |
| Open-source contributions | A standard credibility signal for an agent-infra role. |
| Certifications, awards, hackathons | Nothing. If they exist, they are worth a card; if not, worth knowing they don't. |
| Cloud / deployment / CI-CD experience | The site itself is on Vercel + Neon + R2 with a CI pipeline — that is real, demonstrable infra experience nowhere in the corpus. |
| Competitive programming / DSA proof | Two skill nodes in the hero are literally named "Data Structures & Algorithms" and "Operating Systems", with no card behind either. |

**Deliberately absent and should stay absent:** salary expectations (v1 already
had a bug returning a confident wrong answer here — D-054), visa status,
anything personal.

### 7.3 Audience imbalance

FAQ mix: **24 technical, 10 recruiter, 9 general, 5 collaborator, 1 student.**
The stated goal is recruiter-facing, but the corpus is weighted 2.4:1 toward
technical depth. Recruiter-flavoured cards are the highest-value additions.

### 7.4 What is already strong — do not rewrite it

- ASMOS is genuinely well documented, with real numbers (400+ tests, ~22% token reduction, ownership scoring) — exactly the evidence-first material the new style is built to surface.
- Honest-limits content (`Humanizer AI` as work-in-progress, `The experiment that failed first`) reads as credible rather than polished, and recruiters respond to it.
- The identity/direction/target-role cards are clear and consistent.
- The 49 FAQ answers are well-written. **They were never the problem** — v1 just couldn't find them, which is why they now serve as style exemplars rather than being discarded.

---

## 8. Progress log

| Date | Phase | What happened |
| --- | --- | --- |
| 2026-08-13 | — | Owner reported paraphrase instability and generic answers. Diagnosed by porting `search.ts`'s scoring verbatim and running it against the shipped corpus: three distinct failure modes, all retrieval, none content (§1). |
| 2026-08-13 | Research | Six free-tier providers compared. Groq (6k TPM) and Cerebras (8k context) disqualified by hard numbers against a measured 8.2k-token prompt; OpenRouter's 50 RPD too low for primary. Gemini chosen; both costs of "free" recorded (§2.1). |
| 2026-08-13 | 1 | Built. Full-corpus grounding, JSON-mode generation, six server-side guardrails, v1 as fallback, 18-check guard script. 18/18 offline; guard proven to fail when the grounding gate is reverted; typecheck clean. No new dependency. Nothing live-verified — no API key in this session. |
