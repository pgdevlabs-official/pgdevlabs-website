"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { BadgeCheck, Package, Plus, Trash2 } from "lucide-react";
import {
  confirmMarketplaceOrder,
  confirmSellerPayout,
  createMarketplaceProduct,
  getMarketplacePaymentProof,
  getMarketplaceProfile,
  rejectMarketplaceOrder,
  subscribeToAllOrders,
  subscribeToAllProducts,
  subscribeToProfile,
  updateMarketplaceProduct,
} from "@/lib/marketplaceService";
import { auth } from "@/lib/firebaseConfig";
import type {
  MarketplaceOrder,
  MarketplacePaymentProof,
  MarketplaceProduct,
  MarketplaceProfile,
} from "@/types";

const fieldClass =
  "mt-1 w-full rounded-xl border border-border bg-bg px-3 py-2 text-sm text-fg outline-none focus:border-signal";

function money(amount: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(amount);
}

export function MarketplaceInventoryPanel() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<MarketplaceProfile | null>(null);
  const [products, setProducts] = useState<MarketplaceProduct[]>([]);
  const [orders, setOrders] = useState<MarketplaceOrder[]>([]);
  const [payoutQrs, setPayoutQrs] = useState<Record<string, string>>({});
  const [paymentProofs, setPaymentProofs] = useState<Record<string, MarketplacePaymentProof>>({});
  const [form, setForm] = useState({
    name: "",
    category: "Electronics",
    description: "",
    unitPrice: 0,
    stock: 1,
  });
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!auth) return;
    return onAuthStateChanged(auth, setUser);
  }, []);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      return;
    }
    return subscribeToProfile(user.uid, setProfile, (reason) => setError(reason.message));
  }, [user]);

  useEffect(() => {
    if (!profile || profile.role !== "admin") {
      setProducts([]);
      setOrders([]);
      return;
    }
    const unsubscribeProducts = subscribeToAllProducts(setProducts, (reason) => setError(reason.message));
    const unsubscribeOrders = subscribeToAllOrders(setOrders, (reason) => setError(reason.message));
    return () => {
      unsubscribeProducts();
      unsubscribeOrders();
    };
  }, [profile]);

  useEffect(() => {
    if (profile?.role !== "admin") return;
    let current = true;
    const sellerIds = [...new Set(orders
      .filter((order) => order.status === "confirmed" && order.payoutStatus === "pending")
      .map((order) => order.sellerId))];
    Promise.all(sellerIds.map(async (sellerId) => {
      const seller = await getMarketplaceProfile(sellerId);
      return [sellerId, seller?.payoutQrUrl ?? ""] as const;
    }))
      .then((entries) => {
        if (current) setPayoutQrs(Object.fromEntries(entries));
      })
      .catch((reason: Error) => {
        if (current) setError(reason.message);
      });
    return () => {
      current = false;
    };
  }, [orders, profile]);

  useEffect(() => {
    if (profile?.role !== "admin") return;
    let current = true;
    const reviewOrderIds = orders
      .filter((order) => order.status === "payment_review")
      .map((order) => order.id);
    Promise.all(reviewOrderIds.map(async (orderId) => {
      const proof = await getMarketplacePaymentProof(orderId);
      return proof ? [orderId, proof] as const : null;
    }))
      .then((entries) => {
        if (!current) return;
        setPaymentProofs(
          Object.fromEntries(entries.filter((entry): entry is readonly [string, MarketplacePaymentProof] => entry !== null))
        );
      })
      .catch((reason: Error) => {
        if (current) setError(reason.message);
      });
    return () => {
      current = false;
    };
  }, [orders, profile]);

  const addProduct = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!profile || profile.role !== "admin" || !form.name.trim() || form.unitPrice <= 0 || form.stock < 0) {
      setError("Add a name, a positive price, and valid stock.");
      return;
    }
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await createMarketplaceProduct(profile, {
        ...form,
        name: form.name.trim(),
        category: form.category.trim() || "Electronics",
        description: form.description.trim(),
        image: "",
      });
      setForm({ name: "", category: "Electronics", description: "", unitPrice: 0, stock: 1 });
      setNotice("Admin product listed successfully.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not add product.");
    } finally {
      setBusy(false);
    }
  };

  const runOrderAction = async (action: () => Promise<void>, success: string) => {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await action();
      setNotice(success);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not update the order.");
    } finally {
      setBusy(false);
    }
  };

  if (profile?.role !== "admin") {
    return (
      <div className="rounded-2xl border border-border bg-bg-elevated p-5">
        <h2 className="font-display text-xl font-semibold">Marketplace admin</h2>
        <p className="mt-2 text-sm text-fg-muted">
          Admin marketplace controls need an authenticated Firebase account whose marketplaceUsers profile has the admin role.
        </p>
        {error && <p className="mt-3 text-sm text-danger">{error}</p>}
      </div>
    );
  }

  const reviews = orders.filter((order) => order.status === "payment_review");
  const payouts = orders.filter((order) => order.status === "confirmed" && order.payoutStatus === "pending");

  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-border bg-bg-elevated p-5">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="font-mono-tight text-[10px] uppercase tracking-[0.18em] text-signal">Marketplace admin</p>
            <h2 className="mt-1 font-display text-xl font-semibold">Electronic products & pricing</h2>
          </div>
          <Package size={20} className="text-signal" />
        </div>
        <form onSubmit={addProduct} className="grid gap-4 md:grid-cols-2">
          <label className="text-sm text-fg-muted">Product name<input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className={fieldClass} /></label>
          <label className="text-sm text-fg-muted">Category<input value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} className={fieldClass} /></label>
          <label className="text-sm text-fg-muted">Price<input required type="number" min="1" value={form.unitPrice || ""} onChange={(event) => setForm({ ...form, unitPrice: Number(event.target.value) })} className={fieldClass} /></label>
          <label className="text-sm text-fg-muted">Stock<input required type="number" min="0" value={form.stock} onChange={(event) => setForm({ ...form, stock: Number(event.target.value) })} className={fieldClass} /></label>
          <label className="text-sm text-fg-muted md:col-span-2">Description<textarea rows={2} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} className={fieldClass} /></label>
          <button disabled={busy} className="inline-flex w-fit items-center gap-2 rounded-full bg-gradient-to-r from-signal to-violet px-4 py-2 text-sm font-medium text-white disabled:opacity-50"><Plus size={15} /> Add product</button>
        </form>
        {(notice || error) && <p className={`mt-3 text-sm ${error ? "text-danger" : "text-circuit"}`}>{error || notice}</p>}
        <div className="mt-5 space-y-2">
          {products.map((product) => (
            <div key={product.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-bg p-3">
              <div><p className="font-medium">{product.name}</p><p className="text-xs text-fg-muted">{product.category} · {product.stock} in stock · {money(product.unitPrice)} · {product.seller}</p></div>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => { const price = window.prompt("New unit price", String(product.unitPrice)); if (price && Number(price) > 0) void runOrderAction(() => updateMarketplaceProduct(product.id, { unitPrice: Number(price) }), "Price updated."); }} className="rounded-full border border-border px-3 py-1.5 text-xs">Change price</button>
                <button onClick={() => void runOrderAction(() => updateMarketplaceProduct(product.id, { active: !product.active }), product.active ? "Product hidden from buyers." : "Product visible to buyers.")} className="rounded-full border border-border px-3 py-1.5 text-xs">{product.active ? "Hide" : "Publish"}</button>
                <button onClick={() => void runOrderAction(() => updateMarketplaceProduct(product.id, { active: false }), "Product hidden from buyers; order history is preserved.")} className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs text-danger"><Trash2 size={12} /> Remove</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-bg-elevated p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div><p className="font-mono-tight text-[10px] uppercase tracking-[0.18em] text-warn">Buyer payments</p><h2 className="mt-1 font-display text-xl font-semibold">Verification queue <span className="text-fg-muted">({reviews.length})</span></h2></div>
          <BadgeCheck size={20} className="text-warn" />
        </div>
        {reviews.length === 0 ? <p className="text-sm text-fg-muted">No buyer payments are awaiting verification.</p> : (
          <div className="space-y-3">
            {reviews.map((order) => (
              <article key={order.id} className="rounded-xl border border-border bg-bg p-4">
                <div className="flex flex-wrap justify-between gap-3">
                  <div><h3 className="font-medium">{order.productName} × {order.quantity}</h3><p className="text-sm text-fg-muted">Buyer: {order.buyerName} ({order.buyerEmail})</p><p className="text-sm text-fg-muted">Seller: {order.sellerName} · {money(order.total)}</p><p className="mt-1 text-xs text-fg-muted">UTR: {paymentProofs[order.id]?.paymentUtr ?? "Loading…"}</p></div>
                  <div className="flex flex-wrap content-start gap-2">
                    {paymentProofs[order.id]?.paymentProofUrl && <a href={paymentProofs[order.id].paymentProofUrl} download={`payment-proof-${order.id}.webp`} className="flex items-center gap-2 rounded-full border border-border px-2 py-1.5 text-xs"><Image src={paymentProofs[order.id].paymentProofUrl} alt="Buyer payment screenshot" width={36} height={36} unoptimized className="h-9 w-9 rounded object-cover" />Download screenshot</a>}
                    <button disabled={busy} onClick={() => void runOrderAction(() => confirmMarketplaceOrder(order), "Buyer payment confirmed; stock reduced and seller payout is pending.")} className="rounded-full bg-signal px-3 py-1.5 text-xs font-semibold text-bg disabled:opacity-50">Confirm payment</button>
                    <button disabled={busy} onClick={() => { const reason = window.prompt("Why are you rejecting this payment proof?"); if (reason?.trim()) void runOrderAction(() => rejectMarketplaceOrder(order.id, reason.trim()), "Payment proof rejected."); }} className="rounded-full border border-border px-3 py-1.5 text-xs text-danger">Reject</button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-border bg-bg-elevated p-5">
        <div className="mb-4"><p className="font-mono-tight text-[10px] uppercase tracking-[0.18em] text-warn">Seller payouts</p><h2 className="mt-1 font-display text-xl font-semibold">Payout queue <span className="text-fg-muted">({payouts.length})</span></h2></div>
        {payouts.length === 0 ? <p className="text-sm text-fg-muted">No seller payouts are pending.</p> : (
          <div className="space-y-3">
            {payouts.map((order) => (
              <article key={order.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-bg p-4">
                <div><p className="font-medium">{order.sellerName} · {order.productName} × {order.quantity}</p><p className="text-sm text-fg-muted">Pay {money(order.total)} · buyer {order.buyerEmail}</p></div>
                <div className="flex items-center gap-3">
                  {payoutQrs[order.sellerId] && <a href={payoutQrs[order.sellerId]} target="_blank" rel="noreferrer" className="relative h-16 w-16 overflow-hidden rounded-lg bg-white p-1" aria-label={`View ${order.sellerName}'s payout QR`}><Image src={payoutQrs[order.sellerId]} alt={`${order.sellerName} payout QR`} fill sizes="64px" className="object-contain" unoptimized /></a>}
                  {!payoutQrs[order.sellerId] && <span className="self-center text-xs text-warn">Seller payout QR missing</span>}
                  <button disabled={busy} onClick={() => void runOrderAction(() => confirmSellerPayout(order.id), "Seller payout marked as paid.")} className="rounded-full bg-gradient-to-r from-signal to-violet px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50">Confirm payout sent</button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-border bg-bg-elevated p-5">
        <h2 className="font-display text-xl font-semibold">All marketplace orders</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead><tr className="border-b border-border text-xs text-fg-muted"><th className="py-2">Product</th><th>Buyer</th><th>Seller</th><th>Total</th><th>Order</th><th>Payout</th></tr></thead>
            <tbody>{orders.map((order) => <tr key={order.id} className="border-b border-border/60"><td className="py-3">{order.productName} × {order.quantity}</td><td>{order.buyerEmail}</td><td>{order.sellerName}</td><td>{money(order.total)}</td><td>{order.status}</td><td>{order.payoutStatus}</td></tr>)}</tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
