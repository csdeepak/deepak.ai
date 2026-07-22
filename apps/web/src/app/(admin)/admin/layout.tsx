import type { Metadata } from "next";
import { headers } from "next/headers";
import { AdminShell } from "@/features/admin/components/AdminShell";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { default: "Admin · Deepak Labs", template: "%s · Admin" },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // The middleware handles auth gates. The layout only adds the shell chrome
  // for non-login pages. The x-pathname header is set by the middleware so
  // layouts can branch without triggering auth redirect loops.
  const pathname = (await headers()).get("x-pathname") ?? "";
  const isLoginPage = pathname === "/admin/login";

  if (isLoginPage) {
    return <>{children}</>;
  }

  return <AdminShell>{children}</AdminShell>;
}
