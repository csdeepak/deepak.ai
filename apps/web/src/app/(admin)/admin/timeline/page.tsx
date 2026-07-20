import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Timeline" };

export default function TimelinePage() {
  return (
    <div className="px-6 py-6">
      <h1 className="mb-4 text-h3 font-semibold text-ink">Timeline</h1>
      <p className="text-small text-muted">Timeline editor — ships in the next sprint.</p>
    </div>
  );
}
