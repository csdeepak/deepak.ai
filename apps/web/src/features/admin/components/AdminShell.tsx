"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTransition } from "react";
import { logoutAction } from "@/features/admin/actions/auth";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin/overview", label: "Overview" },
  { href: "/admin/projects", label: "Projects" },
  { href: "/admin/publications", label: "Publications" },
  { href: "/admin/posts", label: "Posts" },
  { href: "/admin/timeline", label: "Timeline" },
  { href: "/admin/skills", label: "Skills" },
] as const;

const SECONDARY = [
  { href: "/admin/media", label: "Media" },
  { href: "/admin/settings", label: "Settings" },
  { href: "/admin/ai-kb", label: "AI KB" },
] as const;

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();

  function handleLogout() {
    startTransition(() => {
      logoutAction();
    });
  }

  return (
    <div className="flex h-screen overflow-hidden bg-canvas">
      {/* Left rail */}
      <nav
        aria-label="Admin navigation"
        className="flex w-56 flex-shrink-0 flex-col border-r border-border bg-surface"
      >
        <div className="border-b border-border px-4 py-4">
          <span className="font-semibold text-ink">dL admin</span>
        </div>

        <div className="flex flex-col gap-0.5 p-2 pt-3">
          {NAV.map(({ href, label }) => (
            <NavItem key={href} href={href} label={label} current={pathname.startsWith(href)} />
          ))}
        </div>

        <div className="mt-auto flex flex-col gap-0.5 border-t border-border p-2">
          {SECONDARY.map(({ href, label }) => (
            <NavItem key={href} href={href} label={label} current={pathname.startsWith(href)} />
          ))}
          <button
            onClick={handleLogout}
            disabled={pending}
            className="mt-1 min-h-[44px] rounded px-3 py-2 text-left text-small text-muted hover:bg-recessed hover:text-ink disabled:opacity-50"
          >
            {pending ? "Signing out…" : "Sign out"}
          </button>
        </div>
      </nav>

      {/* Main work area */}
      <main className="flex flex-1 flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto">{children}</div>
      </main>
    </div>
  );
}

function NavItem({
  href,
  label,
  current,
}: {
  href: string;
  label: string;
  current: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "min-h-[44px] rounded px-3 py-2 text-small transition-colors duration-(--duration-fast)",
        current
          ? "bg-accent-weak font-medium text-ink"
          : "text-muted hover:bg-recessed hover:text-ink",
      )}
    >
      {label}
    </Link>
  );
}
