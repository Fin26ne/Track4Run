import Link from "next/link";
import { Product } from "@/data/products";
import FavoriteButton from "@/components/FavoriteButton";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <Card
      data-testid="product-card"
      className="flex flex-col h-full overflow-hidden border border-gray-200"
    >
      <div className="relative w-full overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.image}
          alt={product.name}
          data-testid="product-image"
          className="w-full aspect-square object-cover"
        />
        <div className="absolute top-2 right-2">
          <FavoriteButton productId={product.id} />
        </div>
      </div>

      <CardHeader className="p-4 pb-2">
        <CardTitle
          data-testid="product-name"
          className="text-lg font-semibold text-gray-900"
        >
          {product.name}
        </CardTitle>
      </CardHeader>

      <CardContent className="p-4 pt-0 flex-1">
        <CardDescription
          data-testid="product-description"
          className="text-sm text-gray-600"
        >
          {product.description}
        </CardDescription>
      </CardContent>

      <CardFooter className="p-4 pt-3 mt-auto flex items-center justify-between border-t border-gray-100 bg-gray-50/50">
        <span
          data-testid="product-price"
          className="text-base font-bold text-gray-900"
        >
          ${product.price.toFixed(2)}
        </span>
        <Link
          href={`/products/${product.id}`}
          data-testid="link-detail"
          className="text-sm font-medium text-gray-900 hover:underline"
        >
          View Details
        </Link>
      </CardFooter>
    </Card>
  );
}
