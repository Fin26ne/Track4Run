"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Utensils, Flame, CheckCircle2 } from "lucide-react";
import { DaySummary } from "@/lib/types";

interface CalendarMonthProps {
  daySummaries: DaySummary[];
  onSelectDay: (summary: DaySummary | null, dateStr: string) => void;
  selectedDateStr?: string | null;
}

export default function CalendarMonth({
  daySummaries,
  onSelectDay,
  selectedDateStr,
}: CalendarMonthProps) {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0 - 11

  // Chuyển sang tháng trước / sau
  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Tính số ngày trong tháng và ngày bắt đầu của tuần (Thứ 2 = 1, CN = 0)
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0 là CN, 1 là T2...
  // Chuyển về tuần bắt đầu từ Thứ Hai: T2=0, T3=1, ..., CN=6
  const startOffset = (firstDayOfWeek + 6) % 7;

  // Tạo map tìm kiếm DaySummary nhanh
  const summaryMap = new Map<string, DaySummary>();
  daySummaries.forEach((s) => {
    summaryMap.set(s.date, s);
  });

  const weekHeaders = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

  // Kiểm tra ngày hôm nay
  const todayObj = new Date();
  const todayStr = `${todayObj.getFullYear()}-${String(todayObj.getMonth() + 1).padStart(2, "0")}-${String(todayObj.getDate()).padStart(2, "0")}`;

  return (
    <div className="bg-[#101522] border border-[#1e2638] rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
      {/* Header chuyển tháng */}
      <div className="flex items-center justify-between">
        <h3 className="text-base sm:text-lg font-black text-white">
          Tháng {month + 1}, {year}
        </h3>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="p-2 rounded-xl border border-[#1e2638] bg-[#141b2b] hover:bg-[#1a2338] text-neutral-300 transition"
            title="Tháng trước"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setCurrentDate(new Date())}
            className="px-3 py-1.5 text-xs font-bold rounded-xl border border-[#1e2638] bg-[#141b2b] hover:bg-[#1a2338] text-neutral-200 transition"
          >
            Hôm nay
          </button>
          <button
            type="button"
            onClick={handleNextMonth}
            className="p-2 rounded-xl border border-[#1e2638] bg-[#141b2b] hover:bg-[#1a2338] text-neutral-300 transition"
            title="Tháng sau"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Chú thích trạng thái */}
      <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-neutral-400 pb-2 border-b border-[#1e2638]">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-orange-500 inline-block shadow-sm shadow-orange-500/50" />
          Đồ ăn
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block shadow-sm shadow-emerald-500/50" />
          Chạy bộ
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm border-2 border-emerald-500 inline-block" />
          Đạt streak
        </span>
      </div>

      {/* Lưới lịch */}
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2 text-center">
        {weekHeaders.map((h, i) => (
          <div key={i} className="text-xs font-black text-neutral-500 py-1 uppercase tracking-wider">
            {h}
          </div>
        ))}

        {/* Ô trống đầu tháng */}
        {Array.from({ length: startOffset }).map((_, i) => (
          <div key={`empty-${i}`} className="h-14 sm:h-16 rounded-2xl opacity-10" />
        ))}

        {/* Các ngày trong tháng */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const dayNum = i + 1;
          const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
          const summary = summaryMap.get(dateStr);

          const isToday = dateStr === todayStr;
          const isSelected = dateStr === selectedDateStr;
          const hasFood = summary && summary.foodLogs.length > 0;
          const hasRun = summary && summary.runLogs.length > 0;
          const isStreakDay = summary && summary.metGoals;

          return (
            <button
              key={dateStr}
              type="button"
              onClick={() => onSelectDay(summary || null, dateStr)}
              className={`h-14 sm:h-16 rounded-2xl p-1.5 flex flex-col justify-between items-center transition relative border ${
                isSelected
                  ? "border-orange-500 bg-orange-500/10 ring-2 ring-orange-500/40 text-white"
                  : isStreakDay
                  ? "border-emerald-500/50 bg-emerald-950/20 hover:bg-emerald-950/30 text-white"
                  : summary?.hasLogs
                  ? "border-[#1e2638] bg-[#141b2b]/60 hover:bg-[#141b2b] text-neutral-200"
                  : "border-[#1e2638]/40 hover:bg-[#141b2b]/30 text-neutral-500"
              }`}
            >
              <div className="w-full flex items-center justify-between px-0.5">
                <span
                  className={`text-xs font-bold leading-none ${
                    isToday
                      ? "w-5 h-5 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white flex items-center justify-center -ml-0.5 shadow-sm"
                      : "text-neutral-200"
                  }`}
                >
                  {dayNum}
                </span>

                {isStreakDay && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                )}
              </div>

              {/* Chấm tròn biểu thị hoạt động */}
              <div className="flex items-center gap-1 my-0.5">
                {hasFood && <span className="w-1.5 h-1.5 rounded-full bg-orange-500 shadow-sm shadow-orange-500/50" />}
                {hasRun && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />}
              </div>

              {/* Net calo tóm tắt */}
              <div className="text-[10px] font-bold truncate w-full px-0.5">
                {summary && summary.hasLogs ? (
                  <span
                    className={
                      summary.netCalories > 0
                        ? "text-orange-400"
                        : "text-emerald-400"
                    }
                  >
                    {summary.netCalories > 0 ? `+${summary.netCalories}` : summary.netCalories}
                  </span>
                ) : (
                  <span className="opacity-0">-</span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
