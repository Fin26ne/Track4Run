"use client";

import React, { useState, useEffect } from "react";
import CalendarMonth from "@/components/CalendarMonth";
import DayDetailSheet from "@/components/DayDetailSheet";
import { createClient } from "@/lib/supabase/client";
import { DaySummary, FoodLog, Goal, RunLog } from "@/lib/types";
import { buildDaySummaries } from "@/lib/streak";
import { Calendar as CalendarIcon, TrendingUp, Navigation, Flame, Sparkles } from "lucide-react";

export default function HistoryPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [foodLogs, setFoodLogs] = useState<FoodLog[]>([]);
  const [runLogs, setRunLogs] = useState<RunLog[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [daySummaries, setDaySummaries] = useState<DaySummary[]>([]);

  const [selectedDay, setSelectedDay] = useState<{
    summary: DaySummary | null;
    dateStr: string;
  } | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) return;

        // Tải food_logs, run_logs, goals của user
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

        setFoodLogs(fLogs);
        setRunLogs(rLogs);
        setGoals(gList);

        // Xây dựng mảng DaySummary cho 90 ngày gần nhất
        const summaries = buildDaySummaries(fLogs, rLogs, gList, 90);
        setDaySummaries(summaries);
      } catch (err) {
        console.error("Lỗi tải lịch sử:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [supabase]);

  // Tính toán thống kê 7 ngày gần nhất (Tuần này)
  const last7Days = daySummaries.slice(0, 7);
  const weekKm = last7Days.reduce((sum, d) => sum + d.totalDistanceKm, 0);
  const weekIntake = last7Days.reduce((sum, d) => sum + d.totalIntake, 0);
  const weekBurn = last7Days.reduce((sum, d) => sum + d.totalBurn, 0);

  // Goal tuần
  const weeklyKmGoal = goals.find(
    (g) => g.goal_type === "weekly_distance_km" && g.is_active
  );

  // Tính toán thống kê 30 ngày gần nhất (Tháng này)
  const last30Days = daySummaries.slice(0, 30);
  const monthIntake = last30Days.reduce((sum, d) => sum + d.totalIntake, 0);
  const monthBurn = last30Days.reduce((sum, d) => sum + d.totalBurn, 0);
  const monthDeficit = monthBurn - monthIntake;

  const monthlyDeficitGoal = goals.find(
    (g) => g.goal_type === "monthly_deficit_kcal" && g.is_active
  );

  return (
    <div className="space-y-6 pb-8">
      {/* Tiêu đề trang */}
      <div className="flex items-center gap-3.5">
        <div className="w-10 h-10 rounded-2xl bg-[#101522] border border-[#1e2638] flex items-center justify-center text-orange-500 shadow-sm">
          <CalendarIcon className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-orange-500">
              Analytics & History
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">
            Lịch sử & Thống kê
          </h1>
        </div>
      </div>

      {loading ? (
        <div className="p-16 text-center text-sm text-neutral-400 bg-[#101522] border border-[#1e2638] rounded-3xl">
          <Sparkles className="w-8 h-8 animate-spin mx-auto mb-3 text-orange-500" />
          <p className="font-bold text-white">Đang tải dữ liệu đám mây...</p>
        </div>
      ) : (
        <>
          {/* Card thống kê tổng hợp tuần / tháng */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Thống kê tuần */}
            <div className="p-5 sm:p-6 rounded-3xl bg-[#101522] border border-[#1e2638] shadow-xl space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-neutral-400">
                  7 ngày qua
                </span>
                <span className="text-xs font-bold px-2.5 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  {Math.round(weekKm * 10) / 10} km
                </span>
              </div>

              {weeklyKmGoal && (
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-neutral-400">
                    <span>Mục tiêu chạy tuần</span>
                    <span className="font-bold text-white">
                      {Math.round(weekKm)} / {weeklyKmGoal.target_value} km
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[#141b2b] overflow-hidden border border-[#1e2638]">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all"
                      style={{
                        width: `${Math.min(
                          100,
                          (weekKm / Number(weeklyKmGoal.target_value)) * 100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-between text-xs text-neutral-400 pt-2 border-t border-[#1e2638]">
                <span>Nạp: <strong className="text-white font-bold">{weekIntake.toLocaleString()}</strong> kcal</span>
                <span>Tiêu: <strong className="text-white font-bold">{weekBurn.toLocaleString()}</strong> kcal</span>
              </div>
            </div>

            {/* Thống kê tháng */}
            <div className="p-5 sm:p-6 rounded-3xl bg-[#101522] border border-[#1e2638] shadow-xl space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-neutral-400">
                  30 ngày qua
                </span>
                <span className="text-xs font-bold px-2.5 py-1 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400">
                  Net: {monthIntake - monthBurn > 0 ? `+${monthIntake - monthBurn}` : monthIntake - monthBurn} kcal
                </span>
              </div>

              {monthlyDeficitGoal && (
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-neutral-400">
                    <span>Mục tiêu thâm hụt tháng</span>
                    <span className="font-bold text-white">
                      {Math.max(0, monthDeficit)} / {monthlyDeficitGoal.target_value} kcal
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[#141b2b] overflow-hidden border border-[#1e2638]">
                    <div
                      className="h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full transition-all"
                      style={{
                        width: `${Math.min(
                          100,
                          Math.max(0, (monthDeficit / Number(monthlyDeficitGoal.target_value)) * 100)
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-between text-xs text-neutral-400 pt-2 border-t border-[#1e2638]">
                <span>Tổng nạp: <strong className="text-white font-bold">{monthIntake.toLocaleString()}</strong></span>
                <span>Tổng đốt: <strong className="text-white font-bold">{monthBurn.toLocaleString()}</strong></span>
              </div>
            </div>
          </div>

          {/* Lịch tháng tương tác */}
          <CalendarMonth
            daySummaries={daySummaries}
            onSelectDay={(summary, dateStr) =>
              setSelectedDay({ summary, dateStr })
            }
            selectedDateStr={selectedDay?.dateStr}
          />
        </>
      )}

      {/* Sheet chi tiết khi chọn ngày */}
      {selectedDay && (
        <DayDetailSheet
          dateStr={selectedDay.dateStr}
          summary={selectedDay.summary}
          onClose={() => setSelectedDay(null)}
        />
      )}
    </div>
  );
}
