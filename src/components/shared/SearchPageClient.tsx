"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { Search as SearchIcon } from "lucide-react";
import { getApps, getProjects, getBlogPosts } from "@/lib/dataService";
import type { SearchResult } from "@/types";

async function buildIndex(): Promise<SearchResult[]> {
  const [apps, projects, blogPosts] = await Promise.all([
    getApps(),
    getProjects(),
    getBlogPosts(),
  ]);
  const appResults: SearchResult[] = apps.map((a) => ({
    type: "app",
    title: a.name,
    description: a.tagline,
    href: `/apps/${a.slug}`,
  }));
  const projectResults: SearchResult[] = projects.map((p) => ({
    type: "project",
    title: p.name,
    description: p.summary,
    href: `/projects/${p.slug}`,
  }));
  const blogResults: SearchResult[] = blogPosts.map((b) => ({
    type: "blog",
    title: b.title,
    description: b.excerpt,
    href: `/blog/${b.slug}`,
  }));
  return [...appResults, ...projectResults, ...blogResults];
}

const typeLabels: Record<SearchResult["type"], string> = {
  app: "App",
  project: "Project",
  blog: "Blog",
  page: "Page",
};

export function SearchPageClient() {
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [index, setIndex] = useState<SearchResult[]>([]);

  useEffect(() => {
    buildIndex().then(setIndex);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query), 150);
    return () => clearTimeout(t);
  }, [query]);

  const results = useMemo(() => {
    if (!debounced.trim()) return [];
    const q = debounced.toLowerCase();
    return index.filter(
      (item) =>
        item.title.toLowerCase().includes(q) || item.description.toLowerCase().includes(q)
    );
  }, [debounced, index]);

  return (
    <div>
      <div className="relative">
        <SearchIcon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-fg-muted" />
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search apps, projects, blog posts…"
          className="w-full rounded-lg border border-border bg-bg-elevated py-3.5 pl-11 pr-4 text-base outline-none placeholder:text-fg-muted focus-visible:border-signal"
        />
      </div>

      <div className="mt-6">
        {!debounced.trim() ? (
          <p className="text-sm text-fg-muted">Start typing to search across everything.</p>
        ) : results.length === 0 ? (
          <p className="text-sm text-fg-muted">No results for &ldquo;{debounced}&rdquo;.</p>
        ) : (
          <div className="space-y-2">
            <p className="font-mono-tight text-xs text-fg-muted">
              {results.length} result{results.length !== 1 ? "s" : ""}
            </p>
            {results.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center justify-between gap-3 rounded-lg border border-border bg-bg-elevated px-4 py-3 transition-colors hover:border-fg-muted"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-signal/10 px-1.5 py-0.5 font-mono-tight text-[10px] uppercase text-signal">
                      {typeLabels[item.type]}
                    </span>
                    <span className="truncate text-sm font-medium">{item.title}</span>
                  </div>
                  <p className="mt-0.5 truncate text-xs text-fg-muted">{item.description}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
