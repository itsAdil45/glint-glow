import type { Metadata } from "next";
import AddressesView from "./addresses-view";
import { NOINDEX_NOFOLLOW, buildOpenGraph, buildTwitter } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Saved Addresses",
  robots: NOINDEX_NOFOLLOW,
  openGraph: buildOpenGraph({ title: "Saved Addresses" }),
  twitter: buildTwitter(),
};

export default function Page() {
  return <AddressesView />;
}
