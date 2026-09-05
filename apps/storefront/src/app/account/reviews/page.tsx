import type { Metadata } from "next";
import ReviewsView from "./reviews-view";

export const metadata: Metadata = {
  title: "My Reviews",
};

export default function Page() {
  return <ReviewsView />;
}
