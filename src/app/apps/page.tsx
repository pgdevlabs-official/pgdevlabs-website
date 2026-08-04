import type { Metadata } from "next";
import { getApps } from "@/lib/dataService";
import { AppsBrowser } from "@/components/shared/AppsBrowser";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Apps",
  description: "Browse every app PGDevLabs has shipped, is testing, or is currently building.",
};

export default async function AppsPage() {
  const apps = await getApps();

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <div className="mb-10">
        <p className="font-mono-tight text-xs uppercase tracking-wide text-signal">Apps</p>
        <h1 className="mt-1 font-display text-3xl font-semibold sm:text-4xl">
          Everything we&apos;ve shipped
        </h1>
        <p className="mt-3 max-w-lg text-sm text-fg-muted sm:text-base">
          Real apps, real users, real bugs fixed in production. Download the
          APK, read the changelog, or leave a review.
        </p>
      </div>

      <AppsBrowser apps={apps} />
    </div>
  );
}
