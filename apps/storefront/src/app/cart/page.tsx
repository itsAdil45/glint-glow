"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cart-store";
import { useAuthStore } from "@/store/auth-store";
import { PriceTag } from "@/components/ui/price-tag";
import { Button } from "@/components/ui/button";
import { resolveImageUrl } from "@/lib/utils";

export default function CartPage() {
  const { cart, isLoading, load, updateItem, removeItem } = useCartStore();
  const user = useAuthStore((s) => s.user);
  const isHydrating = useAuthStore((s) => s.isHydrating);
  const router = useRouter();
  const [busyKey, setBusyKey] = useState<string | null>(null);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const items = cart?.items || [];
  const subtotal = cart?.subtotal || 0;

  function key(productId: string, variationSku: string | null) {
    return `${productId}::${variationSku || ""}`;
  }

  async function handleQuantityChange(productId: string, variationSku: string | null, qty: number) {
    if (qty < 1) return;
    setBusyKey(key(productId, variationSku));
    try {
      await updateItem(productId, qty, variationSku || undefined);
    } finally {
      setBusyKey(null);
    }
  }

  async function handleRemove(productId: string, variationSku: string | null) {
    setBusyKey(key(productId, variationSku));
    try {
      await removeItem(productId, variationSku || undefined);
    } finally {
      setBusyKey(null);
    }
  }

  function handleCheckout() {
    if (!user && !isHydrating) {
      router.push("/login?redirect=/checkout");
    } else {
      router.push("/checkout");
    }
  }

  return (
    <div className="container-page py-10">
      <h1 className="font-display text-3xl mb-8">Your cart</h1>

      {isLoading && !cart ? (
        <p className="text-muted text-sm">Loading…</p>
      ) : items.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-muted mb-4">Your cart is empty.</p>
          <Button asChild>
            <Link href="/collections">Continue shopping</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-12">
          <div className="rounded-2xl bg-surface card-shadow divide-y divide-line overflow-hidden">
            {items.map((item) => {
              const itemKey = key(item.productId, item.variationSku);
              const isBusy = busyKey === itemKey;
              return (
                <div key={itemKey} className="flex gap-4 p-4">
                  <Link
                    href={`/product/${item.slug}`}
                    className="relative w-24 h-28 shrink-0 rounded-xl bg-accent-soft overflow-hidden"
                  >
                    {item.image && (
                      <Image src={resolveImageUrl(item.image)} alt={item.title} fill sizes="96px" className="object-cover" />
                    )}
                  </Link>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <Link href={`/product/${item.slug}`} className="font-display text-base hover:underline">
                        {item.title}
                      </Link>
                      {item.attributes && (
                        <p className="text-xs text-muted mt-1">
                          {Object.entries(item.attributes)
                            .map(([k, v]) => `${k}: ${v}`)
                            .join(" · ")}
                        </p>
                      )}
                      <div className="mt-1">
                        <PriceTag amount={item.unitPrice} size="sm" />
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center rounded-full border border-line h-9 w-fit">
                        <button
                          disabled={isBusy}
                          onClick={() =>
                            handleQuantityChange(item.productId, item.variationSku, item.quantity - 1)
                          }
                          className="w-8 h-full text-base disabled:opacity-40"
                        >
                          −
                        </button>
                        <span className="w-8 text-center text-sm font-body">{item.quantity}</span>
                        <button
                          disabled={isBusy || item.quantity >= item.availableStock}
                          onClick={() =>
                            handleQuantityChange(item.productId, item.variationSku, item.quantity + 1)
                          }
                          className="w-8 h-full text-base disabled:opacity-40"
                        >
                          +
                        </button>
                      </div>
                      <button
                        disabled={isBusy}
                        onClick={() => handleRemove(item.productId, item.variationSku)}
                        className="text-xs text-muted hover:text-danger underline underline-offset-4"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  <div className="text-right">
                    <PriceTag amount={item.lineTotal} size="sm" />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="rounded-2xl bg-surface card-shadow p-6 h-fit">
            <h2 className="font-display text-lg mb-4">Order summary</h2>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted">Subtotal</span>
              <PriceTag amount={subtotal} size="sm" />
            </div>
            <div className="flex justify-between text-sm mb-4 text-muted">
              <span>Shipping</span>
              <span>Calculated at checkout</span>
            </div>
            <div className="border-t border-line pt-4 flex justify-between items-baseline mb-6">
              <span className="font-medium">Total</span>
              <PriceTag amount={subtotal} size="md" />
            </div>
            <Button size="lg" className="w-full" onClick={handleCheckout}>
              Proceed to checkout
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
