import type { Metadata } from "next";
import CheckoutView from "./checkout-view";
import { NOINDEX_NOFOLLOW } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Complete your order with cash on delivery.",
  // Requires being logged in — no search value, and one customer's
  // checkout state has nothing to do with another's.
  robots: NOINDEX_NOFOLLOW,
};

export default function Page() {
  return <CheckoutView />;
}
