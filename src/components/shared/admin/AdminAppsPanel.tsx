"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, AlertCircle, CheckCircle2, Link2 } from "lucide-react";
import { AppsService } from "@/lib/firestoreService";
import { Button } from "@/components/ui/Button";
import { StatusChip } from "@/components/ui/StatusChip";
import { FormField, inputClass } from "@/components/shared/admin/FormField";
import type { App, BuildStatus } from "@/types";

const emptyForm = {
  name: "",
  slug: "",
  tagline: "",
  description: "",
  status: "SHIPPED" as BuildStatus,
  category: "",
  version: "1.0.0",
  packageName: "",
  tags: "",
  apkUrl: "",
};

const emptyVersionForm = { version: "", notes: "", apkUrl: "" };

export function AdminAppsPanel({ initialOpen = false }: { initialOpen?: boolean }) {
  const [apps, setApps] = useState<App[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(initialOpen);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [versionForm, setVersionForm] = useState(emptyVersionForm);
  const [versionSaving, setVersionSaving] = useState(false);

  async function refresh() {
    setLoading(true);
    setError("");
    try {
      const data = await AppsService.getAll();
      setApps(data);
    } catch {
      setError(
        "Couldn't reach Firestore. Check your Firebase keys in .env.local — see README."
      );
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
      const slug = form.slug.trim().toLowerCase().replace(/\s+/g, "-");
      const now = new Date().toISOString();

      await AppsService.create({
        name: form.name.trim(),
        slug,
        tagline: form.tagline.trim(),
        description: form.description.trim(),
        status: form.status,
        category: form.category.trim() || "Uncategorized",
        icon: "",
        screenshots: [],
        rating: 0,
        reviewCount: 0,
        downloadCount: 0,
        versions: [
          {
            version: form.version.trim() || "1.0.0",
            date: now,
            notes: ["Initial release"],
            ...(form.apkUrl.trim() ? { downloadUrl: form.apkUrl.trim() } : {}),
          },
        ],
        reviews: [],
        releasedAt: now,
        updatedAt: now,
        packageName: form.packageName.trim(),
        tags: form.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      });
      setForm(emptyForm);
      setShowForm(false);
      await refresh();
    } catch {
      setError(
        "Couldn't save to Firestore. Check your Firebase keys in .env.local — see README."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleAddVersion(app: App) {
    if (!versionForm.version.trim()) return;
    setVersionSaving(true);
    setError("");
    try {
      const newVersion = {
        version: versionForm.version.trim(),
        date: new Date().toISOString(),
        notes: versionForm.notes
          .split(",")
          .map((n) => n.trim())
          .filter(Boolean).length
          ? versionForm.notes
              .split(",")
              .map((n) => n.trim())
              .filter(Boolean)
          : ["Update"],
        ...(versionForm.apkUrl.trim() ? { downloadUrl: versionForm.apkUrl.trim() } : {}),
      };
      await AppsService.update(app.id, {
        versions: [newVersion, ...app.versions],
        updatedAt: new Date().toISOString(),
      });
      setVersionForm(emptyVersionForm);
      setExpandedId(null);
      await refresh();
    } catch {
      setError("Couldn't add version. Check your Firebase keys in .env.local.");
    } finally {
      setVersionSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this app? This can't be undone.")) return;
    try {
      await AppsService.remove(id);
      await refresh();
    } catch {
      setError("Couldn't delete. Check your Firebase connection.");
    }
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold">Apps</h2>
        <Button size="sm" onClick={() => setShowForm((v) => !v)}>
          <Plus size={14} /> {showForm ? "Cancel" : "Add app"}
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
              placeholder="My App"
            />
          </FormField>
          <FormField label="Slug* (used in URL)">
            <input
              required
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              className={inputClass}
              placeholder="my-app"
            />
          </FormField>
          <FormField label="Tagline">
            <input
              value={form.tagline}
              onChange={(e) => setForm({ ...form, tagline: e.target.value })}
              className={inputClass}
              placeholder="Short one-liner"
            />
          </FormField>
          <FormField label="Category">
            <input
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className={inputClass}
              placeholder="Productivity"
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
          <FormField label="Version">
            <input
              value={form.version}
              onChange={(e) => setForm({ ...form, version: e.target.value })}
              className={inputClass}
              placeholder="1.0.0"
            />
          </FormField>
          <FormField label="Package name (Android)">
            <input
              value={form.packageName}
              onChange={(e) => setForm({ ...form, packageName: e.target.value })}
              className={inputClass}
              placeholder="com.yourname.app"
            />
          </FormField>
          <FormField label="Tags (comma separated)">
            <input
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
              className={inputClass}
              placeholder="utility, android"
            />
          </FormField>
          <div className="sm:col-span-2">
            <FormField label="Description">
              <textarea
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className={inputClass}
                placeholder="What does this app do?"
              />
            </FormField>
          </div>
          <div className="sm:col-span-2">
            <FormField label="APK download link (paste a URL — see below for how to get one, optional)">
              <div className="flex items-center gap-2">
                <Link2 size={14} className="shrink-0 text-fg-muted" />
                <input
                  value={form.apkUrl}
                  onChange={(e) => setForm({ ...form, apkUrl: e.target.value })}
                  className={inputClass}
                  placeholder="https://github.com/you/app/releases/download/v1.0.0/app.apk"
                />
              </div>
            </FormField>
          </div>
          <div className="sm:col-span-2">
            <Button type="submit" disabled={saving} size="sm">
              {saving ? "Saving…" : "Save app"}
            </Button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="text-sm text-fg-muted">Loading…</p>
      ) : apps.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border py-8 text-center text-sm text-fg-muted">
          No apps yet. Add one above.
        </p>
      ) : (
        <div className="divide-y divide-border rounded-lg border border-border">
          {apps.map((app) => (
            <div key={app.id}>
              <div className="flex items-center justify-between gap-3 p-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="truncate text-sm font-medium">{app.name}</span>
                  <StatusChip status={app.status} />
                  <span className="font-mono-tight text-xs text-fg-muted">/{app.slug}</span>
                  {app.versions[0]?.downloadUrl && (
                    <span className="flex items-center gap-1 font-mono-tight text-[10px] text-circuit">
                      <CheckCircle2 size={11} /> APK linked
                    </span>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <button
                    onClick={() => setExpandedId(expandedId === app.id ? null : app.id)}
                    className="font-mono-tight text-xs text-signal hover:underline"
                  >
                    {expandedId === app.id ? "Cancel" : "+ Version / APK"}
                  </button>
                  <button
                    onClick={() => handleDelete(app.id)}
                    aria-label={`Delete ${app.name}`}
                    className="text-fg-muted hover:text-danger"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              {expandedId === app.id && (
                <div className="grid gap-3 border-t border-border bg-bg p-4 sm:grid-cols-2">
                  <FormField label="Version number*">
                    <input
                      value={versionForm.version}
                      onChange={(e) => setVersionForm({ ...versionForm, version: e.target.value })}
                      className={inputClass}
                      placeholder="1.1.0"
                    />
                  </FormField>
                  <FormField label="Changelog notes (comma separated)">
                    <input
                      value={versionForm.notes}
                      onChange={(e) => setVersionForm({ ...versionForm, notes: e.target.value })}
                      className={inputClass}
                      placeholder="Fixed bug, Added feature"
                    />
                  </FormField>
                  <div className="sm:col-span-2">
                    <FormField label="APK download link (paste URL)">
                      <div className="flex items-center gap-2">
                        <Link2 size={14} className="shrink-0 text-fg-muted" />
                        <input
                          value={versionForm.apkUrl}
                          onChange={(e) =>
                            setVersionForm({ ...versionForm, apkUrl: e.target.value })
                          }
                          className={inputClass}
                          placeholder="https://..."
                        />
                      </div>
                    </FormField>
                  </div>
                  <div className="sm:col-span-2">
                    <Button
                      size="sm"
                      disabled={versionSaving || !versionForm.version.trim()}
                      onClick={() => handleAddVersion(app)}
                    >
                      {versionSaving ? "Saving…" : "Add version"}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
