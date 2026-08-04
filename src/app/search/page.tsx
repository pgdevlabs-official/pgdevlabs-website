import type { Metadata } from "next";
import { SearchPageClient } from "@/components/shared/SearchPageClient";

export const metadata: Metadata = {
  title: "Search",
  description: "Search across all PGDevLabs apps, projects, and blog posts.",
};

export default function SearchPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 sm:py-16">
      <p className="font-mono-tight text-xs uppercase tracking-wide text-signal">Search</p>
      <h1 className="mt-1 mb-8 font-display text-3xl font-semibold sm:text-4xl">
        Find anything
      </h1>
      <SearchPageClient />
    </div>
  );
}
