import { apiFetch } from "@/lib/api";
import { Review, ReviewStatus } from "@/types";

export async function fetchAdminReviews(status?: ReviewStatus): Promise<Review[]> {
  const query = status ? `?status=${status}` : "";
  return apiFetch<Review[]>(`/reviews/admin/all${query}`);
}

export async function moderateReview(
  id: string,
  data: { status: "approved" | "rejected"; rejectionReason?: string },
): Promise<Review> {
  return apiFetch<Review>(`/reviews/admin/${id}`, { method: "PATCH", body: JSON.stringify(data) });
}

export async function deleteReview(id: string): Promise<{ message: string }> {
  return apiFetch(`/reviews/admin/${id}`, { method: "DELETE" });
}
