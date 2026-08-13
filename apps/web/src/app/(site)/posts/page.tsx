import type { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { PostRow } from "@/components/content/post-row";
import { EmptyState } from "@/components/content/empty-state";
import { contentService } from "@/services";

/**
 * /posts — the Posts index (Index archetype, docs/24 Part 10; D-021 lane
 * "Posts"). Zero posts is a legitimate state (LAW-008): an honest empty
 * state, never a fabricated placeholder.
 */
export const metadata: Metadata = {
  title: "Posts",
  description: "Writing on what's being built and why.",
};

export default async function PostsIndexPage() {
  const posts = await contentService.getPosts();

  return (
    <Section>
      <Container width="content">
        <header className="max-w-[46ch]">
          <p className="font-mono text-micro uppercase tracking-[0.2em] text-faint">
            Posts
          </p>
          <h1 className="mt-4 text-section font-display font-semibold text-ink">
            Posts
          </h1>
        </header>

        {posts.length > 0 ? (
          <div className="mt-12">
            {posts.map((post) => (
              <PostRow key={post.slug} post={post} />
            ))}
          </div>
        ) : (
          <EmptyState
            className="mt-12"
            title="No posts are published here yet."
            body="This shelf is honestly empty. When something is written, it will appear here."
          />
        )}
      </Container>
    </Section>
  );
}
