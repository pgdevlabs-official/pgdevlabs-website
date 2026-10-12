"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { collection, getDocs, limit, orderBy, query } from "firebase/firestore";
import { auth, db } from "@/lib/firebaseConfig";
import { subscribeToProfile } from "@/lib/marketplaceService";
import type { MarketplaceProfile } from "@/types";

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  createdAt: unknown;
}

function dateLabel(value: unknown) {
  if (value && typeof value === "object" && "seconds" in value) {
    return new Date(Number(value.seconds) * 1000).toLocaleString();
  }
  return "Date unavailable";
}

export function ContactInbox() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<MarketplaceProfile | null>(null);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [refreshIndex, setRefreshIndex] = useState(0);

  useEffect(() => {
    if (!auth) return;
    return onAuthStateChanged(auth, setUser);
  }, []);

  useEffect(() => {
    setProfile(null);
    if (!user) return;
    return subscribeToProfile(user.uid, setProfile, (reason) => setError(reason.message));
  }, [user]);

  useEffect(() => {
    if (profile?.role !== "admin") {
      setMessages([]);
      return;
    }
    let current = true;
    setLoading(true);
    setError("");
    getDocs(query(
      collection(db, "contactMessages"),
      orderBy("createdAt", "desc"),
      limit(100)
    ))
      .then((snapshot) => {
        if (current) {
          setMessages(snapshot.docs.map((entry) => ({
            id: entry.id,
            ...entry.data(),
          }) as ContactMessage));
        }
      })
      .catch((reason: unknown) => {
        if (current) {
          setError(reason instanceof Error ? reason.message : "Could not load contact messages.");
        }
      })
      .finally(() => {
        if (current) setLoading(false);
      });
    return () => {
      current = false;
    };
  }, [profile, refreshIndex]);

  return (
    <section className="mt-10 rounded-2xl border border-border bg-bg-elevated p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-semibold">Contact inbox</h2>
          <p className="mt-1 text-sm text-fg-muted">Private messages submitted through the Contact page.</p>
        </div>
        {profile?.role === "admin" && (
          <button
            type="button"
            disabled={loading}
            onClick={() => setRefreshIndex((current) => current + 1)}
            className="rounded-xl border border-border px-3 py-2 text-sm disabled:opacity-50"
          >
            Refresh
          </button>
        )}
      </div>
      {error && <p role="alert" className="mt-4 text-sm text-danger">{error}</p>}
      {profile?.role !== "admin" ? (
        <p className="mt-4 text-sm text-fg-muted">Contact inbox access requires an administrator account.</p>
      ) : loading ? (
        <p className="mt-4 text-sm text-fg-muted">Loading messages…</p>
      ) : messages.length === 0 ? (
        <p className="mt-4 text-sm text-fg-muted">No contact messages yet.</p>
      ) : (
        <div className="mt-4 space-y-3">
          {messages.map((message) => (
            <article key={message.id} className="rounded-xl border border-border p-4">
              <div className="flex flex-wrap justify-between gap-2">
                <div className="text-sm font-medium">{message.name}</div>
                <time className="text-xs text-fg-muted">{dateLabel(message.createdAt)}</time>
              </div>
              <a className="mt-1 inline-block text-sm text-signal hover:underline" href={`mailto:${encodeURIComponent(message.email)}`}>
                {message.email}
              </a>
              <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-fg-muted">{message.message}</p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
