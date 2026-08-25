"use client";

import { useEffect, useState, type ReactNode } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from "firebase/auth";
import { Lock, LogOut } from "lucide-react";
import { auth } from "@/lib/firebaseConfig";
import { Button } from "@/components/ui/Button";

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL || "";

export function AdminGate({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [checking, setChecking] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setChecking(false);
    });
    return () => unsub();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
      if (ADMIN_EMAIL && cred.user.email?.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
        await signOut(auth);
        setError("This account isn't authorized for admin access.");
      }
    } catch {
      setError("Incorrect email or password.");
    } finally {
      setSubmitting(false);
      setPassword("");
    }
  }

  if (checking) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-sm flex-col items-center justify-center px-4 text-center">
        <p className="text-sm text-fg-muted">Checking access…</p>
      </div>
    );
  }

  const isAuthorized = user && (!ADMIN_EMAIL || user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase());

  if (isAuthorized) {
    return (
      <div>
        <div className="mx-auto flex max-w-6xl items-center justify-end px-4 pt-4 sm:px-6">
          <button
            onClick={() => signOut(auth)}
            className="flex items-center gap-1.5 font-mono-tight text-xs text-fg-muted hover:text-fg"
          >
            <LogOut size={13} /> Sign out ({user?.email})
          </button>
        </div>
        {children}
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-sm flex-col items-center justify-center px-4 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-signal/10 text-signal">
        <Lock size={18} />
      </div>
      <h1 className="mt-4 font-display text-xl font-semibold">Admin access</h1>
      <p className="mt-1 text-sm text-fg-muted">
        Sign in with your admin account to continue.
      </p>
      <form onSubmit={handleSubmit} className="mt-6 w-full space-y-3">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          autoComplete="username"
          className="w-full rounded-md border border-border bg-bg-elevated px-3 py-2.5 text-sm outline-none focus-visible:border-signal"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          autoComplete="current-password"
          className="w-full rounded-md border border-border bg-bg-elevated px-3 py-2.5 text-sm outline-none focus-visible:border-signal"
        />
        {error && <p className="text-xs text-danger">{error}</p>}
        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? "Signing in…" : "Sign in"}
        </Button>
      </form>
    </div>
  );
}