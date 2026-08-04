"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, AlertCircle } from "lucide-react";
import { BlogService } from "@/lib/firestoreService";
import { Button } from "@/components/ui/Button";
import { FormField, inputClass } from "@/components/shared/admin/FormField";
import type { BlogPost } from "@/types";

const emptyForm = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  author: "",
  tags: "",
  readMinutes: "3",
};

export function AdminBlogPanel({ initialOpen = false }: { initialOpen?: boolean }) {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(initialOpen);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);

  async function refresh() {
    setLoading(true);
    setError("");
    try {
      setPosts(await BlogService.getAll());
    } catch {
      setError("Couldn't reach Firestore. Check your Firebase keys in .env.local.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  useEffect(() => {
    if (initialOpen) setShowForm(true);
  }, [initialOpen]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || !form.slug.trim()) return;
    setSaving(true);
    setError("");
    try {
      await BlogService.create({
        title: form.title.trim(),
        slug: form.slug.trim().toLowerCase().replace(/\s+/g, "-"),
        excerpt: form.excerpt.trim(),
        content: form.content.trim(),
        coverImage: "",
        author: form.author.trim() || "PGDevLabs Team",
        publishedAt: new Date().toISOString(),
        tags: form.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        readMinutes: Number(form.readMinutes) || 3,
      });
      setForm(emptyForm);
      setShowForm(false);
      await refresh();
    } catch {
      setError("Couldn't save to Firestore. Check your Firebase keys in .env.local.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this post?")) return;
    try {
      await BlogService.remove(id);
      await refresh();
    } catch {
      setError("Couldn't delete. Check your Firebase connection.");
    }
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold">Blog posts</h2>
        <Button size="sm" onClick={() => setShowForm((v) => !v)}>
          <Plus size={14} /> {showForm ? "Cancel" : "Add post"}
        </Button>
      </div>

      {error && (
        <div className="mb-4 flex items-start gap-2 rounded-md border border-danger/30 bg-danger/10 p-3 text-xs text-danger">
          <AlertCircle size={14} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mb-6 grid gap-3 rounded-lg border border-border bg-bg-elevated p-4 sm:grid-cols-2"
        >
          <FormField label="Title*">
            <input
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className={inputClass}
            />
          </FormField>
          <FormField label="Slug*">
            <input
              required
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              className={inputClass}
            />
          </FormField>
          <FormField label="Author">
            <input
              value={form.author}
              onChange={(e) => setForm({ ...form, author: e.target.value })}
              className={inputClass}
              placeholder="PGDevLabs Team"
            />
          </FormField>
          <FormField label="Read time (minutes)">
            <input
              type="number"
              min={1}
              value={form.readMinutes}
              onChange={(e) => setForm({ ...form, readMinutes: e.target.value })}
              className={inputClass}
            />
          </FormField>
          <div className="sm:col-span-2">
            <FormField label="Tags (comma separated)">
              <input
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
                className={inputClass}
                placeholder="engineering, culture"
              />
            </FormField>
          </div>
          <div className="sm:col-span-2">
            <FormField label="Excerpt">
              <input
                value={form.excerpt}
                onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                className={inputClass}
              />
            </FormField>
          </div>
          <div className="sm:col-span-2">
            <FormField label="Content">
              <textarea
                rows={5}
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                className={inputClass}
              />
            </FormField>
          </div>
          <div className="sm:col-span-2">
            <Button type="submit" disabled={saving} size="sm">
              {saving ? "Saving…" : "Publish post"}
            </Button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="text-sm text-fg-muted">Loading…</p>
      ) : posts.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border py-8 text-center text-sm text-fg-muted">
          No posts yet. Add one above.
        </p>
      ) : (
        <div className="divide-y divide-border rounded-lg border border-border">
          {posts.map((post) => (
            <div key={post.id} className="flex items-center justify-between gap-3 p-3">
              <div className="flex min-w-0 items-center gap-3">
                <span className="truncate text-sm font-medium">{post.title}</span>
                <span className="font-mono-tight text-xs text-fg-muted">/{post.slug}</span>
              </div>
              <button
                onClick={() => handleDelete(post.id)}
                aria-label={`Delete ${post.title}`}
                className="shrink-0 text-fg-muted hover:text-danger"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
