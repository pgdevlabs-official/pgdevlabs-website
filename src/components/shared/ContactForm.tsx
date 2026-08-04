"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    // In production this posts to a Firestore "messages" collection or an API route.
    setTimeout(() => setStatus("sent"), 1000);
  }

  if (status === "sent") {
    return (
      <div className="flex flex-col items-center gap-3 rounded-lg border border-border bg-bg-elevated py-12 text-center">
        <CheckCircle2 size={28} className="text-circuit" />
        <h3 className="font-display text-lg font-semibold">Message sent</h3>
        <p className="max-w-xs text-sm text-fg-muted">
          We read everything. Expect a reply within a couple of days.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1.5 block text-xs font-medium text-fg-muted">Name</label>
        <input
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full rounded-md border border-border bg-bg-elevated px-3 py-2.5 text-sm outline-none focus-visible:border-signal"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-medium text-fg-muted">Email</label>
        <input
          type="email"
          required
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="w-full rounded-md border border-border bg-bg-elevated px-3 py-2.5 text-sm outline-none focus-visible:border-signal"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-medium text-fg-muted">Message</label>
        <textarea
          required
          rows={5}
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          className="w-full rounded-md border border-border bg-bg-elevated px-3 py-2.5 text-sm outline-none focus-visible:border-signal"
        />
      </div>
      <Button type="submit" disabled={status === "sending"} className="w-full sm:w-auto">
        {status === "sending" ? "Sending…" : "Send message"}
      </Button>
    </form>
  );
}
