"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Search, CornerDownLeft, X } from "lucide-react";
import { getApps, getProjects, getBlogPosts } from "@/lib/dataService";
import type { SearchResult } from "@/types";

const staticPages: SearchResult[] = [
  { type: "page", title: "Home", description: "PGDevLabs homepage", href: "/" },
  { type: "page", title: "Apps", description: "Browse all shipped apps", href: "/apps" },
  { type: "page", title: "Projects", description: "Open-source & internal projects", href: "/projects" },
  { type: "page", title: "Blog", description: "Engineering notes & postmortems", href: "/blog" },
  { type: "page", title: "Team", description: "Meet the studio", href: "/team" },
  { type: "page", title: "About", description: "What PGDevLabs is about", href: "/about" },
  { type: "page", title: "Contact", description: "Get in touch", href: "/contact" },
];

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
  return [...staticPages, ...appResults, ...projectResults, ...blogResults];
}

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [index, setIndex] = useState<SearchResult[]>(staticPages);
  const router = useRouter();

  useEffect(() => {
    buildIndex().then(setIndex);
  }, []);

  const results = useMemo(() => {
    if (!query.trim()) return index.slice(0, 8);
    const q = query.toLowerCase();
    return index
      .filter(
        (item) =>
          item.title.toLowerCase().includes(q) || item.description.toLowerCase().includes(q)
      )
      .slice(0, 8);
  }, [query, index]);

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setActiveIndex(0);
  }, []);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === "Escape") close();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [close]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  function handleNav(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && results[activeIndex]) {
      router.push(results[activeIndex].href);
      close();
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-md border border-border bg-bg-elevated px-3 py-1.5 text-sm text-fg-muted transition-colors hover:border-fg-muted"
        aria-label="Open search"
      >
        <Search size={14} />
        <span className="hidden sm:inline">Search</span>
        <kbd className="hidden items-center gap-0.5 rounded border border-border bg-bg px-1.5 py-0.5 font-mono-tight text-[10px] sm:flex">
          ⌘K
        </kbd>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 pt-[12vh] backdrop-blur-sm"
            onClick={close}
          >
            <motion.div
              initial={{ opacity: 0, y: -12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.15 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg overflow-hidden rounded-lg border border-border bg-bg-elevated shadow-2xl"
              role="dialog"
              aria-modal="true"
              aria-label="Search"
            >
              <div className="flex items-center gap-2 border-b border-border px-4 py-3">
                <Search size={16} className="text-fg-muted shrink-0" />
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleNav}
                  placeholder="Search apps, projects, blog…"
                  className="w-full bg-transparent text-sm outline-none placeholder:text-fg-muted"
                />
                <button onClick={close} aria-label="Close search" className="text-fg-muted hover:text-fg">
                  <X size={16} />
                </button>
              </div>

              <div className="max-h-80 overflow-y-auto py-2">
                {results.length === 0 ? (
                  <p className="px-4 py-6 text-center text-sm text-fg-muted">
                    No results for &ldquo;{query}&rdquo;.
                  </p>
                ) : (
                  results.map((item, i) => (
                    <button
                      key={item.href + item.title}
                      onClick={() => {
                        router.push(item.href);
                        close();
                      }}
                      onMouseEnter={() => setActiveIndex(i)}
                      className={`flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left transition-colors ${
                        i === activeIndex ? "bg-signal/10" : ""
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono-tight text-[10px] uppercase text-fg-muted">
                            {item.type}
                          </span>
                          <span className="truncate text-sm font-medium">{item.title}</span>
                        </div>
                        <p className="truncate text-xs text-fg-muted">{item.description}</p>
                      </div>
                      {i === activeIndex && <CornerDownLeft size={14} className="text-fg-muted shrink-0" />}
                    </button>
                  ))
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
