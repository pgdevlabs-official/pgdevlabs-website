import type { MetadataRoute } from "next";
import { getApps, getProjects, getBlogPosts } from "@/lib/dataService";

const baseUrl = "https://pgdevlabs.example.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [apps, projects, blogPosts] = await Promise.all([
    getApps(),
    getProjects(),
    getBlogPosts(),
  ]);

  const staticRoutes = [
    "",
    "/apps",
    "/projects",
    "/downloads",
    "/blog",
    "/team",
    "/about",
    "/contact",
    "/search",
    "/privacy",
    "/terms",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
  }));

  const appRoutes = apps.map((a) => ({
    url: `${baseUrl}/apps/${a.slug}`,
    lastModified: new Date(a.updatedAt),
  }));

  const projectRoutes = projects.map((p) => ({
    url: `${baseUrl}/projects/${p.slug}`,
    lastModified: new Date(p.startedAt),
  }));

  const blogRoutes = blogPosts.map((b) => ({
    url: `${baseUrl}/blog/${b.slug}`,
    lastModified: new Date(b.publishedAt),
  }));

  return [...staticRoutes, ...appRoutes, ...projectRoutes, ...blogRoutes];
}
