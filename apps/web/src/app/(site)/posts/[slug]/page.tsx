import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { Tag } from "@/components/ui/badge";
import { ROUTES } from "@/constants/routes";
import { contentService } from "@/services";
import { renderMarkdown } from "@/lib/markdown";

/**
 * /posts/[slug] — the Post detail (Detail archetype, docs/24 Part 10).
 * `bodyMarkdown` renders server-side only (docs/30 §5 — never ship a
 * markdown parser to the browser).
 */
export const dynamicParams = false;

type Params = { slug: string };

export async function generateStaticParams() {
  const posts = await contentService.getPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await contentService.getPost(slug);
  if (!post) return {};
  return { title: `${post.title} — Posts`, description: post.dek };
}

export default async function PostDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const post = await contentService.getPost(slug);
  if (!post || post.status !== "published") notFound();

  const bodyHtml = post.bodyMarkdown ? renderMarkdown(post.bodyMarkdown) : "";

  return (
    <Section>
      <Container width="reading">
        <header>
          <div className="flex items-center gap-3 text-micro text-faint">
            <Link href={ROUTES.posts} className="hover:text-ink">
              Posts
            </Link>
            <span aria-hidden>/</span>
            <span className="font-mono tabular">
              {new Date(post.publishedAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </span>
            {post.readingMinutes > 0 && <span>{post.readingMinutes} min read</span>}
          </div>
          <h1 className="mt-5 text-section font-display font-semibold text-ink">
            {post.title}
          </h1>
          {post.dek && <p className="mt-4 text-lead text-muted">{post.dek}</p>}

          {post.tags.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <Tag key={tag}>{tag}</Tag>
              ))}
            </div>
          )}
        </header>

        {bodyHtml && (
          <div
            className="mt-16 space-y-5 text-body text-muted [&_a]:text-accent [&_a]:underline-offset-4 [&_a:hover]:underline [&_blockquote]:border-l-2 [&_blockquote]:border-border-emphasis [&_blockquote]:pl-5 [&_blockquote]:text-muted [&_code]:rounded [&_code]:bg-surface [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-small [&_h2]:mt-12 [&_h2]:text-h3 [&_h2]:font-display [&_h2]:font-medium [&_h2]:text-ink [&_h3]:mt-8 [&_h3]:text-h4 [&_h3]:font-display [&_h3]:font-medium [&_h3]:text-ink [&_li]:mt-2 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:leading-relaxed [&_pre]:overflow-x-auto [&_pre]:rounded-md [&_pre]:border [&_pre]:border-border [&_pre]:bg-surface [&_pre]:p-4 [&_strong]:text-ink [&_ul]:list-disc [&_ul]:pl-6"
            dangerouslySetInnerHTML={{ __html: bodyHtml }}
          />
        )}
      </Container>
    </Section>
  );
}
