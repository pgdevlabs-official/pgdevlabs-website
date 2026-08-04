"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { AdminAppsPanel } from "@/components/shared/admin/AdminAppsPanel";
import { AdminProjectsPanel } from "@/components/shared/admin/AdminProjectsPanel";
import { AdminBlogPanel } from "@/components/shared/admin/AdminBlogPanel";
import { AdminTeamPanel } from "@/components/shared/admin/AdminTeamPanel";

const tabs = [
  { id: "apps", label: "Apps" },
  { id: "projects", label: "Projects" },
  { id: "blog", label: "Blog" },
  { id: "team", label: "Team" },
] as const;

type TabId = (typeof tabs)[number]["id"];

export function AdminContentManager() {
  const searchParams = useSearchParams();
  const [active, setActive] = useState<TabId>("apps");
  const [autoOpen, setAutoOpen] = useState(false);

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    const newParam = searchParams.get("new");
    if (tabParam && tabs.some((t) => t.id === tabParam)) {
      setActive(tabParam as TabId);
    }
    if (newParam === "1") {
      setAutoOpen(true);
    }
  }, [searchParams]);

  return (
    <div>
      <div className="flex gap-1 border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActive(tab.id);
              setAutoOpen(false);
            }}
            className={cn(
              "border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
              active === tab.id
                ? "border-signal text-fg"
                : "border-transparent text-fg-muted hover:text-fg"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {active === "apps" && <AdminAppsPanel initialOpen={autoOpen} />}
        {active === "projects" && <AdminProjectsPanel initialOpen={autoOpen} />}
        {active === "blog" && <AdminBlogPanel initialOpen={autoOpen} />}
        {active === "team" && <AdminTeamPanel initialOpen={autoOpen} />}
      </div>
    </div>
  );
}
