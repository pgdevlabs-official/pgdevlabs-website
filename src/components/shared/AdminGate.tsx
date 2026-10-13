"use client";

import { useEffect, useState, type ReactNode } from "react";
import {
  onAuthStateChanged,
  sendPasswordResetEmail,
  signOut,
  type User,
} from "firebase/auth";
import { FirebaseError } from "firebase/app";
import { Lock, LogOut } from "lucide-react";
import { auth } from "@/lib/firebaseConfig";
import { Button } from "@/components/ui/Button";
import { loginMarketplaceUser } from "@/lib/marketplaceService";

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL || "";

export function AdminGate({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [checking, setChecking] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [resetMessage, setResetMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sendingReset, setSendingReset] = useState(false);

  useEffect(() => {
    if (!auth) {
      setChecking(false);
      return;
    }
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setChecking(false);
    });
    return () => unsub();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setResetMessage("");
    if (!ADMIN_EMAIL) {
      setError("Admin access is disabled until NEXT_PUBLIC_ADMIN_EMAIL is configured.");
      return;
    }
    if (!auth) {
      setError("Configure Firebase keys in .env.local before signing in.");
      return;
    }
    setSubmitting(true);
    try {
      const signedInUser = await loginMarketplaceUser(email.trim(), password);
      if (signedInUser.email?.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
        await signOut(auth);
        setError("This account isn't authorized for admin access.");
      }
    } catch (reason) {
      if (reason instanceof FirebaseError && reason.code === "auth/invalid-credential") {
        setError("Email or password is incorrect.");
      } else if (reason instanceof FirebaseError && reason.code === "permission-denied") {
        setError("Firebase blocked admin profile setup. Confirm the deployed Firestore rules allow the configured admin email.");
      } else {
        setError(reason instanceof Error ? reason.message : "Admin sign-in failed.");
      }
    } finally {
      setSubmitting(false);
      setPassword("");
    }
  }

  async function handlePasswordReset() {
    setError("");
    setResetMessage("");
    if (!ADMIN_EMAIL) {
      setError("Admin password reset is unavailable until NEXT_PUBLIC_ADMIN_EMAIL is configured.");
      return;
    }
    if (!auth) {
      setError("Configure Firebase keys before requesting a password reset.");
      return;
    }
    const enteredEmail = email.trim();
    if (!enteredEmail) {
      setError("Enter your email address to request a password reset link.");
      return;
    }
    if (enteredEmail.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
      setError("Only the configured admin email address can request a password reset.");
      return;
    }

    setSendingReset(true);
    try {
      await sendPasswordResetEmail(auth, ADMIN_EMAIL);
      setResetMessage("If this admin account exists, a password reset link has been sent to its email address.");
    } catch (reason) {
      if (reason instanceof FirebaseError && reason.code === "auth/too-many-requests") {
        setError("Too many reset requests. Please wait a while and try again.");
      } else if (reason instanceof FirebaseError && reason.code === "auth/invalid-email") {
        setError("The configured admin email address is invalid.");
      } else {
        setError(reason instanceof Error ? reason.message : "Could not send a password reset email.");
      }
    } finally {
      setSendingReset(false);
    }
  }

  if (checking) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-sm flex-col items-center justify-center px-4 text-center">
        <p className="text-sm text-fg-muted">Checking access…</p>
      </div>
    );
  }

  const isAuthorized = Boolean(
    user && ADMIN_EMAIL && user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()
  );

  if (isAuthorized) {
    return (
      <div>
        <div className="mx-auto flex max-w-6xl items-center justify-end px-4 pt-4 sm:px-6">
          <button
            onClick={() => auth && signOut(auth)}
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
        {ADMIN_EMAIL
          ? "Sign in with your configured admin account to continue."
          : "Admin access is disabled. Configure NEXT_PUBLIC_ADMIN_EMAIL in .env.local and restart the server."}
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
        {resetMessage && <p role="status" className="text-xs text-circuit">{resetMessage}</p>}
        {error && <p className="text-xs text-danger">{error}</p>}
        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? "Signing in…" : "Sign in"}
        </Button>
        <button
          type="button"
          onClick={handlePasswordReset}
          disabled={sendingReset || submitting}
          className="w-full text-sm text-fg-muted underline-offset-4 hover:text-fg hover:underline disabled:opacity-50"
        >
          {sendingReset ? "Sending reset link…" : "Forgot password?"}
        </button>
      </form>
    </div>
  );
}