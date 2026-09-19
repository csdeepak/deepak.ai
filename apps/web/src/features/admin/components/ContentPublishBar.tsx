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
  /** e.g. "post", "paper", "skill" — used in the delete confirmation. */
  noun: string;
}

const initial: ActionState = { error: null };

/**
 * The publish bar for every content type.
 *
 * Posts, Projects and Timeline each grew their own copy. By the fifth type
 * that is five places to fix one bug, so this is the single implementation —
 * parameterised by action set, because the *lifecycle* is what is genuinely
 * common across types, not the data.
 *
 * ## The three states are deliberate, and archived is the one that matters
 *
 * An earlier draft of this component only knew draft and published: it offered
 * Publish whenever the status was not `published`, which meant an archived item
 * jumped straight back to live, skipping draft entirely, and never offered the
 * Restore that `PostPublishBar` had always had. That is a behaviour change
 * wearing the clothes of a refactor — the kind that is invisible in review
 * because both versions "have a publish button".
 *
 * So the states mirror the Posts original exactly:
 *   draft     → Publish · Delete
 *   published → Un-publish · Delete
 *   archived  → Restore (back to draft, never straight to live)
 *
 * Delete is hidden when archived, because it already is.
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

  function handleUnpublish() {
    startTransition(() => {
      unpublish(id);
    });
  }

  function handleArchive() {
    if (
      !confirm(
        `Delete this ${noun}? It will be hidden from the public site and can be restored later.`,
      )
    ) {
      return;
    }
    startTransition(() => {
      archive(id);
    });
  }

  return (
    <div className="sticky bottom-0 border-t border-border bg-surface px-6 py-3">
      {publishState.error && (
        <p role="alert" className="mb-2 text-small text-danger">
          {publishState.error}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-2">
        {status === "draft" && (
          <>
            <form action={action}>
              <input type="hidden" name="id" value={id} />
              <input type="hidden" name="question" value={question} />
              <Button type="submit" variant="primary" disabled={pending}>
                {pending ? "Publishing…" : "Publish"}
              </Button>
            </form>
            <DeleteButton onClick={handleArchive} />
          </>
        )}

        {status === "published" && (
          <>
            <Button type="button" variant="secondary" onClick={handleUnpublish}>
              Un-publish
            </Button>
            <DeleteButton onClick={handleArchive} />
          </>
        )}

        {/* Restore returns it to draft, not to live — the same unpublish action
            Posts has always used for this. Re-publishing is then a deliberate
            second step. */}
        {status === "archived" && (
          <Button type="button" variant="secondary" onClick={handleUnpublish}>
            Restore
          </Button>
        )}

        <span className="ml-auto font-mono text-micro uppercase tracking-[0.14em] text-faint">
          {status}
        </span>
      </div>
    </div>
  );
}

function DeleteButton({ onClick }: { onClick: () => void }) {
  return (
    <Button
      type="button"
      variant="secondary"
      onClick={onClick}
      className="text-warning"
    >
      Delete
    </Button>
  );
}
