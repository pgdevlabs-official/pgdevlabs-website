import Link from "next/link";
import { Star, Download } from "lucide-react";
import { StatusChip } from "@/components/ui/StatusChip";
import { formatCompactNumber } from "@/lib/utils";
import type { App } from "@/types";

export function AppCard({ app }: { app: App }) {
  return (
    <Link
      href={`/apps/${app.slug}`}
      className="glow-card group block rounded-xl border border-border bg-bg-elevated p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl font-display text-lg font-bold text-white transition-transform duration-300 group-hover:scale-105"
            style={{
              background: "linear-gradient(135deg, var(--accent-signal), var(--accent-magenta))",
            }}
          >
            {app.name.charAt(0)}
          </div>
          <div>
            <h3 className="font-display text-base font-semibold transition-colors group-hover:text-signal">
              {app.name}
            </h3>
            <p className="text-sm text-fg-muted">{app.tagline}</p>
          </div>
        </div>
        <StatusChip status={app.status} />
      </div>

      <p className="mt-4 line-clamp-2 text-sm text-fg-muted">{app.description}</p>

      <div className="mt-4 flex items-center gap-4 font-mono-tight text-xs text-fg-muted">
        {app.rating > 0 && (
          <span className="flex items-center gap-1">
            <Star size={12} className="fill-warn text-warn" />
            {app.rating.toFixed(1)}
          </span>
        )}
        {app.downloadCount > 0 && (
          <span className="flex items-center gap-1">
            <Download size={12} />
            {formatCompactNumber(app.downloadCount)}
          </span>
        )}
        <span className="ml-auto">v{app.versions[0]?.version}</span>
      </div>
    </Link>
  );
}