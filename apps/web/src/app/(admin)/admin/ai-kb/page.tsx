import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

/**
 * Legacy route. `/admin/ai-kb` was the designed-but-empty placeholder for the
 * Dex sprint (docs/27 §12). Dex shipped in a different shape than that design
 * assumed — file-backed cached recall, no embeddings sync — and its real admin
 * surface is /admin/dex (D-054). Kept as a redirect so the documented path and
 * any bookmarks still land somewhere true.
 */
export default function AIKBPage() {
  redirect("/admin/dex");
}
