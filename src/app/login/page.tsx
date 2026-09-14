"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { Lock, Mail, ArrowRight, Sparkles, CheckCircle2, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setInfoMsg(null);

    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
        router.push("/");
        router.refresh();
      } else {
        const redirectUrl =
          typeof window !== "undefined"
            ? `${window.location.origin}/auth/callback`
            : process.env.NEXT_PUBLIC_SITE_URL
            ? `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`
            : undefined;

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: redirectUrl,
          },
        });

        if (error) throw error;

        // Nếu Supabase yêu cầu xác thực email (chưa có session tức thì)
        if (data.user && !data.session) {
          setInfoMsg(
            "Đăng ký thành công! Hệ thống đã gửi email xác nhận. Bạn vui lòng kiểm tra hộp thư đến (hoặc thư rác/spam) và nhấn vào liên kết kích hoạt để hoàn tất nhé."
          );
        } else {
          router.push("/");
          router.refresh();
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Đã có lỗi xảy ra. Bạn vui lòng thử lại sau ít phút.";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center py-6 px-4 animate-fadeIn">
      <div className="w-full max-w-md bg-[#101522] border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header thương hiệu */}
        <div className="text-center space-y-2 relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 via-orange-600 to-amber-500 flex items-center justify-center text-white mx-auto shadow-lg shadow-orange-500/25">
            <Sparkles className="w-6 h-6 fill-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight pt-1">
            {mode === "login" ? "Chào mừng trở lại" : "Tạo tài khoản mới"}
          </h1>
          <p className="text-xs text-neutral-400 max-w-xs mx-auto">
            {mode === "login"
              ? "Đăng nhập để đồng bộ lịch sử calo & chạy bộ của bạn trên đám mây"
              : "Bắt đầu theo dõi dinh dưỡng và chạy bộ chuẩn ACSM ngay hôm nay"}
          </p>
        </div>

        {/* Cảnh báo nếu chưa thiết lập Supabase */}
        {!isSupabaseConfigured() && (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 space-y-2">
            <div className="flex items-center gap-1.5 font-bold">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Chưa cấu hình Supabase Cloud</span>
            </div>
            <p className="text-[11px] leading-relaxed text-amber-300/90">
              Để kích hoạt đăng nhập và lưu dữ liệu đám mây, hãy cấu hình file <code className="bg-amber-950/60 px-1 py-0.5 rounded text-amber-200 font-mono">.env.local</code>.
            </p>
          </div>
        )}

        {/* Tab chuyển Đăng nhập / Đăng ký: Athletic Segmented Control */}
        <div className="flex p-1.5 bg-[#141b2b] border border-neutral-800 rounded-2xl">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setErrorMsg(null);
              setInfoMsg(null);
            }}
            className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
              mode === "login"
                ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/20"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            Đăng nhập
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("register");
              setErrorMsg(null);
              setInfoMsg(null);
            }}
            className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
              mode === "register"
                ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/20"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            Đăng ký
          </button>
        </div>

        {/* Thông báo lỗi / thành công */}
        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-xs text-red-300 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {infoMsg && (
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>{infoMsg}</span>
          </div>
        )}

        {/* Form đăng nhập / đăng ký */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-extrabold uppercase tracking-wider text-neutral-300">
              Email tài khoản
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                className="w-full pl-10 pr-4 py-3 rounded-2xl border border-neutral-800 bg-[#141b2b] text-white text-sm focus:outline-none focus:border-orange-500 transition placeholder:text-neutral-600"
              />
              <Mail className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-extrabold uppercase tracking-wider text-neutral-300">
              Mật khẩu
            </label>
            <div className="relative">
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Tối thiểu 6 ký tự"
                className="w-full pl-10 pr-4 py-3 rounded-2xl border border-neutral-800 bg-[#141b2b] text-white text-sm focus:outline-none focus:border-orange-500 transition placeholder:text-neutral-600"
              />
              <Lock className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-orange-500 via-orange-600 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-sm tracking-wide shadow-lg shadow-orange-500/20 active:scale-[0.99] transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <span>{loading ? "Đang xử lý..." : mode === "login" ? "Đăng nhập ngay" : "Tạo tài khoản miễn phí"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="text-center text-[11px] text-neutral-500 leading-relaxed pt-1">
          Dữ liệu được mã hóa an toàn và bảo vệ bởi chính sách Row Level Security (RLS) của Supabase.
        </p>
      </div>
    </div>
  );
}
