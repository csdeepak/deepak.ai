import { NextResponse } from "next/server";
import { answerDexQuestion } from "@/lib/dex/search";

export async function POST(request: Request) {
  let question = "";

  try {
    const body = (await request.json()) as { question?: unknown };
    question = typeof body.question === "string" ? body.question : "";
  } catch {
    question = "";
  }

  return NextResponse.json(answerDexQuestion(question));
}
