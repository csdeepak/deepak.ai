import Link from "next/link";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { ScrollReveal } from "@/animations/scroll-reveal";
import { contentService } from "@/services";

/**
 * Featured post — LinkedIn-style single-post spotlight (docs/30 Phase D).
 * At most one post is ever featured (D-058 Phase C: single boolean,
 * one-at-a-time). Self-hides entirely when none is featured (LAW-008) —
 * this is a legitimate resting state, not an error.
 */
export async function FeaturedPost() {
  const [post] = await contentService.getFeaturedPosts(1);
  if (!post) return null;

  return (
    <Section aria-labelledby="featured-post-heading" className="py-24 md:py-40">
      <Container width="content">
        <ScrollReveal>
          <p className="font-mono text-micro uppercase tracking-[0.2em] text-faint">
            Featured
          </p>
          <div className="mt-8 rounded-md border border-border bg-surface p-8 theme-surface md:p-12">
            <h2
              id="featured-post-heading"
              className="text-section font-display font-medium text-ink"
            >
              <Link href={`/posts/${post.slug}`}>
                <span className="gradient-underline-hover">{post.title}</span>
              </Link>
            </h2>
            {post.dek && (
              <p className="mt-4 max-w-[60ch] text-lead text-muted">{post.dek}</p>
            )}
            <div className="mt-6 flex items-center gap-3 text-micro text-faint">
              <span className="font-mono tabular">
                {new Date(post.publishedAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </span>
              {post.readingMinutes > 0 && <span>{post.readingMinutes} min read</span>}
            </div>
            <Link
              href={`/posts/${post.slug}`}
              className="mt-8 inline-flex h-11 items-center justify-center rounded-md bg-accent px-5 text-small font-medium text-on-accent transition-colors duration-(--duration-fast) hover:bg-accent-hover"
            >
              Read the post
            </Link>
          </div>
        </ScrollReveal>
      </Container>
    </Section>
  );
}
