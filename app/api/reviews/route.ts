import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createClient } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";
import { reviewSchema } from "@/lib/reviewSchema";
import { products } from "@/data/products";

export async function POST(request: NextRequest) {
  // 1. Read "Authorization: Bearer <token>"
  const authHeader =
    request.headers.get("authorization") || request.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = authHeader.replace(/^Bearer\s+/i, "").trim();
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError || !userData?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Parse JSON body then reviewSchema.safeParse
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid input", issues: ["Invalid JSON"] },
      { status: 400 }
    );
  }

  const parseResult = reviewSchema.safeParse(body);
  if (!parseResult.success) {
    return NextResponse.json(
      { error: "Invalid input", issues: parseResult.error.issues },
      { status: 400 }
    );
  }

  const { product_id, rating, comment } = parseResult.data;

  // 3. product_id not in data/products.ts -> 404
  const product = products.find((p) => p.id === product_id);
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  // 4. Insert with Supabase client created WITH user token (RLS applies)
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";

  const userSupabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });

  const { data: insertedData, error: insertError } = await userSupabase
    .from("reviews")
    .insert({
      product_id,
      rating,
      comment,
    })
    .select()
    .single();

  // 5. Error handling: 23505 -> 409, others -> 500
  if (insertError) {
    if (insertError.code === "23505") {
      return NextResponse.json(
        { error: "You already reviewed this product" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }

  if (!insertedData) {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }

  // 6. Success -> revalidatePath and 201 with created row
  revalidatePath(`/products/${product_id}`);
  return NextResponse.json(insertedData, { status: 201 });
}
