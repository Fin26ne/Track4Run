import { createBrowserClient } from "@supabase/ssr";

/**
 * Kiểm tra xem người dùng đã cấu hình URL và Key Supabase thật hay chưa.
 */
export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return Boolean(
    url &&
      key &&
      !url.includes("your-project") &&
      !url.includes("placeholder-project")
  );
}

/**
 * Tạo client Supabase cho các Client Components (trình duyệt).
 * Cung cấp fallback an toàn để tránh crash lúc prerender build khi chưa nạp env.
 */
export function createClient() {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    "https://placeholder-project.supabase.co";
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder";

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

