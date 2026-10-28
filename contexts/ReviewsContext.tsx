"use client";

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/contexts/AuthContext";
import type { Review } from "@/lib/reviews";

type Action =
  | { type: "SET"; payload: Review[] }
  | { type: "ADD"; payload: Review }
  | { type: "UPDATE"; payload: Review }
  | { type: "REMOVE"; payload: number | string };

function reviewsReducer(state: Review[], action: Action): Review[] {
  switch (action.type) {
    case "SET":
      return action.payload;
    case "ADD":
      return [
        action.payload,
        ...state.filter((r) => String(r.id) !== String(action.payload.id)),
      ];
    case "UPDATE":
      return state.map((r) =>
        String(r.id) === String(action.payload.id) ? action.payload : r
      );
    case "REMOVE":
      return state.filter((r) => String(r.id) !== String(action.payload));
    default:
      return state;
  }
}

interface ReviewsContextType {
  reviews: Review[];
  myReview: Review | null;
  submitReview: (rating: number, comment: string) => Promise<Review>;
  updateReview: (
    rating: number,
    comment: string,
    reviewId?: number | string
  ) => Promise<Review>;
  deleteReview: (reviewId?: number | string) => Promise<void>;
}

const ReviewsContext = createContext<ReviewsContextType | undefined>(undefined);

interface ReviewsProviderProps {
  productId: number;
  initialReviews: Review[];
  children: ReactNode;
}

export function ReviewsProvider({
  productId,
  initialReviews,
  children,
}: ReviewsProviderProps) {
  const [reviews, dispatch] = useReducer(reviewsReducer, initialReviews);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    dispatch({ type: "SET", payload: initialReviews });
  }, [initialReviews]);

  const myReview =
    user && user.id
      ? reviews.find((r) => r.user_id === user.id) || null
      : null;

  const submitReview = async (rating: number, comment: string): Promise<Review> => {
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;
    if (!token) {
      throw new Error("You must be logged in to submit a review");
    }

    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        product_id: productId,
        rating,
        comment,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Failed to submit review");
    }

    dispatch({ type: "ADD", payload: data });
    router.refresh();
    return data;
  };

  const updateReview = async (
    rating: number,
    comment: string,
    reviewId?: number | string
  ): Promise<Review> => {
    const targetId = reviewId ?? myReview?.id;
    if (!targetId) {
      throw new Error("No review to update");
    }

    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;

    const client = token
      ? createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co",
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key",
          {
            global: {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          }
        )
      : supabase;

    const { data, error } = await client
      .from("reviews")
      .update({ rating, comment })
      .eq("id", targetId)
      .select()
      .single();

    if (error) {
      throw new Error(error.message || "Failed to update review");
    }

    const updatedReview: Review = data || {
      ...myReview!,
      id: targetId,
      rating,
      comment,
    };

    dispatch({ type: "UPDATE", payload: updatedReview });
    router.refresh();
    return updatedReview;
  };

  const deleteReview = async (reviewId?: number | string): Promise<void> => {
    const target =
      reviewId != null
        ? reviews.find((r) => String(r.id) === String(reviewId))
        : myReview;

    if (!target) return;

    // Optimistically remove
    dispatch({ type: "REMOVE", payload: target.id });

    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;

    const client = token
      ? createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co",
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key",
          {
            global: {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          }
        )
      : supabase;

    const { error } = await client
      .from("reviews")
      .delete()
      .eq("id", target.id);

    if (error) {
      // Rollback
      dispatch({ type: "ADD", payload: target });
      throw new Error(error.message || "Failed to delete review");
    }

    router.refresh();
  };

  return (
    <ReviewsContext.Provider
      value={{
        reviews,
        myReview,
        submitReview,
        updateReview,
        deleteReview,
      }}
    >
      {children}
    </ReviewsContext.Provider>
  );
}

export function useReviews() {
  const context = useContext(ReviewsContext);
  if (!context) {
    throw new Error("useReviews must be used within a ReviewsProvider");
  }
  return context;
}
