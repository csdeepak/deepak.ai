import Link from "next/link";
import Image from "next/image";
import type { Post } from "@/types/content";

/**
 * PostRow — Row-family variant (docs/04 §5). A compact thumbnail renders
 * when the post has a cover image; the slot is skipped entirely otherwise
 * (LAW-008 — no placeholder box).
 */
export function PostRow({ post }: { post: Post }) {
  return (
    <article className="flex items-start gap-4 border-b border-border py-4">
      {post.coverImage && (
        <Link
          href={`/posts/${post.slug}`}
          className="relative size-16 shrink-0 overflow-hidden rounded-md border border-border sm:size-20"
        >
          <Image
            src={post.coverImage.url}
            alt={post.coverImage.alt}
            fill
            sizes="80px"
            className="object-cover"
          />
        </Link>
      )}
      <div className="min-w-0">
        <h3 className="text-body font-medium">
          <Link href={`/posts/${post.slug}`}>{post.title}</Link>
        </h3>
        <p className="mt-1 text-small text-muted">{post.dek}</p>
        <p className="mt-1 font-mono text-micro tabular text-faint">
          {new Date(post.publishedAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
          {post.readingMinutes > 0 && <> · {post.readingMinutes} min</>}
        </p>
      </div>
    </article>
  );
}
