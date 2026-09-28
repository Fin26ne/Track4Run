import Link from "next/link";
import { products } from "@/data/products";
import ProductCard from "@/components/ProductCard";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "cn";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header navigation */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Lumière Candles</h1>
            <p className="text-xs text-gray-500">Handcrafted botanical scented candles</p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              data-testid="btn-login"
              className={cn(buttonVariants({ variant: "outline" }), "cursor-pointer")}
            >
              Login
            </Link>
            <Link
              href="/register"
              data-testid="btn-register"
              className={cn(buttonVariants({ variant: "default" }), "cursor-pointer")}
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
