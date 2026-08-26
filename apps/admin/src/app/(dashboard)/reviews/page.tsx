"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Star } from "lucide-react";
import { fetchAdminReviews, moderateReview, deleteReview } from "@/lib/api-reviews";
import { Review, ReviewStatus } from "@/types";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/input";
import { ReviewStatusBadge } from "@/components/ui/badge";

const STATUS_FILTERS: (ReviewStatus | "all")[] = ["all", "pending", "approved", "rejected"];

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<ReviewStatus | "all">("pending");
  const [rejecting, setRejecting] = useState<string | null>(null);

  useEffect(() => {
    fetchAdminReviews()
      .then(setReviews)
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === "all" ? reviews : reviews.filter((r) => r.status === filter);

  async function handleApprove(id: string) {
    const updated = await moderateReview(id, { status: "approved" });
    setReviews((prev) => prev.map((r) => (r._id === id ? updated : r)));
  }

  async function handleReject(id: string, reason: string) {
    const updated = await moderateReview(id, { status: "rejected", rejectionReason: reason });
    setReviews((prev) => prev.map((r) => (r._id === id ? updated : r)));
    setRejecting(null);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this review permanently?")) return;
    await deleteReview(id);
    setReviews((prev) => prev.filter((r) => r._id !== id));
  }

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-semibold">Reviews</h1>
        <Select
          value={filter}
          onChange={(e) => setFilter(e.target.value as ReviewStatus | "all")}
          className="w-44"
        >
          {STATUS_FILTERS.map((s) => (
            <option key={s} value={s}>
              {s === "all" ? "All statuses" : s.charAt(0).toUpperCase() + s.slice(1)}
            </option>
          ))}
        </Select>
      </div>
      <p className="text-xs text-muted mb-6">
        Reviews are only visible on the storefront once approved. Only customers with a delivered
        order for the product can submit one.
      </p>

      <div className="bg-surface border border-line rounded-lg divide-y divide-line">
        {loading ? (
          <p className="p-5 text-sm text-muted">Loading…</p>
        ) : filtered.length === 0 ? (
          <p className="p-5 text-sm text-muted">No reviews match this filter.</p>
        ) : (
          filtered.map((review) => {
            const product = typeof review.productId === "object" ? review.productId : null;
            const reviewer = typeof review.userId === "object" ? review.userId : null;
            return (
              <div key={review._id} className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    {product ? (
                      <Link
                        href={`/products/${product._id}`}
                        className="text-sm font-medium hover:underline"
                      >
                        {product.title}
                      </Link>
                    ) : (
                      <p className="text-sm font-medium">Product</p>
                    )}
                    <p className="text-xs text-muted mt-0.5">
                      {reviewer?.name || "Customer"} {reviewer?.email && `· ${reviewer.email}`} ·{" "}
                      {new Date(review.createdAt).toLocaleDateString()}
                    </p>
                    <div className="flex mt-1.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          size={13}
                          className={i < review.rating ? "fill-gold text-gold" : "fill-none text-line"}
                        />
                      ))}
                    </div>
                  </div>
                  <ReviewStatusBadge status={review.status} />
                </div>

                {review.title && <p className="text-sm font-medium mt-3">{review.title}</p>}
                <p className="text-sm text-ink-soft mt-1 leading-relaxed">{review.comment}</p>
                {review.status === "rejected" && review.rejectionReason && (
                  <p className="text-xs text-danger mt-2">Rejected: {review.rejectionReason}</p>
                )}

                {rejecting === review._id ? (
                  <RejectForm
                    onSubmit={(reason) => handleReject(review._id, reason)}
                    onCancel={() => setRejecting(null)}
                  />
                ) : (
                  <div className="flex gap-3 mt-3">
                    {review.status !== "approved" && (
                      <Button size="sm" onClick={() => handleApprove(review._id)}>
                        Approve
                      </Button>
                    )}
                    {review.status !== "rejected" && (
                      <Button size="sm" variant="outline" onClick={() => setRejecting(review._id)}>
                        Reject
                      </Button>
                    )}
                    <button
                      onClick={() => handleDelete(review._id)}
                      className="text-xs text-danger underline underline-offset-4 ml-auto self-center"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function RejectForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (reason: string) => void;
  onCancel: () => void;
}) {
  const [reason, setReason] = useState("");

  return (
    <div className="mt-3 flex items-center gap-2">
      <input
        autoFocus
        placeholder="Reason for rejecting (shown to the customer)"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        className="h-9 flex-1 rounded-lg border border-line bg-surface px-3 text-sm outline-none focus:border-accent-ink"
      />
      <Button size="sm" disabled={!reason.trim()} onClick={() => onSubmit(reason.trim())}>
        Confirm reject
      </Button>
      <Button size="sm" variant="ghost" onClick={onCancel}>
        Cancel
      </Button>
    </div>
  );
}
