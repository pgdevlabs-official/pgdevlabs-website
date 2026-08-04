import { AppsService, ProjectsService, BlogService, TeamService } from "@/lib/firestoreService";
import { apps as mockApps, projects as mockProjects, blogPosts as mockBlogPosts, team as mockTeam } from "@/lib/mockData";
import type { App, Project, BlogPost, TeamMember } from "@/types";

// These wrap the Firestore service with a safe fallback to mock data.
// Until real Firebase keys are set in .env.local, Firestore calls will
// fail (invalid API key) — we catch that and serve mock data instead, so
// the site never breaks. Once real keys + real Firestore documents exist,
// this transparently switches to live data.

export async function getApps(): Promise<App[]> {
  try {
    const live = await AppsService.getAll();
    return live.length > 0 ? live : mockApps;
  } catch {
    return mockApps;
  }
}

export async function getAppBySlug(slug: string): Promise<App | null> {
  try {
    const live = await AppsService.getBySlug(slug);
    if (live) return live;
  } catch {
    // fall through to mock
  }
  return mockApps.find((a) => a.slug === slug) || null;
}

export async function getProjects(): Promise<Project[]> {
  try {
    const live = await ProjectsService.getAll();
    return live.length > 0 ? live : mockProjects;
  } catch {
    return mockProjects;
  }
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  try {
    const live = await ProjectsService.getBySlug(slug);
    if (live) return live;
  } catch {
    // fall through to mock
  }
  return mockProjects.find((p) => p.slug === slug) || null;
}

export async function getBlogPosts(): Promise<BlogPost[]> {
  try {
    const live = await BlogService.getAll();
    return live.length > 0 ? live : mockBlogPosts;
  } catch {
    return mockBlogPosts;
  }
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const live = await BlogService.getBySlug(slug);
    if (live) return live;
  } catch {
    // fall through to mock
  }
  return mockBlogPosts.find((b) => b.slug === slug) || null;
}

export async function getTeam(): Promise<TeamMember[]> {
  try {
    const live = await TeamService.getAll();
    return live.length > 0 ? live : mockTeam;
  } catch {
    return mockTeam;
  }
}
