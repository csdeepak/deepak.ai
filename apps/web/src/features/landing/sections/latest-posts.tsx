import Link from "next/link";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { PostRow } from "@/components/content/post-row";
import { ScrollReveal } from "@/animations/scroll-reveal";
import { ROUTES } from "@/constants/routes";
import type { Post } from "@/types/content";

/**
 * S5 — Latest Posts (specs/landing.md §2.5). The page narrows to the
 * reading measure here — rehearsing the reading experience. Whitespace
 * increases after this section (the exhale). Self-hides when empty.
 */
export function LatestPosts({ posts }: { posts: Post[] }) {
  if (posts.length === 0) return null;

  return (
    <Section aria-labelledby="latest-posts-heading" className="pb-20 md:pb-32">
      <Container width="reading">
        <ScrollReveal>
          <h2 id="latest-posts-heading" className="text-h2 font-semibold">
            Writing
          </h2>
          <div className="mt-6">
            {posts.slice(0, 3).map((post) => (
              <PostRow key={post.slug} post={post} />
            ))}
          </div>
          <p className="mt-6">
            <Link
              href={ROUTES.posts}
              className="text-small text-muted hover:text-ink"
            >
              All posts →
            </Link>
          </p>
        </ScrollReveal>
      </Container>
    </Section>
  );
}
