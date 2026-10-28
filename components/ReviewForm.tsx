"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { reviewSchema, type ReviewInput } from "@/lib/reviewSchema";
import { useReviews } from "@/contexts/ReviewsContext";
import type { Review } from "@/lib/reviews";

interface ReviewFormProps {
  productId: number;
  initialData?: Review;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function ReviewForm({
  productId,
  initialData,
  onSuccess,
  onCancel,
}: ReviewFormProps) {
  const { submitReview, updateReview } = useReviews();
  const [serverError, setServerError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ReviewInput>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      product_id: productId,
      rating: initialData?.rating ?? ("" as unknown as number),
      comment: initialData?.comment ?? "",
    },
  });

  const onSubmit = async (data: ReviewInput) => {
    setServerError("");
    setSuccessMessage("");
    try {
      if (initialData) {
        await updateReview(data.rating, data.comment, initialData.id);
      } else {
        await submitReview(data.rating, data.comment);
        setSuccessMessage("Review submitted successfully!");
        reset({
          product_id: productId,
          rating: "" as unknown as number,
          comment: "",
        });
      }
      onSuccess?.();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      setServerError(msg);
    }
  };

  return (
    <form
      data-testid="review-form"
      noValidate
      onSubmit={handleSubmit(onSubmit)}
      className="bg-white border border-gray-200 rounded-lg p-5 space-y-4 shadow-xs"
    >
      <input
        type="hidden"
        {...register("product_id", { valueAsNumber: true })}
        value={productId}
      />

      <h3 className="font-semibold text-gray-900 text-base">
        {initialData ? "Edit Your Review" : "Write a Review"}
      </h3>

      {serverError && (
        <div
          data-testid="error-review"
          className="rounded-md bg-red-50 p-3 text-sm text-red-700 border border-red-200"
        >
          {serverError}
        </div>
      )}

      {successMessage && (
        <div
          data-testid="review-success"
          className="rounded-md bg-green-50 p-3 text-sm text-green-700 border border-green-200"
        >
          {successMessage}
        </div>
      )}

      <div className="space-y-1.5">
        <label
          htmlFor="rating"
          className="block text-xs font-semibold text-gray-700"
        >
          Rating
        </label>
        <select
          id="rating"
          data-testid="input-rating"
          {...register("rating", { valueAsNumber: true })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white"
        >
          <option value="">Select rating</option>
          <option value="5">5</option>
          <option value="4">4</option>
          <option value="3">3</option>
          <option value="2">2</option>
          <option value="1">1</option>
        </select>
        {errors.rating && (
          <p data-testid="error-rating" className="text-xs text-red-600">
            {errors.rating.message}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="comment"
          className="block text-xs font-semibold text-gray-700"
        >
          Comment
        </label>
        <textarea
          id="comment"
          data-testid="input-comment"
          rows={3}
          placeholder="What did you think of this product?"
          {...register("comment")}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none"
        />
        {errors.comment && (
          <p data-testid="error-comment" className="text-xs text-red-600">
            {errors.comment.message}
          </p>
        )}
      </div>

      <div className="flex items-center gap-2 pt-1">
        <button
          type="submit"
          data-testid="btn-submit-review"
          disabled={isSubmitting}
          className="px-4 py-2 bg-gray-900 text-white rounded-md text-sm font-medium hover:bg-gray-800 disabled:opacity-50 transition-colors cursor-pointer"
        >
          {isSubmitting
            ? "Submitting..."
            : initialData
            ? "Update Review"
            : "Submit Review"}
        </button>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
