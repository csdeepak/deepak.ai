"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  createTimelineEntry,
  type TimelineFormState,
} from "@/features/admin/actions/timeline";

const initial: TimelineFormState = { error: null };

export function NewTimelineForm() {
  const [state, action, pending] = useActionState(createTimelineEntry, initial);

  return (
    <form action={action} className="mt-8 max-w-lg space-y-5">
      {state.error && (
        <p role="alert" className="text-small text-danger">
          {state.error}
        </p>
      )}

      {(
        [
          ["role", "Role", "text", "Agentic AI Researcher"],
          ["organization", "Organization", "text", "CCBD / CDSAML"],
          ["startDate", "Start date", "date", ""],
        ] as const
      ).map(([name, label, type, placeholder]) => (
        <div key={name}>
          <label htmlFor={name} className="block text-small font-medium text-ink">
            {label}
            <span className="ml-1 text-faint">*</span>
          </label>
          <Input
            id={name}
            name={name}
            type={type}
            placeholder={placeholder || undefined}
            className="mt-2"
          />
          {state.fieldErrors?.[name] && (
            <p className="mt-1 text-micro text-danger">
              {state.fieldErrors[name]}
            </p>
          )}
        </div>
      ))}

      <Button type="submit" variant="primary" disabled={pending}>
        {pending ? "Creating…" : "Create draft"}
      </Button>
    </form>
  );
}
