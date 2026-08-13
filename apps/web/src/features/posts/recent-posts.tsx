import Link from "next/link";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { ScrollReveal } from "@/animations/scroll-reveal";
import { PostRow } from "@/components/content/post-row";
import { ROUTES } from "@/constants/routes";
import { contentService } from "@/services";

/**
 * Recent posts — up to 5, newest first (docs/30 Phase D). Self-hides
 * entirely when there are zero published posts (LAW-008).
 */
export async function RecentPosts() {
  const posts = await contentService.getLatestPosts(5);
  if (posts.length === 0) return null;

  return (
    <Section aria-labelledby="recent-posts-heading" className="py-24 md:py-40">
      <Container width="content">
        <ScrollReveal>
          <div className="flex items-baseline justify-between">
            <h2
              id="recent-posts-heading"
              className="text-h4 font-display font-medium text-ink"
            >
              Recent posts
            </h2>
            <Link
              href={ROUTES.posts}
              className="text-small text-accent underline-offset-4 hover:underline"
            >
              More posts
            </Link>
          </div>
          <div className="mt-6">
            {posts.map((post) => (
              <PostRow key={post.slug} post={post} />
            ))}
          </div>
        </ScrollReveal>
      </Container>
    </Section>
  );
}
