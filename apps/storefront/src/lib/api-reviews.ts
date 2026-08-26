import { apiFetch } from "@/lib/api";
import { Review, ReviewEligibility } from "@/types";

export async function fetchProductReviews(productId: string): Promise<Review[]> {
  return apiFetch<Review[]>(`/reviews?productId=${productId}`, { auth: false });
}

export async function checkReviewEligibility(productId: string): Promise<ReviewEligibility> {
  return apiFetch<ReviewEligibility>(`/reviews/eligibility?productId=${productId}`);
}

export async function fetchMyReviews(): Promise<Review[]> {
  return apiFetch<Review[]>("/reviews/mine");
}

export async function submitReview(data: {
  productId: string;
  orderId: string;
  rating: number;
  title?: string;
  comment: string;
}): Promise<Review> {
  return apiFetch<Review>("/reviews", { method: "POST", body: JSON.stringify(data) });
}
