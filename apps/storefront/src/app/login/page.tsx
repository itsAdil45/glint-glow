import type { Metadata } from "next";
import LoginView from "./login-view";
import { NOINDEX_NOFOLLOW } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Log In",
  description: "Log in to your GLOWN account to track orders and check out faster.",
  robots: NOINDEX_NOFOLLOW,
};

export default function Page() {
  return <LoginView />;
}
