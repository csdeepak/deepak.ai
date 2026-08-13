"use client";

import { useActionState, useTransition } from "react";
import type { ContentStatus } from "@/types/content";
import { Button } from "@/components/ui/button";
import {
  publishPost,
  unpublishPost,
  archivePost,
  type PostFormState,
} from "@/features/admin/actions/posts";

interface PostPublishBarProps {
  id: string;
  status: ContentStatus;
  question: string;
}

const initial: PostFormState = { error: null };

export function PostPublishBar({ id, status, question }: PostPublishBarProps) {
  const [publishState, publishAction, publishPending] = useActionState(
    publishPost,
    initial,
  );
  const [, startTransition] = useTransition();

  function handleUnpublish() {
    startTransition(() => {
      unpublishPost(id);
    });
  }

  function handleArchive() {
    if (!confirm("Delete this post? It will be hidden from the public site and can be restored later.")) return;
    startTransition(() => {
      archivePost(id);
    });
  }

  return (
    <div className="sticky bottom-0 border-t border-border bg-surface px-6 py-3">
      {publishState.error && (
        <p role="alert" className="mb-2 text-small text-danger">
          {publishState.error}
        </p>
      )}

      <div className="flex items-center gap-2">
        {status === "draft" && (
          <>
            <form action={publishAction}>
              <input type="hidden" name="id" value={id} />
              <input type="hidden" name="question" value={question} />
              <Button type="submit" variant="primary" disabled={publishPending}>
                {publishPending ? "Publishing…" : "Publish"}
              </Button>
            </form>
            <Button variant="secondary" onClick={handleArchive} type="button" className="text-warning">
              Delete
            </Button>
          </>
        )}

        {status === "published" && (
          <>
            <Button variant="secondary" onClick={handleUnpublish} type="button">
              Un-publish
            </Button>
            <Button variant="secondary" onClick={handleArchive} type="button" className="text-warning">
              Delete
            </Button>
          </>
        )}

        {status === "archived" && (
          <Button variant="secondary" onClick={handleUnpublish} type="button">
            Restore
          </Button>
        )}
      </div>
    </div>
  );
}
