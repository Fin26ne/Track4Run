import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { products } from "@/data/products";
import Header from "@/components/Header";
import FavoriteButton from "@/components/FavoriteButton";

export const dynamicParams = false;

type Props = {
  params: Promise<{ id: string }>;
};

export function generateStaticParams() {
  return products.map((product) => ({
    id: product.id.toString(),
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const productId = Number(id);

  if (isNaN(productId) || !Number.isInteger(productId)) {
    notFound();
  }

  const product = products.find((p) => p.id === productId);
  if (!product) {
    notFound();
  }

  return {
    title: `${product.name} | Lumière Candles`,
    description: product.description,
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { id } = await params;
  const productId = Number(id);

  if (isNaN(productId) || !Number.isInteger(productId)) {
    notFound();
  }

  const product = products.find((p) => p.id === productId);
  if (!product) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8">
        <div data-testid="product-detail" className="flex flex-col gap-6">
          <div>
            <Link
              href="/"
              data-testid="link-back"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 inline-flex items-center gap-1"
            >
              &larr; Back to Products
            </Link>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6 sm:p-8 shadow-xs grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <div className="w-full aspect-square overflow-hidden rounded-md border border-gray-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex flex-col h-full justify-between">
              <div>
                <div className="flex items-center justify-between gap-4 mb-3">
                  <span
                    data-testid="detail-category"
                    className="text-xs font-semibold uppercase tracking-wider text-gray-500 bg-gray-100 px-2.5 py-1 rounded"
                  >
                    {product.category}
                  </span>
                  <FavoriteButton productId={product.id} />
                </div>

                <h1
                  data-testid="detail-name"
                  className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3"
                >
                  {product.name}
                </h1>

                <p
                  data-testid="detail-price"
                  className="text-xl sm:text-2xl font-bold text-gray-900 mb-4"
                >
                  ${product.price.toFixed(2)}
                </p>

                <p
                  data-testid="detail-description"
                  className="text-gray-600 text-sm sm:text-base leading-relaxed"
                >
                  {product.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
