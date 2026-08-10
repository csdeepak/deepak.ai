"use server";

import { compare } from "bcryptjs";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { sessionOptions, type SessionData } from "@/lib/auth/session";
import { createRateLimiter, getClientIp } from "@/lib/rate-limit";

export interface LoginState {
  error: string | null;
}

const loginLimiter = createRateLimiter({ max: 5, windowMs: 15 * 60 * 1000 });

export async function loginAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const { headers } = await import("next/headers");
  const ip = getClientIp(await headers());

  if (loginLimiter.isRateLimited(ip)) {
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

  loginLimiter.reset(ip);

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
