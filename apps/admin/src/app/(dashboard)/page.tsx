"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchAdminOrders } from "@/lib/api-orders";
import { fetchAdminProducts } from "@/lib/api-products";
import { Order, Product } from "@/types";
import { formatPrice } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/badge";

export default function DashboardPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchAdminOrders(), fetchAdminProducts()])
      .then(([o, p]) => {
        setOrders(o);
        setProducts(p);
      })
      .finally(() => setLoading(false));
  }, []);

  const revenue = orders
    .filter((o) => o.status !== "cancelled")
    .reduce((sum, o) => sum + o.total, 0);
  const pendingCount = orders.filter((o) => o.status === "pending").length;
  const lowStockCount = products.filter((p) => {
    const stock = p.hasVariations ? p.variations.reduce((s, v) => s + v.stock, 0) : p.stock;
    return stock <= 5;
  }).length;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total orders" value={loading ? "…" : String(orders.length)} />
        <StatCard label="Revenue" value={loading ? "…" : formatPrice(revenue)} />
        <StatCard label="Pending orders" value={loading ? "…" : String(pendingCount)} accent={pendingCount > 0} />
        <StatCard label="Low stock (≤5)" value={loading ? "…" : String(lowStockCount)} accent={lowStockCount > 0} />
      </div>

      <div className="bg-surface border border-line rounded-lg">
        <div className="flex items-center justify-between px-5 py-4 border-b border-line">
          <h2 className="font-medium text-sm">Recent orders</h2>
          <Link href="/orders" className="text-xs text-muted hover:text-ink underline underline-offset-4">
            View all
          </Link>
        </div>
        <table className="w-full text-sm">
          <tbody>
            {orders.slice(0, 8).map((order) => (
              <tr key={order._id} className="border-b border-line last:border-0">
                <td className="px-5 py-3">
                  <Link href={`/orders/${order._id}`} className="price-tag hover:underline">
                    #{order.orderNumber}
                  </Link>
                </td>
                <td className="px-5 py-3 text-muted">
                  {new Date(order.placedAt).toLocaleDateString()}
                </td>
                <td className="px-5 py-3">
                  <StatusBadge status={order.status} />
                </td>
                <td className="px-5 py-3 text-right price-tag">{formatPrice(order.total)}</td>
              </tr>
            ))}
            {!loading && orders.length === 0 && (
              <tr>
                <td colSpan={4} className="px-5 py-8 text-center text-muted text-sm">
                  No orders yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatCard({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="bg-surface border border-line rounded-lg p-5">
      <p className="text-xs text-muted">{label}</p>
      <p className={`text-2xl font-semibold mt-1 ${accent ? "text-warn" : ""}`}>{value}</p>
    </div>
  );
}
