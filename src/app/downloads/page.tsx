import type { Metadata } from "next";
import Link from "next/link";
import { Download } from "lucide-react";
import { getApps } from "@/lib/dataService";
import { StatusChip } from "@/components/ui/StatusChip";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Downloads",
  description: "Direct APK downloads for every PGDevLabs app.",
};

export default async function DownloadsPage() {
  const apps = await getApps();
  const downloadable = apps.filter((a) => a.status === "SHIPPED" || a.status === "BETA");

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
      <p className="font-mono-tight text-xs uppercase tracking-wide text-signal">Downloads</p>
      <h1 className="mt-1 font-display text-3xl font-semibold sm:text-4xl">
        Grab the latest build
      </h1>
      <p className="mt-3 max-w-lg text-sm text-fg-muted sm:text-base">
        Direct Android APK downloads. No Play Store account needed.
      </p>

      <div className="mt-10 divide-y divide-border rounded-lg border border-border">
        {downloadable.map((app) => {
          const latest = app.versions[0];
          return (
            <div key={app.id} className="flex items-center justify-between gap-4 p-4 sm:p-5">
              <div className="flex items-center gap-4 min-w-0">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-signal/10 font-display text-base font-bold text-signal">
                  {app.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <Link href={`/apps/${app.slug}`} className="truncate font-medium hover:text-signal">
                      {app.name}
                    </Link>
                    <StatusChip status={app.status} />
                  </div>
                  <p className="font-mono-tight text-xs text-fg-muted">
                    v{latest?.version} · {latest && formatDate(latest.date)}
                    {latest?.sizeMb ? ` · ${latest.sizeMb} MB` : ""}
                  </p>
                </div>
              </div>
              <a
                href={latest?.downloadUrl || "#"}
                target={latest?.downloadUrl ? "_blank" : undefined}
                rel={latest?.downloadUrl ? "noopener noreferrer" : undefined}
                className="flex shrink-0 items-center gap-1.5 rounded-md bg-signal px-3.5 py-2 text-xs font-medium text-white hover:brightness-110 sm:text-sm"
                {...(latest?.downloadUrl ? {} : { "aria-disabled": true })}
              >
                <Download size={14} /> {latest?.downloadUrl ? "APK" : "Coming soon"}
              </a>
            </div>
          );
        })}
      </div>

      <p className="mt-6 font-mono-tight text-xs text-fg-muted">
        Note: You may need to enable &ldquo;install from unknown sources&rdquo; in Android settings.
      </p>
    </div>
  );
}
