"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "@/lib/firebaseConfig";
import {
  digitalTextAdminAction,
  fetchDigitalTextAdminPaymentProof,
  fetchDigitalTextAdminSellerPayoutQr,
  fetchDigitalTextAdminDashboard,
  type DigitalTextAdminDashboard,
} from "@/lib/digitalTextService";
import { subscribeToProfile } from "@/lib/marketplaceService";
import type { DigitalTextOrder, MarketplaceProfile } from "@/types";

const inputClass =
  "mt-1 w-full rounded-xl border border-border bg-bg px-3 py-2.5 text-sm text-fg outline-none focus:border-signal";
const statuses = ["all", "available", "reserved", "under_review", "sold", "disabled"] as const;
const configuredMarketplaceUpiId = process.env.NEXT_PUBLIC_MARKETPLACE_UPI_ID || "";

function money(value: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(value);
}

function dateLabel(value: unknown) {
  if (value && typeof value === "object" && "seconds" in value) {
    return new Date(Number(value.seconds) * 1000).toLocaleString();
  }
  return new Date(String(value || "")).toLocaleString();
}

function orderIsExpired(order: DigitalTextOrder) {
  const expiresAt = typeof order.expiresAt === "number"
    ? order.expiresAt
    : Number(order.expiresAt.seconds) * 1000;
  return expiresAt <= Date.now();
}

export function DigitalTextAdminPanel() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<MarketplaceProfile | null>(null);
  const [dashboard, setDashboard] = useState<DigitalTextAdminDashboard | null>(null);
  const [proofs, setProofs] = useState<Record<string, { utr: string; screenshot: string }>>({});
  const [payoutQrs, setPayoutQrs] = useState<Record<string, string | null>>({});
  const [price, setPrice] = useState("");
  const [earning, setEarning] = useState("");
  const [reservationMinutes, setReservationMinutes] = useState("5");
  const [approvalRequired, setApprovalRequired] = useState(false);
  const [marketplaceUpiId, setMarketplaceUpiId] = useState(configuredMarketplaceUpiId);
  const [filter, setFilter] = useState<(typeof statuses)[number]>("all");
  const [search, setSearch] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (!auth) return;
    return onAuthStateChanged(auth, setUser);
  }, []);

  useEffect(() => {
    setProfile(null);
    if (!user) return;
    return subscribeToProfile(user.uid, setProfile, (reason) => setError(reason.message));
  }, [user]);

  const refresh = useCallback(async () => {
    if (profile?.role !== "admin") return;
    setError("");
    try {
      const result = await fetchDigitalTextAdminDashboard();
      setDashboard(result);
      setPrice(result.pricing ? String(result.pricing.customerPrice) : "");
      setEarning(result.pricing ? String(result.pricing.sellerEarning) : "");
      setReservationMinutes(result.pricing ? String(result.pricing.reservationMinutes ?? 5) : "5");
      setApprovalRequired(result.pricing?.approvalRequired ?? false);
      setMarketplaceUpiId(result.pricing?.marketplaceUpiId || configuredMarketplaceUpiId);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not load marketplace administration.");
    }
  }, [profile]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const filteredInventory = useMemo(() => {
    const query = search.trim().toLowerCase();
    return (dashboard?.inventory ?? []).filter((item) =>
      (filter === "all" || item.status === filter) &&
      (!query || item.id.toLowerCase().includes(query) || item.sellerId.toLowerCase().includes(query))
    );
  }, [dashboard, filter, search]);

  const runAction = async (
    action: Parameters<typeof digitalTextAdminAction>[0],
    success: string
  ) => {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await digitalTextAdminAction(action);
      setNotice(success);
      await refresh();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Admin action failed.");
    } finally {
      setBusy(false);
    }
  };

  const savePricing = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const customerPrice = Number(price);
    const sellerEarning = Number(earning);
    const timeout = Number(reservationMinutes);
    const upiId = marketplaceUpiId.trim();
    if (!Number.isFinite(customerPrice) || !Number.isFinite(sellerEarning) ||
        !Number.isInteger(timeout) || timeout < 1 || timeout > 60 ||
        customerPrice <= 0 || sellerEarning < 0 || sellerEarning > customerPrice) {
      setError("Set a positive customer price, seller earning between zero and that price, and a timeout from 1 to 60 minutes.");
      return;
    }
    if (!/^[A-Za-z0-9._-]{2,256}@[A-Za-z0-9.-]{2,64}$/.test(upiId)) {
      setError("Enter a valid marketplace UPI ID, such as name@bank.");
      return;
    }
    void runAction({
      action: "setPricing",
      customerPrice,
      sellerEarning,
      reservationMinutes: timeout,
      approvalRequired,
      marketplaceUpiId: upiId,
    }, "Pricing and marketplace UPI ID saved. Existing orders retain their original snapshots.");
  };

  const confirmPayment = (orderId: string) => {
    if (!window.confirm("Confirm only after independently matching this amount and UTR in your bank/UPI app. A screenshot alone is not proof. Did you verify the payment was received?")) return;
    void runAction({ action: "confirmPayment", orderId, bankVerifiedPayment: true }, "Payment verified; unique text was delivered to the buyer.");
  };

  const loadPaymentProof = async (orderId: string) => {
    setError("");
    setBusy(true);
    try {
      const proof = await fetchDigitalTextAdminPaymentProof(orderId);
      setProofs((current) => ({ ...current, [orderId]: proof }));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not load payment proof.");
    } finally {
      setBusy(false);
    }
  };

  const loadPayoutQr = async (sellerId: string) => {
    setError("");
    setBusy(true);
    try {
      const result = await fetchDigitalTextAdminSellerPayoutQr(sellerId);
      setPayoutQrs((current) => ({ ...current, [sellerId]: result.payoutQrUrl || null }));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not load the seller payout QR.");
    } finally {
      setBusy(false);
    }
  };

  const releaseOrder = (order: DigitalTextOrder) => {
    const isReview = order.status === "payment_review";
    const action = isReview ? "rejectPayment" : "releaseExpired";
    if (!isReview && !orderIsExpired(order)) {
      setError("This checkout timer has not expired yet.");
      return;
    }
    if (!window.confirm("Check your bank/UPI app first. Release the reservation only if no payment was received. Confirm that you independently checked?")) return;
    void runAction({
      action,
      orderId: order.id,
      bankCheckedNoPayment: true,
      note: "Payment independently checked and not received.",
    }, "Reservation released after checking that no payment was received.");
  };

  if (profile?.role !== "admin") {
    return (
      <section className="rounded-2xl border border-border bg-bg-elevated p-5">
        <h2 className="font-display text-xl font-semibold">Digital text marketplace admin</h2>
        <p className="mt-2 text-sm text-fg-muted">Sign in with the configured administrator account to manage this marketplace.</p>
        <Link href="/marketplace#account-access" className="mt-3 inline-flex rounded-xl bg-signal px-4 py-2.5 text-sm font-medium text-white">
          Sign in to your admin account
        </Link>
        {error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}
      </section>
    );
  }

  return (
    <section className="space-y-6">
      {notice && <p role="status" className="rounded-xl border border-green-500/30 bg-green-500/10 p-3 text-sm text-green-700">{notice}</p>}
      {error && <p role="alert" className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-700">{error}</p>}

      <form onSubmit={savePricing} className="rounded-2xl border border-border bg-bg-elevated p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-xl font-semibold">Digital-text pricing</h2>
            <p className="mt-1 text-sm text-fg-muted">Server applies these prices; sellers cannot choose or edit them.</p>
          </div>
          <button type="button" onClick={() => void refresh()} className="rounded-xl border border-border px-3 py-2 text-sm">Refresh</button>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="text-sm">Customer price (INR)<input className={inputClass} type="number" min="1" step="0.01" value={price} onChange={(event) => setPrice(event.target.value)} required /></label>
          <label className="text-sm">Seller earning per sale (INR)<input className={inputClass} type="number" min="0" step="0.01" value={earning} onChange={(event) => setEarning(event.target.value)} required /></label>
          <label className="text-sm">Reservation timeout (minutes)<input className={inputClass} type="number" min="1" max="60" step="1" value={reservationMinutes} onChange={(event) => setReservationMinutes(event.target.value)} required /></label>
          <label className="text-sm sm:col-span-2">Marketplace UPI ID<input className={inputClass} type="text" autoComplete="off" value={marketplaceUpiId} onChange={(event) => setMarketplaceUpiId(event.target.value)} placeholder="name@bank" required /><span className="mt-1 block text-xs text-fg-muted">Buyers pay this account. Saving it here updates QR payments without another deployment.</span></label>
        </div>
        <label className="mt-4 flex items-center gap-2 text-sm">
          <input type="checkbox" checked={approvalRequired} onChange={(event) => setApprovalRequired(event.target.checked)} className="accent-signal" />
          Require administrator approval before listings become available
        </label>
        <button disabled={busy} className="mt-4 rounded-xl bg-signal px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50">Save pricing</button>
      </form>

      <section id="digital-text-inventory" className="scroll-mt-24 rounded-2xl border border-border bg-bg-elevated p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-xl font-semibold">Unique inventory</h2>
            <p className="mt-1 text-sm text-fg-muted">
              {(dashboard?.inventory ?? []).filter((item) => item.status === "under_review").length} item(s) waiting for approval
            </p>
          </div>
          <button type="button" disabled={busy} onClick={() => void refresh()} className="rounded-xl border border-border px-3 py-2 text-sm disabled:opacity-50">Refresh inventory</button>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_220px]">
          <input className={inputClass} placeholder="Search item ID or seller ID" value={search} onChange={(event) => setSearch(event.target.value)} aria-label="Search digital-text inventory" />
          <select className={inputClass} value={filter} onChange={(event) => setFilter(event.target.value as (typeof statuses)[number])} aria-label="Filter inventory status">
            {statuses.map((status) => <option key={status} value={status}>{status === "all" ? "All statuses" : status.replaceAll("_", " ")}</option>)}
          </select>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {!filteredInventory.length && <p className="text-sm text-fg-muted">No inventory matches this filter.</p>}
          {filteredInventory.map((item) => (
            <article key={item.id} className="rounded-xl border border-border p-4">
              <div className="flex flex-wrap justify-between gap-2 text-sm">
                <span className="font-mono-tight">Item {item.id}</span>
                <span className="rounded-full bg-white/5 px-2 py-1 text-xs">{item.status.replaceAll("_", " ")}</span>
              </div>
              <p className="mt-2 break-all text-xs text-fg-muted">Seller: {item.sellerId}</p>
              {item.status === "under_review" && (
                <div className="mt-3 flex flex-wrap gap-2">
                  <button type="button" disabled={busy} onClick={() => void runAction({ action: "reviewListing", itemId: item.id, approve: true }, "Listing approved and now visible in the buyer catalog.")} className="rounded-lg bg-signal px-3 py-2 text-xs text-white">Approve and publish</button>
                  <button type="button" disabled={busy} onClick={() => void runAction({ action: "reviewListing", itemId: item.id, approve: false }, "Listing rejected and hidden from buyers.")} className="rounded-lg border border-border px-3 py-2 text-xs">Reject</button>
                </div>
              )}
              {["available", "disabled"].includes(item.status) && (
                <button type="button" disabled={busy} onClick={() => void runAction({
                  action: "setListingAvailability",
                  itemId: item.id,
                  available: item.status === "disabled",
                }, item.status === "disabled" ? "Listing made available." : "Listing disabled.")} className="mt-3 rounded-lg border border-border px-3 py-2 text-xs">
                  {item.status === "disabled" ? "Make available" : "Disable item"}
                </button>
              )}
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-bg-elevated p-5 sm:p-6">
        <h2 className="font-display text-xl font-semibold">Orders and payment review</h2>
        <div className="mt-4 space-y-3">
          {!dashboard?.orders.length && <p className="text-sm text-fg-muted">No digital-text orders yet.</p>}
          {dashboard?.orders.map((order) => {
            const proof = proofs[order.id];
            return (
              <article key={order.id} className="rounded-xl border border-border p-4">
                <div className="flex flex-wrap justify-between gap-2 text-sm">
                  <span>Order {order.id.slice(-8)} · {order.itemIds.length} item(s)</span>
                  <span>{money(order.total)} · {order.status.replaceAll("_", " ")}</span>
                </div>
                <p className="mt-1 text-xs text-fg-muted">Buyer ID: {order.buyerId} · {dateLabel(order.createdAt)}</p>
                <details className="mt-3 text-xs">
                  <summary className="cursor-pointer text-signal">Item and seller earning snapshots</summary>
                  <div className="mt-2 space-y-1">
                    {order.items.map((item) => (
                      <p key={item.itemId}>Item {item.itemId.slice(0, 8)} · seller {item.sellerId} · earning {money(item.sellerEarning)}</p>
                    ))}
                  </div>
                </details>
                {proof && (
                  <div className="mt-3 grid gap-3 sm:grid-cols-[180px_1fr]">
                    <a href={proof.screenshot} target="_blank" rel="noreferrer" className="block w-fit rounded-xl border border-border bg-white p-2">
                      <Image src={proof.screenshot} alt={`Payment screenshot for order ${order.id.slice(-8)}`} width={160} height={160} unoptimized className="h-40 w-40 object-contain" />
                    </a>
                    <div className="text-sm">
                      <p>Submitted UTR: <span className="font-mono-tight">{proof.utr}</span></p>
                      <p className="mt-2 text-xs leading-5 text-fg-muted">The proof image is not payment confirmation. Independently check the UTR, amount, and received status in the merchant bank/UPI app.</p>
                    </div>
                  </div>
                )}
                <div className="mt-3 flex flex-wrap gap-2">
                  {order.status === "payment_review" && (
                    <>
                      {!proof && <button type="button" disabled={busy} onClick={() => void loadPaymentProof(order.id)} className="rounded-lg border border-border px-3 py-2 text-xs">Load payment proof</button>}
                      <button type="button" disabled={busy} onClick={() => confirmPayment(order.id)} className="rounded-lg bg-signal px-3 py-2 text-xs text-white">Verify received and confirm</button>
                    </>
                  )}
                  {(order.status === "payment_review" || (order.status === "awaiting_payment" && orderIsExpired(order))) && (
                    <button type="button" disabled={busy} onClick={() => releaseOrder(order)} className="rounded-lg border border-amber-500/40 px-3 py-2 text-xs text-amber-700">
                      {order.status === "payment_review" ? "Reject after checking no payment" : "Release expired reservation"}
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-bg-elevated p-5 sm:p-6">
        <h2 className="font-display text-xl font-semibold">Pending seller payouts</h2>
        <div className="mt-4 space-y-3">
          {!dashboard?.pendingSales.length && <p className="text-sm text-fg-muted">No seller earnings are awaiting payout.</p>}
          {dashboard?.pendingSales.map((sale) => (
            <article key={sale.itemId} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border p-3 text-sm">
              <div>
                <p>Order {sale.orderId.slice(-8)} · Item {sale.itemId.slice(0, 8)}</p>
                <p className="mt-1 text-xs text-fg-muted">Seller {sale.sellerId} · {money(sale.sellerEarning)}</p>
              </div>
              <button type="button" disabled={busy} onClick={() => void runAction({ action: "markPayoutPaid", itemId: sale.itemId }, "Seller payout recorded as paid.")} className="rounded-lg border border-border px-3 py-2 text-xs">
                Mark this seller paid
              </button>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-bg-elevated p-5 sm:p-6">
        <h2 className="font-display text-xl font-semibold">Seller accounts</h2>
        <div className="mt-4 space-y-2">
          {!dashboard?.sellers.length && <p className="text-sm text-fg-muted">No sellers found.</p>}
          {dashboard?.sellers.map((seller) => {
            const payoutQr = payoutQrs[seller.id];
            return (
              <div key={seller.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border p-3 text-sm">
                <span>{seller.name} · {seller.email} {seller.suspended && <strong className="text-red-700">(suspended)</strong>}</span>
                <div className="flex items-center gap-3">
                  {payoutQr ? (
                    <a href={payoutQr} target="_blank" rel="noreferrer" className="block rounded-lg bg-white p-1">
                      <Image src={payoutQr} alt={`${seller.name} payout QR`} width={96} height={96} unoptimized />
                    </a>
                  ) : Object.hasOwn(payoutQrs, seller.id) ? (
                    <span className="text-xs text-fg-muted">Seller has not saved a payout QR.</span>
                  ) : (
                    <button type="button" disabled={busy} onClick={() => void loadPayoutQr(seller.id)} className="text-xs text-signal hover:underline">
                      Load payout QR
                    </button>
                  )}
                  <button type="button" disabled={busy} onClick={() => void runAction({ action: "suspendSeller", sellerId: seller.id, suspended: !seller.suspended }, seller.suspended ? "Seller reactivated." : "Seller suspended.")} className="rounded-lg border border-border px-3 py-2 text-xs">
                    {seller.suspended ? "Reactivate" : "Suspend"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {Boolean(dashboard?.rejections.length) && (
        <section className="rounded-2xl border border-border bg-bg-elevated p-5 sm:p-6">
          <h2 className="font-display text-xl font-semibold">Duplicate submissions rejected</h2>
          <div className="mt-3 space-y-2 text-sm text-fg-muted">
            {dashboard?.rejections.map((rejection, index) => (
              <p key={`${rejection.sellerId}-${index}`}>Seller {rejection.sellerId} · {rejection.reason} · {dateLabel(rejection.createdAt)}</p>
            ))}
          </div>
        </section>
      )}
      {Boolean(dashboard?.audit.length) && (
        <section className="rounded-2xl border border-border bg-bg-elevated p-5 sm:p-6">
          <h2 className="font-display text-xl font-semibold">Recent admin changes</h2>
          <div className="mt-3 space-y-2 text-sm text-fg-muted">
            {dashboard?.audit.map((entry, index) => (
              <p key={`${entry.subjectId}-${index}`}>
                {entry.action} · {entry.subjectType} {entry.subjectId} · {dateLabel(entry.createdAt)}
              </p>
            ))}
          </div>
        </section>
      )}
    </section>
  );
}
