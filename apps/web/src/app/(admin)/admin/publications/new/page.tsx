import type { Metadata } from "next";
import { NewContentForm } from "@/features/admin/components/NewContentForm";
import { createPublication } from "@/features/admin/actions/publications";

export const metadata: Metadata = { title: "New publication" };

export default function NewPublicationPage() {
  return (
    <div className="px-6 py-8">
      <h1 className="text-h3 font-display font-semibold text-ink">
        New publication
      </h1>
      <p className="mt-2 max-w-[56ch] text-small text-muted">
        Title and year create the draft. Authors, venue, abstract and links come
        next.
      </p>
      <NewContentForm
        action={createPublication}
        fields={[
          { name: "title", label: "Title" },
          { name: "year", label: "Year", type: "number", placeholder: "2026" },
        ]}
      />
    </div>
  );
}
