import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms and conditions for using PGDevLabs apps and services.",
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 sm:py-16">
      <p className="font-mono-tight text-xs uppercase tracking-wide text-signal">Legal</p>
      <h1 className="mt-1 font-display text-3xl font-semibold sm:text-4xl">Terms of Service</h1>
      <p className="mt-2 font-mono-tight text-xs text-fg-muted">Last updated: August 2026</p>

      <div className="mt-8 space-y-6 text-sm leading-relaxed text-fg-muted">
        <section>
          <h2 className="mb-2 font-display text-lg font-semibold text-fg">1. Acceptance of terms</h2>
          <p>
            By downloading, installing, or using any PGDevLabs app or visiting
            this website, you agree to these terms.
          </p>
        </section>
        <section>
          <h2 className="mb-2 font-display text-lg font-semibold text-fg">2. Use of apps</h2>
          <p>
            Our apps are provided as-is. Beta and in-development apps may
            contain bugs and are not guaranteed to be stable. We recommend
            keeping backups of important data.
          </p>
        </section>
        <section>
          <h2 className="mb-2 font-display text-lg font-semibold text-fg">3. Premium features</h2>
          <p>
            Some apps offer optional premium subscriptions. Subscription terms,
            pricing, and cancellation policies are described within the
            relevant app at time of purchase.
          </p>
        </section>
        <section>
          <h2 className="mb-2 font-display text-lg font-semibold text-fg">4. User content</h2>
          <p>
            Reviews and feedback you submit may be displayed publicly. Don&apos;t
            submit anything you don&apos;t have the right to share.
          </p>
        </section>
        <section>
          <h2 className="mb-2 font-display text-lg font-semibold text-fg">5. Limitation of liability</h2>
          <p>
            PGDevLabs is not liable for indirect or incidental damages arising
            from use of our apps, to the extent permitted by law.
          </p>
        </section>
      </div>
    </div>
  );
}
