import { NextResponse } from "next/server";
import { getDexSuggestedQuestions } from "@/lib/dex/search";

/**
 * The suggested-question list is read from static JSON in `content/dex/` and
 * is identical for every visitor, yet it was being recomputed and re-sent on
 * every single Dex open with no cache headers at all.
 *
 * `s-maxage` lets Vercel's edge serve it without invoking the function;
 * `stale-while-revalidate` means a content change never makes a visitor wait
 * on a cold response. The list changes when the owner edits a JSON file and
 * redeploys, so an hour of staleness is not a correctness concern.
 *
 * Deliberately NOT applied to /api/dex/answer — that one is per-question,
 * rate-limited, and logged, and must never be served from a shared cache.
 */
export function GET() {
  return NextResponse.json(
    { questions: getDexSuggestedQuestions() },
    {
      headers: {
        "Cache-Control":
          "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
      },
    },
  );
}
