import { NextResponse } from "next/server";
import { parseDexIntakePayload, saveDexVisitorIntake } from "@/lib/dex/intake";

export async function POST(request: Request) {
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
