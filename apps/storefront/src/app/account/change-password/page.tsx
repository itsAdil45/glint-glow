import type { Metadata } from "next";
import ChangePasswordView from "./change-password-view";
import { NOINDEX_NOFOLLOW, buildOpenGraph, buildTwitter } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Change Password",
  robots: NOINDEX_NOFOLLOW,
  openGraph: buildOpenGraph({ title: "Change Password" }),
  twitter: buildTwitter(),
};

export default function Page() {
  return <ChangePasswordView />;
}
