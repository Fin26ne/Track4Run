import Header from "@/components/Header";
import { products } from "@/data/products";
import ProductCard from "@/components/ProductCard";

type PageProps = {
  searchParams: Promise<{ q?: string; category?: string }>;
};

export default async function HomePage({ searchParams }: PageProps) {
  const params = (await searchParams) || {};
  const q = params.q || "";
  const category = params.category || "";

  const query = q.trim().toLowerCase();
  const cat = category.trim().toLowerCase();

  let filteredProducts = products;

  if (query) {
    filteredProducts = filteredProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query)
    );
  }

  if (cat) {
    filteredProducts = filteredProducts.filter(
      (p) => p.category.toLowerCase() === cat
    );
  }

  // Get distinct categories for dropdown
  const categories = Array.from(new Set(products.map((p) => p.category)));
  const selectedCategory = categories.find((c) => c.toLowerCase() === cat) || "";

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col w-full overflow-x-hidden">
      {/* Header navigation */}
      <Header />

      {/* Main product catalog */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Our Candle Collection</h2>
          <p className="text-sm text-gray-600 mt-1">
            Explore our artisanal, hand-poured soy wax candles.
          </p>
        </div>

        {/* Search and Filter Form */}
        <form
          method="get"
          action="/"
          className="mb-8 flex flex-col sm:flex-row gap-3 bg-white p-4 rounded-lg border border-gray-200 shadow-xs"
        >
          <div className="flex-1">
            <input
              type="text"
              name="q"
              defaultValue={q}
              data-testid="search-input"
              placeholder="Search candles by name or description..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>

          <div className="w-full sm:w-48">
            <select
              name="category"
              defaultValue={selectedCategory}
              data-testid="category-select"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white"
            >
              <option value="">All</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            data-testid="btn-search"
            className="px-4 py-2 bg-gray-900 text-white rounded-md text-sm font-medium hover:bg-gray-800 transition-colors cursor-pointer"
          >
            Search
          </button>
        </form>

        {/* Product Catalog or No Results */}
        {filteredProducts.length === 0 ? (
          <div
            data-testid="no-results"
            className="text-center py-12 bg-white rounded-lg border border-gray-200"
          >
            <p className="text-gray-500 text-sm">No products found matching your search.</p>
          </div>
        ) : (
          <div
            data-testid="product-list"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-6 text-center text-xs text-gray-500">
        <p>&copy; {new Date().getFullYear()} Lumière Candles. Hand-poured with love.</p>
      </footer>
    </div>
  );
}
