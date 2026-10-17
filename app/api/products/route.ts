import { NextRequest, NextResponse } from "next/server";
import { products } from "@/data/products";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const q = searchParams.get("q")?.toLowerCase();
  const category = searchParams.get("category")?.toLowerCase();

  let filtered = products;

  if (q) {
    filtered = filtered.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
    );
  }

  if (category) {
    filtered = filtered.filter(
      (p) => p.category.toLowerCase() === category
    );
  }

  return NextResponse.json(filtered);
}
