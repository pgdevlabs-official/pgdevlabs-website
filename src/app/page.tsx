import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { AppCard } from "@/components/shared/AppCard";
import { ChangelogFeed } from "@/components/shared/ChangelogFeed";
import { getApps } from "@/lib/dataService";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const apps = await getApps();
  const featuredApps = apps.slice(0, 3);
  const shippedCount = apps.filter((a) => a.status === "SHIPPED").length;
  const totalDownloads = apps.reduce((sum, a) => sum + a.downloadCount, 0);

  return (
    <div>
      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 pb-16 pt-16 sm:px-6 sm:pt-24">
        <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-bg-elevated px-3 py-1 font-mono-tight text-xs text-fg-muted">
              <span className="h-1.5 w-1.5 rounded-full bg-circuit" />
              {shippedCount} apps shipped and counting
            </div>
            <h1 className="font-display text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
              We ship apps.
              <br />
              <span className="text-signal">Not pitch decks.</span>
            </h1>
            <p className="mt-6 max-w-lg text-base text-fg-muted sm:text-lg">
              PGDevLabs is a small studio building real, working software —
              expense trackers, productivity tools, and whatever else needs
              building. Every release logged. Every bug owned.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button href="/apps" size="lg">
                Browse Apps <ArrowRight size={16} />
              </Button>
              <Button href="/about" variant="secondary" size="lg">
                About the studio
              </Button>
            </div>
          </div>

          <ChangelogFeed apps={apps} />
        </div>
      </section>

      {/* Stats strip */}
      <section className="border-y border-border bg-bg-elevated">
        <div className="mx-auto grid max-w-6xl grid-cols-3 divide-x divide-border px-4 py-8 sm:px-6">
          <Stat label="Apps shipped" value={String(shippedCount)} />
          <Stat label="Total downloads" value={`${(totalDownloads / 1000).toFixed(1)}k+`} />
          <Stat label="Avg. rating" value="4.5" />
        </div>
      </section>

      {/* Featured apps */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="font-mono-tight text-xs uppercase tracking-wide text-signal">
              Featured
            </p>
            <h2 className="mt-1 font-display text-2xl font-semibold sm:text-3xl">
              What we&apos;re building
            </h2>
          </div>
          <Link
            href="/apps"
            className="hidden items-center gap-1 text-sm font-medium text-fg-muted hover:text-fg sm:flex"
          >
            View all <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featuredApps.map((app) => (
            <AppCard key={app.id} app={app} />
          ))}
        </div>

        <Link
          href="/apps"
          className="mt-6 flex items-center justify-center gap-1 text-sm font-medium text-fg-muted hover:text-fg sm:hidden"
        >
          View all apps <ArrowRight size={14} />
        </Link>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <div className="rounded-lg border border-border bg-bg-elevated px-6 py-12 text-center sm:px-12">
          <h2 className="font-display text-2xl font-semibold sm:text-3xl">
            Got an idea worth shipping?
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-fg-muted sm:text-base">
            We&apos;re always open to talking about what to build next.
          </p>
          <div className="mt-6">
            <Button href="/contact">Get in touch</Button>
          </div>
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-4 text-center first:pl-0 last:pr-0 sm:text-left">
      <p className="font-display text-2xl font-semibold sm:text-3xl">{value}</p>
      <p className="mt-1 font-mono-tight text-xs uppercase tracking-wide text-fg-muted">
        {label}
      </p>
    </div>
  );
}
