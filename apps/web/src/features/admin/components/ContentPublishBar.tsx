"use client";

import { useActionState, useTransition } from "react";
import type { ContentStatus } from "@/types/content";
import { Button } from "@/components/ui/button";

interface ActionState {
  error: string | null;
}

interface ContentPublishBarProps {
  id: string;
  status: ContentStatus;
  /** Live value from the editor — LAW-003 gates publishing on it. */
  question: string;
  publishAction: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  unpublish: (id: string) => Promise<void>;
  archive: (id: string) => Promise<void>;
  /** e.g. "paper", "skill" — used in the delete confirmation. */
  noun: string;
}

const initial: ActionState = { error: null };

/**
 * The publish bar, parameterised by action set.
 *
 * Posts and Timeline each ship their own copy of this (PostPublishBar,
 * TimelinePublishBar). By the third and fourth content type that stops being
 * reasonable duplication and starts being four places to fix the same bug, so
 * Publications and Skills share this one. The *actions* stay per-type — the
 * lifecycle is what is genuinely common, not the data.
 *
 * The existing two are deliberately left alone: rewriting working, shipped
 * editors to adopt this is a separate change with its own risk, and bundling
 * it here would mean a refactor riding along inside a feature PR.
 */
export function ContentPublishBar({
  id,
  status,
  question,
  publishAction,
  unpublish,
  archive,
  noun,
}: ContentPublishBarProps) {
  const [publishState, action, pending] = useActionState(publishAction, initial);
  const [, startTransition] = useTransition();

  return (
    <div className="sticky bottom-0 border-t border-border bg-surface px-6 py-3">
      {publishState.error && (
        <p role="alert" className="mb-2 text-small text-danger">
          {publishState.error}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-2">
        {status !== "published" && (
          <form action={action}>
            <input type="hidden" name="id" value={id} />
            <input type="hidden" name="question" value={question} />
            <Button type="submit" variant="primary" disabled={pending}>
              {pending ? "Publishing…" : "Publish"}
            </Button>
          </form>
        )}

        {status === "published" && (
          <Button
            type="button"
            variant="secondary"
            onClick={() => startTransition(() => { unpublish(id); })}
          >
            Unpublish
          </Button>
        )}

        <Button
          type="button"
          variant="ghost"
          onClick={() => {
            if (
              !confirm(
                `Delete this ${noun}? It will be hidden from the public site and can be restored later.`,
              )
            ) {
              return;
            }
            startTransition(() => { archive(id); });
          }}
        >
          Delete
        </Button>

        <span className="ml-auto font-mono text-micro uppercase tracking-[0.14em] text-faint">
          {status}
        </span>
      </div>
    </div>
  );
}
