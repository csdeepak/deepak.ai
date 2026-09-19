import type { Metadata } from "next";
import { NewTimelineForm } from "@/features/admin/components/NewTimelineForm";

export const metadata: Metadata = { title: "New experience entry" };

export default function NewTimelineEntryPage() {
  return (
    <div className="px-6 py-8">
      <h1 className="text-h3 font-display font-semibold text-ink">
        New experience entry
      </h1>
      <p className="mt-2 max-w-[56ch] text-small text-muted">
        Role, organization and start date are enough to create a draft.
        Everything else can be filled in after.
      </p>
      <NewTimelineForm />
    </div>
  );
}
