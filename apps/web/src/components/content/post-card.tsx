import Link from "next/link";
import Image from "next/image";
import type { Post } from "@/types/content";

/**
 * PostCard — the carousel preview unit (Featured Posts / Posts). Image on
 * top when the post has a cover (self-hides the slot entirely otherwise,
 * LAW-008 — no placeholder box), title + preview text below, "Read more".
 * Clicking anything in the card goes to the dedicated post page — the
 * carousel is for discovery, reading happens there (vertical scroll).
 */
export function PostCard({ post }: { post: Post }) {
  return (
    <Link
      href={`/posts/${post.slug}`}
      data-carousel-item
      className="group flex w-72 shrink-0 snap-start flex-col overflow-hidden rounded-md border border-border bg-surface transition-colors duration-(--duration-hover) hover:border-border-emphasis theme-surface sm:w-80"
    >
      {post.coverImage && (
        <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden border-b border-border">
          <Image
            src={post.coverImage.url}
            alt={post.coverImage.alt}
            fill
            sizes="320px"
            className="object-cover"
          />
        </div>
      )}
      <div className="flex flex-1 flex-col p-5">
        <h3 className="line-clamp-2 text-card-title font-display font-semibold text-ink">
          <span className="gradient-underline-hover">{post.title}</span>
        </h3>
        {post.dek && (
          <p className="mt-2 line-clamp-3 text-small text-muted">{post.dek}</p>
        )}
        <span className="mt-auto pt-4 text-small font-medium text-accent">
          Read more →
        </span>
      </div>
    </Link>
  );
}
