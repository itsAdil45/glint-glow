"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { useCartStore } from "@/store/cart-store";
import { fetchAddresses } from "@/lib/api-addresses";
import { placeOrder } from "@/lib/api-orders";
import { Address } from "@/types";
import { PriceTag } from "@/components/ui/price-tag";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { AddressForm } from "@/components/account/address-form";
import { ApiError } from "@/lib/api";
import { cn } from "@/lib/utils";

export default function CheckoutPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isHydrating = useAuthStore((s) => s.isHydrating);
  const { cart, load: loadCart } = useCartStore();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [phone, setPhone] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isHydrating && !user) {
      router.push("/login?redirect=/checkout");
    }
  }, [isHydrating, user, router]);

  useEffect(() => {
    loadCart();
    if (user) {
      fetchAddresses()
        .then((addrs) => {
          setAddresses(addrs);
          const def = addrs.find((a) => a.isDefault) || addrs[0];
          if (def) {
            setSelectedAddressId(def._id);
            setPhone(def.phone);
          } else {
            setShowAddForm(true);
          }
        })
        .finally(() => setLoadingAddresses(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  function handleAddressCreated(address: Address) {
    setAddresses((prev) => [address, ...prev]);
    setSelectedAddressId(address._id);
    setPhone(address.phone);
    setShowAddForm(false);
  }

  async function handlePlaceOrder() {
    setError("");
    if (!selectedAddressId) {
      setError("Please select a shipping address");
      return;
    }
    if (!phone.trim()) {
      setError("Please enter a phone number");
      return;
    }
    setPlacing(true);
    try {
      const order = await placeOrder({ addressId: selectedAddressId, phone });
      router.push(`/order-confirmation/${order.orderNumber}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not place order");
    } finally {
      setPlacing(false);
    }
  }

  if (!user) return null; // redirecting

  const items = cart?.items || [];
  const subtotal = cart?.subtotal || 0;

  return (
    <div className="container-page py-10">
      <h1 className="font-display text-3xl mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-12">
        <div className="space-y-8">
          <section>
            <h2 className="font-display text-lg mb-4">Shipping address</h2>
            {loadingAddresses ? (
              <p className="text-sm text-muted">Loading addresses…</p>
            ) : (
              <div className="space-y-3">
                {addresses.map((addr) => (
                  <label
                    key={addr._id}
                    className={cn(
                      "block rounded-xl border p-4 cursor-pointer text-sm transition-colors",
                      selectedAddressId === addr._id
                        ? "border-accent-ink bg-accent-soft/40"
                        : "border-line bg-surface",
                    )}
                  >
                    <input
                      type="radio"
                      name="address"
                      className="mr-2"
                      checked={selectedAddressId === addr._id}
                      onChange={() => {
                        setSelectedAddressId(addr._id);
                        setPhone(addr.phone);
                      }}
                    />
                    <span className="font-medium">{addr.fullName}</span>
                    <p className="text-muted mt-1 ml-5">
                      {addr.line1}
                      {addr.line2 ? `, ${addr.line2}` : ""}, {addr.city}
                      {addr.state ? `, ${addr.state}` : ""} {addr.postalCode}, {addr.country}
                    </p>
                  </label>
                ))}

                {!showAddForm && (
                  <button
                    onClick={() => setShowAddForm(true)}
                    className="text-sm underline underline-offset-4"
                  >
                    + Add a new address
                  </button>
                )}
                {showAddForm && (
                  <AddressForm
                    onCreated={handleAddressCreated}
                    onCancel={addresses.length > 0 ? () => setShowAddForm(false) : undefined}
                  />
                )}
              </div>
            )}
          </section>

          <section>
            <h2 className="font-display text-lg mb-4">Contact phone</h2>
            <Label htmlFor="phone">Phone number for delivery</Label>
            <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </section>
        </div>

        <div className="rounded-2xl bg-surface card-shadow p-6 h-fit">
          <h2 className="font-display text-lg mb-4">Order summary</h2>
          <div className="space-y-3 mb-4 max-h-64 overflow-y-auto pr-1">
            {items.map((item) => (
              <div key={`${item.productId}-${item.variationSku}`} className="flex justify-between text-sm">
                <span className="text-muted">
                  {item.title} × {item.quantity}
                </span>
                <PriceTag amount={item.lineTotal} size="sm" />
              </div>
            ))}
          </div>
          <div className="border-t border-line pt-4 flex justify-between items-baseline mb-2">
            <span className="text-sm text-muted">Subtotal</span>
            <PriceTag amount={subtotal} size="sm" />
          </div>
          <div className="flex justify-between items-baseline mb-6">
            <span className="font-medium">Total</span>
            <PriceTag amount={subtotal} size="md" />
          </div>
          <p className="text-xs text-muted mb-4">
            Payment: Cash on delivery. You&apos;ll pay when your order arrives.
          </p>
          {error && <p className="text-sm text-danger mb-3">{error}</p>}
          <Button
            size="lg"
            className="w-full"
            disabled={placing || items.length === 0}
            onClick={handlePlaceOrder}
          >
            {placing ? "Placing order…" : "Place order"}
          </Button>
        </div>
      </div>
    </div>
  );
}
