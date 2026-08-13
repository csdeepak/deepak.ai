"use client";

import { useActionState, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  addToGallery,
  saveGalleryItem,
  removeFromGallery,
  moveGalleryItem,
  type GalleryFormState,
} from "@/features/admin/actions/gallery";
import type { MediaListItem } from "@/features/admin/queries/media";

export interface GalleryItemRow {
  id: string;
  slug: string;
  url: string;
  altText: string;
  caption: string;
  info: string;
  place: string;
  date: string;
  time: string;
  size: number;
  tilt: number;
  depth: number;
  sortOrder: number;
  featured: boolean;
  published: boolean;
  orientation: string;
  width: number;
  height: number;
}

export function GalleryManager({
  items,
  availableMedia,
}: {
  items: GalleryItemRow[];
  availableMedia: MediaListItem[];
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function run(fn: () => Promise<GalleryFormState>) {
    setError(null);
    startTransition(async () => {
      const res = await fn();
      if (res?.error) setError(res.error);
    });
  }

  return (
    <div className="px-6 py-6">
      <div className="mb-6">
        <h1 className="text-h3 font-semibold text-ink">Gallery</h1>
        <p className="mt-1 max-w-[68ch] text-small text-muted">
          Pick images from the media library to show in the gallery. Nothing appears
          on the public site until you tick <strong className="text-ink">Published</strong>;
          the landing-page cluster shows only the ones ticked{" "}
          <strong className="text-ink">Featured</strong>.
        </p>
      </div>

      {error && (
        <p role="alert" className="mb-4 rounded border border-danger/40 bg-danger/10 px-3 py-2 text-small text-danger">
          {error}
        </p>
      )}

      {/* ── Add from media ── */}
      <section className="mb-10">
        <h2 className="mb-3 border-b border-border pb-1.5 font-mono text-micro uppercase tracking-[0.18em] text-faint">
          Add from media
        </h2>
        {availableMedia.length === 0 ? (
          <p className="text-small text-muted">
            Every image in the media library is already in the gallery. Upload more in{" "}
            <a href="/admin/media" className="text-accent hover:underline">
              Media
            </a>
            .
          </p>
        ) : (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
            {availableMedia.map((m) => (
              <li key={m.id}>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => run(() => addToGallery(m.id))}
                  className="group w-full overflow-hidden rounded border border-border bg-surface text-left transition-colors hover:border-accent disabled:opacity-50"
                >
                  <span className="block aspect-4/3 overflow-hidden bg-canvas">
                    {/* Plain <img>: admin thumbnails, matching MediaLibrary. */}
                    <img src={m.url} alt={m.alt} className="h-full w-full object-cover" />
                  </span>
                  <span className="block px-2 py-1.5 text-micro text-muted group-hover:text-ink">
                    {m.alt || "(no alt text)"}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* ── Current gallery ── */}
      <section>
        <h2 className="mb-3 border-b border-border pb-1.5 font-mono text-micro uppercase tracking-[0.18em] text-faint">
          In the gallery ({items.length})
        </h2>
        {items.length === 0 ? (
          <p className="text-small text-muted">
            Nothing in the gallery yet. Add an image above — the public gallery stays
            hidden until at least one item is published.
          </p>
        ) : (
          <ul className="space-y-4">
            {items.map((item, i) => (
              <GalleryRow
                key={item.id}
                item={item}
                isFirst={i === 0}
                isLast={i === items.length - 1}
                pending={pending}
                onMove={(dir) => run(() => moveGalleryItem(item.id, dir))}
                onRemove={() => {
                  if (
                    !confirm(
                      `Remove "${item.altText || item.slug}" from the gallery? The image stays in your media library.`,
                    )
                  )
                    return;
                  run(() => removeFromGallery(item.id));
                }}
              />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

const initial: GalleryFormState = { error: null };

function GalleryRow({
  item,
  isFirst,
  isLast,
  pending,
  onMove,
  onRemove,
}: {
  item: GalleryItemRow;
  isFirst: boolean;
  isLast: boolean;
  pending: boolean;
  onMove: (dir: "up" | "down") => void;
  onRemove: () => void;
}) {
  const [state, action, saving] = useActionState(saveGalleryItem, initial);
  const [featured, setFeatured] = useState(item.featured);
  const [published, setPublished] = useState(item.published);

  return (
    <li className="rounded border border-border bg-surface">
      <form action={action} className="flex flex-col gap-4 p-4 md:flex-row">
        <input type="hidden" name="id" value={item.id} />
        <input type="hidden" name="featured" value={String(featured)} />
        <input type="hidden" name="published" value={String(published)} />

        <div className="flex shrink-0 flex-col gap-2 md:w-44">
          <span className="block overflow-hidden rounded border border-border bg-canvas">
            <img src={item.url} alt={item.altText} className="h-32 w-full object-cover" />
          </span>
          <span className="font-mono text-micro text-faint">
            {item.width}×{item.height} · {item.orientation}
          </span>
          <div className="flex gap-1">
            <Button
              type="button"
              variant="secondary"
              disabled={pending || isFirst}
              onClick={() => onMove("up")}
              className="h-7 flex-1 px-0 text-micro"
            >
              ↑
            </Button>
            <Button
              type="button"
              variant="secondary"
              disabled={pending || isLast}
              onClick={() => onMove("down")}
              className="h-7 flex-1 px-0 text-micro"
            >
              ↓
            </Button>
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Alt text" required hint="Describes the photo for screen readers">
              <input name="altText" defaultValue={item.altText} className={inputCls} />
            </Field>
            <Field label="Caption">
              <input name="caption" defaultValue={item.caption} className={inputCls} />
            </Field>
            <Field label="Info">
              <input name="info" defaultValue={item.info} className={inputCls} />
            </Field>
            <Field label="Place" hint="City granularity">
              <input name="place" defaultValue={item.place} className={inputCls} />
            </Field>
            <Field label="Date">
              <input name="date" defaultValue={item.date} className={inputCls} />
            </Field>
            <Field label="Time">
              <input name="time" defaultValue={item.time} className={inputCls} />
            </Field>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Field label="Size" hint="~0.7–1.4">
              <input name="size" type="number" step="0.05" defaultValue={item.size} className={inputCls} />
            </Field>
            <Field label="Tilt" hint="deg">
              <input name="tilt" type="number" step="0.5" defaultValue={item.tilt} className={inputCls} />
            </Field>
            <Field label="Depth" hint="0–1">
              <input name="depth" type="number" step="0.05" defaultValue={item.depth} className={inputCls} />
            </Field>
            <Field label="Order">
              <input name="sortOrder" type="number" defaultValue={item.sortOrder} className={inputCls} />
            </Field>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-4">
            <Check label="Published" checked={published} onChange={setPublished} />
            <Check label="Featured" checked={featured} onChange={setFeatured} />
            <span className="ml-auto flex items-center gap-2">
              {state.error && (
                <span role="alert" className="text-small text-danger">
                  {state.error}
                </span>
              )}
              <Button type="submit" variant="secondary" disabled={saving}>
                {saving ? "Saving…" : "Save"}
              </Button>
              <Button
                type="button"
                variant="secondary"
                disabled={pending}
                onClick={onRemove}
                className="text-warning"
              >
                Remove
              </Button>
            </span>
          </div>
        </div>
      </form>
    </li>
  );
}

const inputCls =
  "h-9 w-full rounded border border-border bg-canvas px-2.5 text-small text-ink outline-none focus:border-accent focus:ring-1 focus:ring-accent";

function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-1 flex items-baseline gap-1.5">
        <span className="text-micro font-medium text-muted">
          {label}
          {required && <span className="ml-0.5 text-danger">*</span>}
        </span>
        {hint && <span className="text-micro text-faint">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

function Check({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-small text-ink">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="size-4 accent-[var(--grad-1)]"
      />
      {label}
    </label>
  );
}
