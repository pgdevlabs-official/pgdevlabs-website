import { cn } from "@/lib/utils";
import type { BuildStatus } from "@/types";

const statusConfig: Record<BuildStatus, { label: string; color: string; dot: string }> = {
  SHIPPED: { label: "SHIPPED", color: "text-circuit border-circuit/30 bg-circuit/10", dot: "bg-circuit" },
  BETA: { label: "BETA", color: "text-signal border-signal/30 bg-signal/10", dot: "bg-signal" },
  IN_DEV: { label: "IN DEV", color: "text-warn border-warn/30 bg-warn/10", dot: "bg-warn" },
  DEPRECATED: { label: "DEPRECATED", color: "text-danger border-danger/30 bg-danger/10", dot: "bg-danger" },
};

export function StatusChip({ status, className }: { status: BuildStatus; className?: string }) {
  const config = statusConfig[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded border px-2 py-0.5 font-mono-tight text-[11px] font-medium tracking-wide",
        config.color,
        className
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", config.dot)} />
      {config.label}
    </span>
  );
}
