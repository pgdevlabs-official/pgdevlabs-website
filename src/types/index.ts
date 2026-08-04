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

export interface SearchResult {
  type: "app" | "project" | "blog" | "page";
  title: string;
  description: string;
  href: string;
}
