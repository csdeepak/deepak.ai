import type { Metadata } from "next";
import { NewPostForm } from "@/features/admin/components/NewPostForm";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "New post" };

export default function NewPostPage() {
  return (
    <div className="mx-auto max-w-lg px-6 py-8">
      <h1 className="mb-6 text-h3 font-semibold text-ink">New post</h1>
      <NewPostForm />
    </div>
  );
}
