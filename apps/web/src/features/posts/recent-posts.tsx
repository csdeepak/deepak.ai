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
 */
export async function RecentPosts() {
  const posts = await contentService.getLatestPosts(10);
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
