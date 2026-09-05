import type { Metadata } from "next";
import OrderDetailView from "./order-detail-view";

export const metadata: Metadata = {
  title: "Order Details",
  alternates: { canonical: "/account/orders/[id]" },
};

export default function Page() {
  return <OrderDetailView />;
}
