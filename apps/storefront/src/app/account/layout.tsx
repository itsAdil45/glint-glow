import type { Metadata } from "next";
import AccountLayoutView from "./account-layout-view";
import { NOINDEX_NOFOLLOW } from "@/lib/seo";

// Applies to this whole route tree (profile, addresses, orders, reviews,
// change-password) — all of it requires being logged in and is specific
// to one customer, so none of it belongs in search results. Individual
// pages below still set their own title/description.
export const metadata: Metadata = {
  robots: NOINDEX_NOFOLLOW,
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <AccountLayoutView>{children}</AccountLayoutView>;
}
