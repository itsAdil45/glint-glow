"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { useCartStore } from "@/store/cart-store";
import { fetchAddresses } from "@/lib/api-addresses";
import { placeOrder } from "@/lib/api-orders";
import { fetchShippingSettings, estimateShippingFee, ShippingSettings } from "@/lib/api-shipping";
import { Address } from "@/types";
import { PriceTag } from "@/components/ui/price-tag";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { AddressForm } from "@/components/account/address-form";
import { ApiError } from "@/lib/api";
import { cn } from "@/lib/utils";

interface GuestDetails {
  fullName: string;
  email: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

const EMPTY_GUEST_DETAILS: GuestDetails = {
  fullName: "",
  email: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "",
};

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
  const [guest, setGuest] = useState<GuestDetails>(EMPTY_GUEST_DETAILS);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");
  const [shippingSettings, setShippingSettings] = useState<ShippingSettings | null>(null);

  useEffect(() => {
    fetchShippingSettings()
      .then(setShippingSettings)
      .catch(() => null);
  }, []);

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

  function updateGuestField<K extends keyof GuestDetails>(field: K, value: GuestDetails[K]) {
    setGuest((prev) => ({ ...prev, [field]: value }));
  }

  async function handlePlaceOrder() {
    setError("");
    if (!phone.trim()) {
      setError("Please enter a phone number");
      return;
    }

    if (user) {
      if (!selectedAddressId) {
        setError("Please select a shipping address");
        return;
      }
    } else {
      const required: [keyof GuestDetails, string][] = [
        ["fullName", "Full name"],
        ["email", "Email"],
        ["line1", "Address line 1"],
        ["city", "City"],
        ["postalCode", "Postal code"],
        ["country", "Country"],
      ];
      for (const [field, label] of required) {
        if (!guest[field].trim()) {
          setError(`Please enter your ${label.toLowerCase()}`);
          return;
        }
      }
    }

    setPlacing(true);
    try {
      const order = user
        ? await placeOrder({ addressId: selectedAddressId, phone })
        : await placeOrder({ phone, ...guest });
      const confirmationUrl = user
        ? `/order-confirmation/${order.orderNumber}`
        : `/order-confirmation/${order.orderNumber}?email=${encodeURIComponent(guest.email)}`;
      router.push(confirmationUrl);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not place order");
    } finally {
      setPlacing(false);
    }
  }

  if (isHydrating) return null;

  const items = cart?.items || [];
  const subtotal = cart?.subtotal || 0;
  const shippingFee = shippingSettings ? estimateShippingFee(shippingSettings, subtotal) : null;
  const total = subtotal + (shippingFee || 0);

  return (
    <div className="container-page py-10">
      <h1 className="font-display text-3xl mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-12">
        <div className="space-y-8">
          {!user && (
            <p className="text-sm text-muted">
              Checking out as a guest.{" "}
              <Link href="/login?redirect=/checkout" className="text-accent-ink underline underline-offset-4">
                Log in
              </Link>{" "}
              or{" "}
              <Link href="/register" className="text-accent-ink underline underline-offset-4">
                create an account
              </Link>{" "}
              to save your details and track orders — or just continue below.
            </p>
          )}

          <section>
            <h2 className="font-display text-lg mb-4">Shipping address</h2>

            {user ? (
              loadingAddresses ? (
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
              )
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <Label htmlFor="guest-fullName">Full name</Label>
                  <Input
                    id="guest-fullName"
                    value={guest.fullName}
                    onChange={(e) => updateGuestField("fullName", e.target.value)}
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="guest-email">Email</Label>
                  <Input
                    id="guest-email"
                    type="email"
                    value={guest.email}
                    onChange={(e) => updateGuestField("email", e.target.value)}
                  />
                  <p className="mt-1 text-xs text-muted">
                    We&apos;ll send your order confirmation here.
                  </p>
                </div>
                <div className="col-span-2">
                  <Label htmlFor="guest-line1">Address line 1</Label>
                  <Input
                    id="guest-line1"
                    value={guest.line1}
                    onChange={(e) => updateGuestField("line1", e.target.value)}
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="guest-line2">Address line 2 (optional)</Label>
                  <Input
                    id="guest-line2"
                    value={guest.line2}
                    onChange={(e) => updateGuestField("line2", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="guest-city">City</Label>
                  <Input
                    id="guest-city"
                    value={guest.city}
                    onChange={(e) => updateGuestField("city", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="guest-state">State (optional)</Label>
                  <Input
                    id="guest-state"
                    value={guest.state}
                    onChange={(e) => updateGuestField("state", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="guest-postalCode">Postal code</Label>
                  <Input
                    id="guest-postalCode"
                    value={guest.postalCode}
                    onChange={(e) => updateGuestField("postalCode", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="guest-country">Country</Label>
                  <Input
                    id="guest-country"
                    value={guest.country}
                    onChange={(e) => updateGuestField("country", e.target.value)}
                  />
                </div>
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
          <div className="flex justify-between items-baseline mb-2">
            <span className="text-sm text-muted">Shipping</span>
            {shippingFee === null ? (
              <span className="text-sm text-muted">Calculating…</span>
            ) : shippingFee === 0 ? (
              <span className="text-sm font-medium text-accent-ink">Free</span>
            ) : (
              <PriceTag amount={shippingFee} size="sm" />
            )}
          </div>
          <div className="flex justify-between items-baseline mb-6">
            <span className="font-medium">Total</span>
            <PriceTag amount={total} size="md" />
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
