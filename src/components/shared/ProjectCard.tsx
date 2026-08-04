import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { StatusChip } from "@/components/ui/StatusChip";
import type { Project } from "@/types";

export function ProjectCard({ project }: { project: Project }) {
  return (
    <Link
      href={`/projects/${project.slug}`}
      className="group block rounded-lg border border-border bg-bg-elevated p-5 transition-all hover:border-fg-muted hover:-translate-y-0.5"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-display text-base font-semibold group-hover:text-signal">
          {project.name}
        </h3>
        <StatusChip status={project.status} />
      </div>
      <p className="mt-2 text-sm text-fg-muted">{project.summary}</p>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {project.stack.map((s) => (
          <span
            key={s}
            className="rounded bg-bg px-2 py-0.5 font-mono-tight text-[10px] text-fg-muted"
          >
            {s}
          </span>
        ))}
      </div>
      <div className="mt-4 flex items-center gap-1 font-mono-tight text-xs text-signal opacity-0 transition-opacity group-hover:opacity-100">
        View project <ArrowUpRight size={12} />
      </div>
    </Link>
  );
}
