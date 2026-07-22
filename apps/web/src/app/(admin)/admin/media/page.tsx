import type { Metadata } from "next";
import { MediaUploadForm } from "@/features/admin/components/MediaUploadForm";
import { MediaLibrary } from "@/features/admin/components/MediaLibrary";
import { listMedia } from "@/features/admin/queries/media";
import { isStorageConfigured } from "@/lib/media/storage";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Media" };

export default async function MediaPage() {
  const configured = isStorageConfigured();
  const items = configured ? await listMedia() : [];

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <h1 className="text-h3 font-semibold text-ink">Media</h1>
      <p className="mt-1 text-small text-muted">
        Images and PDFs stored in Cloudflare R2 (D-049). Attach them to content
        from an editor’s Media section.
      </p>

      {!configured && (
        <div className="mt-6 rounded-lg border border-border bg-surface p-4 text-small text-muted">
          <strong className="text-ink">Media storage is not configured.</strong>{" "}
          Add R2 credentials to your environment (README → “Media / R2 setup”),
          then restart. Uploading is disabled until then — nothing is faked.
        </div>
      )}

      {configured && (
        <div className="mt-8 space-y-8">
          <MediaUploadForm />
          <MediaLibrary items={items} />
        </div>
      )}
    </div>
  );
}
