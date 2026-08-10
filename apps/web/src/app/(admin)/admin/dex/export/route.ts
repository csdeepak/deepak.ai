/**
 * CSV export for Dex analytics (D-054) — the "analytical sheet" of who visits.
 *
 * Sits under /admin, so the auth middleware gates it exactly like every other
 * admin route. Visitors and questions export separately and are never joined:
 * the question log holds no identity by design.
 */

import { NextResponse } from "next/server";
import { listVisitors, listAllQuestions } from "@/features/admin/queries/dex";

/** RFC 4180: wrap in quotes, double any embedded quote. */
function csvCell(value: string | number | Date): string {
  const raw = value instanceof Date ? value.toISOString() : String(value);
  return `"${raw.replace(/"/g, '""')}"`;
}

function csvResponse(filename: string, header: string[], rows: Array<Array<string | number | Date>>) {
  const body = [header, ...rows].map((row) => row.map(csvCell).join(",")).join("\r\n");

  return new NextResponse(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}

export async function GET(request: Request) {
  const type = new URL(request.url).searchParams.get("type");
  const stamp = new Date().toISOString().slice(0, 10);

  if (type === "visitors") {
    const rows = await listVisitors(10000);
    return csvResponse(
      `dex-visitors-${stamp}.csv`,
      ["When", "Name", "Role", "Company", "Contact", "Reason"],
      rows.map((r) => [r.createdAt, r.name, r.role, r.company, r.contact, r.reason]),
    );
  }

  if (type === "questions") {
    const rows = await listAllQuestions(10000);
    return csvResponse(
      `dex-questions-${stamp}.csv`,
      ["When", "Question", "Outcome", "Matched FAQ", "Visitor role"],
      rows.map((r) => [
        r.createdAt,
        r.question,
        r.answerKind,
        r.matchedQuestion,
        r.visitorRole,
      ]),
    );
  }

  return NextResponse.json(
    { error: "Pass ?type=visitors or ?type=questions" },
    { status: 400 },
  );
}
