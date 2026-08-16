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
    <div className="divide-y divide-line border-y border-line">
      {orders.map((order) => (
        <Link
          key={order._id}
          href={`/account/orders/${order._id}`}
          className="flex items-center justify-between py-4 hover:bg-accent-soft/50 px-2 -mx-2 transition-colors"
        >
          <div>
            <p className="font-tag text-sm">#{order.orderNumber}</p>
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
