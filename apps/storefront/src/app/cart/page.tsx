import type { Metadata } from "next";
import CartView from "./cart-view";

export const metadata: Metadata = {
  title: "Your Cart",
  description: "Review the items in your cart before checking out.",
};

export default function Page() {
  return <CartView />;
}
