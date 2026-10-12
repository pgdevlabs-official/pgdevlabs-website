import type { Metadata } from "next";
import { LockKeyhole } from "lucide-react";
import { ContactForm } from "@/components/shared/ContactForm";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with PGDevLabs.",
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-lg px-4 py-12 sm:px-6 sm:py-16">
      <p className="font-mono-tight text-xs uppercase tracking-wide text-signal">Contact</p>
      <h1 className="mt-1 font-display text-3xl font-semibold sm:text-4xl">Get in touch</h1>
      <p className="mt-3 text-sm text-fg-muted sm:text-base">
        Bug report, feature idea, or a project you want to talk through —
        send the team a message using the form below.
      </p>

      <div className="mt-4 flex items-center gap-2 font-mono-tight text-xs text-fg-muted">
        <LockKeyhole size={13} /> Contact form submissions are private and visible only to administrators.
      </div>

      <div className="mt-8">
        <ErrorBoundary fallbackTitle="Couldn't load the contact form">
          <ContactForm />
        </ErrorBoundary>
      </div>
    </div>
  );
}
