"use client";

import { useEffect, useState } from "react";
import { Category } from "@/types";
import {
  fetchAdminCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  CategoryInput,
} from "@/lib/api-categories";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { ApiError } from "@/lib/api";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);

  function load() {
    fetchAdminCategories()
      .then(setCategories)
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("Delete this category? This cannot be undone.")) return;
    await deleteCategory(id);
    setCategories((prev) => prev.filter((c) => c._id !== id));
  }

  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Categories</h1>
        {!showForm && (
          <Button
            onClick={() => {
              setEditing(null);
              setShowForm(true);
            }}
          >
            Add category
          </Button>
        )}
      </div>

      {showForm && (
        <div className="mb-6">
          <CategoryForm
            initial={editing}
            onDone={(cat) => {
              if (editing) {
                setCategories((prev) => prev.map((c) => (c._id === cat._id ? cat : c)));
              } else {
                setCategories((prev) => [cat, ...prev]);
              }
              setShowForm(false);
              setEditing(null);
            }}
            onCancel={() => {
              setShowForm(false);
              setEditing(null);
            }}
          />
        </div>
      )}

      <div className="bg-surface border border-line rounded-lg divide-y divide-line">
        {loading ? (
          <p className="p-5 text-sm text-muted">Loading…</p>
        ) : categories.length === 0 ? (
          <p className="p-5 text-sm text-muted">No categories yet.</p>
        ) : (
          categories.map((cat) => (
            <div key={cat._id} className="flex items-center justify-between px-5 py-3">
              <div>
                <p className="text-sm font-medium">{cat.name}</p>
                <p className="text-xs text-muted price-tag">/{cat.slug}</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setEditing(cat);
                    setShowForm(true);
                  }}
                  className="text-xs underline underline-offset-4"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(cat._id)}
                  className="text-xs text-danger underline underline-offset-4"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function CategoryForm({
  initial,
  onDone,
  onCancel,
}: {
  initial: Category | null;
  onDone: (cat: Category) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initial?.name || "");
  const [slug, setSlug] = useState(initial?.slug || "");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    const payload: CategoryInput = { name, slug: slug || undefined };
    try {
      const result = initial ? await updateCategory(initial._id, payload) : await createCategory(payload);
      onDone(result);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not save category");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-surface border border-line rounded-lg p-5 space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="cat-name">Name</Label>
          <Input id="cat-name" required value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="cat-slug">Slug (optional)</Label>
          <Input
            id="cat-slug"
            placeholder="auto-generated from name"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
          />
        </div>
      </div>
      {error && <p className="text-sm text-danger">{error}</p>}
      <div className="flex gap-3">
        <Button type="submit" size="sm" disabled={submitting}>
          {submitting ? "Saving…" : "Save"}
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
