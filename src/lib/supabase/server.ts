import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Tạo client Supabase cho Server Components và Route Handlers.
 * Tương thích với Next.js 15 (cookies() là hàm bất đồng bộ).
 */
export async function createClient() {
  const cookieStore = await cookies();
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    "https://placeholder-project.supabase.co";
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder";

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Bỏ qua nếu được gọi từ Server Component (Server Components không thể trực tiếp ghi cookie)
        }
      },
    },
  });
}
