import type { Metadata } from "next";
import LoginView from "./login-view";
import { NOINDEX_NOFOLLOW, buildOpenGraph, buildTwitter } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Log In",
  description: "Log in to your GLOWN account to track orders and check out faster.",
  robots: NOINDEX_NOFOLLOW,
  openGraph: buildOpenGraph({ title: "Log In to GLOWN" }),
  twitter: buildTwitter(),
};

export default function Page() {
  return <LoginView />;
}
