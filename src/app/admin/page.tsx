import type { Metadata } from "next";
import { Suspense } from "react";
import { Package, Download, Star, MessageSquare } from "lucide-react";
import { getApps, getBlogPosts, getProjects } from "@/lib/dataService";
import { AdminGate } from "@/components/shared/AdminGate";
import { AdminStatCard } from "@/components/shared/AdminStatCard";
import { MiniBarChart } from "@/components/shared/MiniBarChart";
import { StatusChip } from "@/components/ui/StatusChip";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";
import { AdminContentManager } from "@/components/shared/admin/AdminContentManager";
import { formatCompactNumber } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

const downloadTrend = [
  { label: "Feb", value: 320 },
  { label: "Mar", value: 540 },
  { label: "Apr", value: 890 },
  { label: "May", value: 1200 },
  { label: "Jun", value: 1850 },
  { label: "Jul", value: 2400 },
];

export default async function AdminPage() {
  const [apps, blogPosts, projects] = await Promise.all([
    getApps(),
    getBlogPosts(),
    getProjects(),
  ]);
  const totalDownloads = apps.reduce((s, a) => s + a.downloadCount, 0);
  const totalReviews = apps.reduce((s, a) => s + a.reviewCount, 0);
  const avgRating =
    apps.filter((a) => a.rating > 0).reduce((s, a) => s + a.rating, 0) /
    (apps.filter((a) => a.rating > 0).length || 1);

  return (
    <AdminGate>
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        <p className="font-mono-tight text-xs uppercase tracking-wide text-signal">Admin</p>
        <h1 className="mt-1 font-display text-3xl font-semibold sm:text-4xl">Dashboard</h1>
        <p className="mt-2 text-sm text-fg-muted">
          Overview across all apps, projects, and content.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <AdminStatCard
            label="Total apps"
            value={String(apps.length)}
            change="+1"
            icon={Package}
          />
          <AdminStatCard
            label="Total downloads"
            value={formatCompactNumber(totalDownloads)}
            change="+18%"
            icon={Download}
          />
          <AdminStatCard
            label="Avg. rating"
            value={avgRating.toFixed(1)}
            change="+0.2"
            icon={Star}
          />
          <AdminStatCard
            label="Reviews"
            value={String(totalReviews)}
            change="+12"
            icon={MessageSquare}
          />
        </div>

        <div className="mt-10 grid gap-4 lg:grid-cols-2">
          <ErrorBoundary fallbackTitle="Couldn't load download trend">
            <div className="rounded-lg border border-border bg-bg-elevated p-5">
              <h2 className="mb-4 font-display text-base font-semibold">
                Download trend (6mo)
              </h2>
              <MiniBarChart data={downloadTrend} />
            </div>
          </ErrorBoundary>

          <div className="rounded-lg border border-border bg-bg-elevated p-5">
            <h2 className="mb-4 font-display text-base font-semibold">Content overview</h2>
            <div className="space-y-3 font-mono-tight text-sm">
              <div className="flex items-center justify-between">
                <span className="text-fg-muted">Apps published</span>
                <span>{apps.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-fg-muted">Projects published</span>
                <span>{projects.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-fg-muted">Blog posts</span>
                <span>{blogPosts.length}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10">
          <h2 className="mb-4 font-display text-lg font-semibold">Apps</h2>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-bg-elevated">
                <tr className="font-mono-tight text-xs uppercase text-fg-muted">
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Version</th>
                  <th className="px-4 py-3 font-medium">Downloads</th>
                  <th className="px-4 py-3 font-medium">Rating</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {apps.map((app) => (
                  <tr key={app.id}>
                    <td className="px-4 py-3 font-medium">{app.name}</td>
                    <td className="px-4 py-3">
                      <StatusChip status={app.status} />
                    </td>
                    <td className="px-4 py-3 font-mono-tight text-fg-muted">
                      v{app.versions[0]?.version}
                    </td>
                    <td className="px-4 py-3 font-mono-tight text-fg-muted">
                      {formatCompactNumber(app.downloadCount)}
                    </td>
                    <td className="px-4 py-3 font-mono-tight text-fg-muted">
                      {app.rating > 0 ? app.rating.toFixed(1) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-14">
          <p className="mb-1 font-mono-tight text-xs uppercase tracking-wide text-signal">
            Manage content
          </p>
          <h2 className="mb-6 font-display text-xl font-semibold">
            Add, edit, or remove
          </h2>
          <ErrorBoundary fallbackTitle="Couldn't load content manager">
            <Suspense fallback={<p className="text-sm text-fg-muted">Loading…</p>}>
              <AdminContentManager />
            </Suspense>
          </ErrorBoundary>
        </div>
      </div>
    </AdminGate>
  );
}
