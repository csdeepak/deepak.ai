"use client";

import { useTransition, useState } from "react";
import { restoreVersion } from "@/features/admin/actions/projects";
import { Button } from "@/components/ui/button";

export interface VersionRow {
  id: string;
  versionNum: number;
  changedFields: string[];
  origin: string;
  createdAt: string;
}

interface Props {
  itemId: string;
  versions: VersionRow[];
  backHref: string;
}

export function VersionHistory({ itemId, versions, backHref }: Props) {
  const [pending, startTransition] = useTransition();
  const [restoringId, setRestoringId] = useState<string | null>(null);

  function handleRestore(versionId: string, vNum: number) {
    if (!confirm(`Restore to version ${vNum}? The current state will be saved as the next version and the item will revert to draft.`)) return;
    setRestoringId(versionId);
    startTransition(() => {
      restoreVersion(itemId, versionId);
    });
  }

  return (
    <div className="px-6 py-6">
      <div className="mb-4 flex items-center gap-3">
        <a href={backHref} className="text-small text-muted hover:text-ink">
          ← Back
        </a>
        <h1 className="text-h4 font-semibold text-ink">Version history</h1>
      </div>

      {versions.length === 0 ? (
        <p className="text-small text-muted">No versions saved yet.</p>
      ) : (
        <div className="flex flex-col divide-y divide-border">
          {versions.map((v) => (
            <div key={v.id} className="flex items-start justify-between gap-4 py-3">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-3">
                  <span className="text-small font-medium text-ink">v{v.versionNum}</span>
                  <span className="text-small text-muted">
                    {new Date(v.createdAt).toLocaleString()}
                  </span>
                  <OriginBadge origin={v.origin} />
                </div>
                {v.changedFields.length > 0 && (
                  <p className="text-micro text-faint">
                    Changed: {v.changedFields.join(", ")}
                  </p>
                )}
              </div>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => handleRestore(v.id, v.versionNum)}
                disabled={pending && restoringId === v.id}
              >
                {pending && restoringId === v.id ? "Restoring…" : "Restore"}
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function OriginBadge({ origin }: { origin: string }) {
  const labels: Record<string, string> = {
    manual_save: "Saved",
    publish: "Published",
    unpublish: "Un-published",
    schedule: "Scheduled",
    restore: "Restored",
    scheduled_publish: "Auto-published",
  };
  return (
    <span className="rounded bg-recessed px-1.5 py-0.5 text-micro text-muted">
      {labels[origin] ?? origin}
    </span>
  );
}
