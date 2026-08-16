"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchAdminOrders } from "@/lib/api-orders";
import { Order, OrderStatus } from "@/types";
import { formatPrice } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/badge";
import { Select } from "@/components/ui/input";

const STATUS_FILTERS: (OrderStatus | "all")[] = [
  "all",
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<OrderStatus | "all">("all");

  useEffect(() => {
    fetchAdminOrders()
      .then(setOrders)
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Orders</h1>
        <Select
          value={filter}
          onChange={(e) => setFilter(e.target.value as OrderStatus | "all")}
          className="w-44"
        >
          {STATUS_FILTERS.map((s) => (
            <option key={s} value={s}>
              {s === "all" ? "All statuses" : s.charAt(0).toUpperCase() + s.slice(1)}
            </option>
          ))}
        </Select>
      </div>

      <div className="bg-surface border border-line rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-bg border-b border-line text-xs text-muted uppercase tracking-wide">
            <tr>
              <th className="text-left px-5 py-3 font-medium">Order</th>
              <th className="text-left px-5 py-3 font-medium">Date</th>
              <th className="text-left px-5 py-3 font-medium">Customer phone</th>
              <th className="text-left px-5 py-3 font-medium">Status</th>
              <th className="text-right px-5 py-3 font-medium">Total</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((order) => (
              <tr key={order._id} className="border-b border-line last:border-0 hover:bg-bg/50">
                <td className="px-5 py-3">
                  <Link href={`/orders/${order._id}`} className="price-tag hover:underline">
                    #{order.orderNumber}
                  </Link>
                </td>
                <td className="px-5 py-3 text-muted">{new Date(order.placedAt).toLocaleDateString()}</td>
                <td className="px-5 py-3 text-muted">{order.phone}</td>
                <td className="px-5 py-3">
                  <StatusBadge status={order.status} />
                </td>
                <td className="px-5 py-3 text-right price-tag">{formatPrice(order.total)}</td>
              </tr>
            ))}
            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-muted text-sm">
                  No orders match this filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
