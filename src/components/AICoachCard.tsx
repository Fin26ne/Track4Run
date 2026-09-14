"use client";

import React, { useState } from "react";
import { AICoachAdvice, DaySummary } from "@/lib/types";
import {
  Sparkles,
  TrendingDown,
  TrendingUp,
  Flame,
  Award,
  Calendar,
  Utensils,
  Footprints,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  ChevronRight,
} from "lucide-react";

interface AICoachCardProps {
  daySummaries: DaySummary[];
  weightKg: number;
  streak: number;
}

export default function AICoachCard({
  daySummaries,
  weightKg,
  streak,
}: AICoachCardProps) {
  const [advice, setAdvice] = useState<AICoachAdvice | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Thống kê 30 ngày
  const last30Days = daySummaries.slice(0, 30);
  const daysLogged = last30Days.filter((d) => d.hasLogs).length;
  const totalIntake = last30Days.reduce((sum, d) => sum + d.totalIntake, 0);
  const totalBurn = last30Days.reduce((sum, d) => sum + d.totalBurn, 0);
  const netCalories = totalIntake - totalBurn;
  const totalDistanceKm = Math.round(
    last30Days.reduce((sum, d) => sum + d.totalDistanceKm, 0) * 10
  ) / 10;

  // Quy đổi mỡ theo sinh lý học thể thao ACSM: 1kg mỡ = ~7.700 kcal
  const fatChangeKg = Math.round((Math.abs(netCalories) / 7700) * 10) / 10;
  const isDeficit = netCalories < 0;
  const dailyAvgDeficit = Math.round(Math.abs(netCalories) / Math.max(1, daysLogged || 30));

  const handleRequestAdvice = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/coach-advice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          daysLogged,
          totalIntake,
          totalBurn,
          netCalories,
          totalDistanceKm,
          weightKg,
          streak,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Không thể tải lời khuyên từ AI Coach.");
      }

      setAdvice(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Đã có lỗi xảy ra.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#101522] border border-[#1e2638] rounded-2xl sm:rounded-3xl p-4 sm:p-7 shadow-xl space-y-4 sm:space-y-6 relative overflow-hidden animate-fadeIn">
      {/* Quầng sáng nền */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-orange-500/10 via-amber-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Header AI Coach */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 relative z-10">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white shadow-md shadow-orange-500/25 shrink-0">
            <Award className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-widest text-orange-500">
                ACSM Certified AI Coach
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse shrink-0" />
            </div>
            <h2 className="text-lg sm:text-xl font-black tracking-tight text-white leading-snug">
              Cố vấn Dinh dưỡng & Thể thao
            </h2>
          </div>
        </div>

        <button
          type="button"
          disabled={loading}
          onClick={handleRequestAdvice}
          className="w-full sm:w-auto px-3.5 sm:px-4 py-2 rounded-xl text-xs font-black bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/30 transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>{advice ? "Cập nhật" : "Phân tích 30 ngày"}</span>
        </button>
      </div>

      {/* Bộ 4 chỉ số sinh lý học thể thao 30 ngày */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 relative z-10">
        {/* Chỉ số 1: Thâm hụt calo */}
        <div className="p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl bg-[#141b2b] border border-[#1e2638] space-y-0.5 sm:space-y-1">
          <span className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider text-neutral-400 block truncate">
            Net Calo 30 ngày
          </span>
          <div className="flex items-baseline gap-1">
            <span className={`text-lg sm:text-xl font-black ${isDeficit ? "text-emerald-400" : "text-orange-400"}`}>
              {isDeficit ? `-${Math.abs(netCalories).toLocaleString()}` : `+${netCalories.toLocaleString()}`}
            </span>
            <span className="text-[10px] font-bold text-neutral-400">kcal</span>
          </div>
          <span className="text-[10px] text-neutral-400 block truncate">
            TB ~{dailyAvgDeficit} kcal / ngày
          </span>
        </div>

        {/* Chỉ số 2: Quy đổi mỡ ACSM */}
        <div className="p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl bg-[#141b2b] border border-[#1e2638] space-y-0.5 sm:space-y-1">
          <span className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider text-neutral-400 block truncate">
            Dự kiến mỡ đổi
          </span>
          <div className="flex items-baseline gap-1">
            <span className={`text-lg sm:text-xl font-black ${isDeficit ? "text-emerald-400" : "text-amber-400"}`}>
              {isDeficit ? `-${fatChangeKg}` : `+${fatChangeKg}`}
            </span>
            <span className="text-[10px] font-bold text-neutral-400">kg</span>
          </div>
          <span className="text-[10px] text-neutral-400 block truncate">
            Chuẩn ACSM (7.7k)
          </span>
        </div>

        {/* Chỉ số 3: Quãng đường chạy */}
        <div className="p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl bg-[#141b2b] border border-[#1e2638] space-y-0.5 sm:space-y-1">
          <span className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider text-neutral-400 block truncate">
            Chạy tích lũy
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-lg sm:text-xl font-black text-white">
              {totalDistanceKm}
            </span>
            <span className="text-[10px] font-bold text-neutral-400">km</span>
          </div>
          <span className="text-[10px] text-neutral-400 block truncate">
            Đốt {totalBurn.toLocaleString()} kcal
          </span>
        </div>

        {/* Chỉ số 4: Kỷ luật & Đánh giá an toàn */}
        <div className="p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl bg-[#141b2b] border border-[#1e2638] space-y-0.5 sm:space-y-1">
          <span className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider text-neutral-400 block truncate">
            Tốc độ thâm hụt
          </span>
          <div className="pt-0.5">
            {isDeficit && dailyAvgDeficit >= 300 && dailyAvgDeficit <= 650 ? (
              <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-black text-emerald-400">
                <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" /> Chuẩn vàng
              </span>
            ) : isDeficit && dailyAvgDeficit > 650 ? (
              <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-black text-amber-400">
                <AlertTriangle className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" /> Thâm hụt sâu
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-black text-orange-400">
                <Flame className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" /> Thặng dư
              </span>
            )}
          </div>
          <span className="text-[10px] text-neutral-400 block truncate">
            {streak > 0 ? `Streak ${streak} ngày` : "Duy trì log"}
          </span>
        </div>
      </div>

      {/* Trạng thái đang phân tích: Animation Waveform Sensor chuyên nghiệp thay vì vòng xoay tròn */}
      {loading && (
        <div className="p-6 rounded-2xl bg-[#141b2b] border border-[#1e2638] text-center space-y-4">
          <div className="flex items-center justify-center gap-1.5 h-10">
            <span className="w-1.5 bg-orange-500 rounded-full animate-wave-1" />
            <span className="w-1.5 bg-amber-400 rounded-full animate-wave-2" />
            <span className="w-1.5 bg-emerald-400 rounded-full animate-wave-3" />
            <span className="w-1.5 bg-orange-400 rounded-full animate-wave-4" />
          </div>

          <div className="space-y-1.5">
            <p className="font-black text-white text-sm">
              AI Coach đang phân tích toàn diện chu kỳ 30 ngày...
            </p>
            <p className="text-xs text-neutral-400 max-w-md mx-auto">
              Đang đối chiếu dữ liệu nạp/đốt với công thức chuyển hóa ACSM, ước tính mỡ thừa và xây dựng lộ trình cả năm.
            </p>
          </div>

          {/* Shimmer laser beam scanner */}
          <div className="w-48 h-1 bg-[#101522] rounded-full mx-auto overflow-hidden relative">
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-orange-500 to-transparent animate-shimmer-beam" />
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-red-950/40 border border-red-900/60 text-xs text-red-300 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Kết quả nhận định & Lời khuyên chi tiết từ AI Coach */}
      {advice ? (
        <div className="space-y-4 relative z-10">
          {/* Card 1: Nhận định phong độ & vóc dáng */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#141b2b] to-[#101522] border border-orange-500/20 space-y-2">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-orange-400" />
              <h4 className="text-xs font-black uppercase tracking-wider text-orange-400">
                Đánh giá phong độ & Kỷ luật
              </h4>
            </div>
            <p className="text-xs sm:text-sm text-neutral-200 leading-relaxed font-medium">
              {advice.assessment}
            </p>
          </div>

          {/* Card 2: Lời khuyên Dinh dưỡng */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#141b2b] border border-[#1e2638] space-y-2">
            <div className="flex items-center gap-2">
              <Utensils className="w-4 h-4 text-emerald-400" />
              <h4 className="text-xs font-black uppercase tracking-wider text-emerald-400">
                Chiến lược Dinh dưỡng Khuyên dùng
              </h4>
            </div>
            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed font-medium">
              {advice.nutritionAdvice}
            </p>
          </div>

          {/* Card 3: Kế hoạch Chạy bộ tuần tới */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#141b2b] border border-[#1e2638] space-y-2">
            <div className="flex items-center gap-2">
              <Footprints className="w-4 h-4 text-orange-400" />
              <h4 className="text-xs font-black uppercase tracking-wider text-orange-400">
                Lộ trình Chạy bộ đề xuất (Workout Strategy)
              </h4>
            </div>
            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed font-medium">
              {advice.workoutAdvice}
            </p>
          </div>

          {/* Card 4: Dự báo 1 năm (365 Days Long-Term Projection) */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-emerald-500/10 border border-[#1e2638] space-y-2">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-400" />
              <h4 className="text-xs font-black uppercase tracking-wider text-amber-400">
                Dự báo 1 Năm (365 Ngày) nếu giữ vững phong độ
              </h4>
            </div>
            <p className="text-xs sm:text-sm text-neutral-200 leading-relaxed font-medium">
              {advice.longTermProjection}
            </p>
          </div>
        </div>
      ) : !loading && (
        <div className="p-4 sm:p-5 rounded-xl sm:rounded-2xl bg-[#141b2b]/60 border border-[#1e2638] flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="space-y-1">
            <p className="text-xs font-bold text-white">
              Bấm nút &quot;Phân tích 30 ngày&quot; để nhận lời khuyên dinh dưỡng & chạy bộ
            </p>
            <p className="text-[11px] text-neutral-400">
              AI Coach sẽ đọc toàn bộ thói quen nạp calo và pace chạy bộ để xây dựng kế hoạch tối ưu cho bạn.
            </p>
          </div>
          <button
            type="button"
            onClick={handleRequestAdvice}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-black text-xs bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-md shadow-orange-500/20 active:scale-[0.98] transition cursor-pointer whitespace-nowrap text-center"
          >
            Nhận lời khuyên AI Coach
          </button>
        </div>
      )}
    </div>
  );
}
