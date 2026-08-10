"use client";

import { useActionState, useState, useRef, useEffect } from "react";
import { uploadMedia, type MediaUploadState } from "@/features/admin/actions/media";
import { Button } from "@/components/ui/button";

const initial: MediaUploadState = { error: null };

/**
 * Auth-gated media upload (D-049). Alt text is required for images — the
 * control only appears/enforces once an image is chosen. PDFs need no alt.
 */
export function MediaUploadForm() {
  const [state, action, pending] = useActionState(uploadMedia, initial);
  const [isImage, setIsImage] = useState<boolean | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // Reset the form after a successful upload so the next one is clean.
  useEffect(() => {
    if (state.uploaded) {
      formRef.current?.reset();
      setIsImage(null);
    }
  }, [state.uploaded]);

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    setIsImage(f ? f.type.startsWith("image/") : null);
  }

  return (
    <form
      ref={formRef}
      action={action}
      className="rounded-lg border border-border bg-surface p-5"
    >
      <h2 className="text-small font-medium text-ink">Upload media</h2>
      <p className="mt-1 text-micro text-faint">
        JPEG / PNG / WebP up to 8 MB, or PDF up to 20 MB. EXIF is stripped from
        images.
      </p>

      <div className="mt-4 flex flex-col gap-3">
        <input
          type="file"
          name="file"
          accept="image/jpeg,image/png,image/webp,application/pdf"
          onChange={onFileChange}
          required
          className="text-small text-muted file:mr-3 file:rounded file:border file:border-border file:bg-canvas file:px-3 file:py-1.5 file:text-small file:text-ink"
        />

        {isImage !== false && (
          <label className="flex flex-col gap-1">
            <span className="text-micro font-medium text-muted">
              Alt text{" "}
              <span className="text-faint">(required for images)</span>
            </span>
            <input
              name="altText"
              className={inputCls}
              placeholder="Describe the image for screen readers"
            />
          </label>
        )}

        <label className="flex flex-col gap-1">
          <span className="text-micro font-medium text-muted">
            Caption <span className="text-faint">(optional)</span>
          </span>
          <input name="caption" className={inputCls} placeholder="Shown beneath the media" />
        </label>

        {state.error && (
          <p role="alert" className="text-small text-danger">
            {state.error}
          </p>
        )}
        {state.uploaded && (
          <p className="text-small text-[var(--color-success,theme(colors.green.600))]">
            Uploaded. It’s in the library below.
          </p>
        )}

        <Button type="submit" variant="secondary" disabled={pending} className="self-start">
          {pending ? "Uploading…" : "Upload"}
        </Button>
      </div>
    </form>
  );
}

const inputCls =
  "h-9 w-full rounded border border-border bg-canvas px-2.5 text-small text-ink outline-none focus:border-accent focus:ring-1 focus:ring-accent";
