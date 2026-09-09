"use client";

import { useEffect, useState } from "react";
import { fetchShippingSettings, updateShippingSettings } from "@/lib/api-shipping";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { ApiError } from "@/lib/api";

export default function ShippingSettingsPage() {
  const [flatFee, setFlatFee] = useState("");
  const [capEnabled, setCapEnabled] = useState(true);
  const [cap, setCap] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchShippingSettings()
      .then((settings) => {
        setFlatFee(String(settings.flatFee));
        setCapEnabled(settings.freeShippingCapEnabled);
        setCap(String(settings.freeShippingCap));
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      const updated = await updateShippingSettings({
        flatFee: Number(flatFee),
        freeShippingCapEnabled: capEnabled,
        freeShippingCap: Number(cap),
      });
      setFlatFee(String(updated.flatFee));
      setCapEnabled(updated.freeShippingCapEnabled);
      setCap(String(updated.freeShippingCap));
      setSaved(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not save settings");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="p-8 max-w-lg">
        <p className="text-sm text-muted">Loading…</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-lg">
      <h1 className="text-2xl font-semibold mb-2">Shipping</h1>
      <p className="text-xs text-muted mb-6">
        Controls the delivery fee shown at checkout and used when an order is placed.
      </p>

      <form onSubmit={handleSave} className="bg-surface border border-line rounded-lg p-5 space-y-5">
        <div>
          <Label htmlFor="flat-fee">Delivery fee (Rs)</Label>
          <Input
            id="flat-fee"
            type="number"
            min={0}
            required
            value={flatFee}
            onChange={(e) => setFlatFee(e.target.value)}
          />
          <p className="mt-1 text-xs text-muted">
            {capEnabled
              ? "Charged on orders below the free-shipping threshold."
              : "Charged on every order, regardless of size."}
          </p>
        </div>

        <div className="flex items-center justify-between border-t border-line pt-5">
          <div>
            <p className="text-sm font-medium">Free shipping above a threshold</p>
            <p className="text-xs text-muted">
              Turn off to always charge the delivery fee above, no matter the order size.
            </p>
          </div>
          <Switch
            checked={capEnabled}
            onChange={() => setCapEnabled((v) => !v)}
            label="Toggle free shipping threshold"
          />
        </div>

        {capEnabled && (
          <div>
            <Label htmlFor="free-shipping-cap">Free shipping threshold (Rs)</Label>
            <Input
              id="free-shipping-cap"
              type="number"
              min={0}
              required
              value={cap}
              onChange={(e) => setCap(e.target.value)}
            />
            <p className="mt-1 text-xs text-muted">
              Orders at or above this subtotal get free delivery instead of the fee above.
            </p>
          </div>
        )}

        {error && <p className="text-sm text-danger">{error}</p>}
        {saved && <p className="text-sm text-accent-ink">Saved.</p>}

        <Button type="submit" disabled={saving}>
          {saving ? "Saving…" : "Save changes"}
        </Button>
      </form>
    </div>
  );
}
