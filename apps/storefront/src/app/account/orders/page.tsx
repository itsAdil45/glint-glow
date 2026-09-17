import type { Metadata } from "next";
import OrdersView from "./orders-view";
import { NOINDEX_NOFOLLOW, buildOpenGraph, buildTwitter } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Order History",
  alternates: { canonical: "/account/orders" },
  robots: NOINDEX_NOFOLLOW,
  openGraph: buildOpenGraph({ title: "Order History" }),
  twitter: buildTwitter(),
};

export default function Page() {
  return <OrdersView />;
}
