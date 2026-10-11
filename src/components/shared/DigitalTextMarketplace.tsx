"use client";

import Image from "next/image";
import Link from "next/link";
import { FirebaseError } from "firebase/app";
import { onAuthStateChanged, reload, type User } from "firebase/auth";
import QRCode from "qrcode";
import { useCallback, useEffect, useMemo, useState } from "react";
import { auth } from "@/lib/firebaseConfig";
import { encodeMarketplaceImage } from "@/lib/marketplaceImages";
import {
  createDigitalTextListing,
  createDigitalTextOrder,
  fetchDigitalTextBuyerOrders,
  fetchDigitalTextCatalog,
  fetchDigitalTextSellerItem,
  fetchDigitalTextSellerDashboard,
  fetchPurchasedDigitalText,
  submitDigitalTextPaymentProof,
  type DigitalTextCatalog,
  type DigitalTextSellerDashboard,
} from "@/lib/digitalTextService";
import {
  loginMarketplaceUser,
  logoutMarketplaceUser,
  registerMarketplaceUser,
  resendMarketplaceEmailVerification,
  sendMarketplacePasswordReset,
  subscribeToProfile,
} from "@/lib/marketplaceService";
import type { DigitalTextOrder, MarketplaceProfile } from "@/types";

const merchantUpiId = process.env.NEXT_PUBLIC_MARKETPLACE_UPI_ID || "";
const fieldClass =
  "mt-1 w-full rounded-xl border border-border bg-bg px-3 py-2.5 text-sm text-fg outline-none focus:border-signal";

function dateLabel(value: unknown) {
  if (value && typeof value === "object" && "seconds" in value) {
    return new Date(Number(value.seconds) * 1000).toLocaleString();
  }
  const date = new Date(String(value || ""));
  return Number.isNaN(date.getTime()) ? "Date unavailable" : date.toLocaleString();
}

function money(value: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(value);
}

function errorMessage(error: unknown) {
  if (error instanceof FirebaseError) {
    if (error.code === "auth/email-already-in-use") return "This email already has an account. Choose Sign in and use that account password.";
    if (error.code === "auth/invalid-credential") return "Email or password is incorrect. Check both and try again.";
    if (error.code === "auth/weak-password") return "Choose a password with at least 6 characters.";
    if (error.code === "auth/invalid-email") return "Enter a valid email address.";
    if (error.code === "auth/network-request-failed") return "Network error. Check your internet connection and try again.";
    if (error.code === "firestore/permission-denied") return "Firebase blocked this action. Confirm the latest Firestore rules are deployed and your email is verified.";
  }
  return error instanceof Error ? error.message : "The request could not be completed.";
}

export function DigitalTextMarketplace() {
  const [user, setUser] = useState<User | null>(null);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [authForm, setAuthForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "buyer" as "buyer" | "seller" | "both",
  });
  const [verified, setVerified] = useState(false);
  const [profile, setProfile] = useState<MarketplaceProfile | null>(null);
  const [catalog, setCatalog] = useState<DigitalTextCatalog | null>(null);
  const [sellerData, setSellerData] = useState<DigitalTextSellerDashboard | null>(null);
  const [sellerItemTexts, setSellerItemTexts] = useState<Record<string, { mainText: string; relatedText: string }>>({});
  const [orders, setOrders] = useState<DigitalTextOrder[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [mainText, setMainText] = useState("");
  const [relatedText, setRelatedText] = useState("");
  const [loadingMore, setLoadingMore] = useState(false);
  const [activeOrder, setActiveOrder] = useState<{ id: string; total: number; expiresAt: number } | null>(null);
  const [activeQr, setActiveQr] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [utr, setUtr] = useState("");
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [purchasedText, setPurchasedText] = useState<Record<string, { id: string; mainText: string; relatedText: string }[]>>({});
  const [copied, setCopied] = useState("");
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const reloadCatalog = useCallback(async () => {
    try {
      const result = await fetchDigitalTextCatalog();
      setCatalog(result);
      setSelectedIds((current) => current.filter((id) => result.items.some((item) => item.id === id)));
    } catch (reason) {
      setError(errorMessage(reason));
    }
  }, []);

  const loadMoreCatalog = async () => {
    if (!catalog?.nextCursor || loadingMore) return;
    setLoadingMore(true);
    setError("");
    try {
      const next = await fetchDigitalTextCatalog(50, catalog.nextCursor);
      setCatalog((current) => current ? {
        ...next,
        items: [...current.items, ...next.items],
      } : next);
    } catch (reason) {
      setError(errorMessage(reason));
    } finally {
      setLoadingMore(false);
    }
  };

  const reloadOrders = useCallback(async () => {
    if (!user || !profile || !["buyer", "both"].includes(profile.role)) return;
    try {
      setOrders(await fetchDigitalTextBuyerOrders());
    } catch (reason) {
      setError(errorMessage(reason));
    }
  }, [user, profile]);

  useEffect(() => {
    const unsubscribeAuth = auth ? onAuthStateChanged(auth, setUser) : undefined;
    void reloadCatalog();
    return () => unsubscribeAuth?.();
  }, [reloadCatalog]);

  useEffect(() => {
    let current = true;
    if (!user) {
      setVerified(false);
      return;
    }
    reload(user)
      .then(() => {
        if (current) setVerified(user.emailVerified);
      })
      .catch((reason: Error) => {
        if (current) setError(reason.message);
      });
    return () => {
      current = false;
    };
  }, [user]);

  useEffect(() => {
    setProfile(null);
    if (!user) return;
    return subscribeToProfile(user.uid, setProfile, (reason) => setError(reason.message));
  }, [user]);

  useEffect(() => {
    void reloadOrders();
    if (!user || !profile || !["seller", "both"].includes(profile.role)) {
      setSellerData(null);
      return;
    }
    let current = true;
    fetchDigitalTextSellerDashboard()
      .then((result) => {
        if (current) setSellerData(result);
      })
      .catch((reason: unknown) => {
        if (current) setError(errorMessage(reason));
      });
    return () => {
      current = false;
    };
  }, [user, profile, reloadOrders]);

  useEffect(() => {
    if (!activeOrder) {
      setSecondsLeft(0);
      setActiveQr("");
      return;
    }
    const update = () => setSecondsLeft(Math.max(0, Math.ceil((activeOrder.expiresAt - Date.now()) / 1000)));
    update();
    const interval = window.setInterval(update, 1000);
    if (!merchantUpiId) {
      setError("Marketplace UPI ID is not configured. Contact the administrator.");
      return () => window.clearInterval(interval);
    }
    const payment = new URLSearchParams({
      pa: merchantUpiId,
      pn: "PGDevLabs",
      am: activeOrder.total.toFixed(2),
      cu: "INR",
      tn: `Text order ${activeOrder.id.slice(-8)}`,
    });
    QRCode.toDataURL(`upi://pay?${payment.toString()}`, { errorCorrectionLevel: "H", margin: 2, width: 220 })
      .then(setActiveQr)
      .catch((reason: Error) => setError(`Could not generate the payment QR: ${reason.message}`));
    return () => window.clearInterval(interval);
  }, [activeOrder]);

  const total = useMemo(() => selectedIds.length * (catalog?.customerPrice ?? 0), [catalog?.customerPrice, selectedIds.length]);

  const run = async (action: () => Promise<void | string>, success: string) => {
    setLoading(true);
    setError("");
    setNotice("");
    try {
      const actionNotice = await action();
      setNotice(actionNotice || success);
    } catch (reason) {
      setError(errorMessage(reason));
    } finally {
      setLoading(false);
    }
  };

  const submitAuth = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void run(async () => {
      if (authMode === "register") {
        await registerMarketplaceUser(authForm.name, authForm.email, authForm.password, authForm.role);
        setAuthForm((current) => ({ ...current, password: "" }));
      } else {
        await loginMarketplaceUser(authForm.email, authForm.password);
        setAuthForm((current) => ({ ...current, password: "" }));
      }
    }, authMode === "register"
      ? "Account created. Check your email, verify it, then return here to use the marketplace."
      : "Signed in successfully.");
  };

  const resetPassword = () => {
    if (!authForm.email.trim()) {
      setError("Enter your account email first.");
      return;
    }
    void run(
      () => sendMarketplacePasswordReset(authForm.email),
      "If an account exists for this email, Firebase has sent a password-reset link. Check your inbox and spam folder."
    );
  };

  const submitListing = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void run(async () => {
      const result = await createDigitalTextListing(mainText, relatedText);
      if (result.duplicate) throw new Error("This text matches an existing or previously submitted item.");
      setMainText("");
      setRelatedText("");
      setSellerData(await fetchDigitalTextSellerDashboard());
      if (result.status === "available") {
        await reloadCatalog();
        return "Item is live in the buyer catalog.";
      }
      return "Item submitted. It is pending admin approval, so it will not appear in the buyer catalog until approved.";
    }, "Your unique text item was submitted.");
  };

  const checkout = () => {
    void run(async () => {
      const order = await createDigitalTextOrder(selectedIds);
      setActiveOrder(order);
      setSelectedIds([]);
      setUtr("");
      setProofFile(null);
      await reloadCatalog();
    }, "Items reserved. Complete UPI payment only while the QR timer is running.");
  };

  const submitProof = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!activeOrder || !proofFile || !utr.trim()) {
      setError("Enter the UPI reference number and attach the payment screenshot.");
      return;
    }
    void run(async () => {
      const screenshot = await encodeMarketplaceImage(proofFile, "payment-proofs");
      await submitDigitalTextPaymentProof(activeOrder.id, utr, screenshot);
      setActiveOrder(null);
      await reloadOrders();
      await reloadCatalog();
    }, "Payment details sent. The screenshot is not proof of payment; admin will verify the transaction independently.");
  };

  const revealPurchase = (orderId: string) => {
    void run(async () => {
      const contents = await fetchPurchasedDigitalText(orderId);
      setPurchasedText((current) => ({ ...current, [orderId]: contents }));
    }, "Verified purchase content loaded.");
  };

  const revealSellerItem = (itemId: string) => {
    void run(async () => {
      const item = await fetchDigitalTextSellerItem(itemId);
      setSellerItemTexts((current) => ({ ...current, [itemId]: item }));
    }, "Your listing text loaded.");
  };

  const copyText = async (key: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(key);
      window.setTimeout(() => setCopied(""), 1800);
    } catch {
      setError("Clipboard access was blocked. Select and copy the text manually.");
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <section className="digital-market-hero">
        <div className="digital-market-copy">
          <p className="font-mono-tight text-xs uppercase tracking-[0.18em] text-signal">PGDevLabs · Unique digital marketplace</p>
          <h1 className="mt-4 max-w-2xl font-display text-4xl font-semibold leading-[1.04] tracking-tight sm:text-6xl">
            One original.<br /><span className="text-signal">One owner.</span>
          </h1>
          <p className="mt-5 max-w-xl text-sm leading-6 text-fg-muted sm:text-base">
            Discover one-of-a-kind text items. Sellers submit two text fields; you see only a safe preview until payment is checked and your purchase is verified.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <a href="#available-items" className="rounded-xl bg-signal px-5 py-3 text-sm font-semibold text-bg transition hover:brightness-110">Explore unique items</a>
            <a href="#seller-dashboard" className="rounded-xl border border-border px-5 py-3 text-sm font-medium text-fg transition hover:bg-white/5">Sell your text</a>
          </div>
          <div className="mt-7 flex flex-wrap gap-x-6 gap-y-2 text-xs text-fg-muted">
            <span>✓ One-time inventory</span>
            <span>✓ Protected full text</span>
            <span>✓ Admin-verified UPI</span>
          </div>
        </div>
        <div className="digital-market-art" aria-hidden="true">
          <div className="digital-art-orbit digital-art-orbit-back" />
          <div className="digital-art-orbit digital-art-orbit-front" />
          <div className="digital-art-card digital-art-card-back"><span>RELATED TEXT</span><i /></div>
          <div className="digital-art-card digital-art-card-front">
            <span className="digital-art-kicker">UNIQUE ITEM · 001</span>
            <strong>A thought,<br />kept original.</strong>
            <i /><i /><i />
            <span className="digital-art-lock">LOCKED UNTIL VERIFIED</span>
          </div>
          <span className="digital-art-dot digital-art-dot-one" />
          <span className="digital-art-dot digital-art-dot-two" />
        </div>
      </section>

      {!user && (
        <section id="account-access" className="mt-6 scroll-mt-28 rounded-2xl border border-border bg-bg-elevated p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="font-display text-xl font-semibold">Join the marketplace</h2>
              <p className="mt-1 text-sm text-fg-muted">Browse previews freely. Sign in to buy or sell; verify your email before using either feature.</p>
            </div>
            <div className="flex gap-2" role="group" aria-label="Account action">
              <button type="button" onClick={() => setAuthMode("login")} aria-pressed={authMode === "login"} className={`rounded-xl px-3 py-2 text-sm ${authMode === "login" ? "bg-signal text-white" : "border border-border"}`}>Sign in</button>
              <button type="button" onClick={() => setAuthMode("register")} aria-pressed={authMode === "register"} className={`rounded-xl px-3 py-2 text-sm ${authMode === "register" ? "bg-signal text-white" : "border border-border"}`}>Create account</button>
            </div>
          </div>
          {!auth ? (
            <p role="alert" className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm">
              Firebase Authentication is not configured. Add the Firebase web app settings to <code>.env.local</code> and restart the site.
            </p>
          ) : (
            <form onSubmit={submitAuth} className="mt-5 grid gap-4 sm:grid-cols-2">
              {authMode === "register" && (
                <>
                  <label className="text-sm">Name<input className={fieldClass} autoComplete="name" value={authForm.name} onChange={(event) => setAuthForm((current) => ({ ...current, name: event.target.value }))} minLength={2} maxLength={80} required /></label>
                  <label className="text-sm">I want to
                    <select className={fieldClass} value={authForm.role} onChange={(event) => setAuthForm((current) => ({ ...current, role: event.target.value as "buyer" | "seller" | "both" }))}>
                      <option value="buyer">Buy items</option>
                      <option value="seller">Sell items</option>
                      <option value="both">Buy and sell</option>
                    </select>
                  </label>
                </>
              )}
              <label className="text-sm">Email<input className={fieldClass} type="email" autoComplete="email" value={authForm.email} onChange={(event) => setAuthForm((current) => ({ ...current, email: event.target.value }))} required /></label>
              <label className="text-sm">Password<input className={fieldClass} type="password" autoComplete={authMode === "login" ? "current-password" : "new-password"} value={authForm.password} onChange={(event) => setAuthForm((current) => ({ ...current, password: event.target.value }))} minLength={6} required /></label>
              <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
                <button type="submit" disabled={loading} className="rounded-xl bg-signal px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50">
                  {loading ? "Please wait…" : authMode === "login" ? "Sign in" : "Create account"}
                </button>
                {authMode === "login" && <button type="button" disabled={loading} onClick={resetPassword} className="text-sm text-signal hover:underline">Forgot password?</button>}
              </div>
            </form>
          )}
        </section>
      )}
      {user && !verified && (
        <div className="mt-6 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5">
          <p className="text-sm">Verify your email to use the digital-text marketplace. After verifying, refresh your status below.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" disabled={loading} onClick={() => void run(
              () => resendMarketplaceEmailVerification(),
              "Verification email sent. Check your inbox and spam folder."
            )} className="rounded-xl border border-amber-500/40 px-3 py-2 text-sm">
              Resend verification email
            </button>
            <button type="button" disabled={loading} onClick={() => void run(async () => {
              await reload(user);
              setVerified(user.emailVerified);
            }, "Email verification status refreshed.")} className="rounded-xl border border-amber-500/40 px-3 py-2 text-sm">
              I verified my email — refresh
            </button>
          </div>
        </div>
      )}
      {user && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm">
          <span className="text-fg-muted">Signed in as {user.email}</span>
          <button type="button" disabled={loading} onClick={() => void run(
            () => logoutMarketplaceUser(),
            "Signed out."
          )} className="rounded-xl border border-border px-3 py-2 hover:bg-white/5">
            Sign out
          </button>
        </div>
      )}
      {profile?.role === "admin" && (
        <div className="mt-6 rounded-2xl border border-border bg-bg-elevated p-5">
          <p className="text-sm text-fg-muted">Manage digital-text prices, listings, payments, and seller payouts in the admin dashboard.</p>
          <Link className="mt-3 inline-flex text-sm font-medium text-signal hover:underline" href="/admin">
            Open admin dashboard
          </Link>
        </div>
      )}

      {notice && <p role="status" className="mt-5 rounded-xl border border-green-500/30 bg-green-500/10 p-3 text-sm text-green-700">{notice}</p>}
      {error && <p role="alert" className="mt-5 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-700">{error}</p>}

      <section id="available-items" className="mt-8 scroll-mt-28 rounded-2xl border border-border bg-bg-elevated p-5 sm:p-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-xl font-semibold">Available items</h2>
            <p className="mt-1 text-sm text-fg-muted">
              {catalog?.items.length ?? 0} available item(s) loaded
              {catalog?.customerPrice ? ` · ${money(catalog.customerPrice)} each` : ""}
            </p>
          </div>
          <button type="button" onClick={() => void reloadCatalog()} className="rounded-xl border border-border px-3 py-2 text-sm hover:bg-white/5">
            Refresh listings
          </button>
        </div>
        {!catalog?.items.length ? (
          <p className="mt-5 rounded-xl border border-dashed border-border p-5 text-sm text-fg-muted">
            {catalog ? "No items are available right now." : "Loading safe previews…"}
          </p>
        ) : (
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {catalog.items.map((item) => {
              const selected = selectedIds.includes(item.id);
              return (
                <label key={item.id} className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 ${selected ? "border-signal bg-signal/5" : "border-border"}`}>
                  <input
                    type="checkbox"
                    checked={selected}
                    disabled={!user || !verified || profile?.role === "seller"}
                    onChange={() => setSelectedIds((current) =>
                      selected ? current.filter((id) => id !== item.id) : [...current, item.id]
                    )}
                    className="mt-1 accent-signal"
                    aria-label={`Select unique text item ${item.id}`}
                  />
                  <span className="min-w-0">
                    <span className="block text-xs font-mono-tight text-fg-muted">Item {item.id.slice(0, 8)}</span>
                    <span className="mt-2 block text-sm leading-5">{item.preview}</span>
                    <span className="mt-2 block text-sm font-semibold">{money(catalog.customerPrice)}</span>
                  </span>
                </label>
              );
            })}
            {catalog.nextCursor && (
              <button type="button" disabled={loadingMore} onClick={() => void loadMoreCatalog()} className="mt-4 rounded-xl border border-border px-4 py-2.5 text-sm disabled:opacity-50">
                {loadingMore ? "Loading…" : "Load more items"}
              </button>
            )}
          </div>
        )}
        {verified && selectedIds.length > 0 && (
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
            <p className="text-sm">{selectedIds.length} different item(s) · <strong>{money(total)}</strong></p>
            <button type="button" disabled={loading} onClick={checkout} className="rounded-xl bg-signal px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50">
              {loading ? "Reserving…" : "Reserve and pay"}
            </button>
          </div>
        )}
      </section>

      {activeOrder && (
        <section className="mt-6 rounded-2xl border border-signal/40 bg-bg-elevated p-5 sm:p-6">
          <h2 className="font-display text-xl font-semibold">Order {activeOrder.id.slice(-8)}</h2>
          <p className="mt-1 text-sm text-fg-muted">Total {money(activeOrder.total)} · QR time remaining: {Math.floor(secondsLeft / 60)}:{String(secondsLeft % 60).padStart(2, "0")}</p>
          {secondsLeft > 0 && activeQr ? (
            <Image src={activeQr} alt="UPI payment QR code" width={220} height={220} unoptimized className="mt-4 rounded-xl bg-white p-2" />
          ) : (
            <p className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm">
              QR timer ended. Do not pay using an old QR. The reservation is held for safe payment reconciliation; contact admin before trying again.
            </p>
          )}
          <form onSubmit={submitProof} className="mt-5 grid gap-3 sm:max-w-xl">
            <label className="text-sm">UPI reference / UTR<input className={fieldClass} value={utr} onChange={(event) => setUtr(event.target.value)} minLength={6} maxLength={80} required /></label>
            <label className="text-sm">Payment screenshot (for review only)<input className={fieldClass} type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => setProofFile(event.currentTarget.files?.[0] ?? null)} required /></label>
            <p className="text-xs leading-5 text-fg-muted">A screenshot or UTR does not confirm payment. Admin checks the bank/UPI transaction independently. After the QR timer ends, submit proof only if you already paid before it expired.</p>
            <button disabled={loading || !proofFile || !utr.trim()} className="w-fit rounded-xl border border-border px-4 py-2.5 text-sm font-medium disabled:opacity-50">
              {loading ? "Submitting…" : "I have paid — send for verification"}
            </button>
          </form>
        </section>
      )}

      {user && verified && profile && ["seller", "both"].includes(profile.role) && (
        <section id="seller-dashboard" className="mt-8 scroll-mt-28 grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <form onSubmit={submitListing} className="rounded-2xl border border-border bg-bg-elevated p-5 sm:p-6">
            <h2 className="font-display text-xl font-semibold">Submit a unique item</h2>
            <p className="mt-1 text-sm text-fg-muted">Price is administrator-controlled. Existing and sold text remains in the duplicate registry. If approval is enabled, buyers see the item only after an admin approves it.</p>
            <label className="mt-4 block text-sm">Main Text<textarea className={fieldClass} rows={6} maxLength={MAX_TEXT_LENGTH} value={mainText} onChange={(event) => setMainText(event.target.value)} required /></label>
            <label className="mt-4 block text-sm">Related Text<textarea className={fieldClass} rows={6} maxLength={MAX_TEXT_LENGTH} value={relatedText} onChange={(event) => setRelatedText(event.target.value)} required /></label>
            <p className="mt-2 text-xs text-fg-muted">Each field supports up to 20,000 characters. Text is normalized for Unicode and line endings; comparison is case-sensitive.</p>
            <button disabled={loading || !mainText.trim() || !relatedText.trim()} className="mt-4 rounded-xl bg-signal px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50">
              {loading ? "Checking…" : "Check uniqueness and submit"}
            </button>
          </form>

          <div className="space-y-6">
            <section className="rounded-2xl border border-border bg-bg-elevated p-5 sm:p-6">
              <h2 className="font-display text-xl font-semibold">My submitted items</h2>
              {!sellerData?.items.length ? <p className="mt-3 text-sm text-fg-muted">No submitted items yet.</p> : (
                <div className="mt-4 space-y-3">
                  {sellerData.items.map((item) => (
                    <article key={item.id} className="rounded-xl border border-border p-3">
                      <div className="flex flex-wrap justify-between gap-2 text-sm">
                        <span className="font-mono-tight">Item {item.id.slice(0, 8)}</span>
                        <span className="rounded-full bg-white/5 px-2 py-1 text-xs">
                          {item.status === "under_review" ? "Waiting for admin approval" : item.status.replaceAll("_", " ")}
                        </span>
                      </div>
                      {sellerItemTexts[item.id] ? (
                        <div className="mt-3 space-y-2">
                          <p className="text-xs font-medium">Main Text</p>
                          <pre className="whitespace-pre-wrap break-words text-xs">{sellerItemTexts[item.id].mainText}</pre>
                          <p className="text-xs font-medium">Related Text</p>
                          <pre className="whitespace-pre-wrap break-words text-xs">{sellerItemTexts[item.id].relatedText}</pre>
                        </div>
                      ) : (
                        <button type="button" disabled={loading} onClick={() => revealSellerItem(item.id)} className="mt-2 text-xs text-signal hover:underline">
                          View my submitted text
                        </button>
                      )}
                    </article>
                  ))}
                </div>
              )}
              {sellerData?.items.some((item) => item.status === "under_review") && (
                <Link href="/admin#digital-text-inventory" className="mt-3 inline-flex text-sm text-signal hover:underline">
                  Admin: review pending items
                </Link>
              )}
            </section>
            <section className="rounded-2xl border border-border bg-bg-elevated p-5 sm:p-6">
              <h2 className="font-display text-xl font-semibold">Sales and earnings</h2>
              {!sellerData?.sales.length ? <p className="mt-3 text-sm text-fg-muted">No completed sales yet.</p> : (
                <div className="mt-4 space-y-3">
                  {sellerData.sales.map((sale) => (
                    <article key={sale.itemId} className="flex flex-wrap justify-between gap-2 rounded-xl border border-border p-3 text-sm">
                      <span>Order {sale.orderId.slice(-8)} · {dateLabel(sale.createdAt)}</span>
                      <span>{money(sale.sellerEarning)} · payout {sale.payoutStatus}</span>
                    </article>
                  ))}
                </div>
              )}
              {Boolean(sellerData?.rejections.length) && (
                <p className="mt-3 text-sm text-amber-700">
                  {sellerData?.rejections.length} duplicate submission(s) were rejected and recorded.
                </p>
              )}
            </section>
          </div>
        </section>
      )}

      {user && verified && profile && ["buyer", "both"].includes(profile.role) && (
        <section className="mt-8 rounded-2xl border border-border bg-bg-elevated p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-xl font-semibold">My purchases</h2>
            <button type="button" onClick={() => void reloadOrders()} className="rounded-xl border border-border px-3 py-2 text-sm">Refresh</button>
          </div>
          {!orders.length ? <p className="mt-3 text-sm text-fg-muted">No purchases yet.</p> : (
            <div className="mt-4 space-y-3">
              {orders.map((order) => (
                <article key={order.id} className="rounded-xl border border-border p-4">
                  <div className="flex flex-wrap justify-between gap-2 text-sm">
                    <span>Order {order.id.slice(-8)} · {order.itemIds.length} item(s)</span>
                    <span>{money(order.total)} · {order.status.replaceAll("_", " ")}</span>
                  </div>
                  <p className="mt-1 text-xs text-fg-muted">{dateLabel(order.createdAt)}</p>
                  {order.status === "confirmed" && (
                    purchasedText[order.id] ? (
                      <div className="mt-4 space-y-4">
                        {purchasedText[order.id].map((item) => (
                          <div key={item.id} className="rounded-xl bg-white/5 p-3">
                            <div className="flex flex-wrap justify-between gap-2 text-xs">
                              <span>Item {item.id.slice(0, 8)} · Main Text</span>
                              <button type="button" onClick={() => void copyText(`${item.id}-main`, item.mainText)} className="text-signal hover:underline">
                                {copied === `${item.id}-main` ? "Copied!" : "Copy"}
                              </button>
                            </div>
                            <pre className="mt-2 whitespace-pre-wrap break-words text-sm">{item.mainText}</pre>
                            <div className="mt-4 flex flex-wrap justify-between gap-2 text-xs">
                              <span>Related Text</span>
                              <button type="button" onClick={() => void copyText(`${item.id}-related`, item.relatedText)} className="text-signal hover:underline">
                                {copied === `${item.id}-related` ? "Copied!" : "Copy"}
                              </button>
                            </div>
                            <pre className="mt-2 whitespace-pre-wrap break-words text-sm">{item.relatedText}</pre>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <button type="button" disabled={loading} onClick={() => revealPurchase(order.id)} className="mt-3 rounded-xl bg-signal px-3 py-2 text-sm text-white disabled:opacity-50">
                        View purchased text
                      </button>
                    )
                  )}
                </article>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}

const MAX_TEXT_LENGTH = 20000;
