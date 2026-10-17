import Link from "next/link";
import Header from "@/components/Header";

export default function NotFound() {
  return (
    <div
      data-testid="not-found"
      className="min-h-screen bg-gray-50 flex flex-col"
    >
      <Header />
      <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">404</h1>
        <h2 className="text-lg font-semibold text-gray-700 mb-4">
          Product Not Found
        </h2>
        <p className="text-sm text-gray-500 mb-6 max-w-sm">
          The product you are looking for does not exist or may have been removed.
        </p>
        <Link
          href="/"
          className="px-4 py-2 bg-gray-900 text-white rounded text-sm font-medium hover:bg-gray-800 transition-colors"
        >
          &larr; Back to Products
        </Link>
      </div>
    </div>
  );
}
