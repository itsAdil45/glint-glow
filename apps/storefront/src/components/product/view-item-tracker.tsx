"use client";

import { useEffect, useRef } from "react";
import { Product } from "@/types";
import { trackViewItem } from "@/lib/gtm";

export function ViewItemTracker({ product }: { product: Product }) {
  const trackedRef = useRef<string | null>(null);

  useEffect(() => {
    // React Strict Mode intentionally double-invokes effects in
    // development (mount, synthetic unmount, mount again) — without this
    // guard that shows up as two view_item pushes per page load. Doesn't
    // happen in a production build, but guarding here matches the same
    // once-only pattern already used for begin_checkout/purchase rather
    // than leaving this one as an inconsistent exception.
    if (trackedRef.current === product._id) return;
    trackedRef.current = product._id;

    trackViewItem({
      item_id: product._id,
      item_name: product.title,
      price: product.basePrice,
      item_brand: product.brand,
    });
  }, [product._id, product.title, product.basePrice, product.brand]);

  return null;
}
