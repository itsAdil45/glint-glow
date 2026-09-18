"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import {
  fetchAdminCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  Coupon,
  CouponInput,
  CouponType,
} from "@/lib/api-coupons";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { ApiError } from "@/lib/api";

function formatValue(coupon: Coupon) {
  return coupon.type === "percentage" ? `${coupon.value}%` : `Rs. ${coupon.value}`;
}

function statusOf(coupon: Coupon): { label: string; className: string } {
  const now = new Date();
  if (!coupon.isActive) return { label: "Inactive", className: "bg-line text-muted" };
  if (coupon.expiresAt && new Date(coupon.expiresAt) < now)
    return { label: "Expired", className: "bg-danger/10 text-danger" };
  if (coupon.startsAt && new Date(coupon.startsAt) > now)
    return { label: "Scheduled", className: "bg-gold-soft text-gold" };
  if (coupon.usageLimit != null && coupon.usedCount >= coupon.usageLimit)
    return { label: "Used up", className: "bg-line text-muted" };
  return { label: "Active", className: "bg-accent-soft text-accent-ink" };
}

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Coupon | null>(null);

  function load() {
    fetchAdminCoupons()
      .then(setCoupons)
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("Delete this coupon? This cannot be undone.")) return;
    await deleteCoupon(id);
    setCoupons((prev) => prev.filter((c) => c._id !== id));
  }

  async function handleToggleActive(coupon: Coupon) {
    const updated = await updateCoupon(coupon._id, { isActive: !coupon.isActive });
    setCoupons((prev) => prev.map((c) => (c._id === coupon._id ? updated : c)));
  }

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Coupons</h1>
        {!showForm && (
          <Button
            onClick={() => {
              setEditing(null);
              setShowForm(true);
            }}
          >
            <Plus size={16} /> Add coupon
          </Button>
        )}
      </div>

      {showForm && (
        <div className="mb-6">
          <CouponForm
            initial={editing}
            onDone={(coupon) => {
              setCoupons((prev) => {
                const exists = prev.some((c) => c._id === coupon._id);
                return exists ? prev.map((c) => (c._id === coupon._id ? coupon : c)) : [coupon, ...prev];
              });
              setShowForm(false);
              setEditing(null);
            }}
            onCancel={() => {
              setShowForm(false);
              setEditing(null);
            }}
          />
        </div>
      )}

      <div className="bg-surface border border-line rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line text-left text-xs text-muted">
              <th className="px-5 py-3 font-medium">Code</th>
              <th className="px-5 py-3 font-medium">Discount</th>
              <th className="px-5 py-3 font-medium">Min order</th>
              <th className="px-5 py-3 font-medium">Usage</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="text-right px-5 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-muted text-sm">
                  Loading…
                </td>
              </tr>
            ) : coupons.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-muted text-sm">
                  No coupons yet.
                </td>
              </tr>
            ) : (
              coupons.map((coupon) => {
                const status = statusOf(coupon);
                return (
                  <tr key={coupon._id}>
                    <td className="px-5 py-3">
                      <p className="text-sm font-medium price-tag">{coupon.code}</p>
                      {coupon.description && <p className="text-xs text-muted">{coupon.description}</p>}
                    </td>
                    <td className="px-5 py-3">
                      {formatValue(coupon)}
                      {coupon.type === "percentage" && coupon.maxDiscountAmount != null && (
                        <span className="text-xs text-muted"> (max Rs. {coupon.maxDiscountAmount})</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-muted">
                      {coupon.minOrderValue ? `Rs. ${coupon.minOrderValue}` : "—"}
                    </td>
                    <td className="px-5 py-3 text-muted">
                      {coupon.usedCount}
                      {coupon.usageLimit != null ? ` / ${coupon.usageLimit}` : ""}
                      {coupon.usageLimitPerUser != null && (
                        <span className="text-xs"> · {coupon.usageLimitPerUser}/customer</span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <button
                        onClick={() => handleToggleActive(coupon)}
                        className={`text-xs font-medium rounded-full px-2.5 py-1 ${status.className}`}
                      >
                        {status.label}
                      </button>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex justify-end gap-3">
                        <button
                          onClick={() => {
                            setEditing(coupon);
                            setShowForm(true);
                          }}
                          className="text-xs underline underline-offset-4"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(coupon._id)}
                          className="text-xs text-danger underline underline-offset-4"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function toDateInputValue(iso?: string) {
  if (!iso) return "";
  return iso.slice(0, 10);
}

function CouponForm({
  initial,
  onDone,
  onCancel,
}: {
  initial: Coupon | null;
  onDone: (coupon: Coupon) => void;
  onCancel: () => void;
}) {
  const [code, setCode] = useState(initial?.code || "");
  const [type, setType] = useState<CouponType>(initial?.type || "percentage");
  const [value, setValue] = useState(initial?.value ?? 10);
  const [maxDiscountAmount, setMaxDiscountAmount] = useState(initial?.maxDiscountAmount ?? "");
  const [minOrderValue, setMinOrderValue] = useState(initial?.minOrderValue ?? 0);
  const [usageLimit, setUsageLimit] = useState(initial?.usageLimit ?? "");
  const [usageLimitPerUser, setUsageLimitPerUser] = useState(initial?.usageLimitPerUser ?? "");
  const [startsAt, setStartsAt] = useState(toDateInputValue(initial?.startsAt));
  const [expiresAt, setExpiresAt] = useState(toDateInputValue(initial?.expiresAt));
  const [isActive, setIsActive] = useState(initial?.isActive ?? true);
  const [description, setDescription] = useState(initial?.description || "");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    const payload: CouponInput = {
      code: code.trim().toUpperCase(),
      type,
      value: Number(value),
      maxDiscountAmount: maxDiscountAmount === "" ? undefined : Number(maxDiscountAmount),
      minOrderValue: Number(minOrderValue) || 0,
      usageLimit: usageLimit === "" ? undefined : Number(usageLimit),
      usageLimitPerUser: usageLimitPerUser === "" ? undefined : Number(usageLimitPerUser),
      startsAt: startsAt || undefined,
      expiresAt: expiresAt || undefined,
      isActive,
      description: description || undefined,
    };
    try {
      const result = initial ? await updateCoupon(initial._id, payload) : await createCoupon(payload);
      onDone(result);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not save coupon");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-surface border border-line rounded-lg p-5 space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="coupon-code">Code</Label>
          <Input
            id="coupon-code"
            required
            placeholder="WELCOME10"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="uppercase"
          />
        </div>
        <div>
          <Label htmlFor="coupon-description">Internal note (optional)</Label>
          <Input
            id="coupon-description"
            placeholder="Instagram launch promo"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="coupon-type">Discount type</Label>
          <Select id="coupon-type" value={type} onChange={(e) => setType(e.target.value as CouponType)}>
            <option value="percentage">Percentage off</option>
            <option value="fixed">Fixed amount off</option>
          </Select>
        </div>
        <div>
          <Label htmlFor="coupon-value">{type === "percentage" ? "Percentage (%)" : "Amount (Rs.)"}</Label>
          <Input
            id="coupon-value"
            type="number"
            required
            min={0}
            max={type === "percentage" ? 100 : undefined}
            value={value}
            onChange={(e) => setValue(Number(e.target.value))}
          />
        </div>
        {type === "percentage" && (
          <div>
            <Label htmlFor="coupon-max-discount">Max discount (Rs., optional)</Label>
            <Input
              id="coupon-max-discount"
              type="number"
              min={0}
              placeholder="No cap"
              value={maxDiscountAmount}
              onChange={(e) => setMaxDiscountAmount(e.target.value === "" ? "" : Number(e.target.value))}
            />
          </div>
        )}
        <div>
          <Label htmlFor="coupon-min-order">Minimum order (Rs.)</Label>
          <Input
            id="coupon-min-order"
            type="number"
            min={0}
            value={minOrderValue}
            onChange={(e) => setMinOrderValue(Number(e.target.value))}
          />
        </div>
        <div>
          <Label htmlFor="coupon-usage-limit">Total uses allowed (optional)</Label>
          <Input
            id="coupon-usage-limit"
            type="number"
            min={1}
            placeholder="Unlimited"
            value={usageLimit}
            onChange={(e) => setUsageLimit(e.target.value === "" ? "" : Number(e.target.value))}
          />
        </div>
        <div>
          <Label htmlFor="coupon-usage-per-user">Uses per customer (optional)</Label>
          <Input
            id="coupon-usage-per-user"
            type="number"
            min={1}
            placeholder="Unlimited"
            value={usageLimitPerUser}
            onChange={(e) => setUsageLimitPerUser(e.target.value === "" ? "" : Number(e.target.value))}
          />
        </div>
        <div>
          <Label htmlFor="coupon-starts">Starts (optional)</Label>
          <Input id="coupon-starts" type="date" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="coupon-expires">Expires (optional)</Label>
          <Input id="coupon-expires" type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} />
        </div>
        <div className="flex items-end pb-2.5">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
            Active
          </label>
        </div>
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}
      <div className="flex gap-3">
        <Button type="submit" size="sm" disabled={submitting}>
          {submitting ? "Saving…" : "Save"}
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
