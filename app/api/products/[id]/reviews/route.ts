import { NextRequest, NextResponse } from "next/server";
import { products } from "@/data/products";
import { getProductReviews } from "@/lib/reviews";

type RouteProps = {
  params: Promise<{ id: string }>;
};

export async function GET(
  _request: NextRequest,
  { params }: RouteProps
) {
  const { id } = await params;
  const productId = Number(id);

  if (isNaN(productId) || !Number.isInteger(productId)) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  const product = products.find((p) => p.id === productId);
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  const result = await getProductReviews(productId);
  return NextResponse.json(result, { status: 200 });
}
