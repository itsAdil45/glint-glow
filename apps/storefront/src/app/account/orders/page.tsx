import type { Metadata } from "next";
import OrdersView from "./orders-view";

export const metadata: Metadata = {
  title: "Order History",
};

export default function Page() {
  return <OrdersView />;
}
