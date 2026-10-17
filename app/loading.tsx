export default function Loading() {
  return (
    <div
      data-testid="loading"
      className="min-h-screen flex items-center justify-center bg-gray-50"
    >
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
    </div>
  );
}
