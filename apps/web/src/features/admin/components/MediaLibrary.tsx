"use client";

import { useState, useTransition } from "react";
import { FileText } from "lucide-react";
import { deleteMedia } from "@/features/admin/actions/media";
import type { MediaListItem } from "@/features/admin/queries/media";

/**
 * The media library grid. Delete is reference-checked: an asset still used by
 * content cannot be deleted, and the reason is shown honestly (not hidden).
 */
export function MediaLibrary({ items }: { items: MediaListItem[] }) {
  if (items.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border p-8 text-center text-small text-muted">
        No media yet. Upload an image or PDF above.
      </p>
    );
  }

  return (
    <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {items.map((item) => (
        <MediaCard key={item.id} item={item} />
      ))}
    </ul>
  );
}

function MediaCard({ item }: { item: MediaListItem }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [deleted, setDeleted] = useState(false);

  if (deleted) return null;

  function onDelete() {
    setError(null);
    startTransition(async () => {
      const res = await deleteMedia(item.id);
      if (res.error) setError(res.error);
      else setDeleted(true);
    });
  }

  return (
    <li className="flex flex-col overflow-hidden rounded-lg border border-border bg-surface">
      <div className="flex aspect-video items-center justify-center bg-canvas">
        {item.kind === "image" ? (
          // eslint-disable-next-line @next/next/no-img-element -- admin thumbnail, not a public render path
          <img src={item.url} alt={item.alt} className="h-full w-full object-cover" />
        ) : (
          <FileText className="size-8 text-faint" aria-hidden />
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3">
        <span className="truncate text-micro font-medium text-ink">
          {item.caption || (item.kind === "pdf" ? "PDF document" : item.alt) || "Untitled"}
        </span>
        <span className="text-micro text-faint">
          {item.kind.toUpperCase()} · {kb(item.byteSize)}
          {item.width && item.height ? ` · ${item.width}×${item.height}` : ""}
        </span>
        <span className="text-micro text-faint">
          {item.refCount > 0
            ? `Used by ${item.refCount} item${item.refCount === 1 ? "" : "s"}`
            : "Unused"}
        </span>
        {error && (
          <p role="alert" className="text-micro text-danger">
            {error}
          </p>
        )}
        <button
          type="button"
          onClick={onDelete}
          disabled={pending}
          className="mt-1 self-start text-micro text-danger underline-offset-2 hover:underline disabled:opacity-50"
        >
          {pending ? "Deleting…" : "Delete"}
        </button>
      </div>
    </li>
  );
}

function kb(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
