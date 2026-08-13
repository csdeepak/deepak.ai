import Link from "next/link";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { ScrollReveal } from "@/animations/scroll-reveal";
import { Carousel } from "@/components/content/carousel";
import { PostCard } from "@/components/content/post-card";
import { ROUTES } from "@/constants/routes";
import { contentService } from "@/services";

/**
 * Featured Posts — horizontal carousel, ordered by `featuredOrder`
 * (D-058 Phase D carousel redesign, several posts allowed — supersedes
 * the earlier single-featured-post block). Self-hides entirely when
 * nothing is featured (LAW-008); `Posts` below still shows regardless.
 */
export async function FeaturedPosts() {
  const posts = await contentService.getFeaturedPosts();
  if (posts.length === 0) return null;

  return (
    <Section aria-labelledby="featured-posts-heading" className="py-24 md:py-40">
      <Container width="content">
        <ScrollReveal>
          <p className="font-mono text-micro uppercase tracking-[0.2em] text-faint">
            Featured
          </p>
          <h2
            id="featured-posts-heading"
            className="mt-3 text-h4 font-display font-medium text-ink"
          >
            Featured posts
          </h2>
        </ScrollReveal>

        <div className="mt-8">
          <Carousel ariaLabel="Featured posts">
            {posts.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
            <Link
              href={ROUTES.posts}
              data-carousel-item
              className="flex w-72 shrink-0 snap-start flex-col items-center justify-center gap-2 rounded-md border border-dashed border-border bg-surface p-5 text-center transition-colors duration-(--duration-hover) hover:border-border-emphasis theme-surface sm:w-80"
            >
              <span className="text-body font-medium text-ink">See all posts</span>
              <span className="text-accent" aria-hidden>→</span>
            </Link>
          </Carousel>
        </div>
      </Container>
    </Section>
  );
}
