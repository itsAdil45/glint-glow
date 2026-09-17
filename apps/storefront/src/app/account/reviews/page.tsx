import type { Metadata } from "next";
import ReviewsView from "./reviews-view";
import { NOINDEX_NOFOLLOW, buildOpenGraph, buildTwitter } from "@/lib/seo";

export const metadata: Metadata = {
  title: "My Reviews",
  alternates: { canonical: "/account/reviews" },
  robots: NOINDEX_NOFOLLOW,
  openGraph: buildOpenGraph({ title: "My Reviews" }),
  twitter: buildTwitter(),
};

export default function Page() {
  return <ReviewsView />;
}
