"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ActionState {
  error: string | null;
  fieldErrors?: Partial<Record<string, string>>;
}

export interface NewContentField {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
}

const initial: ActionState = { error: null };

/**
 * Minimal create form — just enough fields to make a draft, then straight
 * into the real editor. Shared by Publications and Skills; the per-type
 * create action decides what is actually required.
 */
export function NewContentForm({
  action,
  fields,
  submitLabel = "Create draft",
}: {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  fields: NewContentField[];
  submitLabel?: string;
}) {
  const [state, formAction, pending] = useActionState(action, initial);

  return (
    <form action={formAction} className="mt-8 max-w-lg space-y-5">
      {state.error && (
        <p role="alert" className="text-small text-danger">
          {state.error}
        </p>
      )}

      {fields.map((field) => (
        <div key={field.name}>
          <label
            htmlFor={field.name}
            className="block text-small font-medium text-ink"
          >
            {field.label}
            <span className="ml-1 text-faint">*</span>
          </label>
          <Input
            id={field.name}
            name={field.name}
            type={field.type ?? "text"}
            placeholder={field.placeholder}
            className="mt-2"
          />
          {state.fieldErrors?.[field.name] && (
            <p className="mt-1 text-micro text-danger">
              {state.fieldErrors[field.name]}
            </p>
          )}
        </div>
      ))}

      <Button type="submit" variant="primary" disabled={pending}>
        {pending ? "Creating…" : submitLabel}
      </Button>
    </form>
  );
}
