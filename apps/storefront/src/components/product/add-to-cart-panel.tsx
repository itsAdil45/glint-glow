"use client";

import { useMemo, useState } from "react";
import { Product, ProductVariation } from "@/types";
import { PriceTag } from "@/components/ui/price-tag";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cart-store";
import { useAuthStore } from "@/store/auth-store";

export function AddToCartPanel({ product }: { product: Product }) {
  const [selected, setSelected] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    product.attributes.forEach((attr) => {
      initial[attr.name] = attr.values[0];
    });
    return initial;
  });
  const [quantity, setQuantity] = useState(1);
  const [status, setStatus] = useState<"idle" | "adding" | "added" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const addItem = useCartStore((s) => s.addItem);
  const isHydrating = useAuthStore((s) => s.isHydrating);

  const matchedVariation: ProductVariation | undefined = useMemo(() => {
    if (!product.hasVariations) return undefined;
    return product.variations.find((v) =>
      product.attributes.every((attr) => v.attributes[attr.name] === selected[attr.name]),
    );
  }, [product, selected]);

  const price = product.hasVariations ? matchedVariation?.price ?? product.basePrice : product.basePrice;
  const stock = product.hasVariations ? matchedVariation?.stock ?? 0 : product.stock;
  const inStock = stock > 0;

  async function handleAddToCart() {
    setStatus("adding");
    setErrorMessage("");
    try {
      await addItem(product._id, quantity, matchedVariation?.sku);
      setStatus("added");
      setTimeout(() => setStatus("idle"), 2000);
    } catch (err) {
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Could not add to cart");
    }
  }

  return (
    <div className="space-y-6">
      <PriceTag amount={price} compareAt={product.hasVariations ? undefined : product.compareAtPrice} size="lg" />

      {product.attributes.map((attr) => (
        <div key={attr.name}>
          <span className="text-xs font-medium tracking-wide text-ink-soft uppercase">
            {attr.name}: <span className="text-ink normal-case">{selected[attr.name]}</span>
          </span>
          <div className="flex flex-wrap gap-2 mt-2">
            {attr.values.map((value) => {
              const isActive = selected[attr.name] === value;
              return (
                <button
                  key={value}
                  onClick={() => setSelected((prev) => ({ ...prev, [attr.name]: value }))}
                  className={`h-10 min-w-10 px-4 rounded-full border text-sm transition-colors ${
                    isActive
                      ? "border-accent-ink bg-accent-ink text-paper"
                      : "border-line hover:border-accent-ink"
                  }`}
                >
                  {value}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      <div className="flex items-center gap-4">
        <div className="flex items-center rounded-full border border-line h-11 w-fit">
          <button
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="w-10 h-full text-lg"
            aria-label="Decrease quantity"
          >
            −
          </button>
          <span className="w-10 text-center text-sm font-body">{quantity}</span>
          <button
            onClick={() => setQuantity((q) => Math.min(stock || 1, q + 1))}
            className="w-10 h-full text-lg"
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
        <span className="text-xs text-muted">
          {inStock ? `${stock} in stock` : "Out of stock"}
        </span>
      </div>

      <Button
        size="lg"
        className="w-full"
        disabled={!inStock || status === "adding" || isHydrating}
        onClick={handleAddToCart}
      >
        {status === "adding" ? "Adding…" : status === "added" ? "Added to cart" : "Add to cart"}
      </Button>
      {status === "error" && <p className="text-sm text-danger">{errorMessage}</p>}

      {/* Sticky mobile add-to-cart bar */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-paper border-t border-line p-3 flex items-center gap-3">
        <PriceTag amount={price} size="md" />
        <Button
          className="flex-1"
          disabled={!inStock || status === "adding"}
          onClick={handleAddToCart}
        >
          {inStock ? "Add to cart" : "Out of stock"}
        </Button>
      </div>
    </div>
  );
}
