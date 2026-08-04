"use client";

import { useState, type ReactNode } from "react";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/Button";

const MAX_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 10;

export function AdminGate({ children }: { children: ReactNode }) {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (lockedUntil && Date.now() < lockedUntil) {
      setError(true);
      return;
    }

    const correctPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "demo";
    if (password === correctPassword) {
      setAuthed(true);
      setError(false);
      setAttempts(0);
      setLockedUntil(null);
    } else {
      const nextAttempts = attempts + 1;
      setAttempts(nextAttempts);
      setError(true);
      setPassword("");
      if (nextAttempts >= MAX_ATTEMPTS) {
        setLockedUntil(Date.now() + LOCKOUT_MINUTES * 60 * 1000);
      }
    }
  }

  if (authed) return <>{children}</>;

  const isLocked = lockedUntil !== null && Date.now() < lockedUntil;

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-sm flex-col items-center justify-center px-4 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-signal/10 text-signal">
        <Lock size={18} />
      </div>
      <h1 className="mt-4 font-display text-xl font-semibold">Admin access</h1>
      <p className="mt-1 text-sm text-fg-muted">Enter the admin password to continue.</p>
      <form onSubmit={handleSubmit} className="mt-6 w-full space-y-3">
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          disabled={isLocked}
          className="w-full rounded-md border border-border bg-bg-elevated px-3 py-2.5 text-sm outline-none focus-visible:border-signal disabled:opacity-50"
        />
        {error && !isLocked && (
          <p className="text-xs text-danger">
            Incorrect password. {MAX_ATTEMPTS - attempts} attempt{MAX_ATTEMPTS - attempts !== 1 ? "s" : ""} left.
          </p>
        )}
        {isLocked && (
          <p className="text-xs text-danger">
            Too many failed attempts. Try again in a few minutes.
          </p>
        )}
        <Button type="submit" className="w-full" disabled={isLocked}>
          Enter
        </Button>
      </form>
    </div>
  );
}