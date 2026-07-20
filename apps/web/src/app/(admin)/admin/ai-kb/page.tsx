import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "AI Knowledge Base" };

export default function AIKBPage() {
  return (
    <div className="px-6 py-6">
      <h1 className="mb-2 text-h3 font-semibold text-ink">AI Knowledge Base</h1>
      <div className="mb-6 rounded-md border border-border p-4 text-small text-muted">
        <div className="mb-4 grid grid-cols-4 gap-4 text-center">
          {[["Items", "—"], ["Synced", "0"], ["Pending", "0"], ["Stale", "0"]].map(([label, val]) => (
            <div key={label}>
              <div className="text-micro text-faint">{label}</div>
              <div className="text-h4 font-semibold text-ink">{val}</div>
            </div>
          ))}
        </div>
        <p className="text-micro text-faint">Last sync: never</p>
      </div>
      <p className="text-small text-muted">
        <strong>Dex is not live.</strong> Configure an LLM API key in Settings → AI to
        enable embedding sync and answer testing. Implementation deferred to v1.5.
      </p>
    </div>
  );
}
