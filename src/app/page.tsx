import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { AppCard } from "@/components/shared/AppCard";
import { ChangelogFeed } from "@/components/shared/ChangelogFeed";
import { MeshBackground } from "@/components/shared/MeshBackground";
import { AnimatedCounter } from "@/components/shared/AnimatedCounter";
import { getApps } from "@/lib/dataService";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const apps = await getApps();
  const featuredApps = apps.slice(0, 3);
  const shippedCount = apps.filter((a) => a.status === "SHIPPED").length;
  const totalDownloads = apps.reduce((sum, a) => sum + a.downloadCount, 0);
  const totalDownloadsK = Math.round(totalDownloads / 100) / 10;

  const tickerItems = [
    ...apps.map((a) => `${a.name} · v${a.versions[0]?.version} shipped`),
    "always building something",
    "bugs fixed in public",
    `${shippedCount} apps live right now`,
  ];

  return (
    <div className="overflow-hidden">
      {/* Hero */}
      <section className="relative">
        <MeshBackground />
        <div className="relative z-10 mx-auto max-w-6xl px-4 pb-20 pt-20 sm:px-6 sm:pt-28">
          <div className="grid items-center gap-12 lg:grid-cols-[1.15fr_1fr]">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-bg-elevated/80 px-3 py-1.5 font-mono-tight text-xs text-fg-muted backdrop-blur-sm">
                <span className="relative h-1.5 w-1.5 rounded-full bg-circuit pulse-dot" />
                {shippedCount} apps shipped and counting
              </div>
              <h1 className="font-display text-5xl font-bold leading-[0.98] tracking-tight sm:text-6xl lg:text-7xl">
                We ship apps.
                <br />
                <span className="gradient-text gradient-text-animate">
                  Not pitch decks.
                </span>
              </h1>
              <p className="mt-7 max-w-lg text-base text-fg-muted sm:text-lg">
                PGDevLabs is a small studio building real, working software —
                expense trackers, productivity tools, and whatever else needs
                building. Every release logged. Every bug owned.
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                <Button href="/apps" size="lg" className="shadow-lg shadow-signal/20">
                  Browse Apps <ArrowRight size={16} />
                </Button>
                <Button href="/about" variant="secondary" size="lg">
                  <Sparkles size={15} /> About the studio
                </Button>
              </div>
            </div>

            <ChangelogFeed apps={apps} />
          </div>
        </div>

        {/* Marquee ticker */}
        <div className="relative z-10 border-y border-border bg-bg-elevated/60 py-3 backdrop-blur-sm">
          <div className="overflow-hidden">
            <div className="marquee-track">
              {[...tickerItems, ...tickerItems].map((item, i) => (
                <span
                  key={i}
                  className="flex items-center gap-2 whitespace-nowrap px-6 font-mono-tight text-xs text-fg-muted"
                >
                  <span className="h-1 w-1 rounded-full bg-signal" />
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="bg-bg-elevated">
        <div className="mx-auto grid max-w-6xl grid-cols-3 divide-x divide-border px-4 py-10 sm:px-6">
          <Stat value={<AnimatedCounter target={shippedCount} />} label="Apps shipped" />
          <Stat
            value={<AnimatedCounter target={totalDownloadsK} suffix="k+" />}
            label="Total downloads"
          />
          <Stat value={<AnimatedCounter target={4.5} duration={1} />} label="Avg. rating" />
        </div>
      </section>

      {/* Featured apps */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <p className="font-mono-tight text-xs uppercase tracking-wide text-signal">
              Featured
            </p>
            <h2 className="mt-1 font-display text-3xl font-bold sm:text-4xl">
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

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
      <section className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
        <div className="glow-card relative overflow-hidden rounded-2xl border border-border bg-bg-elevated px-6 py-14 text-center sm:px-12">
          <div
            className="pointer-events-none absolute inset-0 opacity-40"
            style={{
              background:
                "radial-gradient(circle at 50% 0%, rgba(91,141,239,0.25), transparent 60%)",
            }}
          />
          <div className="relative">
            <h2 className="font-display text-3xl font-bold sm:text-4xl">
              Got an idea worth shipping?
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm text-fg-muted sm:text-base">
              We&apos;re always open to talking about what to build next.
            </p>
            <div className="mt-7">
              <Button href="/contact" size="lg">
                Get in touch
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function Stat({ value, label }: { value: React.ReactNode; label: string }) {
  return (
    <div className="px-4 text-center first:pl-0 last:pr-0 sm:text-left">
      <p className="font-display text-3xl font-bold sm:text-4xl">{value}</p>
      <p className="mt-1 font-mono-tight text-xs uppercase tracking-wide text-fg-muted">
        {label}
      </p>
    </div>
  );
}