import type { Metadata } from "next";
import ForgotPasswordView from "./forgot-password-view";
import { NOINDEX_NOFOLLOW } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Reset Your Password",
  description: "Request a password reset code for your GLOWN account.",
  robots: NOINDEX_NOFOLLOW,
};

export default function Page() {
  return <ForgotPasswordView />;
}
