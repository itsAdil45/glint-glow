import type { Metadata } from "next";
import AddressesView from "./addresses-view";

export const metadata: Metadata = {
  title: "Saved Addresses",
};

export default function Page() {
  return <AddressesView />;
}
