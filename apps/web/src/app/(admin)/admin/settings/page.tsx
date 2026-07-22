import type { Metadata } from "next";
import { getDb } from "@/db/index";
import { siteSettings } from "@/db/schema";
import { SettingsEditor } from "@/features/admin/components/SettingsEditor";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const db = getDb();
  const rows = await db.select().from(siteSettings);
  const settings: Record<string, unknown> = {};
  for (const row of rows) {
    settings[row.key] = row.value;
  }

  const isDbMode = process.env.CONTENT_SOURCE === "db";

  return (
    <div className="mx-auto max-w-2xl px-6 py-6">
      <h1 className="mb-2 text-h3 font-semibold text-ink">Settings</h1>

      {!isDbMode && (
        <div className="mb-6 rounded-md border border-warning bg-[color-mix(in_srgb,var(--color-warning)_10%,transparent)] px-4 py-3 text-small text-warning">
          <strong>Site is running in file mode.</strong> Changes saved here update the
          database but will not appear on the public site until you set{" "}
          <code>CONTENT_SOURCE=db</code> and restart.
        </div>
      )}
      {isDbMode && (
        <p className="mb-6 text-small text-muted">
          DB mode active. <code>content/site.ts</code> is read-only reference — all
          content is managed here.
        </p>
      )}

      <SettingsEditor settings={settings} />
    </div>
  );
}
