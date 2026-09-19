"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Tag, X } from "lucide-react";
import { useCartStore } from "@/store/cart-store";
import { PriceTag } from "@/components/ui/price-tag";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { resolveImageUrl } from "@/lib/utils";
import { fetchShippingSettings, estimateShippingFee, ShippingSettings } from "@/lib/api-shipping";
import { showApiError } from "@/lib/toast";

export default function CartPage() {
  const { cart, isLoading, load, updateItem, removeItem, applyCoupon, removeCoupon } = useCartStore();
  const router = useRouter();
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [shippingSettings, setShippingSettings] = useState<ShippingSettings | null>(null);
  const [couponInput, setCouponInput] = useState("");
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const lastShownCouponError = useRef<string | null>(null);

  useEffect(() => {
    load();
    fetchShippingSettings()
      .then(setShippingSettings)
      .catch(() => null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // The backend self-heals a coupon that expired or hit its limit between
  // being applied and now — it clears it and reports why via
  // cart.couponError. Surfaced once per distinct message rather than on
  // every render, since this value stays put across re-renders until the
  // cart is refetched.
  useEffect(() => {
    if (cart?.couponError && cart.couponError !== lastShownCouponError.current) {
      toast.error(cart.couponError);
      lastShownCouponError.current = cart.couponError;
    } else if (!cart?.couponError) {
      lastShownCouponError.current = null;
    }
  }, [cart?.couponError]);

  const items = cart?.items || [];
  const subtotal = cart?.subtotal || 0;
  const discountAmount = cart?.discountAmount || 0;
  // Shipping is estimated on the pre-discount subtotal, matching how the
  // backend actually calculates it at checkout — a free-shipping
  // threshold is about cart value, not what's finally paid after a coupon.
  const shippingFee = shippingSettings ? estimateShippingFee(shippingSettings, subtotal) : null;
  const total = Math.max(subtotal - discountAmount, 0) + (shippingFee || 0);

  function key(productId: string, variationSku: string | null) {
    return `${productId}::${variationSku || ""}`;
  }

  async function handleQuantityChange(productId: string, variationSku: string | null, qty: number) {
    if (qty < 1) return;
    setBusyKey(key(productId, variationSku));
    try {
      await updateItem(productId, qty, variationSku || undefined);
    } catch (err) {
      showApiError(err, "Could not update quantity");
    } finally {
      setBusyKey(null);
    }
  }

  async function handleRemove(productId: string, variationSku: string | null) {
    setBusyKey(key(productId, variationSku));
    try {
      await removeItem(productId, variationSku || undefined);
    } catch (err) {
      showApiError(err, "Could not remove item");
    } finally {
      setBusyKey(null);
    }
  }

  async function handleApplyCoupon(e: React.FormEvent) {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setApplyingCoupon(true);
    try {
      await applyCoupon(couponInput.trim());
      setCouponInput("");
      toast.success("Coupon applied");
    } catch (err) {
      showApiError(err, "Could not apply this coupon");
    } finally {
      setApplyingCoupon(false);
    }
  }

  async function handleRemoveCoupon() {
    setApplyingCoupon(true);
    try {
      await removeCoupon();
      toast.success("Coupon removed");
    } catch (err) {
      showApiError(err, "Could not remove coupon");
    } finally {
      setApplyingCoupon(false);
    }
  }

  function handleCheckout() {
    router.push("/checkout");
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

            {cart?.couponCode ? (
              <div className="flex items-center justify-between rounded-lg border border-line bg-accent-soft/40 px-3 py-2 mb-4">
                <span className="flex items-center gap-1.5 text-sm font-medium">
                  <Tag size={14} className="text-accent-ink" />
                  {cart.couponCode}
                </span>
                <button
                  onClick={handleRemoveCoupon}
                  disabled={applyingCoupon}
                  aria-label="Remove coupon"
                  className="text-muted hover:text-danger disabled:opacity-40"
                >
                  <X size={15} />
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="flex gap-2 mb-4">
                <Input
                  placeholder="Coupon code"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  className="uppercase"
                />
                <Button type="submit" variant="outline" disabled={applyingCoupon || !couponInput.trim()}>
                  {applyingCoupon ? "…" : "Apply"}
                </Button>
              </form>
            )}


            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted">Subtotal</span>
              <PriceTag amount={subtotal} size="sm" />
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted">Discount</span>
                <span className="font-medium text-accent-ink flex items-center gap-1">
                  −<PriceTag amount={discountAmount} size="sm" />
                </span>
              </div>
            )}
            <div className="flex justify-between text-sm mb-4">
              <span className="text-muted">Shipping</span>
              {shippingFee === null ? (
                <span className="text-muted">Calculated at checkout</span>
              ) : shippingFee === 0 ? (
                <span className="font-medium text-accent-ink">Free</span>
              ) : (
                <PriceTag amount={shippingFee} size="sm" />
              )}
            </div>
            <div className="border-t border-line pt-4 flex justify-between items-baseline mb-6">
              <span className="font-medium">Total</span>
              <PriceTag amount={total} size="md" />
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
