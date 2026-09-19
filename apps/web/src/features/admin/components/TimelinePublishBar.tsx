"use client";

import { useActionState, useTransition } from "react";
import type { ContentStatus } from "@/types/content";
import { Button } from "@/components/ui/button";
import {
  publishTimelineEntry,
  unpublishTimelineEntry,
  archiveTimelineEntry,
  type TimelineFormState,
} from "@/features/admin/actions/timeline";

interface TimelinePublishBarProps {
  id: string;
  status: ContentStatus;
  question: string;
}

const initial: TimelineFormState = { error: null };

/** Mirrors PostPublishBar — same lifecycle, same wording, different action set. */
export function TimelinePublishBar({
  id,
  status,
  question,
}: TimelinePublishBarProps) {
  const [publishState, publishAction, publishPending] = useActionState(
    publishTimelineEntry,
    initial,
  );
  const [, startTransition] = useTransition();

  function handleUnpublish() {
    startTransition(() => {
      unpublishTimelineEntry(id);
    });
  }

  function handleArchive() {
    if (
      !confirm(
        "Delete this entry? It will be hidden from the public site and can be restored later.",
      )
    ) {
      return;
    }
    startTransition(() => {
      archiveTimelineEntry(id);
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
        {status !== "published" && (
          <form action={publishAction}>
            <input type="hidden" name="id" value={id} />
            <input type="hidden" name="question" value={question} />
            <Button type="submit" variant="primary" disabled={publishPending}>
              {publishPending ? "Publishing…" : "Publish"}
            </Button>
          </form>
        )}

        {status === "published" && (
          <Button type="button" variant="secondary" onClick={handleUnpublish}>
            Unpublish
          </Button>
        )}

        <Button type="button" variant="ghost" onClick={handleArchive}>
          Delete
        </Button>

        <span className="ml-auto font-mono text-micro uppercase tracking-[0.14em] text-faint">
          {status}
        </span>
      </div>
    </div>
  );
}
