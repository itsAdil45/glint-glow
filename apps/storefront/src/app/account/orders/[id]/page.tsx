import type { Metadata } from "next";
import OrderDetailView from "./order-detail-view";

export const metadata: Metadata = {
  title: "Order Details",
};

export default function Page() {
  return <OrderDetailView />;
}
