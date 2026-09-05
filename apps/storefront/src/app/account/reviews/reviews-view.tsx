"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Star } from "lucide-react";
import { fetchMyReviews } from "@/lib/api-reviews";
import { Review } from "@/types";

const STATUS_LABEL: Record<Review["status"], string> = {
  pending: "Awaiting approval",
  approved: "Published",
  rejected: "Not approved",
};

const STATUS_CLASS: Record<Review["status"], string> = {
  pending: "text-muted",
  approved: "text-accent-ink",
  rejected: "text-danger",
};

export default function MyReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyReviews()
      .then(setReviews)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-sm text-muted">Loading…</p>;

  if (reviews.length === 0) {
    return <p className="text-sm text-muted">You haven&apos;t written any reviews yet.</p>;
  }

  return (
    <div className="rounded-2xl bg-surface card-shadow divide-y divide-line overflow-hidden">
      {reviews.map((review) => {
        const product = typeof review.productId === "object" ? review.productId : null;
        return (
          <div key={review._id} className="p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                {product ? (
                  <Link
                    href={`/product/${product.slug}`}
                    className="font-body text-sm hover:text-accent-ink"
                  >
                    {product.title}
                  </Link>
                ) : (
                  <p className="font-body text-sm">Product</p>
                )}
                <div className="flex mt-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={13}
                      className={i < review.rating ? "fill-gold text-gold" : "fill-none text-line"}
                    />
                  ))}
                </div>
              </div>
              <span className={`text-xs shrink-0 ${STATUS_CLASS[review.status]}`}>
                {STATUS_LABEL[review.status]}
              </span>
            </div>
            {review.title && <p className="text-sm font-medium mt-2">{review.title}</p>}
            <p className="text-sm text-ink-soft mt-1 leading-relaxed">{review.comment}</p>
            {review.status === "rejected" && review.rejectionReason && (
              <p className="text-xs text-muted mt-2">Reason: {review.rejectionReason}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
