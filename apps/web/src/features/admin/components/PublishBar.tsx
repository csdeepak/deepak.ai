"use client";

import { useActionState, useTransition } from "react";
import type { ContentStatus } from "@/types/content";
import { Button } from "@/components/ui/button";
import {
  publishProject,
  scheduleProject,
  unpublishProject,
  cancelSchedule,
  archiveProject,
  type ProjectFormState,
} from "@/features/admin/actions/projects";
import { cn } from "@/lib/utils";

interface PublishBarProps {
  id: string;
  status: ContentStatus;
  question: string;
  scheduledFor?: string | null;
  slug: string;
}

const initial: ProjectFormState = { error: null };

export function PublishBar({
  id,
  status,
  question,
  scheduledFor,
  slug,
}: PublishBarProps) {
  const [publishState, publishAction, publishPending] = useActionState(
    publishProject,
    initial,
  );
  const [scheduleState, scheduleAction, schedulePending] = useActionState(
    scheduleProject,
    initial,
  );
  const [, startTransition] = useTransition();

  const error = publishState.error ?? scheduleState.error;

  function handleUnpublish() {
    startTransition(() => {
      unpublishProject(id);
    });
  }

  function handleCancelSchedule() {
    startTransition(() => {
      cancelSchedule(id);
    });
  }

  function handleArchive() {
    if (!confirm("Archive this project? It will be hidden from the public site.")) return;
    startTransition(() => {
      archiveProject(id);
    });
  }

  return (
    <div className="sticky bottom-0 border-t border-border bg-surface px-6 py-3">
      {error && (
        <p role="alert" className="mb-2 text-small text-danger">
          {error}
        </p>
      )}

      <div className="flex items-center gap-2">
        {/* Always: open public page in new tab */}
        <a
          href={`/projects/${slug}`}
          target="_blank"
          rel="noopener"
          className="inline-flex h-10 items-center gap-1 rounded-md border border-border px-4 text-small text-muted hover:border-border-emphasis hover:text-ink"
        >
          Preview ↗
        </a>

        {/* Status-dependent controls */}
        {status === "draft" && (
          <>
            <form action={scheduleAction}>
              <input type="hidden" name="id" value={id} />
              <input type="hidden" name="question" value={question} />
              <SchedulePicker disabled={schedulePending} />
            </form>
            <form action={publishAction}>
              <PublishHiddenFields id={id} question={question} />
              <Button type="submit" variant="primary" disabled={publishPending}>
                {publishPending ? "Publishing…" : "Publish"}
              </Button>
            </form>
          </>
        )}

        {status === "scheduled" && (
          <>
            <span className="text-small text-muted">
              Scheduled: {scheduledFor ? new Date(scheduledFor).toLocaleString() : "—"}
            </span>
            <Button variant="secondary" onClick={handleCancelSchedule} type="button">
              Cancel schedule
            </Button>
            <form action={publishAction}>
              <PublishHiddenFields id={id} question={question} />
              <Button type="submit" variant="primary" disabled={publishPending}>
                Publish now
              </Button>
            </form>
          </>
        )}

        {status === "published" && (
          <>
            <Button variant="secondary" onClick={handleUnpublish} type="button">
              Un-publish
            </Button>
            <Button
              variant="secondary"
              onClick={handleArchive}
              type="button"
              className="text-warning"
            >
              Archive
            </Button>
          </>
        )}

        {status === "archived" && (
          <Button variant="secondary" onClick={handleUnpublish} type="button">
            Un-archive
          </Button>
        )}
      </div>
    </div>
  );
}

function SchedulePicker({ disabled }: { disabled: boolean }) {
  return (
    <div className="flex items-center gap-1">
      <input
        type="datetime-local"
        name="scheduledFor"
        className="h-10 rounded-md border border-border bg-surface px-2 text-small text-ink"
        min={new Date().toISOString().slice(0, 16)}
      />
      <Button type="submit" variant="secondary" disabled={disabled}>
        Schedule
      </Button>
    </div>
  );
}

function PublishHiddenFields({
  id,
  question,
}: {
  id: string;
  question: string;
}) {
  return (
    <>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="question" value={question} />
    </>
  );
}

export function StatusBadge({ status }: { status: ContentStatus }) {
  const styles: Record<ContentStatus, string> = {
    draft: "bg-recessed text-muted",
    scheduled: "bg-accent-weak text-ink",
    published: "bg-[color-mix(in_srgb,var(--color-success)_15%,transparent)] text-success",
    archived: "bg-recessed text-faint",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded px-2 py-0.5 text-micro font-medium uppercase tracking-wide",
        styles[status],
      )}
    >
      {status}
    </span>
  );
}
