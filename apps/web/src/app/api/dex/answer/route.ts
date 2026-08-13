import { NextResponse } from "next/server";
import { answerDexQuestion } from "@/lib/dex/search";
import { generateDexAnswer } from "@/lib/dex/llm/generate";
import { logDexQuestion } from "@/lib/dex/log";
import { isDexVisitorRole } from "@/lib/dex/intake-shared";
import { createRateLimiter, getClientIp } from "@/lib/rate-limit";

// Hard input cap for the request body — distinct from search.ts's own
// 360-char UX refusal threshold. Anything over this never reaches the
// matcher or the DB log at all.
const MAX_QUESTION_LENGTH = 500;

// Public, unauthenticated, and writes a DB row on every call — generous
// enough for a real visitor chatting with Dex, tight enough to blunt a
// scripted loop hammering the endpoint.
const answerLimiter = createRateLimiter({ max: 20, windowMs: 5 * 60 * 1000 });

export async function POST(request: Request) {
  const ip = getClientIp(request.headers);
  if (answerLimiter.isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many questions. Try again in a few minutes." },
      { status: 429 },
    );
  }

  let question = "";
  let visitorRole: unknown = "";
  let turnstileToken = "";

  try {
    const body = (await request.json()) as {
      question?: unknown;
      role?: unknown;
      turnstileToken?: unknown;
    };
    question = typeof body.question === "string" ? body.question : "";
    visitorRole = body.role;
    turnstileToken = typeof body.turnstileToken === "string" ? body.turnstileToken : "";
  } catch {
    question = "";
  }

  if (question.trim().length > MAX_QUESTION_LENGTH) {
    return NextResponse.json(
      { error: "Question is too long." },
      { status: 400 },
    );
  }

  // Dex v2 (D-059): grounded generation first, v1 cached matcher as the
  // fallback. `generateDexAnswer` returns null — never throws — when the LLM
  // is disabled, out of free-tier quota, slow, or produced something that
  // failed validation. The visitor always gets a real answer; the only
  // difference is which layer produced it.
  //
  // The role is validated against the closed enum before it goes anywhere near
  // the prompt. It arrives in the request body, so an unvalidated pass-through
  // would be a second, unrate-limited injection surface alongside the question
  // itself — a free-text "role" could carry instructions.
  const safeRole = isDexVisitorRole(visitorRole) ? visitorRole : "";
  const generated = await generateDexAnswer(question, safeRole, ip, turnstileToken);
  if (generated.reason && generated.reason !== "disabled") {
    console.warn("Dex v2 fell back to cached recall:", generated.reason);
  }
  const answer = generated.answer ?? answerDexQuestion(question);

  // Analytics only (D-054) — logDexQuestion swallows its own failures so a
  // logging or DB outage can never cost the visitor their answer.
  if (question.trim()) {
    await logDexQuestion(question.trim(), answer, visitorRole);
  }

  return NextResponse.json(answer);
}
