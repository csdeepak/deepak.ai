# 32 — Dex v2: go-live checklist

> A step-by-step guide to get Dex v2 fully working in production, in order.
> Written for whoever is doing this by hand in the Vercel dashboard — not a
> technical design doc. For the full reasoning and architecture, see
> [`31-DEX-V2-LLM-AGENT.md`](31-DEX-V2-LLM-AGENT.md) and
> `memory/DECISIONS.md` → `D-059`, `D-060`.

Work through this top to bottom. Each step tells you what to do and how to
know it worked before moving to the next one.

---

## Step 1 — Force a fresh deploy

Vercel only picks up new environment variables on the **next** build. If you
added the five Dex v2 variables after your last deploy already finished, this
step alone usually fixes it.

1. Open your project on [vercel.com](https://vercel.com).
2. **Deployments** tab → click the top (most recent) deployment.
3. Click **⋯** → **Redeploy**.
4. If asked about build cache, choose **without** existing cache — a clean
   build, not a cached one.
5. Wait for it to finish (usually 1-3 minutes). Status should say **Ready**.

If the deployment fails here (status says **Error** instead of **Ready**),
stop and go to **Step 2A**. If it succeeds, go to **Step 2B**.

---

## Step 2A — If the deploy itself failed

1. Click the failed deployment → **Build Logs**.
2. Scroll to the red error text near the bottom.
3. Copy that error text and paste it back to me — I'll tell you the exact fix.

**Two causes already seen on this project:**

**Google Fonts fetch failure — transient, just redeploy.** If the error looks
like this:

```
src/app/layout.tsx
`next/font` error:
Failed to fetch `Inter Tight` from Google Fonts.
> Build failed because of webpack errors
```

…nothing is wrong with your code. `next/font/google` downloads Inter Tight
from `fonts.gstatic.com` during the build, and Vercel's builder occasionally
can't reach it (it retries 3× then gives up). **Redeploy the same commit and
it will usually pass.** This happened on 2026-08-13 to the Dex v2 Phase 2
commit itself: identical commit, failed once, succeeded on retry with zero
changes. Permanent fix if it becomes annoying: self-host the font via
`next/font/local` instead, which removes the build-time network dependency.

**Lockfile mismatch.** `npm ci` requires `package-lock.json` to exactly match
`package.json`. If you see anything mentioning `npm ci` or "package-lock" in
the error, that's the family of problem — paste it and I'll confirm.

---

## Step 2B — If the deploy succeeded, confirm the five env vars are actually there

1. **Settings** tab → **Environment Variables**.
2. Check all five are present, each with **Production** checked:

| Key | Should be set |
|---|---|
| `LLM_API_KEY` | ✅ |
| `UPSTASH_REDIS_REST_URL` | ✅ |
| `UPSTASH_REDIS_REST_TOKEN` | ✅ |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | ✅ |
| `TURNSTILE_SECRET_KEY` | ✅ |

3. Click into each value once and check for accidental leading/trailing
   spaces or a stray line break — these are invisible and the single most
   common cause of "I definitely pasted it right but it's not working."

If any are missing or look wrong, fix them, then repeat **Step 1** (redeploy
again — this step alone doesn't restart anything).

---

## Step 3 — Watch the logs while asking Dex a question

1. Open the deployment from Step 1 → **Runtime Logs** (sometimes labelled
   just **Logs**).
2. Type `Dex` into the log search/filter box.
3. In another tab, open your live site, open the Dex panel, and ask it a real
   question (e.g. "What are Deepak's top projects?").
4. Watch the Logs tab — a line should appear within a few seconds.

### What the line means

| If you see this line | It means | What to do |
|---|---|---|
| **Nothing appears at all** | The new code may not actually be live — the deploy might not include your latest push | Check the deployment's commit hash (top of the deployment page) matches your latest GitHub commit. If not, push again. |
| `Dex v2 disabled: LLM_API_KEY is set but UPSTASH_REDIS_REST_URL/TOKEN are not` | Redis variables missing or misspelled | Re-check the two Upstash values in Step 2B |
| `...turnstile_missing` | The Turnstile widget never produced a token | Go to **Step 4** below |
| `...turnstile_failed` | Cloudflare rejected the token | Go to **Step 4** below |
| `...redis_unavailable` | Upstash can't be reached | Log into [upstash.com](https://upstash.com), confirm the database still exists and isn't paused; re-copy the REST URL/token if unsure |
| `...ip_rate_limited` or `...daily_budget_exceeded` | The guardrails are working correctly — you've just hit a limit from testing | Wait a few minutes (IP limit) or until tomorrow UTC (daily limit), or this is actually good news: it means everything is working |
| `...provider_error` | Gemini rejected the request | Re-check `LLM_API_KEY` was copied correctly, no extra characters |
| No `Dex` line, but the answer in the panel still reads like the old generic style | The v1 fallback is answering — one of the lines above should also be present just above it; look again | Paste me everything you see, even a "nothing" |

Whatever you find, that's the actual state — paste it here and I'll confirm
the exact next move rather than guessing further.

---

## Step 4 — If it's a Turnstile problem specifically

1. Go to [dash.cloudflare.com](https://dash.cloudflare.com) → **Turnstile**.
2. Click your widget.
3. Check **Hostname management** lists your real live domain exactly (no
   `https://`, no trailing slash) — e.g. `deepak-ai-web.vercel.app`, or your
   custom domain if you've since attached one.
4. If it's missing or wrong, add the correct hostname, save.
5. Repeat **Step 1** (redeploy) and **Step 3** (watch logs again) — Turnstile
   config changes take effect immediately, no redeploy strictly required for
   *this* specific fix, but redeploying rules out every other variable at
   once.

---

## Step 5 — Once Dex v2 is actually answering

Confirm these, in your own browser, on the live site:

- [ ] Ask 4-5 real questions — do the answers read like a natural reply, not
      a fixed template?
- [ ] Ask something you know isn't in the knowledge base (e.g. "what's his
      notice period") — does it honestly hand off to contact info instead of
      making something up?
- [ ] Try asking it to do something unrelated ("write me a poem") — does it
      decline?
- [ ] `/admin/dex` (log in first) — do you see `generated` as an answer kind
      in the list, alongside the older kinds?

If all four hold up, Dex v2 is live and working as designed.

---

## Reference — the five production env vars

Kept here for quick copy-paste if you ever need to re-enter them (e.g. after
rotating a key). Full values are in your local `.env.local` (never commit
that file) and in the Vercel dashboard itself — not repeated here since this
file may end up more widely shared than a chat message.

| Key | Where to get it again if lost |
|---|---|
| `LLM_API_KEY` | [aistudio.google.com/apikey](https://aistudio.google.com/apikey) — generate a new one if the old is lost, it's free |
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | [upstash.com](https://upstash.com) → your database → REST API section |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` / `TURNSTILE_SECRET_KEY` | [dash.cloudflare.com](https://dash.cloudflare.com) → Turnstile → your widget |

---

## Verified against the code (2026-08-14)

Everything quoted above was checked against the implementation before this
file was committed, so the strings you are told to look for are the strings
the code actually emits:

- All six failure reasons (`turnstile_missing`, `turnstile_failed`,
  `redis_unavailable`, `ip_rate_limited`, `daily_budget_exceeded`,
  `provider_error`) exist in `src/lib/dex/llm/`.
- The "Dex v2 disabled…" message in Step 3 matches `config.ts` verbatim.
- Every log line the module emits is `Dex`-prefixed, so the Step 3 filter
  works.
- `generated` is a real `DexAnswerKind` (`src/lib/dex/types.ts`).

**One bug was found and fixed while verifying this file:** `getDexStats()`
counted only `('cached','knowledge')` as answered, so a `generated` reply
fell through every bucket — not answered, not unanswered, not refused — and
`/admin/dex`'s answer-rate would have silently undercounted as soon as v2
started serving. Fixed in the same commit as this doc.
