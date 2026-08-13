"use client";

import { useActionState } from "react";
import { createPost, type PostFormState } from "@/features/admin/actions/posts";
import { Button } from "@/components/ui/button";

const initial: PostFormState = { error: null };

export function NewPostForm() {
  const [state, action, pending] = useActionState(createPost, initial);

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
          placeholder="What building ASMOS taught me about agentic AI"
        />
        {state.fieldErrors?.title && (
          <span className="text-micro text-danger">{state.fieldErrors.title}</span>
        )}
      </label>

      <Button type="submit" variant="primary" disabled={pending}>
        {pending ? "Creating…" : "Create post"}
      </Button>
    </form>
  );
}
