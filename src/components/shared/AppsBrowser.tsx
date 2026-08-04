"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { AppCard } from "@/components/shared/AppCard";
import type { App, BuildStatus } from "@/types";
import { cn } from "@/lib/utils";

const statusFilters: { label: string; value: BuildStatus | "ALL" }[] = [
  { label: "All", value: "ALL" },
  { label: "Shipped", value: "SHIPPED" },
  { label: "Beta", value: "BETA" },
  { label: "In dev", value: "IN_DEV" },
];

export function AppsBrowser({ apps }: { apps: App[] }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<BuildStatus | "ALL">("ALL");

  const categories = useMemo(
    () => Array.from(new Set(apps.map((a) => a.category))),
    [apps]
  );
  const [category, setCategory] = useState<string>("ALL");

  const filtered = useMemo(() => {
    return apps.filter((app) => {
      const matchesQuery =
        !query.trim() ||
        app.name.toLowerCase().includes(query.toLowerCase()) ||
        app.tagline.toLowerCase().includes(query.toLowerCase());
      const matchesStatus = status === "ALL" || app.status === status;
      const matchesCategory = category === "ALL" || app.category === category;
      return matchesQuery && matchesStatus && matchesCategory;
    });
  }, [apps, query, status, category]);

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-fg-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search apps…"
            className="w-full rounded-md border border-border bg-bg-elevated py-2 pl-9 pr-3 text-sm outline-none placeholder:text-fg-muted focus-visible:border-signal"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {statusFilters.map((f) => (
            <button
              key={f.value}
              onClick={() => setStatus(f.value)}
              className={cn(
                "rounded-md border px-3 py-1.5 font-mono-tight text-xs transition-colors",
                status === f.value
                  ? "border-signal bg-signal/10 text-signal"
                  : "border-border text-fg-muted hover:text-fg"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          onClick={() => setCategory("ALL")}
          className={cn(
            "rounded-full px-3 py-1 text-xs transition-colors",
            category === "ALL" ? "bg-fg text-bg" : "bg-bg-elevated text-fg-muted hover:text-fg"
          )}
        >
          All categories
        </button>
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={cn(
              "rounded-full px-3 py-1 text-xs transition-colors",
              category === c ? "bg-fg text-bg" : "bg-bg-elevated text-fg-muted hover:text-fg"
            )}
          >
            {c}
          </button>
        ))}
      </div>

      <p className="mt-6 mb-4 font-mono-tight text-xs text-fg-muted">
        {filtered.length} app{filtered.length !== 1 ? "s" : ""} found
      </p>

      {filtered.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border py-16 text-center">
          <p className="text-sm text-fg-muted">No apps match your filters.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((app) => (
            <AppCard key={app.id} app={app} />
          ))}
        </div>
      )}
    </div>
  );
}
