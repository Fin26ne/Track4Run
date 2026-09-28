"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { products } from "@/data/products";
import ProductCard from "@/components/ProductCard";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "cn";

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function getSnapshot(): string | null {
  try {
    return localStorage.getItem("currentUser");
  } catch {
    return null;
  }
}

function getServerSnapshot(): string | null {
  return null;
}

export default function HomePage() {
  const storedUser = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  let currentUser: { name: string; email: string } | null = null;
  if (storedUser) {
    try {
      currentUser = JSON.parse(storedUser);
    } catch {
      currentUser = null;
    }
  }

  function handleLogout() {
    try {
      localStorage.removeItem("currentUser");
      window.dispatchEvent(new Event("storage"));
    } catch {
      // ignore
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col w-full overflow-x-hidden">
      {/* Header navigation */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-10 w-full">
        <div className="max-w-6xl mx-auto px-4 py-3 sm:py-4 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-bold text-gray-900 truncate">
              Lumière Candles
            </h1>
            <p className="hidden sm:block text-xs text-gray-500">
              Handcrafted botanical scented candles
            </p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {currentUser && (
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-medium text-gray-700 bg-gray-100 px-2 py-1 rounded">
                  Hi, {currentUser.name}
                </span>
                <button
                  type="button"
                  onClick={handleLogout}
                  className={cn(
                    buttonVariants({ variant: "ghost", size: "sm" }),
                    "sm:h-8 text-xs cursor-pointer text-gray-600 hover:text-red-600"
                  )}
                >
                  Logout
                </button>
              </div>
            )}
            <Link
              href="/login"
              data-testid="btn-login"
              className={cn(buttonVariants({ variant: "outline", size: "sm" }), "sm:h-8 cursor-pointer")}
            >
              Login
            </Link>
            <Link
              href="/register"
              data-testid="btn-register"
              className={cn(buttonVariants({ variant: "default", size: "sm" }), "sm:h-8 cursor-pointer")}
            >
              Register
            </Link>
          </div>
        </div>
      </header>

      {/* Main product catalog */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Our Candle Collection</h2>
          <p className="text-sm text-gray-600 mt-1">
            Explore our artisanal, hand-poured soy wax candles.
          </p>
        </div>

        {/* Product grid container */}
        <div
          data-testid="product-list"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-6 text-center text-xs text-gray-500">
        <p>&copy; {new Date().getFullYear()} Lumière Candles. Hand-poured with love.</p>
      </footer>
    </div>
  );
}
