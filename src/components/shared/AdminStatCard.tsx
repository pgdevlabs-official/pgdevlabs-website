import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function AdminStatCard({
  label,
  value,
  change,
  icon: Icon,
}: {
  label: string;
  value: string;
  change?: string;
  icon: LucideIcon;
}) {
  const isPositive = change?.startsWith("+");
  return (
    <div className="rounded-lg border border-border bg-bg-elevated p-5">
      <div className="flex items-center justify-between">
        <span className="font-mono-tight text-xs uppercase tracking-wide text-fg-muted">
          {label}
        </span>
        <Icon size={15} className="text-fg-muted" />
      </div>
      <p className="mt-3 font-display text-2xl font-semibold">{value}</p>
      {change && (
        <p
          className={cn(
            "mt-1 font-mono-tight text-xs",
            isPositive ? "text-circuit" : "text-danger"
          )}
        >
          {change} this month
        </p>
      )}
    </div>
  );
}
