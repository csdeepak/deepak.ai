import Link from "next/link";
import type { Post } from "@/types/content";

/** PostRow — Row-family variant; title-forward, no thumbnails (docs/04 §5). */
export function PostRow({ post }: { post: Post }) {
  return (
    <article className="border-b border-border py-4">
      <h3 className="text-body font-medium">
        <Link href={`/posts/${post.slug}`}>{post.title}</Link>
      </h3>
      <p className="mt-1 text-small text-muted">{post.dek}</p>
      <p className="mt-1 font-mono text-micro tabular text-faint">
        {new Date(post.publishedAt).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })}{" "}
        · {post.readingMinutes} min
      </p>
    </article>
  );
}
