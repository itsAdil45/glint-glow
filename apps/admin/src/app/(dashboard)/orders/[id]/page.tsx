"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { fetchAdminOrder, updateOrderStatus } from "@/lib/api-orders";
import { Order, OrderStatus } from "@/types";
import { formatPrice } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/badge";
import { Select } from "@/components/ui/input";

const STATUSES: OrderStatus[] = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchAdminOrder(params.id)
      .then(setOrder)
      .finally(() => setLoading(false));
  }, [params.id]);

  async function handleStatusChange(status: OrderStatus) {
    if (!order) return;
    setUpdating(true);
    try {
      const updated = await updateOrderStatus(order._id, status);
      setOrder(updated);
    } finally {
      setUpdating(false);
    }
  }

  if (loading) return <div className="p-8 text-sm text-muted">Loading…</div>;
  if (!order) return <div className="p-8 text-sm text-muted">Order not found.</div>;

  return (
    <div className="p-8 max-w-3xl">
      <button
        onClick={() => router.push("/orders")}
        className="flex items-center gap-1.5 text-sm text-muted hover:text-ink mb-4"
      >
        <ArrowLeft size={15} /> Back to orders
      </button>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Order #{order.orderNumber}</h1>
          <p className="text-sm text-muted mt-1">
            Placed {new Date(order.placedAt).toLocaleString()}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={order.status} />
          <Select
            value={order.status}
            disabled={updating}
            onChange={(e) => handleStatusChange(e.target.value as OrderStatus)}
            className="w-40"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        <div className="bg-surface border border-line rounded-lg p-5">
          <h2 className="text-sm font-medium mb-4">Items</h2>
          <div className="space-y-3">
            {order.items.map((item, i) => (
              <div key={i} className="flex justify-between text-sm">
                <div>
                  <p>{item.title}</p>
                  {item.variationSku && (
                    <p className="text-xs text-muted">
                      {Object.entries(item.attributes)
                        .map(([k, v]) => `${k}: ${v}`)
                        .join(" · ")}{" "}
                      · SKU {item.variationSku} · Qty {item.quantity}
                    </p>
                  )}
                </div>
                <span className="price-tag">{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-line mt-4 pt-4 space-y-1.5">
            <div className="flex justify-between text-sm text-muted">
              <span>Subtotal</span>
              <span className="price-tag">{formatPrice(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm text-muted">
              <span>Shipping</span>
              <span className="price-tag">{formatPrice(order.shippingFee)}</span>
            </div>
            <div className="flex justify-between font-medium">
              <span>Total</span>
              <span className="price-tag">{formatPrice(order.total)}</span>
            </div>
          </div>
          <p className="text-xs text-muted mt-3">Payment method: Cash on delivery</p>
        </div>

        <div className="bg-surface border border-line rounded-lg p-5 h-fit">
          <h2 className="text-sm font-medium mb-3">Shipping address</h2>
          <p className="text-sm text-muted leading-relaxed">
            {order.shippingAddress.fullName}
            <br />
            {order.shippingAddress.line1}
            {order.shippingAddress.line2 ? `, ${order.shippingAddress.line2}` : ""}
            <br />
            {order.shippingAddress.city}
            {order.shippingAddress.state ? `, ${order.shippingAddress.state}` : ""}{" "}
            {order.shippingAddress.postalCode}
            <br />
            {order.shippingAddress.country}
            <br />
            {order.phone}
          </p>
        </div>
      </div>
    </div>
  );
}
