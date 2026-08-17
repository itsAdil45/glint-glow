"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { fetchMyOrders } from "@/lib/api-orders";
import { Order } from "@/types";
import { PriceTag } from "@/components/ui/price-tag";
import { Button } from "@/components/ui/button";

export default function OrderConfirmationPage() {
  const params = useParams<{ orderNumber: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyOrders()
      .then((orders) => {
        setOrder(orders.find((o) => o.orderNumber === params.orderNumber) || null);
      })
      .finally(() => setLoading(false));
  }, [params.orderNumber]);

  return (
    <div className="container-page py-16 max-w-lg mx-auto text-center">
      <span className="font-body text-xs tracking-widest text-accent-ink uppercase">
        Order confirmed
      </span>
      <h1 className="font-display text-3xl mt-3">Thank you for your order</h1>
      <p className="text-muted mt-2">
        Order <span className="font-body">#{params.orderNumber}</span> has been placed. A
        confirmation email is on its way.
      </p>

      {!loading && order && (
        <div className="mt-8 rounded-2xl bg-surface card-shadow p-6 text-left">
          <div className="space-y-2 mb-4">
            {order.items.map((item, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-muted">
                  {item.title} × {item.quantity}
                </span>
                <PriceTag amount={item.price * item.quantity} size="sm" />
              </div>
            ))}
          </div>
          <div className="border-t border-line pt-4 flex justify-between items-baseline">
            <span className="font-medium">Total</span>
            <PriceTag amount={order.total} size="md" />
          </div>
          <p className="text-xs text-muted mt-3">Payment: Cash on delivery</p>
        </div>
      )}

      <div className="mt-8 flex justify-center gap-3">
        <Button asChild>
          <Link href="/products">Continue shopping</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/account/orders">View orders</Link>
        </Button>
      </div>
    </div>
  );
}
