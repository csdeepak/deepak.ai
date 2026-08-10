import type { SessionOptions } from "iron-session";

export interface SessionData {
  user?: "owner";
  iat?: number;
}

export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET ?? "dev-secret-min-32-chars-change-me!",
  cookieName: "__session",
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 8, // 8 hours
  },
};
