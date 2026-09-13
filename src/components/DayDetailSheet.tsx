"use client";

import React from "react";
import { X, Utensils, Flame, Activity, Clock, Navigation } from "lucide-react";
import { DaySummary } from "@/lib/types";

interface DayDetailSheetProps {
  dateStr: string;
  summary: DaySummary | null;
  onClose: () => void;
}

export default function DayDetailSheet({
  dateStr,
  summary,
  onClose,
}: DayDetailSheetProps) {
  // Format ngày dạng: Thứ Bảy, 13/09/2026
  const dateParts = dateStr.split("-");
  const formattedDate =
    dateParts.length === 3
      ? `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`
      : dateStr;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-md p-0 sm:p-4 transition-all">
      <div className="bg-[#101522] w-full max-w-lg rounded-t-3xl sm:rounded-3xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl border border-[#1e2638] animate-fadeIn">
        {/* Header Sheet */}
        <div className="p-5 border-b border-[#1e2638] flex items-center justify-between">
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-orange-500">
              Chi tiết nhật ký ngày
            </span>
            <h3 className="text-xl font-black text-white">
              {formattedDate}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-[#141b2b] border border-[#1e2638] hover:bg-[#1a2338] text-neutral-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nội dung chi tiết */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
          {/* Card tổng kết Net Calo của ngày */}
          <div className="grid grid-cols-3 gap-2.5 text-center">
            <div className="p-3.5 rounded-2xl bg-[#141b2b] border border-orange-500/20">
              <span className="text-[11px] font-bold text-orange-400 block uppercase tracking-wider">
                Nạp vào
              </span>
              <span className="text-xl font-black text-white">
                {summary ? summary.totalIntake.toLocaleString() : 0}
              </span>
              <span className="text-[10px] font-semibold text-neutral-400 block">kcal</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#141b2b] border border-emerald-500/20">
              <span className="text-[11px] font-bold text-emerald-400 block uppercase tracking-wider">
                Tiêu thụ
              </span>
              <span className="text-xl font-black text-white">
                {summary ? summary.totalBurn.toLocaleString() : 0}
              </span>
              <span className="text-[10px] font-semibold text-neutral-400 block">kcal</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#141b2b] border border-[#1e2638]">
              <span className="text-[11px] font-bold text-neutral-400 block uppercase tracking-wider">
                Net Calo
              </span>
              <span className={`text-xl font-black ${
                summary && summary.netCalories > 0 ? "text-orange-400" : "text-emerald-400"
              }`}>
                {summary ? (summary.netCalories > 0 ? `+${summary.netCalories}` : summary.netCalories) : 0}
              </span>
              <span className="text-[10px] font-semibold text-neutral-400 block">kcal</span>
            </div>
          </div>

          {/* Danh sách bữa ăn */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-neutral-400 flex items-center gap-2">
              <Utensils className="w-4 h-4 text-emerald-400" />
              Bữa ăn đã nạp ({summary?.foodLogs.length || 0})
            </h4>

            {summary && summary.foodLogs.length > 0 ? (
              <div className="space-y-2.5">
                {summary.foodLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-4 rounded-2xl border border-[#1e2638] bg-[#141b2b]/60 space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-neutral-400">
                        {new Date(log.logged_at).toLocaleTimeString("vi-VN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      <span className="text-base font-black text-white">
                        {log.total_calories} kcal
                      </span>
                    </div>

                    {/* Liệt kê các món ăn */}
                    {log.items && log.items.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-1">
                        {log.items.map((item, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center text-xs px-2.5 py-1 rounded-xl bg-[#101522] border border-[#1e2638] text-neutral-300 font-semibold"
                          >
                            {item.name} ({item.weightGrams}g - {item.totalCalories} kcal)
                          </span>
                        ))}
                      </div>
                    )}

                    {log.note && (
                      <p className="text-xs text-neutral-400 italic">
                        {log.note}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-neutral-500 italic py-2">
                Không có dữ liệu bữa ăn nào trong ngày này.
              </p>
            )}
          </div>

          {/* Danh sách chạy bộ */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-neutral-400 flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-500" />
              Chạy bộ tiêu thụ ({summary?.runLogs.length || 0})
            </h4>

            {summary && summary.runLogs.length > 0 ? (
              <div className="space-y-2.5">
                {summary.runLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-4 rounded-2xl border border-[#1e2638] bg-[#141b2b]/60 space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-neutral-400">
                        {new Date(log.logged_at).toLocaleTimeString("vi-VN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}{" "}
                        • {log.source === "photo" ? "Ảnh đồng hồ" : "Nhập tay"}
                      </span>
                      <span className="text-base font-black text-orange-400">
                        -{log.calories_burned} kcal
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-xs pt-1">
                      <div className="flex items-center gap-1.5 text-neutral-300 font-semibold">
                        <Navigation className="w-3.5 h-3.5 text-orange-400" />
                        <span>{log.distance_km} km</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-neutral-300 font-semibold">
                        <Clock className="w-3.5 h-3.5 text-orange-400" />
                        <span>{log.duration_minutes} phút</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-neutral-300 font-semibold">
                        <Activity className="w-3.5 h-3.5 text-orange-400" />
                        <span>MET {log.met_value}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-neutral-500 italic py-2">
                Không có dữ liệu chạy bộ trong ngày này.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
