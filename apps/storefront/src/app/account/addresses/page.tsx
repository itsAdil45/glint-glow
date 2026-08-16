"use client";

import { useEffect, useState } from "react";
import { Address } from "@/types";
import { fetchAddresses, deleteAddress, updateAddress } from "@/lib/api-addresses";
import { AddressForm } from "@/components/account/address-form";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  function load() {
    fetchAddresses()
      .then(setAddresses)
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  async function handleDelete(id: string) {
    setBusyId(id);
    try {
      await deleteAddress(id);
      setAddresses((prev) => prev.filter((a) => a._id !== id));
    } finally {
      setBusyId(null);
    }
  }

  async function handleSetDefault(id: string) {
    setBusyId(id);
    try {
      await updateAddress(id, { isDefault: true });
      load();
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="max-w-xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-xl">Saved addresses</h2>
        {!showForm && (
          <Button size="sm" variant="outline" onClick={() => setShowForm(true)}>
            Add address
          </Button>
        )}
      </div>

      {showForm && (
        <div className="mb-6">
          <AddressForm
            onCreated={(addr) => {
              setAddresses((prev) => [addr, ...prev]);
              setShowForm(false);
            }}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      {loading ? (
        <p className="text-sm text-muted">Loading…</p>
      ) : addresses.length === 0 && !showForm ? (
        <p className="text-sm text-muted">No addresses saved yet.</p>
      ) : (
        <div className="space-y-3">
          {addresses.map((addr) => (
            <div key={addr._id} className={cn("border p-4 text-sm", addr.isDefault ? "border-ink" : "border-line")}>
              <div className="flex justify-between">
                <span className="font-medium">{addr.fullName}</span>
                {addr.isDefault && (
                  <span className="text-xs font-tag uppercase tracking-wide text-accent-ink">Default</span>
                )}
              </div>
              <p className="text-muted mt-1">{addr.phone}</p>
              <p className="text-muted mt-1">
                {addr.line1}
                {addr.line2 ? `, ${addr.line2}` : ""}, {addr.city}
                {addr.state ? `, ${addr.state}` : ""} {addr.postalCode}, {addr.country}
              </p>
              <div className="flex gap-4 mt-3">
                {!addr.isDefault && (
                  <button
                    disabled={busyId === addr._id}
                    onClick={() => handleSetDefault(addr._id)}
                    className="text-xs underline underline-offset-4"
                  >
                    Set as default
                  </button>
                )}
                <button
                  disabled={busyId === addr._id}
                  onClick={() => handleDelete(addr._id)}
                  className="text-xs text-danger underline underline-offset-4"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
