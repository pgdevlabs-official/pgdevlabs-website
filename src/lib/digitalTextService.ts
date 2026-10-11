import {
  collection,
  documentId,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  startAfter,
  setDoc,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { db, requireFirebaseAuth } from "@/lib/firebaseConfig";
import type {
  DigitalTextCatalogItem,
  DigitalTextOrder,
  DigitalTextSale,
  DigitalTextSellerListing,
  DigitalTextSellerListingDetails,
  MarketplaceProfile,
} from "@/types";

const collections = {
  catalog: "digitalTextCatalog",
  items: "digitalTextItems",
  orders: "digitalTextOrders",
  fingerprints: "digitalTextFingerprints",
  sales: "digitalTextSales",
  settings: "digitalTextSettings",
  rejections: "digitalTextRejections",
  audit: "digitalTextAuditEvents",
  users: "marketplaceUsers",
};

const maximumTextLength = 20_000;
const maximumCartItems = 8;
const screenshotLimit = 600_000;
const reservationClockSkewAllowanceMs = 5_000;
const configuredAdminEmail = (process.env.NEXT_PUBLIC_ADMIN_EMAIL || "prashantraj93345@gmail.com").toLowerCase();
const configuredMarketplaceUpiId = process.env.NEXT_PUBLIC_MARKETPLACE_UPI_ID?.trim() || "";
const upiIdPattern = /^[A-Za-z0-9._-]{2,256}@[A-Za-z0-9.-]{2,64}$/;

export interface DigitalTextPricing {
  customerPrice: number;
  sellerEarning: number;
  reservationMinutes: number;
  approvalRequired: boolean;
  marketplaceUpiId?: string;
  currency: "INR";
}

export interface DigitalTextCatalog {
  customerPrice: number;
  marketplaceUpiId: string;
  currency: "INR";
  items: DigitalTextCatalogItem[];
  nextCursor: { createdAt: { seconds: number; nanoseconds: number }; id: string } | null;
}

export interface DigitalTextSellerDashboard {
  items: DigitalTextSellerListing[];
  sales: DigitalTextSale[];
  rejections: { reason: string; createdAt: unknown }[];
}

export interface DigitalTextAdminDashboard {
  pricing: DigitalTextPricing | null;
  inventory: DigitalTextCatalogItem[];
  orders: DigitalTextOrder[];
  rejections: { sellerId: string; reason: string; createdAt: unknown }[];
  audit: {
    action: string;
    adminId: string;
    subjectType: string;
    subjectId: string;
    createdAt: unknown;
  }[];
  sellers: { id: string; name: string; email: string; suspended: boolean }[];
  pendingSales: DigitalTextSale[];
}

function requireVerifiedUser() {
  const user = requireFirebaseAuth().currentUser;
  if (!user) throw new Error("Sign in to use the digital marketplace.");
  if (!user.emailVerified) throw new Error("Verify your email before using the digital marketplace.");
  return user;
}

async function requireProfile(roles: MarketplaceProfile["role"][]) {
  const user = requireVerifiedUser();
  const snapshot = await getDoc(doc(db, collections.users, user.uid));
  if (!snapshot.exists()) throw new Error("Create a marketplace account first.");
  const profile = snapshot.data() as MarketplaceProfile & { marketplaceSuspended?: boolean };
  if (profile.marketplaceSuspended) throw new Error("This marketplace account is suspended.");
  if (!roles.includes(profile.role)) throw new Error("Your marketplace account cannot do that action.");
  return { user, profile };
}

async function requireAdmin() {
  const { user, profile } = await requireProfile(["admin"]);
  if (user.email?.toLowerCase() !== configuredAdminEmail) {
    throw new Error("Administrator permission is required.");
  }
  return { user, profile };
}

function canonicalText(value: string, label: string) {
  if (typeof value !== "string") throw new Error(`${label} is required.`);
  const normalized = value.replace(/\r\n?/g, "\n").normalize("NFC").trim();
  if (!normalized) throw new Error(`${label} cannot be empty.`);
  if (normalized.length > maximumTextLength) {
    throw new Error(`${label} must be ${maximumTextLength} characters or fewer.`);
  }
  return normalized;
}

async function fingerprint(value: string) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function asCatalogItem(id: string, data: Record<string, unknown>): DigitalTextCatalogItem {
  return { id, ...data } as DigitalTextCatalogItem;
}

function asOrder(id: string, data: Record<string, unknown>): DigitalTextOrder {
  return { id, ...data } as DigitalTextOrder;
}

export async function fetchDigitalTextCatalog(
  pageSize = 50,
  cursor?: DigitalTextCatalog["nextCursor"]
): Promise<DigitalTextCatalog> {
  const pricingSnapshot = await getDoc(doc(db, collections.settings, "pricing"));
  const customerPrice = pricingSnapshot.exists() ? Number(pricingSnapshot.data().customerPrice || 0) : 0;
  let listingQuery = query(
    collection(db, collections.catalog),
    where("status", "==", "available"),
    orderBy("createdAt", "desc"),
    orderBy(documentId(), "desc"),
    limit(Math.min(Math.max(pageSize, 1), 50))
  );
  if (cursor) {
    listingQuery = query(
      collection(db, collections.catalog),
      where("status", "==", "available"),
      orderBy("createdAt", "desc"),
      orderBy(documentId(), "desc"),
      startAfter(
        new Timestamp(cursor.createdAt.seconds, cursor.createdAt.nanoseconds),
        cursor.id
      ),
      limit(Math.min(Math.max(pageSize, 1), 50))
    );
  }
  const snapshot = await getDocs(listingQuery);
  const items = snapshot.docs.map((entry) => asCatalogItem(entry.id, entry.data()));
  return {
    customerPrice,
    marketplaceUpiId: String(
      pricingSnapshot.exists()
        ? pricingSnapshot.data().marketplaceUpiId || configuredMarketplaceUpiId
        : configuredMarketplaceUpiId
    ).trim(),
    currency: "INR",
    items,
    nextCursor: items.length === Math.min(Math.max(pageSize, 1), 50)
      ? {
          id: items.at(-1)?.id ?? "",
          createdAt: items.at(-1)?.createdAt ?? { seconds: 0, nanoseconds: 0 },
        }
      : null,
  };
}

export async function createDigitalTextListing(mainValue: string, relatedValue: string) {
  const { user, profile } = await requireProfile(["seller", "both", "admin"]);
  const mainText = canonicalText(mainValue, "Main Text");
  const relatedText = canonicalText(relatedValue, "Related Text");
  if (mainText === relatedText) throw new Error("Main Text and Related Text must be different.");
  const [mainHash, relatedHash] = await Promise.all([
    fingerprint(mainText),
    fingerprint(relatedText),
  ]);
  const pairHash = await fingerprint([mainHash, relatedHash].sort().join(":"));
  const fingerprintIds = [`text_${mainHash}`, `text_${relatedHash}`, `pair_${pairHash}`];
  const fingerprintRefs = fingerprintIds.map((id) => doc(db, collections.fingerprints, id));
  const itemRef = doc(collection(db, collections.items));
  const catalogRef = doc(db, collections.catalog, itemRef.id);
  const rejectionRef = doc(collection(db, collections.rejections));
  const pricingRef = doc(db, collections.settings, "pricing");
  const profileRef = doc(db, collections.users, user.uid);

  return runTransaction(db, async (transaction) => {
    const [pricingSnapshot, profileSnapshot, ...fingerprintSnapshots] = await Promise.all([
      transaction.get(pricingRef),
      transaction.get(profileRef),
      ...fingerprintRefs.map((reference) => transaction.get(reference)),
    ]);
    if (!pricingSnapshot.exists() || !(Number(pricingSnapshot.data().customerPrice) > 0)) {
      throw new Error("Admin must configure marketplace pricing before listings can be submitted.");
    }
    if (!profileSnapshot.exists() || profileSnapshot.data().marketplaceSuspended === true) {
      throw new Error("This seller account is not eligible to submit listings.");
    }
    if (fingerprintSnapshots.some((entry) => entry.exists())) {
      transaction.set(rejectionRef, {
        sellerId: user.uid,
        reason: "duplicate_content",
        createdAt: serverTimestamp(),
      });
      return { itemId: "", status: "rejected", duplicate: true };
    }
    const status = pricingSnapshot.data().approvalRequired === true ? "under_review" : "available";
    const createdAt = Timestamp.now();
    transaction.set(itemRef, {
      sellerId: user.uid,
      sellerName: profile.name,
      mainText,
      relatedText,
      status,
      createdAt,
    });
    transaction.set(catalogRef, {
      sellerId: user.uid,
      mainText,
      preview: "Read the public Main Text. Related Text is delivered after payment is verified.",
      status,
      createdAt,
    });
    for (let index = 0; index < fingerprintRefs.length; index += 1) {
      transaction.set(fingerprintRefs[index], {
        itemId: itemRef.id,
        sellerId: user.uid,
        field: index === 0 ? "mainTextHash" : index === 1 ? "relatedTextHash" : "pairHash",
        createdAt,
      });
    }
    return { itemId: itemRef.id, status, duplicate: false };
  });
}

export async function createDigitalTextOrder(itemIds: string[], serverTimeOffsetMs: number) {
  const { user, profile } = await requireProfile(["buyer", "both", "admin"]);
  if (!Array.isArray(itemIds) || itemIds.length < 1 || itemIds.length > maximumCartItems) {
    throw new Error(`Choose between 1 and ${maximumCartItems} different items per order.`);
  }
  if (new Set(itemIds).size !== itemIds.length) throw new Error("An item can only be added once to an order.");
  if (!Number.isFinite(serverTimeOffsetMs) || Math.abs(serverTimeOffsetMs) > 5 * 60 * 1000) {
    throw new Error("Your device clock is too far from Firebase server time. Check your computer date and time, then try again.");
  }
  const orderRef = doc(collection(db, collections.orders));
  const pricingRef = doc(db, collections.settings, "pricing");
  const profileRef = doc(db, collections.users, user.uid);
  const catalogRefs = itemIds.map((id) => doc(db, collections.catalog, id));
  return runTransaction(db, async (transaction) => {
    const [pricingSnapshot, profileSnapshot, ...catalogSnapshots] = await Promise.all([
      transaction.get(pricingRef),
      transaction.get(profileRef),
      ...catalogRefs.map((reference) => transaction.get(reference)),
    ]);
    if (!pricingSnapshot.exists()) throw new Error("Marketplace pricing is not configured.");
    if (!profileSnapshot.exists() || profileSnapshot.data().marketplaceSuspended === true) {
      throw new Error("This buyer account is not eligible to purchase.");
    }
    const pricing = pricingSnapshot.data();
    const customerPrice = Number(pricing.customerPrice);
    const sellerEarning = Number(pricing.sellerEarning);
    if (!Number.isFinite(customerPrice) || customerPrice <= 0 ||
        !Number.isFinite(sellerEarning) || sellerEarning < 0 || sellerEarning > customerPrice) {
      throw new Error("Marketplace pricing is invalid. Contact the administrator.");
    }
    const reservationMinutes = Number(pricing.reservationMinutes);
    if (!Number.isInteger(reservationMinutes) || reservationMinutes < 1 || reservationMinutes > 60) {
      throw new Error("Marketplace reservation timeout is invalid. Contact the administrator.");
    }
    if (catalogSnapshots.some((entry) => !entry.exists() || entry.data().status !== "available")) {
      throw new Error("One or more selected items are unavailable. Refresh the listings.");
    }
    const total = Math.round(customerPrice * itemIds.length * 100) / 100;
    const expiresAt = Date.now() + serverTimeOffsetMs
      + reservationMinutes * 60 * 1000 - reservationClockSkewAllowanceMs;
    transaction.set(orderRef, {
      buyerId: user.uid,
      buyerName: profile.name,
      itemIds: [...itemIds],
      itemCount: itemIds.length,
      total,
      currency: "INR",
      status: "awaiting_payment",
      payoutStatus: "pending",
      createdAt: Timestamp.now(),
      expiresAt: Timestamp.fromMillis(expiresAt),
    });
    for (let index = 0; index < itemIds.length; index += 1) {
      const catalogSnapshot = catalogSnapshots[index];
      if (!catalogSnapshot?.exists()) throw new Error("One or more selected items are unavailable. Refresh the listings.");
      const listing = catalogSnapshot.data();
      const orderItemRef = doc(orderRef, "items", itemIds[index]);
      transaction.set(orderItemRef, {
        itemId: itemIds[index],
        sellerId: String(listing.sellerId),
        customerPrice,
        sellerEarning,
      });
      transaction.update(catalogRefs[index], {
        status: "reserved",
        reservedOrderId: orderRef.id,
      });
      transaction.update(doc(db, collections.items, itemIds[index]), {
        status: "reserved",
        reservedOrderId: orderRef.id,
      });
    }
    return { id: orderRef.id, total, itemCount: itemIds.length, expiresAt };
  });
}

export async function submitDigitalTextPaymentProof(orderId: string, utrValue: string, screenshot: string) {
  const { user } = await requireProfile(["buyer", "both", "admin"]);
  const utr = utrValue.trim();
  if (utr.length < 6 || utr.length > 80) throw new Error("Enter a valid UPI reference number.");
  if (!/^data:image\/(png|jpeg|webp);base64,/.test(screenshot) || screenshot.length > screenshotLimit) {
    throw new Error("Choose an image smaller than 600 KB.");
  }
  const orderRef = doc(db, collections.orders, orderId);
  const proofRef = doc(orderRef, "private", "paymentProof");
  await runTransaction(db, async (transaction) => {
    const orderSnapshot = await transaction.get(orderRef);
    if (!orderSnapshot.exists() || orderSnapshot.data().buyerId !== user.uid ||
        orderSnapshot.data().status !== "awaiting_payment") {
      throw new Error("This order cannot accept payment proof.");
    }
    transaction.update(orderRef, { status: "payment_review" });
    transaction.set(proofRef, { buyerId: user.uid, utr, screenshot, createdAt: Timestamp.now() });
  });
}

export async function fetchDigitalTextBuyerOrders() {
  const { user } = await requireProfile(["buyer", "both", "admin"]);
  const snapshot = await getDocs(query(
    collection(db, collections.orders),
    where("buyerId", "==", user.uid),
    orderBy("createdAt", "desc"),
    limit(50)
  ));
  return snapshot.docs.map((entry) => asOrder(entry.id, entry.data()));
}

export async function fetchPurchasedDigitalText(orderId: string) {
  const { user } = await requireProfile(["buyer", "both", "admin"]);
  const orderRef = doc(db, collections.orders, orderId);
  const orderSnapshot = await getDoc(orderRef);
  if (!orderSnapshot.exists() || orderSnapshot.data().buyerId !== user.uid ||
      orderSnapshot.data().status !== "confirmed") {
    throw new Error("This purchase is not confirmed or does not belong to your account.");
  }
  const snapshots = await getDocs(collection(orderRef, "items"));
  const contents = await Promise.all(snapshots.docs.map(async (entry) => {
    const privateItem = await getDoc(doc(db, collections.items, entry.id));
    if (!privateItem.exists() || privateItem.data().buyerId !== user.uid ||
        privateItem.data().soldOrderId !== orderId) {
      throw new Error("Purchase entitlement could not be verified.");
    }
    return {
      id: privateItem.id,
      mainText: privateItem.data().mainText as string,
      relatedText: privateItem.data().relatedText as string,
    };
  }));
  return contents;
}

export async function fetchDigitalTextSellerDashboard(): Promise<DigitalTextSellerDashboard> {
  const { user } = await requireProfile(["seller", "both", "admin"]);
  const [items, sales, rejections] = await Promise.all([
    getDocs(query(collection(db, collections.items), where("sellerId", "==", user.uid), orderBy("createdAt", "desc"), limit(100))),
    getDocs(query(collection(db, collections.sales), where("sellerId", "==", user.uid), orderBy("createdAt", "desc"), limit(100))),
    getDocs(query(collection(db, collections.rejections), where("sellerId", "==", user.uid), orderBy("createdAt", "desc"), limit(50))),
  ]);
  return {
    items: items.docs.map((entry) => ({ id: entry.id, ...entry.data() } as DigitalTextSellerListing)),
    sales: sales.docs.map((entry) => ({ itemId: entry.id, ...entry.data() } as DigitalTextSale)),
    rejections: rejections.docs.map((entry) => entry.data() as { reason: string; createdAt: unknown }),
  };
}

export async function fetchDigitalTextSellerItem(itemId: string): Promise<DigitalTextSellerListingDetails> {
  const { user } = await requireProfile(["seller", "both", "admin"]);
  const snapshot = await getDoc(doc(db, collections.items, itemId));
  if (!snapshot.exists() || snapshot.data().sellerId !== user.uid) {
    throw new Error("Seller listing not found.");
  }
  return {
    id: snapshot.id,
    mainText: String(snapshot.data().mainText),
    relatedText: String(snapshot.data().relatedText),
  };
}

export async function fetchDigitalTextAdminDashboard(): Promise<DigitalTextAdminDashboard> {
  await requireAdmin();
  const [pricing, inventory, orders, rejections, sellers, audit, pendingSales] = await Promise.all([
    getDoc(doc(db, collections.settings, "pricing")),
    getDocs(query(collection(db, collections.catalog), orderBy("createdAt", "desc"), limit(50))),
    getDocs(query(collection(db, collections.orders), orderBy("createdAt", "desc"), limit(50))),
    getDocs(query(collection(db, collections.rejections), orderBy("createdAt", "desc"), limit(50))),
    getDocs(query(collection(db, collections.users), where("role", "in", ["seller", "both"]), limit(50))),
    getDocs(query(collection(db, collections.audit), orderBy("createdAt", "desc"), limit(50))),
    getDocs(query(collection(db, collections.sales), where("payoutStatus", "==", "pending"), orderBy("createdAt", "desc"), limit(100))),
  ]);
  const ordersWithItems = await Promise.all(orders.docs.map(async (entry) => {
    const items = await getDocs(collection(db, collections.orders, entry.id, "items"));
    return asOrder(entry.id, {
      ...entry.data(),
      items: items.docs.map((item) => item.data()),
    });
  }));
  return {
    pricing: pricing.exists() ? pricing.data() as DigitalTextPricing : null,
    inventory: inventory.docs.map((entry) => asCatalogItem(entry.id, entry.data())),
    orders: ordersWithItems,
    rejections: rejections.docs.map((entry) => entry.data() as { sellerId: string; reason: string; createdAt: unknown }),
    sellers: sellers.docs.map((entry) => ({
      id: entry.id,
      name: String(entry.data().name || "Seller"),
      email: String(entry.data().email || ""),
      suspended: entry.data().marketplaceSuspended === true,
    })),
    audit: audit.docs.map((entry) => entry.data() as DigitalTextAdminDashboard["audit"][number]),
    pendingSales: pendingSales.docs.map((entry) => ({ itemId: entry.id, ...entry.data() } as DigitalTextSale)),
  };
}

export async function fetchDigitalTextAdminPaymentProof(orderId: string) {
  await requireAdmin();
  const proof = await getDoc(doc(db, collections.orders, orderId, "private", "paymentProof"));
  if (!proof.exists()) throw new Error("No payment proof was submitted for this order.");
  return { utr: String(proof.data().utr), screenshot: String(proof.data().screenshot) };
}

export async function fetchDigitalTextAdminSellerPayoutQr(sellerId: string) {
  await requireAdmin();
  const seller = await getDoc(doc(db, collections.users, sellerId));
  if (!seller.exists()) throw new Error("Seller account not found.");
  return { payoutQrUrl: String(seller.data().payoutQrUrl || "") };
}

export type DigitalTextAdminAction =
  | {
      action: "setPricing";
      customerPrice: number;
      sellerEarning: number;
      reservationMinutes: number;
      approvalRequired: boolean;
      marketplaceUpiId: string;
    }
  | { action: "reviewListing"; itemId: string; approve: boolean }
  | { action: "setListingAvailability"; itemId: string; available: boolean }
  | { action: "publishMainText"; itemId: string }
  | { action: "confirmPayment"; orderId: string; bankVerifiedPayment: true }
  | {
      action: "rejectPayment" | "releaseExpired";
      orderId: string;
      bankCheckedNoPayment: true;
      note?: string;
    }
  | { action: "markPayoutPaid"; itemId: string }
  | { action: "suspendSeller"; sellerId: string; suspended: boolean };

async function audit(action: string, subjectType: string, subjectId: string, details: Record<string, unknown> = {}) {
  const user = requireVerifiedUser();
  await setDoc(doc(collection(db, collections.audit)), {
    action,
    adminId: user.uid,
    subjectType,
    subjectId,
    details,
    createdAt: serverTimestamp(),
  });
}

export async function digitalTextAdminAction(action: DigitalTextAdminAction) {
  const { user } = await requireAdmin();
  const catalogRef = (id: string) => doc(db, collections.catalog, id);
  const itemRef = (id: string) => doc(db, collections.items, id);
  const orderRef = (id: string) => doc(db, collections.orders, id);

  if (action.action === "setPricing") {
    const { customerPrice, sellerEarning, reservationMinutes, marketplaceUpiId } = action;
    if (!Number.isFinite(customerPrice) || customerPrice <= 0 || sellerEarning < 0 ||
        sellerEarning > customerPrice || !Number.isInteger(reservationMinutes) ||
        reservationMinutes < 1 || reservationMinutes > 60) {
      throw new Error("Enter valid prices and a reservation timeout from 1 to 60 minutes.");
    }
    if (!upiIdPattern.test(marketplaceUpiId.trim())) {
      throw new Error("Enter a valid marketplace UPI ID, such as name@bank.");
    }
    await setDoc(doc(db, collections.settings, "pricing"), {
      customerPrice,
      sellerEarning,
      reservationMinutes,
      approvalRequired: action.approvalRequired,
      marketplaceUpiId: marketplaceUpiId.trim(),
      currency: "INR",
      updatedAt: serverTimestamp(),
      updatedBy: user.uid,
    }, { merge: true });
    await audit(action.action, "pricing", "current", { customerPrice, sellerEarning, reservationMinutes });
    return { success: true };
  }

  if (action.action === "publishMainText") {
    const privateSnapshot = await getDoc(itemRef(action.itemId));
    const publicSnapshot = await getDoc(catalogRef(action.itemId));
    if (!privateSnapshot.exists() || !publicSnapshot.exists()) {
      throw new Error("Listing not found. Refresh the inventory and try again.");
    }
    const mainText = String(privateSnapshot.data().mainText || "");
    if (!mainText) throw new Error("The listing has no main text to publish.");
    await updateDoc(catalogRef(action.itemId), { mainText });
    await audit(action.action, "listing", action.itemId);
    return { success: true };
  }

  if (action.action === "reviewListing" || action.action === "setListingAvailability") {
    await runTransaction(db, async (transaction) => {
      const privateRef = itemRef(action.itemId);
      const publicRef = catalogRef(action.itemId);
      const [privateSnapshot, publicSnapshot] = await Promise.all([
        transaction.get(privateRef),
        transaction.get(publicRef),
      ]);
      if (!privateSnapshot.exists() || !publicSnapshot.exists()) throw new Error("Listing not found.");
      const current = privateSnapshot.data().status;
      if (current === "sold" || current === "reserved") throw new Error("Reserved or sold listings cannot be changed.");
      let status: string;
      if (action.action === "reviewListing") {
        if (current !== "under_review") throw new Error("This listing is not awaiting review.");
        status = action.approve ? "available" : "disabled";
      } else {
        if (!["available", "disabled"].includes(current)) throw new Error("Only unsold listings can change availability.");
        status = action.available ? "available" : "disabled";
      }
      transaction.update(privateRef, { status, reviewedAt: Timestamp.now(), reviewedBy: user.uid });
      transaction.update(publicRef, {
        status,
        mainText: privateSnapshot.data().mainText,
      });
    });
    await audit(action.action, "listing", action.itemId);
    return { success: true };
  }

  if (action.action === "suspendSeller") {
    if (!action.sellerId || action.sellerId === user.uid) throw new Error("Choose a different seller account.");
    await updateDoc(doc(db, collections.users, action.sellerId), {
      marketplaceSuspended: action.suspended,
      suspensionUpdatedAt: serverTimestamp(),
      suspensionUpdatedBy: user.uid,
    });
    await audit(action.action, "seller", action.sellerId, { suspended: action.suspended });
    return { success: true };
  }

  if (action.action === "markPayoutPaid") {
    const saleRef = doc(db, collections.sales, action.itemId);
    await runTransaction(db, async (transaction) => {
      const sale = await transaction.get(saleRef);
      if (!sale.exists()) throw new Error("Seller sale not found.");
      const saleData = sale.data();
      const order = await transaction.get(orderRef(saleData.orderId));
      if (!order.exists() || order.data().status !== "confirmed") {
        throw new Error("Only confirmed sales are eligible for payout.");
      }
      if (saleData.payoutStatus === "paid") return;
      transaction.update(saleRef, { payoutStatus: "paid", paidAt: Timestamp.now(), paidBy: user.uid });
    });
    await audit(action.action, "sale", action.itemId);
    return { success: true };
  }

  await runTransaction(db, async (transaction) => {
    const currentOrderRef = orderRef(action.orderId);
    const orderSnapshot = await transaction.get(currentOrderRef);
    if (!orderSnapshot.exists()) throw new Error("Order not found.");
    const order = orderSnapshot.data();
    const rows = await Promise.all(order.itemIds.map(async (itemId: string) => {
      const entry = await transaction.get(doc(currentOrderRef, "items", itemId));
      if (!entry.exists()) throw new Error("The order is missing a reserved item.");
      return { id: itemId, ...entry.data() };
    }));
    const privateRefs = rows.map((entry) => itemRef(entry.id));
    const publicRefs = rows.map((entry) => catalogRef(entry.id));
    const privateSnapshots = await Promise.all(privateRefs.map((reference) => transaction.get(reference)));
    const publicSnapshots = await Promise.all(publicRefs.map((reference) => transaction.get(reference)));

    if (action.action === "confirmPayment") {
      if (action.bankVerifiedPayment !== true) throw new Error("Verify payment in your bank/UPI app first.");
      if (order.status === "confirmed") return;
      if (order.status !== "payment_review") throw new Error("Only orders awaiting payment review can be confirmed.");
      for (let index = 0; index < rows.length; index += 1) {
        const privateSnapshot = privateSnapshots[index];
        const publicSnapshot = publicSnapshots[index];
        if (!privateSnapshot || !privateSnapshot.exists() ||
            privateSnapshot.data().status !== "reserved" ||
            privateSnapshot.data().reservedOrderId !== action.orderId ||
            !publicSnapshot || !publicSnapshot.exists() ||
            publicSnapshot.data().status !== "reserved" ||
            publicSnapshot.data().reservedOrderId !== action.orderId) {
          throw new Error("A reserved item changed. Investigate this order before confirming.");
        }
      }
      for (let index = 0; index < rows.length; index += 1) {
        const saleRef = doc(db, collections.sales, rows[index].id);
        transaction.update(privateRefs[index], {
          status: "sold",
          buyerId: order.buyerId,
          soldOrderId: action.orderId,
          soldAt: Timestamp.now(),
        });
        transaction.update(publicRefs[index], { status: "sold" });
        transaction.set(saleRef, {
          itemId: rows[index].id,
          orderId: action.orderId,
          sellerId: rows[index].sellerId,
          sellerEarning: rows[index].sellerEarning,
          payoutStatus: "pending",
          createdAt: Timestamp.now(),
        });
      }
      transaction.update(currentOrderRef, {
        status: "confirmed",
        paymentVerifiedAt: Timestamp.now(),
        paymentVerifiedBy: user.uid,
      });
      return;
    }

    if (action.bankCheckedNoPayment !== true) {
      throw new Error("Check your bank/UPI app and confirm that no payment was received.");
    }
    if (action.action === "releaseExpired" &&
        (order.status !== "awaiting_payment" || order.expiresAt.toMillis() > Date.now())) {
      throw new Error("Only an expired order that is still awaiting payment can be released.");
    }
    if (action.action === "rejectPayment" && order.status !== "payment_review") {
      throw new Error("This order is not awaiting payment review.");
    }
    if (!["awaiting_payment", "payment_review"].includes(order.status)) return;
    for (let index = 0; index < rows.length; index += 1) {
      const privateSnapshot = privateSnapshots[index];
      const publicSnapshot = publicSnapshots[index];
      if (privateSnapshot?.exists() && privateSnapshot.data().reservedOrderId === action.orderId &&
          privateSnapshot.data().status === "reserved" && publicSnapshot?.exists() &&
          publicSnapshot.data().reservedOrderId === action.orderId &&
          publicSnapshot.data().status === "reserved") {
        transaction.update(privateRefs[index], { status: "available", reservedOrderId: "" });
        transaction.update(publicRefs[index], { status: "available", reservedOrderId: "" });
      }
    }
    transaction.update(currentOrderRef, {
      status: action.action === "releaseExpired" ? "expired" : "rejected",
      releasedAt: Timestamp.now(),
      releasedBy: user.uid,
      releaseNote: action.note || "No payment received, checked by admin.",
    });
  });
  await audit(action.action, "order", action.orderId);
  return { success: true };
}
