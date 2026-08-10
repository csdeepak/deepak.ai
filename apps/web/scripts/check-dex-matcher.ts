/**
 * Dex matcher guard (D-054).
 *
 * Locks in the two behaviours that protect the public assistant:
 *   1. Approved questions keep returning their cached/knowledge answer.
 *   2. Everything else is refused or honestly answered "I don't know yet" —
 *      Dex must never answer a question it has no approved memory for.
 *
 * Written as a plain tsx script rather than a test-framework suite to match
 * scripts/check-bundle-budget.mjs — the repo has no test runner, and this
 * needs none. Run it after any edit to src/lib/dex/search.ts or the JSON in
 * content/dex/:
 *
 *   npm run check:dex --workspace=web
 *
 * Exits non-zero on any regression, so it can be wired into CI as-is.
 *
 * History: added after the D-054 question log caught a live false positive —
 * "What is Deepak's expected salary?" matched "Who is Deepak?" on the shared
 * name alone and returned a confident, wrong answer.
 */

import { answerDexQuestion } from "../src/lib/dex/search";
import type { DexAnswerKind } from "../src/lib/dex/types";

const CASES: Array<[question: string, expected: DexAnswerKind]> = [
  // ── Approved memory — must stay answerable ────────────────────────────────
  ["Who is Deepak?", "cached"],
  ["Deepak", "cached"],
  ["Tell me about Deepak", "cached"],
  ["What is ASMOS?", "cached"],
  ["How did ASMOS reduce tokens?", "cached"],
  ["How does ASMOS choose the owner agent?", "cached"],
  ["Is ASMOS a working prototype?", "cached"],
  ["Can you explain ASMOS with an example?", "cached"],
  ["What does Deepak mean by an AI employee?", "cached"],
  ["What LinkedIn AI employee does Deepak want to build?", "cached"],
  ["What Instagram AI employee does Deepak want to build?", "cached"],
  ["What is Deepak's review boundary for AI employees?", "cached"],
  ["Can Deepak's AI employee schedule posts?", "cached"],
  ["What does Deepak mean by an agent skill?", "cached"],
  ["What kind of company or team is Deepak targeting?", "cached"],
  ["Is Deepak open to startups or research labs", "cached"],
  ["What can Deepak's AI employees access?", "cached"],
  ["Can Deepak's AI employees read his Gmail", "cached"],
  ["What will Deepak's LinkedIn skill Excel sheet contain?", "cached"],
  ["Who is the audience for Deepak AI on Instagram?", "cached"],
  ["Does Dex ask who you are before answering?", "cached"],
  ["What computer vision experience does Deepak have?", "cached"],
  ["Has Deepak built systems beyond ML notebooks?", "cached"],
  ["How does Deepak work?", "cached"],
  ["How does Deepak debug and learn new tools?", "cached"],

  // ── Visitor-task requests — must stay refused (protects API credits) ──────
  ["Can you write my assignment?", "refusal"],
  ["Can you write my LinkedIn post?", "refusal"],
  ["Can you generate my Instagram video?", "refusal"],
  ["Can you schedule my post?", "refusal"],
  ["Can you prepare my report?", "refusal"],

  // ── About Deepak but unrecorded — must hand off to him, never guess ──────
  // The "unknown" kind now returns his contact details rather than a dead end
  // (owner decision 2026-08-04), so a recruiter who hits a gap can still reach
  // him. What matters here is that Dex does NOT fabricate an answer.
  ["What is Deepak's expected salary?", "unknown"],
  ["What is Deepak's favourite food?", "unknown"],
  ["Where does Deepak live exactly?", "unknown"],
  ["What are Deepak's political views?", "unknown"],
];

let failed = 0;

for (const [question, expected] of CASES) {
  const { kind, matchedQuestion } = answerDexQuestion(question);
  if (kind === expected) continue;

  failed++;
  const matched = matchedQuestion ? ` (matched "${matchedQuestion}")` : "";
  console.error(`✗ ${question}\n    expected ${expected}, got ${kind}${matched}`);
}

if (failed > 0) {
  console.error(`\n✗ dex matcher guard: ${failed}/${CASES.length} case(s) regressed`);
  process.exit(1);
}

console.log(`✓ dex matcher guard: ${CASES.length} cases pass`);
console.log("  approved questions answerable; tasks refused; gaps hand off to Deepak, never guessed");
