import Link from "next/link";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { ScrollReveal } from "@/animations/scroll-reveal";
import { Carousel } from "@/components/content/carousel";
import { PostCard } from "@/components/content/post-card";
import { ROUTES } from "@/constants/routes";
import { contentService } from "@/services";

/**
 * Posts — horizontal carousel, newest first (D-058 Phase D carousel
 * redesign). Self-hides entirely when there are zero published posts
 * (LAW-008).
 *
 * Featured posts are filtered out because `FeaturedPosts` has already shown
 * them a few hundred pixels above: before this, the same two posts rendered
 * twice on one landing page, which reads as either a bug or padding. The
 * extra read is build-time only (this route is statically generated) and
 * keeps the section self-contained rather than threading props through the
 * page — the pattern every other landing section here follows.
 */
export async function RecentPosts() {
  const [latest, featured] = await Promise.all([
    contentService.getLatestPosts(10),
    contentService.getFeaturedPosts(),
  ]);

  const featuredSlugs = new Set(featured.map((post) => post.slug));
  const posts = latest.filter((post) => !featuredSlugs.has(post.slug));
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
              Posts
            </h2>
            <Link
              href={ROUTES.posts}
              className="text-small text-accent underline-offset-4 hover:underline"
            >
              More posts
            </Link>
          </div>
        </ScrollReveal>

        <div className="mt-8">
          <Carousel ariaLabel="Recent posts">
            {posts.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </Carousel>
        </div>
      </Container>
    </Section>
  );
}
