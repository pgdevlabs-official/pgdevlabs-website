"use client";

import { useState } from "react";
import { FirebaseError } from "firebase/app";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { db } from "@/lib/firebaseConfig";

export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const name = form.name.trim();
    const email = form.email.trim();
    const message = form.message.trim();
    if (name.length < 2 || name.length > 80) {
      setError("Enter a name between 2 and 80 characters.");
      return;
    }
    if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Enter a valid email address.");
      return;
    }
    if (!message || message.length > 5000) {
      setError("Enter a message between 1 and 5,000 characters.");
      return;
    }
    setStatus("sending");
    try {
      await addDoc(collection(db, "contactMessages"), {
        name,
        email,
        message,
        createdAt: serverTimestamp(),
      });
      setStatus("sent");
      setForm({ name: "", email: "", message: "" });
    } catch (reason) {
      setStatus("idle");
      setError(reason instanceof FirebaseError && reason.code === "permission-denied"
        ? "The contact form is temporarily unavailable. Please try again later."
        : reason instanceof Error
          ? `Message could not be sent: ${reason.message}`
          : "Message could not be sent. Please try again.");
    }
  }

  if (status === "sent") {
    return (
      <div className="flex flex-col items-center gap-3 rounded-lg border border-border bg-bg-elevated py-12 text-center">
        <CheckCircle2 size={28} className="text-circuit" />
        <h3 className="font-display text-lg font-semibold">Message sent</h3>
        <p className="max-w-xs text-sm text-fg-muted">
          Your message was saved to our private support inbox. We&apos;ll get back to you as soon as we can.
        </p>
        <Button variant="secondary" size="sm" onClick={() => setStatus("idle")}>
          Send another message
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="contact-name" className="mb-1.5 block text-xs font-medium text-fg-muted">Name</label>
        <input
          id="contact-name"
          required
          minLength={2}
          maxLength={80}
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full rounded-md border border-border bg-bg-elevated px-3 py-2.5 text-sm outline-none focus-visible:border-signal"
        />
      </div>
      <div>
        <label htmlFor="contact-email" className="mb-1.5 block text-xs font-medium text-fg-muted">Email</label>
        <input
          id="contact-email"
          type="email"
          required
          maxLength={254}
          autoComplete="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="w-full rounded-md border border-border bg-bg-elevated px-3 py-2.5 text-sm outline-none focus-visible:border-signal"
        />
      </div>
      <div>
        <label htmlFor="contact-message" className="mb-1.5 block text-xs font-medium text-fg-muted">Message</label>
        <textarea
          id="contact-message"
          required
          rows={5}
          maxLength={5000}
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          className="w-full rounded-md border border-border bg-bg-elevated px-3 py-2.5 text-sm outline-none focus-visible:border-signal"
        />
      </div>
      {error && <p role="alert" className="text-sm text-danger">{error}</p>}
      <Button type="submit" disabled={status === "sending"} className="w-full sm:w-auto">
        {status === "sending" ? "Sending…" : "Send message"}
      </Button>
    </form>
  );
}
