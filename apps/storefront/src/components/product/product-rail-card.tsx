"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, Loader2, Check } from "lucide-react";
import { Product } from "@/types";
import { PriceTag } from "@/components/ui/price-tag";
import { colorToHex } from "@/lib/colors";
import { cn, resolveImageUrl } from "@/lib/utils";
import { useCartStore } from "@/store/cart-store";

const MAX_SWATCHES = 3;

export function ProductRailCard({ product }: { product: Product }) {
  const [status, setStatus] = useState<"idle" | "adding" | "added">("idle");
  const addItem = useCartStore((s) => s.addItem);

  const primaryImage = product.images[0];
  const price = product.hasVariations
    ? Math.min(...product.variations.map((v) => v.price))
    : product.basePrice;
  const compareAt = product.hasVariations ? undefined : product.compareAtPrice;
  const discountPct =
    compareAt && compareAt > price
      ? Math.round((1 - price / compareAt) * 100)
      : null;

  const colorAttr = product.attributes.find(
    (a) => a.name.toLowerCase() === "color",
  );

  // Variation products need a size/color picked on the PDP — quick-add only
  // makes sense for simple products, so the button behaves as a shortcut to
  // the PDP instead of silently guessing a variation.
  async function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (product.hasVariations || status !== "idle") return;
    setStatus("adding");
    try {
      await addItem(product._id, 1);
      setStatus("added");
      setTimeout(() => setStatus("idle"), 1800);
    } catch {
      setStatus("idle");
    }
  }

  return (
    <Link
      href={`/product/${product.slug}`}
      className="group block w-[200px] sm:w-[220px] shrink-0  rounded "
    >
      <div className="relative aspect-square bg-paper">
        {primaryImage ? (
          <Image
            src={resolveImageUrl(primaryImage.url)}
            alt={primaryImage.alt || product.title}
            fill
            sizes="220px"
            className="object-contain transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-muted text-sm">
            No image
          </div>
        )}

        {discountPct && (
          <span className="absolute top-3 left-3 rounded-full bg-accent-ink text-paper px-2.5 py-1 text-[11px] font-medium">
            −{discountPct}%
          </span>
        )}

        <span className="absolute top-3 right-3 h-8 w-8 rounded-full bg-accent-soft/90 flex items-center justify-center text-ink-soft">
          <Search size={13} />
        </span>

        {!product.hasVariations && (
          <button
            onClick={handleAddToCart}
            disabled={status !== "idle"}
            className={cn(
              "absolute inset-x-6 bottom-4 rounded-full bg-accent text-paper text-xs font-medium py-2.5 flex items-center justify-center gap-1.5",
              "opacity-0 translate-y-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0",
              status !== "idle" && "opacity-100 translate-y-0",
            )}
          >
            {status === "adding" && (
              <Loader2 size={13} className="animate-spin" />
            )}
            {status === "added" && <Check size={13} />}
            {status === "added" ? "Added" : "Add To Cart"}
          </button>
        )}
      </div>

      <div className="pt-3 px-2">
        {product.brand && (
          <p className="text-[11px] text-muted uppercase tracking-wide">
            {product.brand}
          </p>
        )}
        <h3 className="text-sm font-semibold text-ink mt-0.5 truncate">
          {product.title}
        </h3>

        <div className="mt-1 flex items-baseline gap-1.5">
          {product.hasVariations && (
            <span className="text-xs text-muted">From</span>
          )}
          <PriceTag amount={price} compareAt={compareAt} size="sm" />
        </div>

        {colorAttr && colorAttr.values.length > 0 && (
          <div className="mt-2 flex items-center gap-1.5">
            {colorAttr.values.slice(0, MAX_SWATCHES).map((value) => {
              const hex = colorToHex(value);
              return (
                <span
                  key={value}
                  title={value}
                  className="h-4 w-4 rounded-full border border-line shrink-0"
                  style={{ backgroundColor: hex || "#c6c6c2" }}
                />
              );
            })}
            {colorAttr.values.length > MAX_SWATCHES && (
              <span className="text-[11px] text-muted">
                +{colorAttr.values.length - MAX_SWATCHES}
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
