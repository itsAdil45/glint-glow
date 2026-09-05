import type { Metadata } from "next";
import RegisterView from "./register-view";
import { NOINDEX_NOFOLLOW } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Create an Account",
  description: "Create a GLOWN account to save your details and track your orders.",
  robots: NOINDEX_NOFOLLOW,
};

export default function Page() {
  return <RegisterView />;
}
