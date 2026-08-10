import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Skills" };

export default function SkillsPage() {
  return (
    <div className="px-6 py-6">
      <h1 className="mb-4 text-h3 font-semibold text-ink">Skills</h1>
      <p className="text-small text-muted">Skills editor — ships in the next sprint.</p>
    </div>
  );
}
