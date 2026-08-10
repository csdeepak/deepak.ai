"use client";

import { useMemo } from "react";
import { FileText, X } from "lucide-react";
import type { MediaListItem } from "@/features/admin/queries/media";

export interface MediaSelection {
  cover: string | null; // media id
  gallery: string[]; // media ids
  attachments: string[]; // media ids (pdf)
}

/**
 * Attach media from the library to content (D-048 §Media). Cover = one image,
 * gallery = many images, attachments = many PDFs. Selections are media ids; the
 * parent serializes them for the Server Action. Uploading happens on the Media
 * page — this only attaches what already exists (honest: nothing to attach until
 * something is uploaded).
 */
export function MediaPicker({
  available,
  value,
  onChange,
}: {
  available: MediaListItem[];
  value: MediaSelection;
  onChange: (next: MediaSelection) => void;
}) {
  const images = useMemo(() => available.filter((m) => m.kind === "image"), [available]);
  const pdfs = useMemo(() => available.filter((m) => m.kind === "pdf"), [available]);
  const byId = useMemo(
    () => new Map(available.map((m) => [m.id, m] as const)),
    [available],
  );

  if (available.length === 0) {
    return (
      <p className="text-small text-faint">
        No media uploaded yet. Add images or PDFs on the{" "}
        <a href="/admin/media" className="text-accent hover:underline">
          Media
        </a>{" "}
        page, then attach them here.
      </p>
    );
  }

  const galleryUnused = images.filter((m) => !value.gallery.includes(m.id));
  const attachUnused = pdfs.filter((m) => !value.attachments.includes(m.id));

  return (
    <div className="flex flex-col gap-5">
      {/* Cover */}
      <div>
        <p className="mb-1.5 text-micro font-medium text-muted">Cover image</p>
        {value.cover && byId.get(value.cover) ? (
          <Thumb
            item={byId.get(value.cover)!}
            onRemove={() => onChange({ ...value, cover: null })}
          />
        ) : (
          <select
            value=""
            onChange={(e) =>
              e.target.value && onChange({ ...value, cover: e.target.value })
            }
            className={selectCls}
          >
            <option value="">Choose a cover image…</option>
            {images.map((m) => (
              <option key={m.id} value={m.id}>
                {m.caption || m.alt || m.id.slice(0, 8)}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Gallery */}
      <div>
        <p className="mb-1.5 text-micro font-medium text-muted">Gallery</p>
        <div className="flex flex-col gap-2">
          {value.gallery.map((id) => {
            const item = byId.get(id);
            if (!item) return null;
            return (
              <Thumb
                key={id}
                item={item}
                onRemove={() =>
                  onChange({ ...value, gallery: value.gallery.filter((g) => g !== id) })
                }
              />
            );
          })}
          {galleryUnused.length > 0 && (
            <select
              value=""
              onChange={(e) =>
                e.target.value &&
                onChange({ ...value, gallery: [...value.gallery, e.target.value] })
              }
              className={selectCls}
            >
              <option value="">Add an image…</option>
              {galleryUnused.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.caption || m.alt || m.id.slice(0, 8)}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Attachments (PDF) */}
      <div>
        <p className="mb-1.5 text-micro font-medium text-muted">Attachments (PDF)</p>
        <div className="flex flex-col gap-2">
          {value.attachments.map((id) => {
            const item = byId.get(id);
            if (!item) return null;
            return (
              <Thumb
                key={id}
                item={item}
                onRemove={() =>
                  onChange({
                    ...value,
                    attachments: value.attachments.filter((a) => a !== id),
                  })
                }
              />
            );
          })}
          {attachUnused.length > 0 && (
            <select
              value=""
              onChange={(e) =>
                e.target.value &&
                onChange({ ...value, attachments: [...value.attachments, e.target.value] })
              }
              className={selectCls}
            >
              <option value="">Add a PDF…</option>
              {attachUnused.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.caption || m.id.slice(0, 8)}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>
    </div>
  );
}

function Thumb({ item, onRemove }: { item: MediaListItem; onRemove: () => void }) {
  return (
    <div className="flex items-center gap-3 rounded border border-border bg-surface p-2">
      <div className="grid size-10 shrink-0 place-items-center overflow-hidden rounded bg-canvas">
        {item.kind === "image" ? (
          // eslint-disable-next-line @next/next/no-img-element -- admin thumbnail
          <img src={item.url} alt={item.alt} className="h-full w-full object-cover" />
        ) : (
          <FileText className="size-5 text-faint" aria-hidden />
        )}
      </div>
      <span className="flex-1 truncate text-small text-ink">
        {item.caption || item.alt || (item.kind === "pdf" ? "PDF" : "Image")}
      </span>
      <button
        type="button"
        onClick={onRemove}
        aria-label="Remove"
        className="grid size-8 place-items-center rounded text-faint hover:text-danger"
      >
        <X className="size-4" aria-hidden />
      </button>
    </div>
  );
}

const selectCls =
  "h-9 w-full rounded border border-border bg-surface px-2.5 text-small text-ink outline-none focus:border-accent focus:ring-1 focus:ring-accent";
