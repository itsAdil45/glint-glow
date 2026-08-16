"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { fetchOrder } from "@/lib/api-orders";
import { Order } from "@/types";
import { PriceTag } from "@/components/ui/price-tag";

const STATUS_LABEL: Record<Order["status"], string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrder(params.id)
      .then(setOrder)
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) return <p className="text-sm text-muted">Loading…</p>;
  if (!order) return <p className="text-sm text-muted">Order not found.</p>;

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-xl">Order #{order.orderNumber}</h2>
          <p className="text-xs text-muted mt-1">
            Placed on {new Date(order.placedAt).toLocaleDateString()}
          </p>
        </div>
        <span className="text-xs font-tag uppercase tracking-wide bg-accent-soft px-2 py-1">
          {STATUS_LABEL[order.status]}
        </span>
      </div>

      <div className="border border-line p-5 mb-6">
        <h3 className="text-sm font-medium mb-3">Items</h3>
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
                    · Qty {item.quantity}
                  </p>
                )}
              </div>
              <PriceTag amount={item.price * item.quantity} size="sm" />
            </div>
          ))}
        </div>
        <div className="border-t border-line mt-4 pt-4 flex justify-between items-baseline">
          <span className="font-medium">Total</span>
          <PriceTag amount={order.total} size="md" />
        </div>
      </div>

      <div className="border border-line p-5">
        <h3 className="text-sm font-medium mb-3">Shipping address</h3>
        <p className="text-sm text-muted">
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
  );
}
