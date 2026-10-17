"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useFavorites } from "@/contexts/FavoritesContext";
import { products } from "@/data/products";
import Header from "@/components/Header";
import FavoriteButton from "@/components/FavoriteButton";

export default function FavoritesPage() {
  const { user, loading } = useAuth();
  const { favorites } = useFavorites();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  if (loading || !user) {
    return null;
  }

  const favoriteProducts = products.filter((p) => favorites.includes(p.id));

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <main
        data-testid="favorites-page"
        className="flex-1 max-w-4xl w-full mx-auto px-4 py-8"
      >
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Your Favorites</h1>
            <p className="text-sm text-gray-600 mt-1">
              Products you have marked as your favorite.
            </p>
          </div>
          <Link
            href="/"
            className="text-sm text-gray-600 hover:text-gray-900 font-medium inline-flex items-center gap-1"
          >
            &larr; Back to Products
          </Link>
        </div>

        {favoriteProducts.length === 0 ? (
          <div
            data-testid="favorites-empty"
            className="bg-white border border-gray-200 rounded-lg p-8 text-center shadow-xs"
          >
            <p className="text-gray-500 text-sm mb-4">You have no favorite products yet.</p>
            <Link
              href="/"
              className="inline-block px-4 py-2 bg-gray-900 text-white rounded text-sm font-medium hover:bg-gray-800 transition-colors"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {favoriteProducts.map((product) => (
              <div
                key={product.id}
                data-testid="favorite-item"
                className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between gap-4 shadow-xs"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-16 h-16 object-cover rounded shrink-0 border border-gray-100"
                  />
                  <div className="min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {product.name}
                    </h3>
                    <p className="text-sm font-bold text-gray-900">
                      ${product.price.toFixed(2)}
                    </p>
                    <Link
                      href={`/products/${product.id}`}
                      className="text-xs text-blue-600 hover:underline mt-1 inline-block"
                    >
                      View Details
                    </Link>
                  </div>
                </div>

                <div className="shrink-0">
                  <FavoriteButton productId={product.id} />
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
