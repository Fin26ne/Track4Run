"use client";

import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useFavorites } from "@/contexts/FavoritesContext";
import { cn } from "@/lib/utils";

interface FavoriteButtonProps {
  productId: number;
  className?: string;
}

export default function FavoriteButton({ productId, className }: FavoriteButtonProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();

  const fav = isFavorite(productId);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      router.push("/login");
      return;
    }

    toggleFavorite(productId);
  };

  return (
    <button
      type="button"
      data-testid="btn-favorite"
      aria-pressed={fav ? "true" : "false"}
      aria-label={fav ? "Remove from favorites" : "Add to favorites"}
      onClick={handleClick}
      className={cn(
        "p-2 rounded-full bg-white/90 backdrop-blur-xs hover:bg-white border border-gray-200 shadow-xs transition-colors cursor-pointer flex items-center justify-center",
        className
      )}
    >
      <Heart
        className={cn(
          "size-4 transition-colors",
          fav ? "fill-red-500 text-red-500" : "text-gray-400 hover:text-red-500"
        )}
      />
    </button>
  );
}
