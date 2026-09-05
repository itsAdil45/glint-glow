import type { Metadata } from "next";
import OrdersView from "./orders-view";

export const metadata: Metadata = {
  title: "Order History",
  alternates: { canonical: "/account/orders" },
};

export default function Page() {
  return <OrdersView />;
}
