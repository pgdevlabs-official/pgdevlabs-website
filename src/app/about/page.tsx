import type { Metadata } from "next";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "About",
  description: "What PGDevLabs is, and why we build the way we do.",
};

const principles = [
  {
    title: "Ship, then iterate",
    body: "We put working software in front of real users fast, then fix what breaks in production — publicly, in the changelog.",
  },
  {
    title: "One team, full ownership",
    body: "No hand-offs between design, build, and support. Whoever builds a feature owns its bugs.",
  },
  {
    title: "Boring tech, interesting products",
    body: "We reach for proven tools — Firebase, Next.js — so the interesting problems get our attention, not the infrastructure.",
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
      <p className="font-mono-tight text-xs uppercase tracking-wide text-signal">About</p>
      <h1 className="mt-1 font-display text-3xl font-semibold sm:text-4xl">
        A small studio, on purpose
      </h1>
      <p className="mt-4 text-base leading-relaxed text-fg-muted sm:text-lg">
        PGDevLabs started as one developer building an app to solve a real
        problem — splitting shared expenses without the group-chat math. It
        grew into a small studio that builds mobile-first apps end to end:
        design, Firebase architecture, Play Store launch, and everything
        after.
      </p>

      <div className="mt-12 space-y-6">
        {principles.map((p) => (
          <div key={p.title} className="border-l-2 border-signal pl-5">
            <h2 className="font-display text-lg font-semibold">{p.title}</h2>
            <p className="mt-1.5 text-sm text-fg-muted">{p.body}</p>
          </div>
        ))}
      </div>

      <div className="mt-14 rounded-lg border border-border bg-bg-elevated p-8 text-center">
        <h2 className="font-display text-xl font-semibold">Want to build something together?</h2>
        <p className="mx-auto mt-2 max-w-sm text-sm text-fg-muted">
          We take on a small number of outside projects each year.
        </p>
        <div className="mt-5">
          <Button href="/contact">Get in touch</Button>
        </div>
      </div>
    </div>
  );
}
