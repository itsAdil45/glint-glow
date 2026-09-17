import type { Metadata } from "next";
import OrderConfirmationView from "./order-confirmation-view";
import { NOINDEX_NOFOLLOW, buildOpenGraph, buildTwitter } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Order Confirmed",
  description: "Your GLOWN order has been placed successfully.",
  // Already excluded via robots.txt disallow — this is the matching
  // meta-tag signal, since this page has no search value and is
  // specific to one order.
  robots: NOINDEX_NOFOLLOW,
  openGraph: buildOpenGraph({ title: "Order Confirmed" }),
  twitter: buildTwitter(),
};

export default function Page() {
  return <OrderConfirmationView />;
}
