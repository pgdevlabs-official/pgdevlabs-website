import Link from "next/link";
import { formatDate } from "@/lib/utils";
import type { BlogPost } from "@/types";

export function BlogCard({ post }: { post: BlogPost }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group block rounded-lg border border-border bg-bg-elevated p-5 transition-all hover:border-fg-muted hover:-translate-y-0.5"
    >
      <div className="flex items-center gap-2 font-mono-tight text-xs text-fg-muted">
        <span>{formatDate(post.publishedAt)}</span>
        <span>·</span>
        <span>{post.readMinutes} min read</span>
      </div>
      <h3 className="mt-2 font-display text-lg font-semibold group-hover:text-signal">
        {post.title}
      </h3>
      <p className="mt-2 line-clamp-2 text-sm text-fg-muted">{post.excerpt}</p>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {post.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full bg-bg px-2 py-0.5 font-mono-tight text-[10px] text-fg-muted"
          >
            #{tag}
          </span>
        ))}
      </div>
    </Link>
  );
}
