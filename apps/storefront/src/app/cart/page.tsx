import type { Metadata } from "next";
import CartView from "./cart-view";
import { buildOpenGraph, buildTwitter } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Your Cart",
  description: "Review the items in your cart before checking out.",
  alternates: { canonical: "/cart" },
  openGraph: buildOpenGraph({ title: "Your Cart", url: "/cart" }),
  twitter: buildTwitter(),
};

export default function Page() {
  return <CartView />;
}
