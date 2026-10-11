import {
  createUserWithEmailAndPassword,
  deleteUser,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  setDoc,
  updateDoc,
  where,
  type Unsubscribe,
  writeBatch,
} from "firebase/firestore";
import { db, requireFirebaseAuth } from "@/lib/firebaseConfig";
import type {
  MarketplaceOrder,
  MarketplacePaymentProof,
  MarketplaceProduct,
  MarketplaceProfile,
} from "@/types";

const profileCollection = "marketplaceUsers";
const productCollection = "marketplaceProducts";
const orderCollection = "marketplaceOrders";
const paymentProofCollection = "marketplacePaymentProofs";
const configuredAdminEmail = (process.env.NEXT_PUBLIC_ADMIN_EMAIL || "prashantraj93345@gmail.com").toLowerCase();

export async function registerMarketplaceUser(
  name: string,
  email: string,
  password: string,
  role: "buyer" | "seller" | "both"
) {
  const normalizedName = name.trim();
  const normalizedEmail = email.trim();
  if (normalizedName.length < 2 || normalizedName.length > 80) {
    throw new Error("Enter a name between 2 and 80 characters.");
  }
  if (password.length < 6) throw new Error("Choose a password with at least 6 characters.");
  const credential = await createUserWithEmailAndPassword(requireFirebaseAuth(), normalizedEmail, password);
  try {
    await sendEmailVerification(credential.user);
  } catch (error) {
    await deleteUser(credential.user);
    throw error;
  }
  const profile: MarketplaceProfile = {
    id: credential.user.uid,
    name: normalizedName,
    email: credential.user.email ?? normalizedEmail,
    role: credential.user.email?.toLowerCase() === configuredAdminEmail ? "admin" : role,
    createdAt: new Date().toISOString(),
  };
  try {
    await setDoc(doc(db, profileCollection, credential.user.uid), profile);
  } catch (error) {
    await deleteUser(credential.user);
    throw error;
  }
  return { user: credential.user, profile };
}

export async function loginMarketplaceUser(email: string, password: string) {
  const credential = await signInWithEmailAndPassword(requireFirebaseAuth(), email.trim(), password);
  if (credential.user.email?.toLowerCase() === configuredAdminEmail) {
    const profileRef = doc(db, profileCollection, credential.user.uid);
    const existingProfile = await getDoc(profileRef);
    if (existingProfile.exists()) {
      if (existingProfile.data().role !== "admin") {
        await updateDoc(profileRef, { role: "admin" });
      }
    } else {
      await setDoc(profileRef, {
        id: credential.user.uid,
        name: credential.user.displayName || credential.user.email.split("@")[0],
        email: credential.user.email,
        role: "admin",
        createdAt: new Date().toISOString(),
      } satisfies MarketplaceProfile);
    }
  }
  return credential.user;
}

export async function sendMarketplacePasswordReset(email: string) {
  await sendPasswordResetEmail(requireFirebaseAuth(), email.trim());
}

export async function resendMarketplaceEmailVerification() {
  const currentUser = requireFirebaseAuth().currentUser;
  if (!currentUser) throw new Error("Sign in before requesting another verification email.");
  await sendEmailVerification(currentUser);
}

export async function logoutMarketplaceUser() {
  await signOut(requireFirebaseAuth());
}

export function subscribeToProfile(
  userId: string,
  onProfile: (profile: MarketplaceProfile | null) => void,
  onError: (error: Error) => void
): Unsubscribe {
  return onSnapshot(
    doc(db, profileCollection, userId),
    (snapshot) => onProfile(snapshot.exists() ? (snapshot.data() as MarketplaceProfile) : null),
    onError
  );
}

export function subscribeToProducts(
  onProducts: (products: MarketplaceProduct[]) => void,
  onError: (error: Error) => void
): Unsubscribe {
  const productsQuery = query(
    collection(db, productCollection),
    where("active", "==", true),
    orderBy("createdAt", "desc")
  );
  return onSnapshot(
    productsQuery,
    (snapshot) =>
      onProducts(snapshot.docs.map((entry) => ({ id: entry.id, ...entry.data() }) as MarketplaceProduct)),
    onError
  );
}

export function subscribeToAllProducts(
  onProducts: (products: MarketplaceProduct[]) => void,
  onError: (error: Error) => void
): Unsubscribe {
  return onSnapshot(
    query(collection(db, productCollection), orderBy("createdAt", "desc")),
    (snapshot) =>
      onProducts(snapshot.docs.map((entry) => ({ id: entry.id, ...entry.data() }) as MarketplaceProduct)),
    onError
  );
}

export function subscribeToSellerProducts(
  sellerId: string,
  onProducts: (products: MarketplaceProduct[]) => void,
  onError: (error: Error) => void
): Unsubscribe {
  const productsQuery = query(
    collection(db, productCollection),
    where("sellerId", "==", sellerId),
    orderBy("createdAt", "desc")
  );
  return onSnapshot(
    productsQuery,
    (snapshot) =>
      onProducts(snapshot.docs.map((entry) => ({ id: entry.id, ...entry.data() }) as MarketplaceProduct)),
    onError
  );
}

export function subscribeToUserOrders(
  field: "buyerId" | "sellerId",
  userId: string,
  onOrders: (orders: MarketplaceOrder[]) => void,
  onError: (error: Error) => void
): Unsubscribe {
  const ordersQuery = query(
    collection(db, orderCollection),
    where(field, "==", userId),
    orderBy("createdAt", "desc")
  );
  return onSnapshot(
    ordersQuery,
    (snapshot) =>
      onOrders(snapshot.docs.map((entry) => ({ id: entry.id, ...entry.data() }) as MarketplaceOrder)),
    onError
  );
}

export function subscribeToAllOrders(
  onOrders: (orders: MarketplaceOrder[]) => void,
  onError: (error: Error) => void
): Unsubscribe {
  return onSnapshot(
    query(collection(db, orderCollection), orderBy("createdAt", "desc")),
    (snapshot) =>
      onOrders(snapshot.docs.map((entry) => ({ id: entry.id, ...entry.data() }) as MarketplaceOrder)),
    onError
  );
}

export async function createMarketplaceProduct(
  seller: MarketplaceProfile,
  product: Omit<
    MarketplaceProduct,
    "id" | "sellerId" | "seller" | "active" | "reservedOrderIds" | "lastReleasedOrderId" | "createdAt"
  >
) {
  await addDoc(collection(db, productCollection), {
    ...product,
    sellerId: seller.id,
    seller: seller.name,
    active: true,
    reservedOrderIds: [],
    lastReleasedOrderId: "",
    createdAt: new Date().toISOString(),
  });
}

export async function updateMarketplaceProduct(
  productId: string,
  values: Partial<Pick<MarketplaceProduct, "name" | "category" | "description" | "unitPrice" | "stock" | "image" | "active">>
) {
  await updateDoc(doc(db, productCollection, productId), values);
}

export async function updatePayoutQr(userId: string, payoutQrUrl: string) {
  await updateDoc(doc(db, profileCollection, userId), { payoutQrUrl });
}

export async function getMarketplaceProfile(userId: string) {
  const profile = await getDoc(doc(db, profileCollection, userId));
  return profile.exists() ? (profile.data() as MarketplaceProfile) : null;
}

export async function createMarketplaceOrder(
  buyer: MarketplaceProfile,
  product: MarketplaceProduct,
  quantity: number,
  note: string
) {
  const expiresAt = Date.now() + 5 * 60 * 1000;
  const orderRef = doc(collection(db, orderCollection));
  const productRef = doc(db, productCollection, product.id);
  const order = {
    productId: product.id,
    productName: product.name,
    sellerId: product.sellerId,
    sellerName: product.seller,
    buyerId: buyer.id,
    buyerName: buyer.name,
    buyerEmail: buyer.email,
    unitPrice: product.unitPrice,
    quantity,
    total: product.unitPrice * quantity,
    note,
    status: "awaiting_payment" as const,
    payoutStatus: "pending" as const,
    expiresAt,
    createdAt: new Date().toISOString(),
  };
  await runTransaction(db, async (transaction) => {
    const productSnapshot = await transaction.get(productRef);
    if (!productSnapshot.exists()) throw new Error("This product is no longer available.");
    const currentProduct = productSnapshot.data() as MarketplaceProduct;
    if (!currentProduct.active || currentProduct.stock < quantity) {
      throw new Error("There is not enough stock available. Refresh and try again.");
    }
    transaction.update(productRef, {
      stock: currentProduct.stock - quantity,
      reservedOrderIds: [...(currentProduct.reservedOrderIds ?? []), orderRef.id],
    });
    transaction.set(orderRef, order);
  });
  return { id: orderRef.id, ...order };
}

export async function submitOrderPayment(
  orderId: string,
  buyerId: string,
  paymentUtr: string,
  paymentProofUrl: string
) {
  const batch = writeBatch(db);
  batch.update(doc(db, orderCollection, orderId), { status: "payment_review" });
  batch.set(doc(db, paymentProofCollection, orderId), {
    orderId,
    buyerId,
    paymentUtr: paymentUtr.trim(),
    paymentProofUrl,
    createdAt: new Date().toISOString(),
  });
  await batch.commit();
}

export async function getMarketplacePaymentProof(orderId: string) {
  const proof = await getDoc(doc(db, paymentProofCollection, orderId));
  return proof.exists()
    ? ({ id: proof.id, ...proof.data() } as MarketplacePaymentProof)
    : null;
}

export async function expireMarketplaceOrder(orderId: string) {
  const orderRef = doc(db, orderCollection, orderId);
  await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(orderRef);
    if (!snapshot.exists()) return;
    const currentOrder = { id: snapshot.id, ...snapshot.data() } as MarketplaceOrder;
    if (currentOrder.status !== "awaiting_payment" || currentOrder.expiresAt > Date.now()) return;
    const productRef = doc(db, productCollection, currentOrder.productId);
    const productSnapshot = await transaction.get(productRef);
    if (productSnapshot.exists()) {
      const product = productSnapshot.data() as MarketplaceProduct;
      transaction.update(productRef, {
        stock: product.stock + currentOrder.quantity,
        reservedOrderIds: (product.reservedOrderIds ?? []).filter((id) => id !== orderId),
        lastReleasedOrderId: orderId,
      });
    }
    transaction.update(orderRef, { status: "expired" });
  });
}

export async function rejectMarketplaceOrder(orderId: string, reason: string) {
  const orderRef = doc(db, orderCollection, orderId);
  await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(orderRef);
    if (!snapshot.exists()) throw new Error("Order no longer exists.");
    const order = { id: snapshot.id, ...snapshot.data() } as MarketplaceOrder;
    if (order.status !== "payment_review") throw new Error("This order is not awaiting payment review.");
    const productRef = doc(db, productCollection, order.productId);
    const productSnapshot = await transaction.get(productRef);
    if (productSnapshot.exists()) {
      const product = productSnapshot.data() as MarketplaceProduct;
      transaction.update(productRef, {
        stock: product.stock + order.quantity,
        reservedOrderIds: (product.reservedOrderIds ?? []).filter((id) => id !== orderId),
        lastReleasedOrderId: orderId,
      });
    }
    transaction.update(orderRef, {
      status: "rejected",
      rejectionReason: reason,
    });
  });
}

export async function confirmMarketplaceOrder(order: MarketplaceOrder) {
  const orderRef = doc(db, orderCollection, order.id);
  const productRef = doc(db, productCollection, order.productId);
  await runTransaction(db, async (transaction) => {
    const [orderSnapshot, productSnapshot] = await Promise.all([
      transaction.get(orderRef),
      transaction.get(productRef),
    ]);
    if (!orderSnapshot.exists() || !productSnapshot.exists()) {
      throw new Error("Order or product no longer exists.");
    }
    const currentOrder = orderSnapshot.data() as MarketplaceOrder;
    const currentProduct = productSnapshot.data() as MarketplaceProduct;
    if (currentOrder.status !== "payment_review") {
      throw new Error("This order is not awaiting payment verification.");
    }
    if (!(currentProduct.reservedOrderIds ?? []).includes(order.id)) {
      throw new Error("The stock reservation for this order has expired.");
    }
    transaction.update(productRef, {
      reservedOrderIds: (currentProduct.reservedOrderIds ?? []).filter((id) => id !== order.id),
      lastReleasedOrderId: order.id,
    });
    transaction.update(orderRef, { status: "confirmed", payoutStatus: "pending" });
  });
}

export async function confirmSellerPayout(orderId: string) {
  await updateDoc(doc(db, orderCollection, orderId), { payoutStatus: "paid" });
}
