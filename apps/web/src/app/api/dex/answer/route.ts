import { NextResponse } from "next/server";
import { answerDexQuestion } from "@/lib/dex/search";
import { logDexQuestion } from "@/lib/dex/log";
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

  try {
    const body = (await request.json()) as { question?: unknown; role?: unknown };
    question = typeof body.question === "string" ? body.question : "";
    visitorRole = body.role;
  } catch {
    question = "";
  }

  if (question.trim().length > MAX_QUESTION_LENGTH) {
    return NextResponse.json(
      { error: "Question is too long." },
      { status: 400 },
    );
  }

  const answer = answerDexQuestion(question);

  // Analytics only (D-054) — logDexQuestion swallows its own failures so a
  // logging or DB outage can never cost the visitor their answer.
  if (question.trim()) {
    await logDexQuestion(question.trim(), answer, visitorRole);
  }

  return NextResponse.json(answer);
}
