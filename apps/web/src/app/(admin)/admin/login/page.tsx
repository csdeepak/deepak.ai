import type { Metadata } from "next";
import { LoginForm } from "@/features/admin/components/LoginForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sign in · Admin",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-4">
      <div className="w-full max-w-sm">
        <h1 className="mb-8 text-h3 font-semibold text-ink">
          dL admin
        </h1>
        <LoginForm />
      </div>
    </div>
  );
}
