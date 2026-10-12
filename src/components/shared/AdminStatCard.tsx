import type { LucideIcon } from "lucide-react";

export function AdminStatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
}) {
  return (
    <div className="rounded-lg border border-border bg-bg-elevated p-5">
      <div className="flex items-center justify-between">
        <span className="font-mono-tight text-xs uppercase tracking-wide text-fg-muted">
          {label}
        </span>
        <Icon size={15} className="text-fg-muted" />
      </div>
      <p className="mt-3 font-display text-2xl font-semibold">{value}</p>
    </div>
  );
}
