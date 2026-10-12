import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How PGDevLabs collects, uses, and protects your data.",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 sm:py-16">
      <p className="font-mono-tight text-xs uppercase tracking-wide text-signal">Legal</p>
      <h1 className="mt-1 font-display text-3xl font-semibold sm:text-4xl">Privacy Policy</h1>
      <p className="mt-2 font-mono-tight text-xs text-fg-muted">Last updated: August 2026</p>

      <div className="prose-content mt-8 space-y-6 text-sm leading-relaxed text-fg-muted">
        <section>
          <h2 className="mb-2 font-display text-lg font-semibold text-fg">1. Information we collect</h2>
          <p>
            We collect account information (email and display name) when you
            create an account, app usage data to improve our products, and
            information you submit voluntarily through contact or review forms.
          </p>
        </section>
        <section>
          <h2 className="mb-2 font-display text-lg font-semibold text-fg">2. How we use it</h2>
          <p>
            Your data is used to operate app features (like expense syncing in
            KharchaMate), respond to support requests, and improve product
            quality. We do not sell personal data to third parties.
          </p>
        </section>
        <section>
          <h2 className="mb-2 font-display text-lg font-semibold text-fg">3. Data storage</h2>
          <p>
            App data is stored securely using Firebase Firestore with
            production security rules restricting access to authenticated
            owners of that data. Contact form messages, including the name,
            email address, and message you provide, are stored in Firestore and
            can be read only by administrators for support.
          </p>
        </section>
        <section>
          <h2 className="mb-2 font-display text-lg font-semibold text-fg">4. Your rights</h2>
          <p>
            You can request account deletion or a data export at any time by
            contacting us through the Contact page.
          </p>
        </section>
        <section>
          <h2 className="mb-2 font-display text-lg font-semibold text-fg">5. Changes</h2>
          <p>
            We may update this policy as our products evolve. Material changes
            will be noted on this page.
          </p>
        </section>
      </div>
    </div>
  );
}
