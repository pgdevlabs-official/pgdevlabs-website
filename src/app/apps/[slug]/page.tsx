import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Smartphone, Calendar, Tag } from "lucide-react";
import { getApps, getAppBySlug } from "@/lib/dataService";
import { StatusChip } from "@/components/ui/StatusChip";
import { RatingStars } from "@/components/ui/RatingStars";
import { DownloadButton } from "@/components/shared/DownloadButton";
import { VersionHistory } from "@/components/shared/VersionHistory";
import { ReviewsSection } from "@/components/shared/ReviewsSection";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";
import { AppCard } from "@/components/shared/AppCard";
import { formatDate, formatCompactNumber } from "@/lib/utils";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const app = await getAppBySlug(slug);
  if (!app) return {};
  return {
    title: app.name,
    description: app.tagline,
  };
}

export default async function AppDetailPage({ params }: Props) {
  const { slug } = await params;
  const app = await getAppBySlug(slug);
  if (!app) notFound();

  const allApps = await getApps();
  const related = allApps.filter((a) => a.slug !== app.slug).slice(0, 2);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
      <Link
        href="/apps"
        className="mb-6 inline-flex items-center gap-1 text-sm text-fg-muted hover:text-fg"
      >
        <ChevronLeft size={15} /> All apps
      </Link>

      {/* Header */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-signal/10 font-display text-2xl font-bold text-signal">
            {app.name.charAt(0)}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-2xl font-semibold sm:text-3xl">{app.name}</h1>
              <StatusChip status={app.status} />
            </div>
            <p className="mt-1 text-fg-muted">{app.tagline}</p>
            {app.rating > 0 && (
              <div className="mt-2 flex items-center gap-2">
                <RatingStars rating={app.rating} />
                <span className="font-mono-tight text-xs text-fg-muted">
                  {app.rating.toFixed(1)} · {app.reviewCount} reviews ·{" "}
                  {formatCompactNumber(app.downloadCount)} downloads
                </span>
              </div>
            )}
          </div>
        </div>
        <DownloadButton
          version={app.versions[0]?.version || "1.0.0"}
          downloadUrl={app.versions[0]?.downloadUrl}
        />
      </div>

      {/* Meta row */}
      <div className="mt-6 flex flex-wrap gap-4 border-y border-border py-4 font-mono-tight text-xs text-fg-muted">
        <span className="flex items-center gap-1.5">
          <Tag size={13} /> {app.category}
        </span>
        <span className="flex items-center gap-1.5">
          <Calendar size={13} /> Released {formatDate(app.releasedAt)}
        </span>
        {app.packageName && (
          <span className="flex items-center gap-1.5">
            <Smartphone size={13} /> {app.packageName}
          </span>
        )}
      </div>

      {/* Description */}
      <section className="mt-8">
        <h2 className="font-display text-xl font-semibold">About</h2>
        <p className="mt-3 leading-relaxed text-fg-muted">{app.description}</p>
        {app.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {app.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-bg-elevated px-2.5 py-1 font-mono-tight text-[11px] text-fg-muted"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </section>

      {/* Screenshots */}
      {app.screenshots.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-3 font-display text-xl font-semibold">Screenshots</h2>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {app.screenshots.map((src, i) => (
              <div
                key={i}
                className="h-64 w-32 shrink-0 rounded-lg border border-border bg-bg-elevated"
              />
            ))}
          </div>
        </section>
      )}

      {/* Version history */}
      <section className="mt-10">
        <h2 className="mb-3 font-display text-xl font-semibold">Version history</h2>
        <ErrorBoundary fallbackTitle="Couldn't load version history">
          <VersionHistory versions={app.versions} />
        </ErrorBoundary>
      </section>

      {/* Reviews */}
      <section className="mt-10">
        <ErrorBoundary fallbackTitle="Couldn't load reviews">
          <ReviewsSection reviews={app.reviews} />
        </ErrorBoundary>
      </section>

      {/* Related apps */}
      {related.length > 0 && (
        <section className="mt-14">
          <h2 className="mb-4 font-display text-xl font-semibold">More from PGDevLabs</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {related.map((a) => (
              <AppCard key={a.id} app={a} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
