"use server";

import { compare } from "bcryptjs";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { sessionOptions, type SessionData } from "@/lib/auth/session";

export interface LoginState {
  error: string | null;
}

// In-memory rate limiter. Known gap (documented in docs/27 §13):
// resets on deploy/restart; per-instance only. Future fix: Postgres table.
const attempts = new Map<string, { count: number; resetAt: number }>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;

function getClientIp(headers: Headers): string {
  return (
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headers.get("x-real-ip") ??
    "unknown"
  );
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const rec = attempts.get(ip);
  if (!rec || rec.resetAt <= now) {
    attempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  rec.count += 1;
  return rec.count > MAX_ATTEMPTS;
}

function clearAttempts(ip: string) {
  attempts.delete(ip);
}

export async function loginAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const { headers } = await import("next/headers");
  const ip = getClientIp(await headers());

  if (isRateLimited(ip)) {
    return { error: "Too many login attempts. Try again in 15 minutes." };
  }

  const submitted = formData.get("password");
  if (typeof submitted !== "string") {
    return { error: "Incorrect credentials." };
  }

  const hash = process.env.ADMIN_PASSWORD_HASH;
  // Always run bcrypt.compare — never short-circuit before it.
  // This ensures constant-time behaviour and reveals nothing about which
  // factor failed.
  const DUMMY = "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy";
  const ok = await compare(submitted, hash ?? DUMMY);
  if (!hash || !ok) {
    return { error: "Incorrect credentials." };
  }

  clearAttempts(ip);

  const session = await getIronSession<SessionData>(
    await cookies(),
    sessionOptions,
  );
  session.user = "owner";
  session.iat = Date.now();
  await session.save();

  redirect("/admin/overview");
}

export async function logoutAction(): Promise<void> {
  const session = await getIronSession<SessionData>(
    await cookies(),
    sessionOptions,
  );
  session.destroy();
  redirect("/admin/login");
}
