import type { Metadata } from "next";
import { getProjects } from "@/lib/dataService";
import { ProjectCard } from "@/components/shared/ProjectCard";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Projects",
  description: "Open-source tools and internal projects from PGDevLabs.",
};

export default async function ProjectsPage() {
  const projects = await getProjects();

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <div className="mb-10">
        <p className="font-mono-tight text-xs uppercase tracking-wide text-signal">Projects</p>
        <h1 className="mt-1 font-display text-3xl font-semibold sm:text-4xl">
          Tools we build for ourselves
        </h1>
        <p className="mt-3 max-w-lg text-sm text-fg-muted sm:text-base">
          Internal tools and open-source utilities that came out of building
          our apps — some public, some just for us.
        </p>
      </div>

      {projects.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border py-16 text-center">
          <p className="text-sm text-fg-muted">No projects published yet.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}
