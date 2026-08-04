import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { getBlogPostBySlug } from "@/lib/dataService";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) return {};
  return { title: post.title, description: post.excerpt };
}

export default async function BlogDetailPage({ params }: Props) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) notFound();

  return (
    <article className="mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-14">
      <Link
        href="/blog"
        className="mb-6 inline-flex items-center gap-1 text-sm text-fg-muted hover:text-fg"
      >
        <ChevronLeft size={15} /> All posts
      </Link>

      <div className="flex items-center gap-2 font-mono-tight text-xs text-fg-muted">
        <span>{formatDate(post.publishedAt)}</span>
        <span>·</span>
        <span>{post.readMinutes} min read</span>
        <span>·</span>
        <span>{post.author}</span>
      </div>

      <h1 className="mt-3 font-display text-3xl font-semibold sm:text-4xl">{post.title}</h1>
      <p className="mt-4 text-lg text-fg-muted">{post.excerpt}</p>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {post.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full bg-bg-elevated px-2.5 py-1 font-mono-tight text-[11px] text-fg-muted"
          >
            #{tag}
          </span>
        ))}
      </div>

      <div className="prose prose-invert mt-10 max-w-none leading-relaxed text-fg">
        <p>{post.content}</p>
      </div>
    </article>
  );
}
