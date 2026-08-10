"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "@/features/admin/actions/auth";
import { Button } from "@/components/ui/button";

const initial: LoginState = { error: null };

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, initial);

  return (
    <form action={action} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="password"
          className="text-small font-medium text-muted"
        >
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          autoFocus
          required
          className="h-10 w-full rounded-md border border-border bg-surface px-3 text-body text-ink outline-none focus:border-accent focus:ring-1 focus:ring-accent"
        />
      </div>

      {state.error && (
        <p role="alert" className="text-small text-danger">
          {state.error}
        </p>
      )}

      <Button type="submit" variant="primary" disabled={pending} className="w-full">
        {pending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
