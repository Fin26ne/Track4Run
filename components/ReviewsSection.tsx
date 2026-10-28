"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useReviews } from "@/contexts/ReviewsContext";
import ReviewForm from "@/components/ReviewForm";
import type { Review } from "@/lib/reviews";

interface ReviewsSectionProps {
  productId: number;
  initialReviews?: Review[];
}

export default function ReviewsSection({ productId }: ReviewsSectionProps) {
  const { reviews, myReview, deleteReview } = useReviews();
  const { user, loading } = useAuth();
  const [editingId, setEditingId] = useState<number | string | null>(null);
  const [justSubmitted, setJustSubmitted] = useState(false);

  const count = reviews.length;
  const sum = reviews.reduce((acc, r) => acc + (Number(r.rating) || 0), 0);
  const average = count === 0 ? 0 : Math.round((sum / count) * 10) / 10;

  const handleDelete = async (id: number | string) => {
    try {
      await deleteReview(id);
      setJustSubmitted(false);
      if (editingId === id) {
        setEditingId(null);
      }
    } catch {
      // rollback handled in ReviewsContext
    }
  };

  const renderFormArea = () => {
    if (loading) {
      return null;
    }

    if (!user) {
      return (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-5 text-center my-6">
          <p className="text-sm text-gray-600 mb-2">Want to share your feedback?</p>
          <Link
            href="/login"
            data-testid="link-login-to-review"
            className="text-sm font-semibold text-gray-900 hover:underline inline-flex items-center gap-1"
          >
            Log in to write a review &rarr;
          </Link>
        </div>
      );
    }

    // Logged in with a review: no new-review form!
    if (myReview) {
      return null;
    }

    return (
      <div className="my-6">
        <ReviewForm
          productId={productId}
          onSuccess={() => setJustSubmitted(true)}
        />
      </div>
    );
  };

  return (
    <section className="bg-white border border-gray-200 rounded-lg p-6 sm:p-8 shadow-xs mt-8">
      {/* Reviews Summary Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Customer Reviews</h2>
          <div className="flex items-center gap-2 mt-1">
            <span
              data-testid="rating-average"
              className="text-2xl font-bold text-gray-900"
            >
              {average}
            </span>
            <span className="text-sm text-gray-500">/ 5</span>
            <span className="text-gray-300">•</span>
            <span
              data-testid="review-count"
              className="text-sm font-semibold text-gray-700"
            >
              {count}
            </span>
            <span className="text-sm text-gray-500">
              {count === 1 ? "review" : "reviews"}
            </span>
          </div>
        </div>
      </div>

      {/* Success Notification after Submitting */}
      {justSubmitted && (
        <div
          data-testid="review-success"
          className="rounded-md bg-green-50 p-4 text-sm text-green-700 border border-green-200 my-4 flex items-center justify-between"
        >
          <span>Review submitted successfully!</span>
          <button
            type="button"
            onClick={() => setJustSubmitted(false)}
            className="text-xs text-green-800 hover:underline font-semibold cursor-pointer"
          >
            &times; Close
          </button>
        </div>
      )}

      {/* Review Form Area (Conditional: only when logged in with no review) */}
      {renderFormArea()}

      {/* Reviews List */}
      <div className="mt-6 space-y-4">
        {reviews.length === 0 ? (
          <div
            data-testid="reviews-empty"
            className="text-center py-8 text-gray-500 text-sm bg-gray-50 rounded-lg border border-gray-100"
          >
            No reviews yet. Be the first to review this product!
          </div>
        ) : (
          reviews.map((review) => {
            const isOwn = Boolean(
              user &&
                user.id &&
                review.user_id &&
                String(user.id) === String(review.user_id)
            );

            return (
              <div
                key={review.id}
                data-testid="review-item"
                className="border-b border-gray-100 pb-4 last:border-b-0 space-y-2"
              >
                {editingId === review.id ? (
                  <ReviewForm
                    productId={productId}
                    initialData={review}
                    onSuccess={() => setEditingId(null)}
                    onCancel={() => setEditingId(null)}
                  />
                ) : (
                  <>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          data-testid="review-author"
                          className="font-semibold text-gray-900 text-sm"
                        >
                          {review.author || "Anonymous"}
                        </span>
                        {isOwn && (
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-medium">
                            You
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        <span className="text-xs text-gray-500">Rating:</span>
                        <span
                          data-testid="review-rating"
                          className="font-bold text-gray-900 text-sm"
                        >
                          {review.rating}
                        </span>
                      </div>
                    </div>

                    <p
                      data-testid="review-comment"
                      className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed"
                    >
                      {review.comment}
                    </p>

                    {isOwn && (
                      <div className="flex items-center gap-3 pt-1">
                        <button
                          type="button"
                          data-testid="btn-edit-review"
                          onClick={() => setEditingId(review.id)}
                          className="text-xs font-medium text-gray-600 hover:text-gray-900 cursor-pointer hover:underline"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          data-testid="btn-delete-review"
                          onClick={() => handleDelete(review.id)}
                          className="text-xs font-medium text-red-600 hover:text-red-700 cursor-pointer hover:underline"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
