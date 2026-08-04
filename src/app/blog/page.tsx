import type { Metadata } from "next";
import { getBlogPosts } from "@/lib/dataService";
import { BlogCard } from "@/components/shared/BlogCard";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Blog",
  description: "Engineering notes, postmortems, and updates from PGDevLabs.",
};

export default async function BlogPage() {
  const blogPosts = await getBlogPosts();
  const sorted = [...blogPosts].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
      <div className="mb-10">
        <p className="font-mono-tight text-xs uppercase tracking-wide text-signal">Blog</p>
        <h1 className="mt-1 font-display text-3xl font-semibold sm:text-4xl">
          Notes from the build
        </h1>
        <p className="mt-3 max-w-lg text-sm text-fg-muted sm:text-base">
          What broke, what we learned, and what shipped. Written by whoever
          was closest to the bug.
        </p>
      </div>

      {sorted.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border py-16 text-center">
          <p className="text-sm text-fg-muted">No posts published yet.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {sorted.map((post) => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
