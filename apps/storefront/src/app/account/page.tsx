import type { Metadata } from "next";
import AccountView from "./account-view";

export const metadata: Metadata = {
  title: "My Account",
  alternates: { canonical: "/account" },
};

export default function Page() {
  return <AccountView />;
}
