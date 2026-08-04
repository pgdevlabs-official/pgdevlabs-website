"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, AlertCircle } from "lucide-react";
import { ProjectsService } from "@/lib/firestoreService";
import { Button } from "@/components/ui/Button";
import { StatusChip } from "@/components/ui/StatusChip";
import { FormField, inputClass } from "@/components/shared/admin/FormField";
import type { Project, BuildStatus } from "@/types";

const emptyForm = {
  name: "",
  slug: "",
  summary: "",
  description: "",
  status: "IN_DEV" as BuildStatus,
  stack: "",
  repoUrl: "",
  liveUrl: "",
};

export function AdminProjectsPanel({ initialOpen = false }: { initialOpen?: boolean }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(initialOpen);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);

  async function refresh() {
    setLoading(true);
    setError("");
    try {
      setProjects(await ProjectsService.getAll());
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
    if (!form.name.trim() || !form.slug.trim()) return;
    setSaving(true);
    setError("");
    try {
      await ProjectsService.create({
        name: form.name.trim(),
        slug: form.slug.trim().toLowerCase().replace(/\s+/g, "-"),
        summary: form.summary.trim(),
        description: form.description.trim(),
        status: form.status,
        stack: form.stack
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        repoUrl: form.repoUrl.trim() || undefined,
        liveUrl: form.liveUrl.trim() || undefined,
        coverImage: "",
        startedAt: new Date().toISOString(),
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
    if (!confirm("Delete this project?")) return;
    try {
      await ProjectsService.remove(id);
      await refresh();
    } catch {
      setError("Couldn't delete. Check your Firebase connection.");
    }
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold">Projects</h2>
        <Button size="sm" onClick={() => setShowForm((v) => !v)}>
          <Plus size={14} /> {showForm ? "Cancel" : "Add project"}
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
          <FormField label="Name*">
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
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
          <FormField label="Status">
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as BuildStatus })}
              className={inputClass}
            >
              <option value="SHIPPED">Shipped</option>
              <option value="BETA">Beta</option>
              <option value="IN_DEV">In dev</option>
              <option value="DEPRECATED">Deprecated</option>
            </select>
          </FormField>
          <FormField label="Stack (comma separated)">
            <input
              value={form.stack}
              onChange={(e) => setForm({ ...form, stack: e.target.value })}
              className={inputClass}
              placeholder="Next.js, TypeScript"
            />
          </FormField>
          <FormField label="Repo URL">
            <input
              value={form.repoUrl}
              onChange={(e) => setForm({ ...form, repoUrl: e.target.value })}
              className={inputClass}
              placeholder="https://github.com/..."
            />
          </FormField>
          <FormField label="Live URL">
            <input
              value={form.liveUrl}
              onChange={(e) => setForm({ ...form, liveUrl: e.target.value })}
              className={inputClass}
              placeholder="https://..."
            />
          </FormField>
          <div className="sm:col-span-2">
            <FormField label="Summary">
              <input
                value={form.summary}
                onChange={(e) => setForm({ ...form, summary: e.target.value })}
                className={inputClass}
              />
            </FormField>
          </div>
          <div className="sm:col-span-2">
            <FormField label="Description">
              <textarea
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className={inputClass}
              />
            </FormField>
          </div>
          <div className="sm:col-span-2">
            <Button type="submit" disabled={saving} size="sm">
              {saving ? "Saving…" : "Save project"}
            </Button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="text-sm text-fg-muted">Loading…</p>
      ) : projects.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border py-8 text-center text-sm text-fg-muted">
          No projects yet. Add one above.
        </p>
      ) : (
        <div className="divide-y divide-border rounded-lg border border-border">
          {projects.map((project) => (
            <div key={project.id} className="flex items-center justify-between gap-3 p-3">
              <div className="flex min-w-0 items-center gap-3">
                <span className="truncate text-sm font-medium">{project.name}</span>
                <StatusChip status={project.status} />
                <span className="font-mono-tight text-xs text-fg-muted">/{project.slug}</span>
              </div>
              <button
                onClick={() => handleDelete(project.id)}
                aria-label={`Delete ${project.name}`}
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
