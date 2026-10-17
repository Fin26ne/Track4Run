"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div
      data-testid="error-boundary"
      className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50 text-center"
    >
      <h2 className="text-xl font-bold text-gray-900 mb-2">Something went wrong!</h2>
      <p className="text-sm text-gray-600 mb-4">
        {error.message || "An unexpected error occurred."}
      </p>
      <button
        type="button"
        data-testid="btn-retry"
        onClick={() => reset()}
        className="px-4 py-2 bg-gray-900 text-white rounded text-sm font-medium hover:bg-gray-800 transition-colors cursor-pointer"
      >
        Try again
      </button>
    </div>
  );
}
