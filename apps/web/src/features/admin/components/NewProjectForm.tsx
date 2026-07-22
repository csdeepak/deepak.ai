"use client";

import { useActionState } from "react";
import { createProject, type ProjectFormState } from "@/features/admin/actions/projects";
import { Button } from "@/components/ui/button";

const initial: ProjectFormState = { error: null };

export function NewProjectForm() {
  const [state, action, pending] = useActionState(createProject, initial);

  return (
    <form action={action} className="flex flex-col gap-4">
      {state.error && (
        <p role="alert" className="text-small text-danger">{state.error}</p>
      )}

      <label className="flex flex-col gap-1.5">
        <span className="text-small font-medium text-ink">
          Title <span className="text-danger">*</span>
        </span>
        <input
          name="title"
          required
          autoFocus
          className="h-9 rounded border border-border bg-surface px-3 text-small text-ink outline-none focus:border-accent focus:ring-1 focus:ring-accent"
          placeholder="ASMOS: Predictive Typing"
        />
        {state.fieldErrors?.title && (
          <span className="text-micro text-danger">{state.fieldErrors.title}</span>
        )}
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-small font-medium text-ink">
          Year <span className="text-danger">*</span>
        </span>
        <input
          name="year"
          type="number"
          required
          min={1990}
          max={2099}
          defaultValue={new Date().getFullYear()}
          className="h-9 w-28 rounded border border-border bg-surface px-3 text-small text-ink outline-none focus:border-accent focus:ring-1 focus:ring-accent"
        />
        {state.fieldErrors?.year && (
          <span className="text-micro text-danger">{state.fieldErrors.year}</span>
        )}
      </label>

      <Button type="submit" variant="primary" disabled={pending}>
        {pending ? "Creating…" : "Create project"}
      </Button>
    </form>
  );
}
