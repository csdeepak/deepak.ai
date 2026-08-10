import { NextResponse, type NextRequest } from "next/server";
import { getIronSession } from "iron-session";
import { sessionOptions, type SessionData } from "@/lib/auth/session";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith("/admin")) return NextResponse.next();

  // Forward current path to layouts so they can conditionally render chrome.
  const response = NextResponse.next();
  response.headers.set("x-pathname", pathname);

  // Login page is open — no session required.
  if (pathname === "/admin/login") return response;

  const session = await getIronSession<SessionData>(
    request,
    response,
    sessionOptions,
  );

  if (!session.user) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
