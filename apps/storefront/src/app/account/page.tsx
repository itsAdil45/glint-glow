import type { Metadata } from "next";
import AccountView from "./account-view";
import { NOINDEX_NOFOLLOW, buildOpenGraph, buildTwitter } from "@/lib/seo";

export const metadata: Metadata = {
  title: "My Account",
  alternates: { canonical: "/account" },
  robots: NOINDEX_NOFOLLOW,
  openGraph: buildOpenGraph({ title: "My Account" }),
  twitter: buildTwitter(),
};

export default function Page() {
  return <AccountView />;
}
