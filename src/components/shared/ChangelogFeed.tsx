"use client";

import { motion } from "framer-motion";
import { formatDate } from "@/lib/utils";
import type { App } from "@/types";

export function ChangelogFeed({ apps }: { apps: App[] }) {
  const entries = apps
    .flatMap((app) =>
      app.versions.map((v) => ({
        app: app.name,
        slug: app.slug,
        version: v.version,
        date: v.date,
        note: v.notes[0],
      }))
    )
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 6);

  return (
    <div className="w-full overflow-hidden rounded-lg border border-border bg-bg-elevated shadow-xl">
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-danger/60" />
          <span className="h-2.5 w-2.5 rounded-full bg-warn/60" />
          <span className="h-2.5 w-2.5 rounded-full bg-circuit/60" />
        </div>
        <span className="ml-2 font-mono-tight text-xs text-fg-muted">
          pgdevlabs/releases — live
        </span>
      </div>
      <div className="p-4">
        {entries.map((entry, i) => (
          <motion.div
            key={`${entry.slug}-${entry.version}`}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08, duration: 0.3 }}
            className="flex items-start gap-3 border-b border-border/60 py-2.5 font-mono-tight text-xs last:border-0 sm:text-sm"
          >
            <span className="mt-0.5 shrink-0 text-fg-muted">{formatDate(entry.date)}</span>
            <span className="shrink-0 text-circuit">{entry.app}</span>
            <span className="shrink-0 text-signal">v{entry.version}</span>
            <span className="truncate text-fg-muted">{entry.note}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
