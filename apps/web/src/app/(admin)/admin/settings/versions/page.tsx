import type { Metadata } from "next";
import { desc } from "drizzle-orm";
import { getDb } from "@/db/index";
import { siteSettingsVersions } from "@/db/schema";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Settings versions" };

export default async function SettingsVersionsPage() {
  const db = getDb();
  const versions = await db
    .select()
    .from(siteSettingsVersions)
    .orderBy(desc(siteSettingsVersions.createdAt))
    .limit(100);

  return (
    <div className="px-6 py-6">
      <div className="mb-4 flex items-center gap-3">
        <a href="/admin/settings" className="text-small text-muted hover:text-ink">
          ← Back to Settings
        </a>
        <h1 className="text-h4 font-semibold text-ink">Settings version history</h1>
      </div>

      {versions.length === 0 ? (
        <p className="text-small text-muted">No settings versions saved yet.</p>
      ) : (
        <div className="flex flex-col divide-y divide-border">
          {versions.map((v) => {
            const snap = v.snapshot as { previous: unknown; current: unknown };
            return (
              <div key={v.id} className="py-3">
                <div className="flex items-center gap-3 text-small">
                  <span className="font-medium text-ink">{v.key}</span>
                  <span className="text-muted">{new Date(v.createdAt).toLocaleString()}</span>
                  <span className="rounded bg-recessed px-1.5 py-0.5 text-micro text-muted">
                    {v.origin}
                  </span>
                </div>
                <pre className="mt-2 rounded bg-recessed px-3 py-2 text-micro text-muted whitespace-pre-wrap">
                  {String(snap?.current ?? "")}
                </pre>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
