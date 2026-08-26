"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Star } from "lucide-react";
import { fetchProductReviews, checkReviewEligibility, submitReview } from "@/lib/api-reviews";
import { Review, ReviewEligibility } from "@/types";
import { Button } from "@/components/ui/button";
import { Textarea, Input, Label } from "@/components/ui/input";
import { useAuthStore } from "@/store/auth-store";
import { ApiError } from "@/lib/api";
import { cn } from "@/lib/utils";

function StarRow({ value, size = 14 }: { value: number; size?: number }) {
  return (
    <div className="flex">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={size}
          className={i < Math.round(value) ? "fill-gold text-gold" : "fill-none text-line"}
        />
      ))}
    </div>
  );
}

export function ProductReviews({
  productId,
  ratingsAvg,
  ratingsCount,
}: {
  productId: string;
  ratingsAvg: number;
  ratingsCount: number;
}) {
  const user = useAuthStore((s) => s.user);
  const isHydrating = useAuthStore((s) => s.isHydrating);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [eligibility, setEligibility] = useState<ReviewEligibility | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [submitted, setSubmitted] = useState<Review | null>(null);

  useEffect(() => {
    fetchProductReviews(productId)
      .then(setReviews)
      .finally(() => setLoading(false));
  }, [productId]);

  useEffect(() => {
    if (isHydrating || !user) return;
    let cancelled = false;
    checkReviewEligibility(productId)
      .catch(() => null)
      .then((result) => {
        if (!cancelled) setEligibility(result);
      });
    return () => {
      cancelled = true;
    };
  }, [productId, user, isHydrating]);

  return (
    <section className="mt-14 border-t border-line pt-8">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="font-display text-2xl">Reviews</h2>
          {ratingsCount > 0 ? (
            <div className="flex items-center gap-2 mt-1.5">
              <StarRow value={ratingsAvg} />
              <span className="text-sm text-muted">
                {ratingsAvg.toFixed(1)} · {ratingsCount} review{ratingsCount !== 1 ? "s" : ""}
              </span>
            </div>
          ) : (
            <p className="text-sm text-muted mt-1.5">No reviews yet</p>
          )}
        </div>

        <ReviewCta
          user={user}
          isHydrating={isHydrating}
          eligibility={user ? eligibility : null}
          submitted={submitted}
          onWriteReview={() => setShowForm(true)}
        />
      </div>

      {showForm && eligibility?.canReview && (
        <ReviewForm
          productId={productId}
          orderId={eligibility.orderId}
          onDone={(review) => {
            setSubmitted(review);
            setShowForm(false);
          }}
          onCancel={() => setShowForm(false)}
        />
      )}

      {loading ? (
        <p className="text-sm text-muted">Loading reviews…</p>
      ) : reviews.length === 0 ? (
        <p className="text-sm text-muted">Be the first to review this product.</p>
      ) : (
        <ul className="space-y-6 max-w-2xl">
          {reviews.map((review) => {
            const reviewer = typeof review.userId === "object" ? review.userId.name : "Customer";
            return (
              <li key={review._id} className="border-b border-line pb-6 last:border-0">
                <div className="flex items-center justify-between">
                  <StarRow value={review.rating} />
                  <span className="text-xs text-muted">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {review.title && <p className="font-medium text-sm mt-2">{review.title}</p>}
                <p className="text-sm text-ink-soft mt-1 leading-relaxed">{review.comment}</p>
                <p className="text-xs text-muted mt-2">{reviewer}</p>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

function ReviewCta({
  user,
  isHydrating,
  eligibility,
  submitted,
  onWriteReview,
}: {
  user: unknown;
  isHydrating: boolean;
  eligibility: ReviewEligibility | null;
  submitted: Review | null;
  onWriteReview: () => void;
}) {
  if (isHydrating) return null;

  if (submitted) {
    return <p className="text-sm text-muted">Thanks — your review is awaiting approval.</p>;
  }

  if (!user) {
    return (
      <Link href="/login" className="text-sm text-accent-ink underline underline-offset-4">
        Log in to write a review
      </Link>
    );
  }

  if (!eligibility) return null;

  if (eligibility.canReview) {
    return (
      <Button size="sm" variant="outline" onClick={onWriteReview}>
        Write a review
      </Button>
    );
  }

  if (eligibility.reason === "already_reviewed") {
    return (
      <p className="text-sm text-muted">
        {eligibility.status === "pending"
          ? "Your review is awaiting approval."
          : eligibility.status === "rejected"
            ? "Your review wasn't approved for publishing."
            : "You've already reviewed this product."}
      </p>
    );
  }

  return <p className="text-sm text-muted">Only customers with a delivered order can review.</p>;
}

function ReviewForm({
  productId,
  orderId,
  onDone,
  onCancel,
}: {
  productId: string;
  orderId: string;
  onDone: (review: Review) => void;
  onCancel: () => void;
}) {
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const review = await submitReview({ productId, orderId, rating, title, comment });
      onDone(review);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not submit your review");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl bg-surface card-shadow p-5 mb-8 max-w-2xl space-y-4">
      <div>
        <Label>Your rating</Label>
        <div className="flex gap-1">
          {Array.from({ length: 5 }).map((_, i) => {
            const value = i + 1;
            return (
              <button
                key={value}
                type="button"
                onClick={() => setRating(value)}
                aria-label={`${value} star${value !== 1 ? "s" : ""}`}
              >
                <Star
                  size={22}
                  className={cn(value <= rating ? "fill-gold text-gold" : "fill-none text-line")}
                />
              </button>
            );
          })}
        </div>
      </div>
      <div>
        <Label htmlFor="review-title">Title (optional)</Label>
        <Input id="review-title" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} />
      </div>
      <div>
        <Label htmlFor="review-comment">Your review</Label>
        <Textarea
          id="review-comment"
          required
          minLength={3}
          maxLength={2000}
          rows={4}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
      </div>
      {error && <p className="text-sm text-danger">{error}</p>}
      <div className="flex gap-3">
        <Button type="submit" size="sm" disabled={submitting}>
          {submitting ? "Submitting…" : "Submit review"}
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
