import { NextResponse } from "next/server";
import { parseDexIntakePayload, saveDexVisitorIntake } from "@/lib/dex/intake";
import { createRateLimiter, getClientIp } from "@/lib/rate-limit";

// Separate instance from the Dex answer limiter (@/app/api/dex/answer/route)
// — a visitor submitting this one-time form shouldn't be throttled by how
// many chat questions they've asked, and vice versa.
const intakeLimiter = createRateLimiter({ max: 20, windowMs: 5 * 60 * 1000 });

export async function POST(request: Request) {
  const ip = getClientIp(request.headers);
  if (intakeLimiter.isRateLimited(ip)) {
    return NextResponse.json({ ok: false }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const payload = parseDexIntakePayload(body);
  if (!payload) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  try {
    await saveDexVisitorIntake(payload);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Dex visitor intake save failed:", error);
    return NextResponse.json({ ok: false }, { status: 503 });
  }
}
