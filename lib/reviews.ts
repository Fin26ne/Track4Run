import { supabase } from "@/lib/supabaseClient";

export interface Review {
  id: number | string;
  product_id: number;
  rating: number;
  comment: string;
  author?: string | null;
  user_id?: string | null;
  created_at: string;
}

export interface ReviewsResponse {
  average: number;
  count: number;
  reviews: Review[];
}

export async function getProductReviews(productId: number): Promise<ReviewsResponse> {
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("product_id", productId)
    .order("created_at", { ascending: false });

  if (error || !data) {
    return { average: 0, count: 0, reviews: [] };
  }

  const reviews: Review[] = data;
  const count = reviews.length;
  const sum = reviews.reduce((acc, r) => acc + (Number(r.rating) || 0), 0);
  const average = count === 0 ? 0 : Math.round((sum / count) * 10) / 10;

  return {
    average,
    count,
    reviews,
  };
}

export const getReviews = getProductReviews;
export const getReviewsByProductId = getProductReviews;
