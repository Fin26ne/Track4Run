import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Nếu chưa cấu hình Supabase, bỏ qua kiểm tra session để không chặn build hoặc dev cục bộ
  if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes("your-project")) {
    return supabaseResponse;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  // Quan trọng: getUser() xác thực token với server Supabase, bảo mật hơn getSession()
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const isAuthPage = pathname.startsWith("/login") || pathname.startsWith("/auth");
  const isApiRoute = pathname.startsWith("/api");
  const isStaticFile = pathname.includes(".");

  // Nếu chưa đăng nhập và cố vào trang riêng tư -> Redirect về /login
  if (!user && !isAuthPage && !isApiRoute && !isStaticFile) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Nếu đã đăng nhập mà lại vào /login -> Redirect về Dashboard
  if (user && isAuthPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
