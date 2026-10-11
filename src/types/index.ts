export type BuildStatus = "SHIPPED" | "BETA" | "IN_DEV" | "DEPRECATED";

export interface AppVersion {
  version: string;
  date: string;
  notes: string[];
  downloadUrl?: string;
  sizeMb?: number;
}

export interface AppReview {
  id: string;
  author: string;
  rating: number;
  comment: string;
  date: string;
}

export interface App {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  status: BuildStatus;
  category: string;
  icon: string;
  screenshots: string[];
  rating: number;
  reviewCount: number;
  downloadCount: number;
  versions: AppVersion[];
  reviews: AppReview[];
  releasedAt: string;
  updatedAt: string;
  packageName?: string;
  tags: string[];
}

export interface Project {
  id: string;
  slug: string;
  name: string;
  summary: string;
  description: string;
  status: BuildStatus;
  stack: string[];
  repoUrl?: string;
  liveUrl?: string;
  coverImage: string;
  startedAt: string;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage: string;
  author: string;
  publishedAt: string;
  tags: string[];
  readMinutes: number;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  avatar: string;
  socials: { github?: string; twitter?: string; linkedin?: string };
}

export interface MarketplaceProduct {
  id: string;
  sellerId: string;
  name: string;
  category: string;
  unitPrice: number;
  stock: number;
  seller: string;
  description: string;
  image: string;
  active: boolean;
  reservedOrderIds?: string[];
  lastReleasedOrderId: string;
  createdAt: string;
}

export interface MarketplaceOrder {
  id: string;
  productId: string;
  productName: string;
  sellerId: string;
  sellerName: string;
  buyerId: string;
  buyerName: string;
  buyerEmail: string;
  unitPrice: number;
  quantity: number;
  total: number;
  note: string;
  status: "awaiting_payment" | "payment_review" | "confirmed" | "rejected" | "expired";
  payoutStatus: "pending" | "paid";
  expiresAt: number;
  createdAt: string;
}

export interface MarketplacePaymentProof {
  id: string;
  orderId: string;
  buyerId: string;
  paymentUtr: string;
  paymentProofUrl: string;
  createdAt: string;
}

export interface MarketplaceProfile {
  id: string;
  role: "buyer" | "seller" | "both" | "admin";
  name: string;
  email: string;
  payoutQrUrl?: string;
  createdAt: string;
}

export type DigitalTextStatus =
  | "under_review"
  | "available"
  | "reserved"
  | "sold"
  | "disabled";

export interface DigitalTextCatalogItem {
  id: string;
  sellerId: string;
  mainText?: string;
  preview: string;
  status: DigitalTextStatus;
  createdAt: { seconds: number; nanoseconds: number };
}

export interface DigitalTextOrderItem {
  itemId: string;
  sellerId: string;
  sellerName?: string;
  customerPrice: number;
  sellerEarning: number;
}

export interface DigitalTextOrder {
  id: string;
  buyerId: string;
  itemIds: string[];
  items: DigitalTextOrderItem[];
  total: number;
  currency: "INR";
  status: "awaiting_payment" | "payment_review" | "confirmed" | "rejected" | "expired";
  payoutStatus: "pending" | "paid";
  createdAt: { seconds: number; nanoseconds: number } | string;
  expiresAt: number | { seconds: number; nanoseconds: number };
}

export interface DigitalTextSellerListing {
  id: string;
  sellerId: string;
  sellerName: string;
  status: DigitalTextStatus;
  createdAt: { seconds: number; nanoseconds: number } | string;
}

export interface DigitalTextSellerListingDetails {
  id: string;
  mainText: string;
  relatedText: string;
}

export interface DigitalTextSale {
  itemId: string;
  orderId: string;
  sellerId: string;
  sellerEarning: number;
  payoutStatus: "pending" | "paid";
  createdAt: { seconds: number; nanoseconds: number } | string;
}

export interface SearchResult {
  type: "app" | "project" | "blog" | "page";
  title: string;
  description: string;
  href: string;
}
