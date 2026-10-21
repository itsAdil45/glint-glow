"use client";

import { useState } from "react";
import { updateProduct } from "@/lib/api-products";
import { Product } from "@/types";

// Inline editor for a product's (optional) source price on the products
// table. Saves on blur / Enter; clearing the field removes the price.
export function SourcePriceCell({
  product,
  onSaved,
}: {
  product: Product;
  onSaved: (value: number | null) => void;
}) {
  const saved = product.sourcePrice ?? null;
  const [value, setValue] = useState(saved !== null ? String(saved) : "");
  const [saving, setSaving] = useState(false);

  async function commit() {
    const trimmed = value.trim();
    const next = trimmed === "" ? null : Number(trimmed);

    if (next === saved) return;
    if (next !== null && (!Number.isFinite(next) || next < 0)) {
      setValue(saved !== null ? String(saved) : "");
      return;
    }

    setSaving(true);
    try {
      await updateProduct(product._id, { sourcePrice: next });
      onSaved(next);
    } catch {
      setValue(saved !== null ? String(saved) : "");
      alert("Could not update source price");
    } finally {
      setSaving(false);
    }
  }

  return (
    <input
      type="number"
      min={0}
      step="0.01"
      inputMode="decimal"
      placeholder="—"
      aria-label={`Source price for ${product.title}`}
      value={value}
      disabled={saving}
      onChange={(e) => setValue(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Enter") e.currentTarget.blur();
      }}
      className="h-8 w-24 rounded-md border border-line bg-surface px-2 text-sm placeholder:text-muted focus:border-ink outline-none transition-colors disabled:opacity-50"
    />
  );
}
