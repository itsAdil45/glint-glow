import type { Metadata } from "next";
import ForgotPasswordView from "./forgot-password-view";
import { NOINDEX_NOFOLLOW, buildOpenGraph, buildTwitter } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Reset Your Password",
  description: "Request a password reset code for your GLOWN account.",
  robots: NOINDEX_NOFOLLOW,
  openGraph: buildOpenGraph({ title: "Reset Your Password" }),
  twitter: buildTwitter(),
};

export default function Page() {
  return <ForgotPasswordView />;
}
