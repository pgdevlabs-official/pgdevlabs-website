import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ExternalLink, Code2, Calendar } from "lucide-react";
import { getProjectBySlug } from "@/lib/dataService";
import { StatusChip } from "@/components/ui/StatusChip";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) return {};
  return { title: project.name, description: project.summary };
}

export default async function ProjectDetailPage({ params }: Props) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <Link
        href="/projects"
        className="mb-6 inline-flex items-center gap-1 text-sm text-fg-muted hover:text-fg"
      >
        <ChevronLeft size={15} /> All projects
      </Link>

      <div className="flex flex-wrap items-center gap-2">
        <h1 className="font-display text-2xl font-semibold sm:text-3xl">{project.name}</h1>
        <StatusChip status={project.status} />
      </div>
      <p className="mt-2 text-fg-muted">{project.summary}</p>

      <div className="mt-4 flex items-center gap-1.5 font-mono-tight text-xs text-fg-muted">
        <Calendar size={13} /> Started {formatDate(project.startedAt)}
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {project.stack.map((s) => (
          <span
            key={s}
            className="rounded bg-bg-elevated px-2 py-0.5 font-mono-tight text-[11px] text-fg-muted"
          >
            {s}
          </span>
        ))}
      </div>

      <p className="mt-8 leading-relaxed text-fg-muted">{project.description}</p>

      <div className="mt-8 flex flex-wrap gap-3">
        {project.repoUrl && (
          <Button href={project.repoUrl} target="_blank" rel="noopener noreferrer" variant="secondary">
            <Code2 size={15} /> View repo
          </Button>
        )}
        {project.liveUrl && (
          <Button href={project.liveUrl} target="_blank" rel="noopener noreferrer">
            <ExternalLink size={15} /> Live demo
          </Button>
        )}
      </div>
    </div>
  );
}
