"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, AlertCircle } from "lucide-react";
import { TeamService } from "@/lib/firestoreService";
import { Button } from "@/components/ui/Button";
import { FormField, inputClass } from "@/components/shared/admin/FormField";
import type { TeamMember } from "@/types";

const emptyForm = { name: "", role: "", bio: "", github: "" };

export function AdminTeamPanel({ initialOpen = false }: { initialOpen?: boolean }) {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(initialOpen);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);

  async function refresh() {
    setLoading(true);
    setError("");
    try {
      setMembers(await TeamService.getAll());
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
    if (!form.name.trim()) return;
    setSaving(true);
    setError("");
    try {
      await TeamService.create({
        name: form.name.trim(),
        role: form.role.trim(),
        bio: form.bio.trim(),
        avatar: "",
        socials: form.github.trim() ? { github: form.github.trim() } : {},
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
    if (!confirm("Remove this team member?")) return;
    try {
      await TeamService.remove(id);
      await refresh();
    } catch {
      setError("Couldn't delete. Check your Firebase connection.");
    }
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold">Team</h2>
        <Button size="sm" onClick={() => setShowForm((v) => !v)}>
          <Plus size={14} /> {showForm ? "Cancel" : "Add member"}
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
          <FormField label="Role">
            <input
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className={inputClass}
              placeholder="Developer"
            />
          </FormField>
          <FormField label="GitHub URL">
            <input
              value={form.github}
              onChange={(e) => setForm({ ...form, github: e.target.value })}
              className={inputClass}
              placeholder="https://github.com/..."
            />
          </FormField>
          <div className="sm:col-span-2">
            <FormField label="Bio">
              <textarea
                rows={3}
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                className={inputClass}
              />
            </FormField>
          </div>
          <div className="sm:col-span-2">
            <Button type="submit" disabled={saving} size="sm">
              {saving ? "Saving…" : "Save member"}
            </Button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="text-sm text-fg-muted">Loading…</p>
      ) : members.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border py-8 text-center text-sm text-fg-muted">
          No team members yet. Add one above.
        </p>
      ) : (
        <div className="divide-y divide-border rounded-lg border border-border">
          {members.map((member) => (
            <div key={member.id} className="flex items-center justify-between gap-3 p-3">
              <div className="flex min-w-0 items-center gap-3">
                <span className="truncate text-sm font-medium">{member.name}</span>
                <span className="font-mono-tight text-xs text-fg-muted">{member.role}</span>
              </div>
              <button
                onClick={() => handleDelete(member.id)}
                aria-label={`Remove ${member.name}`}
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
