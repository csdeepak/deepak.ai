import type { Metadata } from "next";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Posts" };

export default function PostsPage() {
  return (
    <div className="px-6 py-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-h3 font-semibold text-ink">Posts</h1>
        <Link href="/admin/posts/new" className="inline-flex h-9 items-center rounded-md bg-accent px-4 text-small font-medium text-on-accent hover:bg-accent-hover">
          + New post
        </Link>
      </div>
      <p className="text-small text-muted">Posts editor — ships in the next sprint.</p>
    </div>
  );
}
