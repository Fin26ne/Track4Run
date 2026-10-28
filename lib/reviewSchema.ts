import { z } from "zod";

export const reviewSchema = z.object({
  product_id: z
    .number({ message: "Product ID is required" })
    .int()
    .positive(),
  rating: z
    .number({ message: "Rating is required" })
    .int("Rating must be an integer")
    .min(1, "Rating must be between 1 and 5")
    .max(5, "Rating must be between 1 and 5"),
  comment: z
    .string({ message: "Comment is required" })
    .trim()
    .min(1, "Comment is required")
    .max(500, "Comment cannot exceed 500 characters"),
});

export type ReviewInput = z.infer<typeof reviewSchema>;
export type ReviewFormData = ReviewInput;
