"use client";

import { useEffect } from "react";
import { Product } from "@/types";
import { trackViewItem } from "@/lib/gtm";

export function ViewItemTracker({ product }: { product: Product }) {
  useEffect(() => {
    trackViewItem({
      item_id: product._id,
      item_name: product.title,
      price: product.basePrice,
      item_brand: product.brand,
    });
    // Only re-fire if the product itself changes (e.g. navigating PDP to
    // PDP client-side) — not on every re-render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product._id]);

  return null;
}
