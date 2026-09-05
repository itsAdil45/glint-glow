"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchMyOrders } from "@/lib/api-orders";
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

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyOrders()
      .then(setOrders)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-sm text-muted">Loading…</p>;

  if (orders.length === 0) {
    return <p className="text-sm text-muted">You haven&apos;t placed any orders yet.</p>;
  }

  return (
    <div className="rounded-2xl bg-surface card-shadow divide-y divide-line overflow-hidden">
      {orders.map((order) => (
        <Link
          key={order._id}
          href={`/account/orders/${order._id}`}
          className="flex items-center justify-between p-4 hover:bg-accent-soft/40 transition-colors"
        >
          <div>
            <p className="font-body text-sm">#{order.orderNumber}</p>
            <p className="text-xs text-muted mt-1">
              {new Date(order.placedAt).toLocaleDateString()} · {order.items.length} item
              {order.items.length !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="text-right">
            <PriceTag amount={order.total} size="sm" />
            <p className="text-xs text-muted mt-1">{STATUS_LABEL[order.status]}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}
