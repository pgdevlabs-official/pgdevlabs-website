"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { FirebaseError } from "firebase/app";
import QRCode from "qrcode";
import {
  BadgeCheck,
  Box,
  Camera,
  CreditCard,
  LogOut,
  PackagePlus,
  ShoppingBag,
  Store,
  Upload,
} from "lucide-react";
import {
  createMarketplaceOrder,
  createMarketplaceProduct,
  expireMarketplaceOrder,
  loginMarketplaceUser,
  logoutMarketplaceUser,
  registerMarketplaceUser,
  sendMarketplacePasswordReset,
  subscribeToProducts,
  subscribeToProfile,
  subscribeToSellerProducts,
  subscribeToUserOrders,
  submitOrderPayment,
  updateMarketplaceProduct,
  updatePayoutQr,
} from "@/lib/marketplaceService";
import { encodeMarketplaceImage } from "@/lib/marketplaceImages";
import { auth } from "@/lib/firebaseConfig";
import type { MarketplaceOrder, MarketplaceProduct, MarketplaceProfile } from "@/types";

const MERCHANT_UPI_ID =
  process.env.NEXT_PUBLIC_MARKETPLACE_UPI_ID || "9798770034@naviaxis";
const fieldClass =
  "mt-1 w-full rounded-xl border border-border bg-bg px-3 py-2.5 text-sm text-fg outline-none focus:border-signal";

function formatRupees(value: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(value);
}

function orderStatus(status: MarketplaceOrder["status"]) {
  return {
    awaiting_payment: "Payment pending",
    payment_review: "Payment verification pending",
    confirmed: "Confirmed",
    rejected: "Rejected",
    expired: "QR expired",
  }[status];
}

function fileFromInput(event: React.ChangeEvent<HTMLInputElement>) {
  return event.currentTarget.files?.[0] ?? null;
}

export function MarketplacePlatform() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<MarketplaceProfile | null>(null);
  const [profileReady, setProfileReady] = useState(false);
  const [products, setProducts] = useState<MarketplaceProduct[]>([]);
  const [myProducts, setMyProducts] = useState<MarketplaceProduct[]>([]);
  const [orders, setOrders] = useState<MarketplaceOrder[]>([]);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [authForm, setAuthForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "buyer" as "buyer" | "seller" | "both",
  });
  const [productForm, setProductForm] = useState({
    name: "",
    category: "Electronics",
    description: "",
    unitPrice: 0,
    stock: 1,
  });
  const [selectedProductId, setSelectedProductId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState("");
  const [paymentUtr, setPaymentUtr] = useState("");
  const [paymentFile, setPaymentFile] = useState<File | null>(null);
  const [activeOrderId, setActiveOrderId] = useState("");
  const [timeLeft, setTimeLeft] = useState(0);
  const [qrData, setQrData] = useState("");
  const [payoutFile, setPayoutFile] = useState<File | null>(null);
  const [productImage, setProductImage] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const expirationRequests = useRef(new Set<string>());

  const buyableProducts = useMemo(
    () => products.filter((product) => product.stock > 0 && product.sellerId !== user?.uid),
    [products, user]
  );
  const selectedProduct = useMemo(
    () => buyableProducts.find((product) => product.id === selectedProductId) ?? buyableProducts[0],
    [buyableProducts, selectedProductId]
  );
  const total = selectedProduct ? selectedProduct.unitPrice * quantity : 0;
  const activeOrder = orders.find((order) => order.id === activeOrderId) ?? null;

  useEffect(() => {
    if (!auth) return;
    return onAuthStateChanged(auth, setUser);
  }, []);

  useEffect(() => {
    setProfile(null);
    setProfileReady(false);
    setProducts([]);
    setMyProducts([]);
    setOrders([]);
    if (!user) return;

    const unsubs = [
      subscribeToProfile(user.uid, (nextProfile) => {
        setProfile(nextProfile);
        setProfileReady(true);
      }, (reason) => {
        setError(reason.message);
        setProfileReady(true);
      }),
      subscribeToProducts(setProducts, (reason) => setError(reason.message)),
    ];
    return () => unsubs.forEach((unsubscribe) => unsubscribe());
  }, [user]);

  useEffect(() => {
    if (!user || !profile || !["seller", "both"].includes(profile.role)) {
      setMyProducts([]);
      return;
    }
    return subscribeToSellerProducts(user.uid, setMyProducts, (reason) => setError(reason.message));
  }, [user, profile]);

  useEffect(() => {
    if (!user || !profile || profile.role === "admin") {
      setOrders([]);
      return;
    }
    setOrders([]);
    const byBuyer = ["buyer", "both"].includes(profile.role)
      ? subscribeToUserOrders("buyerId", user.uid, (next) => {
          setOrders((current) => {
            const byId = new Map(current.map((order) => [order.id, order]));
            next.forEach((order) => byId.set(order.id, order));
            return [...byId.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
          });
        }, (reason) => setError(reason.message))
      : undefined;
    const bySeller = ["seller", "both"].includes(profile.role)
      ? subscribeToUserOrders("sellerId", user.uid, (next) => {
          setOrders((current) => {
            const byId = new Map(current.map((order) => [order.id, order]));
            next.forEach((order) => byId.set(order.id, order));
            return [...byId.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
          });
        }, (reason) => setError(reason.message))
      : undefined;
    return () => {
      byBuyer?.();
      bySeller?.();
    };
  }, [user, profile]);

  useEffect(() => {
    if (!user || !profile || !["seller", "both"].includes(profile.role)) return;
    orders
      .filter((order) =>
        order.sellerId === user.uid &&
        order.status === "awaiting_payment" &&
        order.expiresAt <= Date.now() &&
        !expirationRequests.current.has(order.id)
      )
      .forEach((order) => {
        expirationRequests.current.add(order.id);
        void expireMarketplaceOrder(order.id).catch((reason: Error) => {
          expirationRequests.current.delete(order.id);
          setError(reason.message);
        });
      });
  }, [orders, profile, user]);

  useEffect(() => {
    if (!activeOrder || activeOrder.status !== "awaiting_payment") {
      setTimeLeft(0);
      setQrData("");
      return;
    }

    const refreshTime = () => {
      const remaining = Math.max(0, Math.ceil((activeOrder.expiresAt - Date.now()) / 1000));
      setTimeLeft(remaining);
      if (remaining === 0 && !expirationRequests.current.has(activeOrder.id)) {
        expirationRequests.current.add(activeOrder.id);
        void expireMarketplaceOrder(activeOrder.id).catch((reason: Error) => {
          expirationRequests.current.delete(activeOrder.id);
          setError(reason.message);
        });
      }
    };
    refreshTime();
    const timer = window.setInterval(refreshTime, 1000);
    return () => window.clearInterval(timer);
  }, [activeOrder]);

  useEffect(() => {
    if (!activeOrder || activeOrder.status !== "awaiting_payment") return;
    const payment = new URLSearchParams({
      pa: MERCHANT_UPI_ID,
      pn: "PGDevLabs",
      am: activeOrder.total.toFixed(2),
      cu: "INR",
      tn: `Order ${activeOrder.id.slice(-8)}`,
    });
    QRCode.toDataURL(`upi://pay?${payment.toString()}`, {
      errorCorrectionLevel: "H",
      margin: 2,
      width: 220,
    })
      .then(setQrData)
      .catch((reason: Error) => setError(`Could not generate the payment QR: ${reason.message}`));
  }, [activeOrder]);

  const submitAuth = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    setNotice("");
    try {
      if (authMode === "register") {
        await registerMarketplaceUser(authForm.name, authForm.email, authForm.password, authForm.role);
        setNotice("Account created. Check your email and verify the address before using the digital-text marketplace.");
      } else {
        await loginMarketplaceUser(authForm.email, authForm.password);
        setNotice("Signed in successfully.");
      }
    } catch (reason) {
      if (reason instanceof FirebaseError && reason.code === "auth/email-already-in-use") {
        setAuthMode("login");
        setAuthForm((current) => ({ ...current, password: "" }));
        setNotice("This email already has an account. Login below with the password you created earlier.");
        setError("");
      } else if (reason instanceof FirebaseError && reason.code === "auth/invalid-credential") {
        setError("Email or password is incorrect. If this is a KharchaMate-only account, create a marketplace account with a new password first.");
      } else if (reason instanceof FirebaseError && reason.code === "auth/weak-password") {
        setError("Choose a password with at least 6 characters.");
      } else {
        setError(reason instanceof Error ? reason.message : "Authentication failed.");
      }
    } finally {
      setBusy(false);
    }
  };

  const resetPassword = async () => {
    const email = authForm.email.trim();
    if (!email) {
      setError("Enter your account email first.");
      return;
    }
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await sendMarketplacePasswordReset(email);
      setNotice("If an account exists for this email, Firebase has sent a password-reset link. Check your inbox and spam folder.");
    } catch (reason) {
      if (reason instanceof FirebaseError && reason.code === "auth/invalid-email") {
        setError("Enter a valid email address.");
      } else {
        setError(reason instanceof Error ? reason.message : "Could not send the password-reset email.");
      }
    } finally {
      setBusy(false);
    }
  };

  const addProduct = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user || !profile || !productForm.name.trim() || productForm.unitPrice <= 0 || productForm.stock < 0) {
      setError("Product name, a price above zero, and valid stock are required.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const image = productImage
        ? await encodeMarketplaceImage(productImage, "products")
        : "";
      await createMarketplaceProduct(profile, {
        ...productForm,
        name: productForm.name.trim(),
        category: productForm.category.trim() || "Electronics",
        description: productForm.description.trim(),
        image,
      });
      setProductForm({ name: "", category: "Electronics", description: "", unitPrice: 0, stock: 1 });
      setProductImage(null);
      setNotice("Your electronic item is listed.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not add the product.");
    } finally {
      setBusy(false);
    }
  };

  const placeOrder = async () => {
    if (!user || !profile || !selectedProduct) return;
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > selectedProduct.stock) {
      setError(`Choose a quantity from 1 to ${selectedProduct.stock}.`);
      return;
    }
    setBusy(true);
    setError("");
    try {
      const order = await createMarketplaceOrder(profile, selectedProduct, quantity, note);
      setOrders((current) => [order, ...current]);
      setActiveOrderId(order.id);
      setPaymentUtr("");
      setPaymentFile(null);
      setNotice("Order created. Pay before the five-minute QR timer expires.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not create the order.");
    } finally {
      setBusy(false);
    }
  };

  const submitPayment = async () => {
    if (!user || !activeOrder || !paymentFile || !paymentUtr.trim()) {
      setError("Enter the UTR/reference number and attach your payment screenshot.");
      return;
    }
    if (timeLeft <= 0) {
      setError("This payment QR has expired. Place a new order to get another QR.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const proofUrl = await encodeMarketplaceImage(paymentFile, "payment-proofs");
      await submitOrderPayment(activeOrder.id, user.uid, paymentUtr, proofUrl);
      setNotice("Payment details sent. The admin will verify your payment.");
      setActiveOrderId("");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not submit payment proof.");
    } finally {
      setBusy(false);
    }
  };

  const savePayoutQr = async () => {
    if (!user || !payoutFile) {
      setError("Choose a QR image first.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const url = await encodeMarketplaceImage(payoutFile, "payout-qr");
      await updatePayoutQr(user.uid, url);
      setPayoutFile(null);
      setNotice("Seller payout QR saved.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not save the payout QR.");
    } finally {
      setBusy(false);
    }
  };

  const signOut = async () => {
    try {
      await logoutMarketplaceUser();
      setActiveOrderId("");
      setNotice("Signed out.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not sign out.");
    }
  };

  if (!user) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
        <div className="rounded-3xl border border-border bg-bg-elevated p-6 sm:p-9">
          <p className="font-mono-tight text-xs uppercase tracking-[0.18em] text-signal">Electronics marketplace</p>
          <h1 className="mt-2 font-display text-3xl font-semibold">Buy and sell electronics</h1>
          <p className="mt-2 text-sm leading-6 text-fg-muted">
            Create an account or sign in to browse live stock, list your items, and track payments and payouts.
          </p>
          <div className="mt-6 flex gap-2">
            {(["login", "register"] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setAuthMode(mode)}
                className={`rounded-full px-4 py-2 text-sm ${authMode === mode ? "bg-signal text-bg" : "border border-border text-fg-muted"}`}
              >
                {mode === "login" ? "Login" : "Create account"}
              </button>
            ))}
          </div>
          <form onSubmit={submitAuth} className="mt-5 space-y-4">
            {authMode === "register" && (
              <>
                <label className="block text-sm text-fg-muted">
                  Full name
                  <input required value={authForm.name} onChange={(event) => setAuthForm({ ...authForm, name: event.target.value })} className={fieldClass} />
                </label>
                <fieldset>
                  <legend className="text-sm text-fg-muted">How do you want to use the marketplace?</legend>
                  <div className="mt-2 grid gap-2 sm:grid-cols-3">
                    {(["buyer", "seller", "both"] as const).map((role) => (
                      <label key={role} className={`cursor-pointer rounded-xl border p-3 text-sm ${authForm.role === role ? "border-signal bg-signal/10 text-fg" : "border-border text-fg-muted"}`}>
                        <input
                          type="radio"
                          name="marketplace-role"
                          value={role}
                          checked={authForm.role === role}
                          onChange={() => setAuthForm({ ...authForm, role })}
                          className="sr-only"
                        />
                        {role === "both" ? "Buy and sell" : role === "buyer" ? "Buy only" : "Sell only"}
                      </label>
                    ))}
                  </div>
                </fieldset>
              </>
            )}
            <label className="block text-sm text-fg-muted">
              Email
              <input required type="email" autoComplete="email" value={authForm.email} onChange={(event) => setAuthForm({ ...authForm, email: event.target.value })} className={fieldClass} />
            </label>
            <label className="block text-sm text-fg-muted">
              Password
              <input required minLength={6} type="password" autoComplete={authMode === "register" ? "new-password" : "current-password"} value={authForm.password} onChange={(event) => setAuthForm({ ...authForm, password: event.target.value })} className={fieldClass} />
            </label>
            {authMode === "login" && (
              <div>
                <button type="button" disabled={busy} onClick={() => void resetPassword()} className="text-sm text-signal underline underline-offset-4 disabled:opacity-50">
                  Forgot password? Send reset email
                </button>
                <p className="mt-1 text-xs text-fg-muted">
                  This resets the password for this Firebase account, including KharchaMate if it uses the same account.
                </p>
              </div>
            )}
            <button disabled={busy} className="w-full rounded-full bg-gradient-to-r from-signal to-violet px-4 py-3 text-sm font-semibold text-white disabled:opacity-50">
              {busy ? "Please wait…" : authMode === "login" ? "Login" : "Create account"}
            </button>
          </form>
          {notice && <p className="mt-4 text-sm text-circuit">{notice}</p>}
          {error && <p className="mt-4 text-sm text-danger">{error}</p>}
        </div>
      </main>
    );
  }

  if (!profile && profileReady) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-14 text-center">
        <h1 className="font-display text-2xl font-semibold">Marketplace profile unavailable</h1>
        <p className="mt-2 text-sm text-fg-muted">This account has no marketplace profile. Sign out and create an account from this page.</p>
        <button onClick={() => void signOut()} className="mt-5 rounded-full border border-border px-4 py-2 text-sm">Sign out</button>
        {error && <p className="mt-3 text-sm text-danger">{error}</p>}
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-14 text-center">
        <h1 className="font-display text-2xl font-semibold">Loading marketplace account…</h1>
        {error && <p className="mt-4 text-sm text-danger">{error}</p>}
      </main>
    );
  }

  if (profile.role === "admin") {
    return (
      <main className="mx-auto max-w-2xl px-4 py-14 text-center">
        <h1 className="font-display text-2xl font-semibold">Admin account</h1>
        <p className="mt-2 text-fg-muted">Use the protected admin dashboard to verify buyer payments and seller payouts.</p>
        <a href="/admin" className="mt-5 inline-flex rounded-full bg-signal px-4 py-2 text-sm font-semibold text-bg">Open admin dashboard</a>
        <button onClick={() => void signOut()} className="ml-3 rounded-full border border-border px-4 py-2 text-sm">Logout</button>
      </main>
    );
  }

  const canBuy = profile.role === "buyer" || profile.role === "both";
  const canSell = profile.role === "seller" || profile.role === "both";
  const sellOrders = orders.filter((order) => order.sellerId === user.uid);
  const buyOrders = orders.filter((order) => order.buyerId === user.uid);

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <header className="rounded-3xl border border-border bg-bg-elevated p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="font-mono-tight text-xs uppercase tracking-[0.18em] text-signal">Electronics marketplace</p>
            <h1 className="mt-2 font-display text-3xl font-semibold">Welcome, {profile.name}</h1>
            <p className="mt-1 text-sm text-fg-muted">{profile.email}</p>
          </div>
          <button onClick={() => void signOut()} className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-2 text-sm text-fg-muted hover:text-fg">
            <LogOut size={15} /> Sign out
          </button>
        </div>
        <p className="mt-5 text-sm text-fg-muted">
          Account mode: {profile.role === "both" ? "Buy and sell" : profile.role === "buyer" ? "Buy only" : "Sell only"}
        </p>
      </header>

      {error && <p role="alert" className="mt-4 rounded-xl border border-danger/40 bg-danger/10 p-3 text-sm text-danger">{error}</p>}
      {notice && <p role="status" className="mt-4 rounded-xl border border-circuit/30 bg-circuit/10 p-3 text-sm text-circuit">{notice}</p>}

      {canBuy && (
        <section className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="rounded-2xl border border-border bg-bg-elevated p-5">
            <div className="mb-4 flex items-center gap-2">
              <ShoppingBag size={18} className="text-signal" />
              <h2 className="font-display text-xl font-semibold">Available electronics</h2>
            </div>
            {buyableProducts.length === 0 ? (
              <p className="rounded-xl border border-dashed border-border p-5 text-sm text-fg-muted">No items are listed right now.</p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
              {buyableProducts.map((product) => (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => { setSelectedProductId(product.id); setQuantity(1); }}
                    className={`overflow-hidden rounded-2xl border text-left ${selectedProduct?.id === product.id ? "border-signal" : "border-border"}`}
                  >
                    {product.image ? (
                      <div className="relative h-44 bg-bg">
                        <Image src={product.image} alt={product.name} fill sizes="(max-width: 640px) 100vw, 50vw" className="object-cover" unoptimized />
                      </div>
                    ) : (
                      <div className="grid h-44 place-items-center bg-bg text-fg-muted"><Box size={36} /></div>
                    )}
                    <div className="p-4">
                      <div className="flex justify-between gap-3">
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="mt-1 text-xs text-fg-muted">{product.category} · Seller: {product.seller}</p>
                        </div>
                        <span className="text-xs text-fg-muted">{product.stock} left</span>
                      </div>
                      <p className="mt-3 font-display text-lg font-semibold text-signal">{formatRupees(product.unitPrice)}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-5">
            <div className="rounded-2xl border border-border bg-bg-elevated p-5">
              <h2 className="font-display text-xl font-semibold">Checkout</h2>
              {selectedProduct ? (
                <>
                  <p className="mt-3 font-medium">{selectedProduct.name}</p>
                  <label className="mt-4 block text-sm text-fg-muted">
                    Quantity (stock: {selectedProduct.stock})
                    <input type="number" min={1} max={selectedProduct.stock} value={quantity} onChange={(event) => setQuantity(Number(event.target.value))} className={fieldClass} />
                  </label>
                  <label className="mt-3 block text-sm text-fg-muted">
                    Order note / delivery details
                    <textarea rows={2} value={note} onChange={(event) => setNote(event.target.value)} className={fieldClass} />
                  </label>
                  <div className="mt-4 flex justify-between border-t border-border pt-4">
                    <span className="text-fg-muted">Total</span>
                    <strong className="text-lg text-signal">{formatRupees(total)}</strong>
                  </div>
                  <button disabled={busy || selectedProduct.stock < 1} onClick={() => void placeOrder()} className="mt-4 w-full rounded-full bg-gradient-to-r from-signal to-violet px-4 py-3 text-sm font-semibold text-white disabled:opacity-50">
                    <CreditCard size={15} className="mr-2 inline" /> Generate 5-minute payment QR
                  </button>
                </>
              ) : <p className="mt-3 text-sm text-fg-muted">Select an available item to calculate your total.</p>}
            </div>

            {activeOrder && activeOrder.status === "awaiting_payment" && (
              <div className="rounded-2xl border border-warn/40 bg-bg-elevated p-5">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Scan to pay {formatRupees(activeOrder.total)}</h3>
                  <span className="font-mono-tight text-sm text-warn">{Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")}</span>
                </div>
                {qrData && <div className="mx-auto mt-4 w-fit rounded-xl bg-white p-2"><Image src={qrData} alt="UPI payment QR" width={200} height={200} unoptimized /></div>}
                <p className="mt-3 text-center text-xs text-fg-muted">UPI ID: <strong className="text-fg">{MERCHANT_UPI_ID}</strong></p>
                <p className="mt-1 text-center text-xs text-fg-muted">Verify the payee and amount in your UPI app before paying.</p>
                <label className="mt-4 block text-sm text-fg-muted">
                  UTR / transaction reference
                  <input value={paymentUtr} onChange={(event) => setPaymentUtr(event.target.value)} className={fieldClass} />
                </label>
                <label className="mt-3 block text-sm text-fg-muted">
                  Payment screenshot (PNG/JPG/WEBP, up to 5 MB before compression)
                  <input type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => setPaymentFile(fileFromInput(event))} className={fieldClass} />
                </label>
                <button disabled={busy || timeLeft <= 0} onClick={() => void submitPayment()} className="mt-4 w-full rounded-full bg-signal px-4 py-3 text-sm font-semibold text-bg disabled:opacity-50">
                  I have paid — submit for verification
                </button>
              </div>
            )}

            <div className="rounded-2xl border border-border bg-bg-elevated p-5">
              <h3 className="font-display text-lg font-semibold">My purchases</h3>
              <div className="mt-3 space-y-3">
                {buyOrders.length === 0 ? <p className="text-sm text-fg-muted">No purchase orders yet.</p> : buyOrders.map((order) => (
                  <div key={order.id} className="rounded-xl border border-border p-3">
                    <div className="flex justify-between gap-2"><span className="font-medium">{order.productName} × {order.quantity}</span><span className="text-sm">{formatRupees(order.total)}</span></div>
                    <p className="mt-1 text-xs text-fg-muted">{orderStatus(order.status)}</p>
                    {order.status === "awaiting_payment" && <button onClick={() => setActiveOrderId(order.id)} className="mt-2 text-xs text-signal">Continue payment</button>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {canSell && (
        <section className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-border bg-bg-elevated p-5">
            <div className="mb-4 flex items-center gap-2"><PackagePlus size={18} className="text-signal" /><h2 className="font-display text-xl font-semibold">List an electronic item</h2></div>
            <form onSubmit={addProduct} className="space-y-3">
              <label className="block text-sm text-fg-muted">Item name<input required value={productForm.name} onChange={(event) => setProductForm({ ...productForm, name: event.target.value })} className={fieldClass} placeholder="Phone, laptop, headphones…" /></label>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block text-sm text-fg-muted">Category<input value={productForm.category} onChange={(event) => setProductForm({ ...productForm, category: event.target.value })} className={fieldClass} /></label>
                <label className="block text-sm text-fg-muted">Price<input required type="number" min="1" value={productForm.unitPrice || ""} onChange={(event) => setProductForm({ ...productForm, unitPrice: Number(event.target.value) })} className={fieldClass} /></label>
              </div>
              <label className="block text-sm text-fg-muted">Available quantity<input required type="number" min="0" value={productForm.stock} onChange={(event) => setProductForm({ ...productForm, stock: Number(event.target.value) })} className={fieldClass} /></label>
              <label className="block text-sm text-fg-muted">Description<textarea rows={3} value={productForm.description} onChange={(event) => setProductForm({ ...productForm, description: event.target.value })} className={fieldClass} /></label>
              <label className="block text-sm text-fg-muted">Item photo (optional, compressed for Firestore; up to 5 MB before compression)<input type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => setProductImage(fileFromInput(event))} className={fieldClass} /></label>
              <button disabled={busy} className="rounded-full bg-gradient-to-r from-signal to-violet px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">List item</button>
            </form>
            <div className="mt-6 space-y-3">
              {myProducts.map((product) => (
                <div key={product.id} className="rounded-xl border border-border p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div><p className="font-medium">{product.name}</p><p className="text-xs text-fg-muted">{product.stock} stock · {formatRupees(product.unitPrice)}</p></div>
                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => { const price = window.prompt("New price", String(product.unitPrice)); if (price && Number(price) > 0) void updateMarketplaceProduct(product.id, { unitPrice: Number(price) }).catch((reason: Error) => setError(reason.message)); }} className="rounded-full border border-border px-3 py-1.5 text-xs">Change price</button>
                      <button onClick={() => { const stock = window.prompt("Set available stock", String(product.stock)); if (stock !== null && Number.isInteger(Number(stock)) && Number(stock) >= 0) void updateMarketplaceProduct(product.id, { stock: Number(stock), active: Number(stock) > 0 }).catch((reason: Error) => setError(reason.message)); }} className="rounded-full border border-border px-3 py-1.5 text-xs">Update stock</button>
                      <button onClick={() => void updateMarketplaceProduct(product.id, { active: false }).catch((reason: Error) => setError(reason.message))} className="rounded-full border border-border px-3 py-1.5 text-xs text-danger">Remove listing</button>
                    </div>
                  </div>
                  {product.stock <= 3 && <p className="mt-2 text-xs text-warn">{product.stock === 0 ? "Out of stock — add stock to relist." : `Low stock — only ${product.stock} item(s) remain.`}</p>}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border border-border bg-bg-elevated p-5">
              <div className="mb-3 flex items-center gap-2"><Camera size={17} className="text-signal" /><h2 className="font-display text-xl font-semibold">Seller payout QR</h2></div>
              <p className="text-sm text-fg-muted">Save your UPI QR in the marketplace database. Admin uses it to send your payout, then marks it paid here.</p>
              {profile.payoutQrUrl && <div className="relative mt-4 h-48 w-48 overflow-hidden rounded-xl bg-white p-2"><Image src={profile.payoutQrUrl} alt="Seller payout QR" fill sizes="192px" className="object-contain" unoptimized /></div>}
              <label className="mt-4 block text-sm text-fg-muted">Upload or change QR (PNG/JPG/WEBP, up to 5 MB before compression)<input type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => setPayoutFile(fileFromInput(event))} className={fieldClass} /></label>
              <button onClick={() => void savePayoutQr()} disabled={busy || !payoutFile} className="mt-3 inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm disabled:opacity-50"><Upload size={14} /> Save payout QR</button>
            </div>

            <div className="rounded-2xl border border-border bg-bg-elevated p-5">
              <div className="mb-3 flex items-center gap-2"><Store size={17} className="text-signal" /><h2 className="font-display text-xl font-semibold">Sales and payouts</h2></div>
              <div className="space-y-3">
                {sellOrders.length === 0 ? <p className="text-sm text-fg-muted">No sales yet.</p> : sellOrders.map((order) => (
                  <div key={order.id} className="rounded-xl border border-border p-3">
                    <div className="flex justify-between gap-3"><span className="font-medium">{order.productName} × {order.quantity}</span><span>{formatRupees(order.total)}</span></div>
                    <p className="mt-1 text-xs text-fg-muted">Buyer: {order.buyerName} · {orderStatus(order.status)}</p>
                    {order.status === "confirmed" && <p className={`mt-2 text-xs ${order.payoutStatus === "paid" ? "text-circuit" : "text-warn"}`}>Seller payout: {order.payoutStatus === "paid" ? "Paid" : "Under process"}</p>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {!canBuy && !canSell && <p className="mt-8 text-sm text-danger">This account does not have a marketplace role.</p>}
      <div className="mt-8 flex items-center gap-2 text-xs text-fg-muted"><BadgeCheck size={14} /> Orders and stock sync through Firebase across signed-in users.</div>
    </main>
  );
}
