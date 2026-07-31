import { NextResponse } from "next/server";
import { getDexSuggestedQuestions } from "@/lib/dex/search";

export function GET() {
  return NextResponse.json({ questions: getDexSuggestedQuestions() });
}
