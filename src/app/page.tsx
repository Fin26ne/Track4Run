"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import StreakBadge from "@/components/StreakBadge";
import { createClient } from "@/lib/supabase/client";
import { DaySummary, FoodLog, Goal, RunLog } from "@/lib/types";
import { buildDaySummaries, calculateStreak } from "@/lib/streak";
import { Utensils, Flame, PlusCircle, LogOut, Sparkles, User, Activity, Clock, Navigation, Target } from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [streak, setStreak] = useState<number>(0);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [todaySummary, setTodaySummary] = useState<DaySummary | null>(null);

  // Lấy ngày hôm nay dạng YYYY-MM-DD theo giờ địa phương
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

  useEffect(() => {
    async function fetchDashboardData() {
      setLoading(true);
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          router.push("/login");
          return;
        }

        setUserEmail(user.email || "Vận động viên");

        // Tải food_logs, run_logs và goals
        const [foodRes, runRes, goalsRes] = await Promise.all([
          supabase
            .from("food_logs")
            .select("*")
            .eq("user_id", user.id)
            .order("log_date", { ascending: false }),
          supabase
            .from("run_logs")
            .select("*")
            .eq("user_id", user.id)
            .order("log_date", { ascending: false }),
          supabase.from("goals").select("*").eq("user_id", user.id),
        ]);

        const fLogs = (foodRes.data as FoodLog[]) || [];
        const rLogs = (runRes.data as RunLog[]) || [];
        const gList = (goalsRes.data as Goal[]) || [];

        setGoals(gList);

        // Xây dựng DaySummaries để tính Streak & thông số hôm nay
        const summaries = buildDaySummaries(fLogs, rLogs, gList, 60);
        const currentStreak = calculateStreak(summaries);
        setStreak(currentStreak);

        const todayData = summaries.find((s) => s.date === todayStr) || null;
        setTodaySummary(todayData);
      } catch (err) {
        console.error("Lỗi nạp dashboard:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, [supabase, router, todayStr]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  // Mục tiêu ngày
  const activeIntakeGoal = goals.find(
    (g) => g.goal_type === "daily_intake_max" && g.is_active
  );
  const activeBurnGoal = goals.find(
    (g) => g.goal_type === "daily_burn_min" && g.is_active
  );

  const totalIntake = todaySummary ? todaySummary.totalIntake : 0;
  const totalBurn = todaySummary ? todaySummary.totalBurn : 0;
  const netCalories = totalIntake - totalBurn;

  return (
    <div className="space-y-6 pb-8 animate-fadeIn">
      {/* Top Header & User Action */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-500/20 to-amber-500/20 border border-orange-500/30 flex items-center justify-center text-orange-400 font-bold shadow-inner">
            <User className="w-5 h-5" />
          </div>
          <div className="leading-tight">
            <span className="text-[11px] font-semibold text-neutral-400 block uppercase tracking-wider">
              Vận động viên
            </span>
            <span className="text-sm font-black text-white truncate max-w-[160px] sm:max-w-[260px] block">
              {userEmail}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <StreakBadge streak={streak} />
          <button
            type="button"
            onClick={handleLogout}
            className="p-2 rounded-2xl bg-[#141b2b] border border-neutral-800 hover:border-red-500/40 text-neutral-400 hover:text-red-400 transition cursor-pointer shadow-sm"
            title="Đăng xuất"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-16 text-center text-sm text-neutral-400 bg-[#101522] border border-[#1e2638] rounded-3xl space-y-4">
          <div className="flex items-center justify-center gap-1.5 h-8">
            <span className="w-1.5 bg-orange-500 rounded-full animate-wave-1" />
            <span className="w-1.5 bg-amber-400 rounded-full animate-wave-2" />
            <span className="w-1.5 bg-emerald-400 rounded-full animate-wave-3" />
            <span className="w-1.5 bg-orange-400 rounded-full animate-wave-4" />
          </div>
          <p className="font-bold text-white">Đang đồng bộ dữ liệu hôm nay...</p>
          <div className="w-40 h-1 bg-[#141b2b] rounded-full mx-auto overflow-hidden relative">
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-orange-500 to-transparent animate-shimmer-beam" />
          </div>
        </div>
      ) : (
        <>
          {/* Card Tổng Calo Hôm nay: Hero Activity Card */}
          <div className="bg-[#101522] border border-neutral-800 text-white rounded-2xl sm:rounded-3xl p-4 sm:p-7 shadow-2xl relative overflow-hidden space-y-4 sm:space-y-6">
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-orange-500/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex items-center justify-between relative z-10 gap-2">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                  <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-orange-400">
                    Net Calo Hôm Nay
                  </span>
                  <span
                    className={`text-[9px] sm:text-[10px] font-black px-1.5 sm:px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      netCalories <= 0
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                    }`}
                  >
                    {netCalories <= 0 ? "Thâm hụt" : "Thặng dư"}
                  </span>
                </div>

                <div className="flex items-baseline gap-1.5 sm:gap-2 mt-1 sm:mt-2">
                  <span className="text-4xl sm:text-6xl font-black tracking-tight text-white font-mono">
                    {netCalories > 0 ? `+${netCalories.toLocaleString()}` : netCalories.toLocaleString()}
                  </span>
                  <span className="text-base sm:text-xl font-black text-neutral-400">
                    kcal
                  </span>
                </div>
              </div>

              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-orange-500/20 to-amber-500/20 border border-orange-500/30 text-orange-400 flex items-center justify-center shadow-inner shrink-0">
                <Flame className="w-6 h-6 sm:w-9 sm:h-9 fill-orange-500 text-orange-500" />
              </div>
            </div>

            {/* Phân rã Nạp vs Tiêu */}
            <div className="grid grid-cols-2 gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-neutral-800/80 relative z-10">
              <div className="p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl bg-[#141b2b] border border-neutral-800">
                <span className="text-[11px] sm:text-xs text-neutral-400 block font-medium flex items-center gap-1.5 truncate">
                  <Utensils className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  Nạp vào:
                </span>
                <span className="text-lg sm:text-xl font-black text-white font-mono mt-0.5 sm:mt-1 block">
                  {totalIntake.toLocaleString()}{" "}
                  <span className="text-[10px] sm:text-xs font-bold text-neutral-400 font-sans">kcal</span>
                </span>
              </div>

              <div className="p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl bg-[#141b2b] border border-neutral-800">
                <span className="text-[11px] sm:text-xs text-neutral-400 block font-medium flex items-center gap-1.5 truncate">
                  <Flame className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                  Chạy bộ:
                </span>
                <span className="text-lg sm:text-xl font-black text-white font-mono mt-0.5 sm:mt-1 block">
                  {totalBurn.toLocaleString()}{" "}
                  <span className="text-[10px] sm:text-xs font-bold text-neutral-400 font-sans">kcal</span>
                </span>
              </div>
            </div>
          </div>

          {/* Tiến độ Mục tiêu ngày nếu có cài đặt */}
          {(activeIntakeGoal || activeBurnGoal) && (
            <div className="bg-[#101522] border border-neutral-800/90 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl space-y-3 sm:space-y-4">
              <h3 className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-neutral-400 flex items-center gap-2">
                <Target className="w-4 h-4 text-orange-500" />
                Tiến độ mục tiêu ngày
              </h3>

              {activeIntakeGoal && (
                <div className="space-y-1.5 sm:space-y-2 p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-[#141b2b] border border-neutral-800">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-neutral-300">
                      Trần calo nạp (Tối đa)
                    </span>
                    <span className="font-mono font-black text-white">
                      {totalIntake} / {activeIntakeGoal.target_value} kcal
                    </span>
                  </div>
                  <div className="w-full h-2.5 sm:h-3 rounded-full bg-neutral-900 border border-neutral-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        totalIntake <= Number(activeIntakeGoal.target_value)
                          ? "bg-gradient-to-r from-emerald-500 to-teal-400"
                          : "bg-gradient-to-r from-rose-500 to-red-600"
                      }`}
                      style={{
                        width: `${Math.min(
                          100,
                          (totalIntake / Number(activeIntakeGoal.target_value)) * 100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              )}

              {activeBurnGoal && (
                <div className="space-y-1.5 sm:space-y-2 p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-[#141b2b] border border-neutral-800">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-neutral-300">
                      Sàn calo đốt chạy bộ (Tối thiểu)
                    </span>
                    <span className="font-mono font-black text-white">
                      {totalBurn} / {activeBurnGoal.target_value} kcal
                    </span>
                  </div>
                  <div className="w-full h-2.5 sm:h-3 rounded-full bg-neutral-900 border border-neutral-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(
                          100,
                          (totalBurn / Number(activeBurnGoal.target_value)) * 100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 2 Nút lớn hành động nhanh: Modern Athletic Action Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <Link
              href="/log/food"
              className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-[#101522] border border-neutral-800 hover:border-emerald-500/50 shadow-xl transition-all flex items-center gap-3.5 sm:gap-4 group cursor-pointer"
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition shadow-inner">
                <Utensils className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <div className="min-w-0">
                <span className="font-black text-sm sm:text-base text-white block group-hover:text-emerald-400 transition truncate">
                  Chụp ảnh món ăn
                </span>
                <span className="text-[11px] sm:text-xs text-neutral-400 mt-0.5 block truncate">
                  AI ước lượng gram & calo tức thì
                </span>
              </div>
            </Link>

            <Link
              href="/log/run"
              className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-[#101522] border border-neutral-800 hover:border-orange-500/50 shadow-xl transition-all flex items-center gap-3.5 sm:gap-4 group cursor-pointer"
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-orange-500/20 to-amber-500/20 border border-orange-500/30 text-orange-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition shadow-inner">
                <Flame className="w-6 h-6 sm:w-7 sm:h-7 fill-orange-500 text-orange-500" />
              </div>
              <div className="min-w-0">
                <span className="font-black text-sm sm:text-base text-white block group-hover:text-orange-400 transition truncate">
                  Ghi nhận chạy bộ
                </span>
                <span className="text-[11px] sm:text-xs text-neutral-400 mt-0.5 block truncate">
                  Chuẩn ACSM & quét đồng hồ
                </span>
              </div>
            </Link>
          </div>

          {/* Danh sách hoạt động hôm nay */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-neutral-400">
                Hoạt động hôm nay
              </h3>
              <Link
                href="/history"
                className="text-[11px] sm:text-xs font-bold text-orange-400 hover:text-orange-300 transition flex items-center gap-1"
              >
                <span>Xem chi tiết</span>
                <span>→</span>
              </Link>
            </div>

            {(!todaySummary || (!todaySummary.foodLogs.length && !todaySummary.runLogs.length)) ? (
              <div className="p-6 sm:p-8 rounded-2xl sm:rounded-3xl bg-[#101522] border border-dashed border-neutral-800 text-center space-y-1.5">
                <p className="text-xs sm:text-sm font-bold text-neutral-300">
                  Hôm nay chưa có hoạt động nào được ghi nhận.
                </p>
                <p className="text-[11px] sm:text-xs text-neutral-500">
                  Chụp ảnh bữa ăn hoặc ghi lại buổi chạy để duy trì chuỗi ngày rực lửa (Streak)!
                </p>
              </div>
            ) : (
              <div className="space-y-2 sm:space-y-2.5">
                {todaySummary.foodLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-[#101522] border border-neutral-800 flex items-center justify-between gap-2.5 sm:gap-3 shadow-md"
                  >
                    <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
                        <Utensils className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-xs sm:text-sm font-bold text-white block truncate">
                          {log.items.map((i) => i.name).join(", ") || "Bữa ăn"}
                        </span>
                        <span className="text-[10px] sm:text-[11px] text-neutral-500 block">
                          {new Date(log.logged_at).toLocaleTimeString("vi-VN", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs sm:text-sm font-black text-emerald-400 font-mono shrink-0">
                      +{log.total_calories.toLocaleString()} kcal
                    </span>
                  </div>
                ))}

                {todaySummary.runLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-[#101522] border border-neutral-800 flex items-center justify-between gap-2.5 sm:gap-3 shadow-md"
                  >
                    <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-orange-500/15 border border-orange-500/30 text-orange-400 flex items-center justify-center shrink-0">
                        <Flame className="w-4 h-4 sm:w-5 sm:h-5 fill-orange-500 text-orange-500" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-xs sm:text-sm font-bold text-white block truncate">
                          Chạy {log.distance_km} km ({log.duration_minutes} phút)
                        </span>
                        <span className="text-[10px] sm:text-[11px] text-neutral-500 block">
                          {log.source === "photo" ? "Quét ảnh đồng hồ" : "Nhập tay"}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs sm:text-sm font-black text-orange-400 font-mono shrink-0">
                      -{log.calories_burned.toLocaleString()} kcal
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
