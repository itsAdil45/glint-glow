"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { ProductAttribute, ProductVariation } from "@/types";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";

function cartesian(attributes: ProductAttribute[]): Record<string, string>[] {
  if (attributes.length === 0) return [];
  return attributes.reduce<Record<string, string>[]>(
    (acc, attr) => {
      const next: Record<string, string>[] = [];
      for (const combo of acc) {
        for (const value of attr.values) {
          next.push({ ...combo, [attr.name]: value });
        }
      }
      return next;
    },
    [{}],
  );
}

function comboKey(combo: Record<string, string>) {
  return Object.entries(combo)
    .map(([k, v]) => `${k}:${v}`)
    .join("|");
}

export function VariationBuilder({
  attributes,
  setAttributes,
  variations,
  setVariations,
  baseSlug,
}: {
  attributes: ProductAttribute[];
  setAttributes: (attrs: ProductAttribute[]) => void;
  variations: ProductVariation[];
  setVariations: (v: ProductVariation[]) => void;
  baseSlug: string;
}) {
  const [newAttrName, setNewAttrName] = useState("");
  const [newAttrValues, setNewAttrValues] = useState("");

  function addAttribute() {
    if (!newAttrName.trim() || !newAttrValues.trim()) return;
    const values = newAttrValues
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);
    const next = [...attributes, { name: newAttrName.trim(), values }];
    setAttributes(next);
    syncVariations(next);
    setNewAttrName("");
    setNewAttrValues("");
  }

  function removeAttribute(name: string) {
    const next = attributes.filter((a) => a.name !== name);
    setAttributes(next);
    syncVariations(next);
  }

  // Regenerates the variation list to match the current attribute combinations,
  // preserving price/stock/images for combinations that already existed.
  function syncVariations(attrs: ProductAttribute[]) {
    const combos = cartesian(attrs);
    const existingByKey = new Map(variations.map((v) => [comboKey(v.attributes), v]));
    const next: ProductVariation[] = combos.map((combo) => {
      const existing = existingByKey.get(comboKey(combo));
      if (existing) return existing;
      return {
        sku: `${baseSlug || "sku"}-${Object.values(combo).join("-").toLowerCase()}`.replace(/\s+/g, "-"),
        attributes: combo,
        price: 0,
        stock: 0,
        images: [],
        isActive: true,
      };
    });
    setVariations(next);
  }

  function updateVariation(index: number, patch: Partial<ProductVariation>) {
    setVariations(variations.map((v, i) => (i === index ? { ...v, ...patch } : v)));
  }

  return (
    <div className="space-y-6">
      <div>
        <Label>Attributes (e.g. Color, Size)</Label>
        <div className="flex flex-wrap gap-2 mb-3">
          {attributes.map((attr) => (
            <span
              key={attr.name}
              className="inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-3 py-1 text-xs text-accent-ink"
            >
              <strong>{attr.name}:</strong> {attr.values.join(", ")}
              <button type="button" onClick={() => removeAttribute(attr.name)}>
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="Attribute name (e.g. Color)"
            value={newAttrName}
            onChange={(e) => setNewAttrName(e.target.value)}
            className="w-48"
          />
          <Input
            placeholder="Values, comma separated (e.g. Red, Blue, Green)"
            value={newAttrValues}
            onChange={(e) => setNewAttrValues(e.target.value)}
          />
          <Button type="button" variant="outline" onClick={addAttribute}>
            <Plus size={15} /> Add
          </Button>
        </div>
      </div>

      {variations.length > 0 && (
        <div>
          <Label>Variations ({variations.length})</Label>
          <div className="border border-line rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-bg text-xs text-muted uppercase tracking-wide">
                <tr>
                  <th className="text-left px-3 py-2 font-medium">Combination</th>
                  <th className="text-left px-3 py-2 font-medium">SKU</th>
                  <th className="text-left px-3 py-2 font-medium w-28">Price</th>
                  <th className="text-left px-3 py-2 font-medium w-24">Stock</th>
                </tr>
              </thead>
              <tbody>
                {variations.map((v, i) => (
                  <tr key={comboKey(v.attributes)} className="border-t border-line">
                    <td className="px-3 py-2">
                      {Object.entries(v.attributes)
                        .map(([k, val]) => `${k}: ${val}`)
                        .join(" · ")}
                    </td>
                    <td className="px-3 py-2">
                      <Input
                        value={v.sku}
                        onChange={(e) => updateVariation(i, { sku: e.target.value })}
                        className="h-8 text-xs"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <Input
                        type="number"
                        step="0.01"
                        min={0}
                        value={v.price}
                        onChange={(e) => updateVariation(i, { price: Number(e.target.value) })}
                        className="h-8 text-xs"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <Input
                        type="number"
                        min={0}
                        value={v.stock}
                        onChange={(e) => updateVariation(i, { stock: Number(e.target.value) })}
                        className="h-8 text-xs"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted mt-2">
            Lowest variation price shown on the storefront:{" "}
            {formatPrice(Math.min(...variations.map((v) => v.price || 0)))}
          </p>
        </div>
      )}
    </div>
  );
}
