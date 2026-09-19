import type { Metadata } from "next";
import { NewContentForm } from "@/features/admin/components/NewContentForm";
import { createSkill } from "@/features/admin/actions/skills";

export const metadata: Metadata = { title: "New skill" };

export default function NewSkillPage() {
  return (
    <div className="px-6 py-8">
      <h1 className="text-h3 font-display font-semibold text-ink">New skill</h1>
      <p className="mt-2 max-w-[60ch] text-small text-muted">
        Match the spelling used in your project tags — the public page merges by
        name, so an exact match enriches the existing entry instead of creating a
        near-duplicate beside it.
      </p>
      <NewContentForm
        action={createSkill}
        fields={[{ name: "title", label: "Skill", placeholder: "PyTorch" }]}
      />
    </div>
  );
}
