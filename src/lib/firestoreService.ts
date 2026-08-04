import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "@/lib/firebaseConfig";
import type { App, Project, BlogPost, TeamMember } from "@/types";

// Generic helpers ------------------------------------------------------

async function getAll<T>(collectionName: string, orderField?: string): Promise<T[]> {
  const ref = collection(db, collectionName);
  const q = orderField ? query(ref, orderBy(orderField, "desc")) : ref;
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as T);
}

async function getOneBySlug<T extends { slug: string }>(
  collectionName: string,
  slug: string
): Promise<T | null> {
  const all = await getAll<T>(collectionName);
  return all.find((item) => item.slug === slug) || null;
}

async function create(collectionName: string, data: Record<string, unknown>): Promise<string> {
  const ref = await addDoc(collection(db, collectionName), data);
  return ref.id;
}

async function update(
  collectionName: string,
  id: string,
  data: Record<string, unknown>
): Promise<void> {
  await updateDoc(doc(db, collectionName, id), data);
}

async function remove(collectionName: string, id: string): Promise<void> {
  await deleteDoc(doc(db, collectionName, id));
}

// Apps -------------------------------------------------------------

export const AppsService = {
  getAll: () => getAll<App>("apps"),
  getBySlug: (slug: string) => getOneBySlug<App>("apps", slug),
  create: (data: Omit<App, "id">) => create("apps", data),
  update: (id: string, data: Partial<App>) => update("apps", id, data),
  remove: (id: string) => remove("apps", id),
};

// Projects -----------------------------------------------------------

export const ProjectsService = {
  getAll: () => getAll<Project>("projects"),
  getBySlug: (slug: string) => getOneBySlug<Project>("projects", slug),
  create: (data: Omit<Project, "id">) => create("projects", data),
  update: (id: string, data: Partial<Project>) => update("projects", id, data),
  remove: (id: string) => remove("projects", id),
};

// Blog posts -----------------------------------------------------------

export const BlogService = {
  getAll: () => getAll<BlogPost>("blogPosts"),
  getBySlug: (slug: string) => getOneBySlug<BlogPost>("blogPosts", slug),
  create: (data: Omit<BlogPost, "id">) => create("blogPosts", data),
  update: (id: string, data: Partial<BlogPost>) => update("blogPosts", id, data),
  remove: (id: string) => remove("blogPosts", id),
};

// Team -----------------------------------------------------------------

export const TeamService = {
  getAll: () => getAll<TeamMember>("team"),
  create: (data: Omit<TeamMember, "id">) => create("team", data),
  update: (id: string, data: Partial<TeamMember>) => update("team", id, data),
  remove: (id: string) => remove("team", id),
};
