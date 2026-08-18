"use client";

import { useEffect, useMemo, useState } from "react";
import { Category } from "@/types";
import {
  fetchAdminCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  CategoryInput,
} from "@/lib/api-categories";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { ApiError } from "@/lib/api";

interface CategoryTreeNode extends Category {
  depth: number;
}

/** Flattens the category list into depth-ordered rows for indented rendering. */
function flattenTree(categories: Category[]): CategoryTreeNode[] {
  const byParent = new Map<string, Category[]>();
  for (const cat of categories) {
    const key = cat.parentId || "root";
    if (!byParent.has(key)) byParent.set(key, []);
    byParent.get(key)!.push(cat);
  }

  const result: CategoryTreeNode[] = [];
  function walk(parentKey: string, depth: number) {
    const children = byParent.get(parentKey) || [];
    for (const cat of children) {
      result.push({ ...cat, depth });
      walk(cat._id, depth + 1);
    }
  }
  walk("root", 0);
  return result;
}

/** All descendant ids of a category, so it (and its subtree) can't become its own parent. */
function getDescendantIds(categories: Category[], rootId: string): Set<string> {
  const byParent = new Map<string, Category[]>();
  for (const cat of categories) {
    const key = cat.parentId || "root";
    if (!byParent.has(key)) byParent.set(key, []);
    byParent.get(key)!.push(cat);
  }
  const result = new Set<string>();
  function walk(id: string) {
    for (const child of byParent.get(id) || []) {
      result.add(child._id);
      walk(child._id);
    }
  }
  walk(rootId);
  return result;
}

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
    try {
      await deleteCategory(id);
      setCategories((prev) => prev.filter((c) => c._id !== id));
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Could not delete category");
    }
  }

  const treeRows = useMemo(() => flattenTree(categories), [categories]);

  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-center justify-between mb-2">
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
      <p className="text-xs text-muted mb-6">
        Nest categories up to 3 levels deep (e.g. Makeup → Face → Foundation) to build the
        storefront&apos;s mega menu — top-level categories become nav items, their children become
        the flyout columns.
      </p>

      {showForm && (
        <div className="mb-6">
          <CategoryForm
            initial={editing}
            allCategories={categories}
            onDone={(cat) => {
              setCategories((prev) => {
                const exists = prev.some((c) => c._id === cat._id);
                return exists ? prev.map((c) => (c._id === cat._id ? cat : c)) : [cat, ...prev];
              });
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
        ) : treeRows.length === 0 ? (
          <p className="p-5 text-sm text-muted">No categories yet.</p>
        ) : (
          treeRows.map((cat) => (
            <div
              key={cat._id}
              className="flex items-center justify-between px-5 py-3"
              style={{ paddingLeft: `${20 + cat.depth * 24}px` }}
            >
              <div>
                <p className="text-sm font-medium">
                  {cat.depth > 0 && <span className="text-muted mr-1.5">└</span>}
                  {cat.name}
                  {!cat.isActive && (
                    <span className="ml-2 text-[10px] uppercase tracking-wide text-muted bg-line rounded-full px-2 py-0.5">
                      Inactive
                    </span>
                  )}
                </p>
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
  allCategories,
  onDone,
  onCancel,
}: {
  initial: Category | null;
  allCategories: Category[];
  onDone: (cat: Category) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initial?.name || "");
  const [slug, setSlug] = useState(initial?.slug || "");
  const [parentId, setParentId] = useState(initial?.parentId || "");
  const [isActive, setIsActive] = useState(initial?.isActive ?? true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // A category can't be parented under itself or any of its own descendants.
  const excludedIds = useMemo(() => {
    if (!initial) return new Set<string>();
    return new Set([initial._id, ...getDescendantIds(allCategories, initial._id)]);
  }, [initial, allCategories]);

  const parentOptions = useMemo(
    () => flattenTree(allCategories).filter((c) => !excludedIds.has(c._id)),
    [allCategories, excludedIds],
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    const payload: CategoryInput = {
      name,
      slug: slug || undefined,
      parentId: parentId || undefined,
      isActive,
    };
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
        <div>
          <Label htmlFor="cat-parent">Parent category</Label>
          <Select id="cat-parent" value={parentId} onChange={(e) => setParentId(e.target.value)}>
            <option value="">— None (top-level nav item) —</option>
            {parentOptions.map((c) => (
              <option key={c._id} value={c._id}>
                {"— ".repeat(c.depth)}
                {c.name}
              </option>
            ))}
          </Select>
        </div>
        <div className="flex items-end pb-2.5">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
            Active (visible on storefront)
          </label>
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
