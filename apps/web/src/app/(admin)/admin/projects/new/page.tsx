import type { Metadata } from "next";
import { NewProjectForm } from "@/features/admin/components/NewProjectForm";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "New project" };

export default function NewProjectPage() {
  return (
    <div className="mx-auto max-w-lg px-6 py-8">
      <h1 className="mb-6 text-h3 font-semibold text-ink">New project</h1>
      <NewProjectForm />
    </div>
  );
}
