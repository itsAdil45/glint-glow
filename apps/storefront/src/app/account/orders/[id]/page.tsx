import type { Metadata } from "next";
import OrderDetailView from "./order-detail-view";
import { NOINDEX_NOFOLLOW, buildOpenGraph, buildTwitter } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Order Details",
  alternates: { canonical: "/account/orders/[id]" },
  robots: NOINDEX_NOFOLLOW,
  openGraph: buildOpenGraph({ title: "Order Details" }),
  twitter: buildTwitter(),
};

export default function Page() {
  return <OrderDetailView />;
}
