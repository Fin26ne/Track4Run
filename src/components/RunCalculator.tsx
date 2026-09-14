"use client";

import React, { useState, useEffect } from "react";
import ImageUploader from "./ImageUploader";
import {
  calculateRunningCalories,
  paceToDurationMinutes,
  durationToPaceString,
} from "@/lib/met-formula";
import { RunCalorieResult, RunDataFromImage } from "@/lib/types";
import { Activity, Edit3, Watch, Flame, Gauge, HeartPulse, Sparkles, AlertTriangle, CheckCircle2, Save, Timer } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function RunCalculator() {
  const supabase = createClient();
  const [subTab, setSubTab] = useState<"manual" | "photo">("manual");

  // State cho chế độ nhập tay (nhập theo Pace hoặc theo Thời gian)
  const [speedMode, setSpeedMode] = useState<"pace" | "duration">("pace");
  const [manualDistance, setManualDistance] = useState<string>("");
  const [paceMinutes, setPaceMinutes] = useState<string>("5");
  const [paceSeconds, setPaceSeconds] = useState<string>("30");
  const [manualDuration, setManualDuration] = useState<string>("");
  const [manualWeight, setManualWeight] = useState<string>("60");
  const [manualResult, setManualResult] = useState<RunCalorieResult | null>(null);

  // State cho chụp ảnh
  const [photoDistance, setPhotoDistance] = useState<string>("");
  const [photoDuration, setPhotoDuration] = useState<string>("");
  const [photoPace, setPhotoPace] = useState<string>("");
  const [photoWeight, setPhotoWeight] = useState<string>("60");
  const [photoAiNote, setPhotoAiNote] = useState<string | null>(null);
  const [photoLoading, setPhotoLoading] = useState<boolean>(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [photoResult, setPhotoResult] = useState<RunCalorieResult | null>(null);

  // State lưu Supabase
  const [savingRun, setSavingRun] = useState(false);
  const [savedRunSuccess, setSavedRunSuccess] = useState(false);
  const [saveRunNotice, setSaveRunNotice] = useState<string | null>(null);

  // Nạp cân nặng từ profile của user nếu đã đăng nhập
  useEffect(() => {
    async function loadUserProfile() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          const { data } = await supabase
            .from("profiles")
            .select("weight_kg")
            .eq("id", user.id)
            .single();

          if (data && data.weight_kg) {
            setManualWeight(String(data.weight_kg));
            setPhotoWeight(String(data.weight_kg));
          }
        }
      } catch {
        // Bỏ qua nếu chưa auth hoặc chưa có profile
      }
    }

    loadUserProfile();
  }, [supabase]);

  // Hàm lưu buổi chạy vào Supabase
  const handleSaveRunToDatabase = async (
    res: RunCalorieResult,
    dist: number,
    dur: number,
    src: "manual" | "photo"
  ) => {
    setSavingRun(true);
    setSaveRunNotice(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setSaveRunNotice("Vui lòng đăng nhập để lưu vào lịch sử.");
        return;
      }

      const now = new Date();
      const localDateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

      const { error: insertError } = await supabase.from("run_logs").insert({
        user_id: user.id,
        log_date: localDateStr,
        distance_km: dist,
        duration_minutes: dur,
        calories_burned: res.totalCaloriesBurned,
        met_value: res.met,
        source: src,
      });

      if (insertError) throw insertError;
      setSavedRunSuccess(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Lỗi khi lưu buổi chạy.";
      setSaveRunNotice(msg);
    } finally {
      setSavingRun(false);
    }
  };

  // Xử lý tính toán khi nhập tay
  const handleCalculateManual = (e: React.FormEvent) => {
    e.preventDefault();
    const distance = parseFloat(manualDistance);
    const weight = parseFloat(manualWeight);

    if (isNaN(distance) || isNaN(weight) || distance <= 0 || weight <= 0) {
      alert("Vui lòng nhập quãng đường và cân nặng hợp lệ.");
      return;
    }

    let duration = parseFloat(manualDuration);
    if (speedMode === "pace") {
      const pMin = parseInt(paceMinutes, 10) || 0;
      const pSec = parseInt(paceSeconds, 10) || 0;
      if (pMin <= 0 && pSec <= 0) {
        alert("Vui lòng nhập Pace hợp lệ (ví dụ: 5 phút 30 giây / km).");
        return;
      }
      duration = paceToDurationMinutes(distance, pMin, pSec);
      setManualDuration(duration.toString());
    } else {
      if (isNaN(duration) || duration <= 0) {
        alert("Vui lòng nhập thời gian chạy hợp lệ (phút).");
        return;
      }
    }

    const calc = calculateRunningCalories({
      distanceKm: distance,
      durationMinutes: duration,
      weightKg: weight,
    });

    setManualResult(calc);
  };

  // Xử lý khi ảnh đồng hồ được chọn
  const handlePhotoSelected = async (base64Image: string, mimeType: string) => {
    setPhotoLoading(true);
    setPhotoError(null);
    setPhotoResult(null);
    setPhotoAiNote(null);

    try {
      const response = await fetch("/api/analyze-run-photo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ base64Image, mimeType }),
      });

      const data: RunDataFromImage & { error?: string } = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Không thể đọc dữ liệu từ ảnh.");
      }

      let calculatedDuration = data.durationMinutes;

      if (data.distanceKm !== null && data.distanceKm !== undefined) {
        setPhotoDistance(data.distanceKm.toString());
      }
      if (data.durationMinutes !== null && data.durationMinutes !== undefined) {
        setPhotoDuration(data.durationMinutes.toString());
      }
      if (data.pace) {
        setPhotoPace(data.pace);
        // Nếu đồng hồ chỉ hiện Pace và Quãng đường mà không có thời gian tổng
        if ((calculatedDuration === null || calculatedDuration === undefined) && data.distanceKm) {
          const match = data.pace.match(/(\d+):(\d+)/);
          if (match) {
            const pMin = parseInt(match[1], 10);
            const pSec = parseInt(match[2], 10);
            calculatedDuration = paceToDurationMinutes(data.distanceKm, pMin, pSec);
            setPhotoDuration(calculatedDuration.toString());
          }
        }
      }
      if (data.note) {
        setPhotoAiNote(data.note);
      }

      // Nếu đã có quãng đường và thời gian (hoặc quy đổi từ Pace), tự động tính luôn với cân nặng mặc định
      if (data.distanceKm && calculatedDuration && parseFloat(photoWeight) > 0) {
        const autoCalc = calculateRunningCalories({
          distanceKm: data.distanceKm,
          durationMinutes: calculatedDuration,
          weightKg: parseFloat(photoWeight),
        });
        setPhotoResult(autoCalc);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Lỗi xử lý ảnh đồng hồ.";
      setPhotoError(msg);
    } finally {
      setPhotoLoading(false);
    }
  };

  // Tính toán lại sau khi chỉnh sửa số liệu từ ảnh
  const handleCalculateFromPhotoForm = (e: React.FormEvent) => {
    e.preventDefault();
    const distance = parseFloat(photoDistance);
    const duration = parseFloat(photoDuration);
    const weight = parseFloat(photoWeight);

    if (isNaN(distance) || isNaN(duration) || isNaN(weight)) {
      alert("Vui lòng kiểm tra lại các thông số.");
      return;
    }

    const calc = calculateRunningCalories({
      distanceKm: distance,
      durationMinutes: duration,
      weightKg: weight,
    });

    setPhotoResult(calc);
  };

  // Component hiển thị kết quả calo ACSM chuẩn Strava Athletic
  const renderCalorieResult = (
    res: RunCalorieResult,
    dist: number,
    dur: number,
    src: "manual" | "photo"
  ) => {
    return (
      <div className="space-y-4 animate-fadeIn">
        {/* Card Tổng Calo Hero + Nút Lưu */}
        <div className="bg-[#101522] border border-neutral-800 text-white rounded-3xl p-6 sm:p-7 shadow-2xl relative overflow-hidden space-y-6">
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-orange-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-center justify-between relative z-10">
            <div>
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-orange-400">
                <Flame className="w-4 h-4 fill-orange-500 text-orange-500" />
                <span>Năng lượng tiêu thụ (Chuẩn ACSM)</span>
              </div>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-5xl sm:text-6xl font-black tracking-tight text-white font-mono">
                  {res.totalCaloriesBurned.toLocaleString()}
                </span>
                <span className="text-xl font-black text-orange-400">
                  kcal
                </span>
              </div>
            </div>

            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500/20 to-amber-500/20 border border-orange-500/30 text-orange-400 flex items-center justify-center shadow-inner">
              <Flame className="w-9 h-9 fill-orange-500 text-orange-500 animate-pulse" />
            </div>
          </div>

          {/* Nút lưu vào run_logs */}
          <div className="pt-3 border-t border-neutral-800 flex flex-wrap items-center justify-between gap-3 relative z-10">
            <button
              type="button"
              disabled={savingRun || savedRunSuccess || res.totalCaloriesBurned === 0}
              onClick={() => handleSaveRunToDatabase(res, dist, dur, src)}
              className={`px-5 py-3 rounded-2xl text-xs sm:text-sm font-black transition flex items-center gap-2 shadow-md cursor-pointer ${
                savedRunSuccess
                  ? "bg-emerald-600 text-white shadow-emerald-500/25"
                  : "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-emerald-500/20 active:scale-95 disabled:opacity-50"
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>
                {savingRun
                  ? "Đang đồng bộ đám mây..."
                  : savedRunSuccess
                  ? "Đã lưu vào nhật ký đám mây!"
                  : "Lưu buổi chạy vào nhật ký"}
              </span>
            </button>

            {saveRunNotice && (
              <span className="text-xs text-amber-400 font-medium">
                {saveRunNotice}
              </span>
            )}
          </div>
        </div>

        {/* Cảnh báo vận tốc nếu có */}
        {res.warning && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-200/90 leading-relaxed">
              {res.warning}
            </p>
          </div>
        )}

        {/* Bảng chi tiết các chỉ số sinh lý ACSM */}
        <div className="bg-[#101522] border border-neutral-800/80 rounded-3xl p-5 sm:p-6 shadow-md">
          <h4 className="text-xs font-black uppercase tracking-wider text-neutral-400 mb-3.5 flex items-center gap-2">
            <Gauge className="w-4 h-4 text-emerald-400" />
            Chỉ số chuyển hóa sinh lý học thực tế
          </h4>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 bg-[#141b2b] border border-neutral-800/90 rounded-2xl">
              <span className="text-xs text-neutral-400 block font-medium">Vận tốc</span>
              <span className="text-lg font-black text-white font-mono mt-0.5 block">
                {res.speedKmH}{" "}
                <span className="text-xs font-semibold text-neutral-400">km/h</span>
              </span>
              <span className="text-[11px] text-emerald-400/90 font-medium block mt-1">
                ~{res.speedMPerMin} m/phút
              </span>
            </div>

            <div className="p-3.5 bg-[#141b2b] border border-neutral-800/90 rounded-2xl">
              <span className="text-xs text-neutral-400 block font-medium">Oxy tiêu thụ (VO₂)</span>
              <span className="text-lg font-black text-white font-mono mt-0.5 block">
                {res.vo2}
              </span>
              <span className="text-[11px] text-neutral-400 block mt-1">
                ml / kg / phút
              </span>
            </div>

            <div className="p-3.5 bg-[#141b2b] border border-neutral-800/90 rounded-2xl">
              <span className="text-xs text-neutral-400 block font-medium">Hệ số MET</span>
              <span className="text-lg font-black text-amber-400 font-mono mt-0.5 block">
                {res.met}
              </span>
              <span className="text-[11px] text-neutral-400 block mt-1">
                = VO₂ / 3.5
              </span>
            </div>

            <div className="p-3.5 bg-[#141b2b] border border-neutral-800/90 rounded-2xl">
              <span className="text-xs text-neutral-400 block font-medium">Tốc độ đốt</span>
              <span className="text-lg font-black text-orange-400 font-mono mt-0.5 block">
                {res.kcalPerMinute}
              </span>
              <span className="text-[11px] text-neutral-400 block mt-1">
                kcal / phút
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const distNum = parseFloat(manualDistance) || 0;
  const pMinNum = parseInt(paceMinutes, 10) || 0;
  const pSecNum = parseInt(paceSeconds, 10) || 0;
  const calculatedMinutes =
    distNum > 0 && (pMinNum > 0 || pSecNum > 0)
      ? paceToDurationMinutes(distNum, pMinNum, pSecNum)
      : 0;

  const durNum = parseFloat(manualDuration) || 0;
  const calculatedPaceStr =
    distNum > 0 && durNum > 0 ? durationToPaceString(distNum, durNum) : "";

  return (
    <div className="space-y-6">
      {/* Thanh chuyển Sub-tab: Athletic Segmented Control */}
      <div className="flex bg-[#121826] border border-neutral-800/90 p-1.5 rounded-2xl shadow-inner">
        <button
          type="button"
          onClick={() => setSubTab("manual")}
          className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-black flex items-center justify-center gap-2.5 transition-all cursor-pointer ${
            subTab === "manual"
              ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/20"
              : "text-neutral-400 hover:text-white hover:bg-neutral-800/40"
          }`}
        >
          <Edit3 className="w-4 h-4" />
          <span>Nhập tay thông số</span>
        </button>

        <button
          type="button"
          onClick={() => setSubTab("photo")}
          className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-black flex items-center justify-center gap-2.5 transition-all cursor-pointer ${
            subTab === "photo"
              ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/20"
              : "text-neutral-400 hover:text-white hover:bg-neutral-800/40"
          }`}
        >
          <Watch className="w-4 h-4" />
          <span>Quét ảnh đồng hồ (Garmin / Strava)</span>
        </button>
      </div>

      {/* SUB-TAB 1: NHẬP TAY */}
      {subTab === "manual" && (
        <div className="space-y-6">
          <div className="bg-[#101522] border border-neutral-800/90 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-neutral-800/80">
              <div>
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <Flame className="w-5 h-5 text-orange-500" />
                  <span>Thông số buổi chạy</span>
                </h3>
                <p className="text-xs text-neutral-400 mt-1">
                  Đo lường năng lượng tiêu thụ dựa trên tốc độ thực tế theo tiêu chuẩn ACSM
                </p>
              </div>

              {/* Mode Toggle (Pace vs Duration) */}
              <div className="flex items-center gap-1 p-1 bg-[#141b2b] border border-neutral-800 rounded-xl self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setSpeedMode("pace")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    speedMode === "pace"
                      ? "bg-orange-500 text-white shadow-sm"
                      : "text-neutral-400 hover:text-white"
                  }`}
                >
                  <Timer className="w-3.5 h-3.5" />
                  <span>Theo Pace (/km)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSpeedMode("duration")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    speedMode === "duration"
                      ? "bg-orange-500 text-white shadow-sm"
                      : "text-neutral-400 hover:text-white"
                  }`}
                >
                  <Activity className="w-3.5 h-3.5" />
                  <span>Theo Thời gian</span>
                </button>
              </div>
            </div>

            <form onSubmit={handleCalculateManual} className="space-y-6">
              {/* PHẦN 1: QUÃNG ĐƯỜNG */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-neutral-300">
                    Quãng đường chạy
                  </label>
                  <span className="text-[11px] text-neutral-400">Đơn vị: Kilomet</span>
                </div>

                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    min="0.1"
                    required
                    value={manualDistance}
                    onChange={(e) => setManualDistance(e.target.value)}
                    placeholder="5.0"
                    className="w-full px-5 py-3.5 rounded-2xl border border-neutral-800 bg-[#141b2b] text-white text-xl sm:text-2xl font-black font-mono focus:outline-none focus:border-orange-500 transition shadow-inner placeholder:text-neutral-600"
                  />
                  <span className="absolute right-5 top-1/2 -translate-y-1/2 text-xs font-black px-2 py-1 rounded-md bg-neutral-800 text-neutral-300 tracking-wider">
                    KM
                  </span>
                </div>

                {/* Quick Presets for Distance */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="text-[11px] font-semibold text-neutral-400 mr-1">Cự ly mẫu:</span>
                  {[
                    { label: "3 km", val: "3" },
                    { label: "5 km", val: "5" },
                    { label: "10 km", val: "10" },
                    { label: "21.1 km (HM)", val: "21.1" },
                    { label: "42.2 km (FM)", val: "42.2" },
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => setManualDistance(preset.val)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                        manualDistance === preset.val
                          ? "bg-orange-500 text-white shadow-sm"
                          : "bg-[#141b2b] text-neutral-400 border border-neutral-800 hover:text-white hover:border-neutral-700"
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* PHẦN 2: TỐC ĐỘ (PACE HOẶC THỜI GIAN) */}
              {speedMode === "pace" ? (
                <div className="space-y-3 p-4 sm:p-5 rounded-2xl bg-[#141b2b] border border-neutral-800/80">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-extrabold uppercase tracking-wider text-orange-400 flex items-center gap-1.5">
                      <Timer className="w-4 h-4" />
                      <span>Pace chạy (phút : giây / km)</span>
                    </label>
                    <span className="text-[11px] text-neutral-400">Chuẩn Runner</span>
                  </div>

                  {/* Stopwatch digital style inputs */}
                  <div className="flex items-center justify-center gap-3 py-2">
                    {/* Minutes */}
                    <div className="flex flex-col items-center">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setPaceMinutes(String(Math.max(2, (parseInt(paceMinutes, 10) || 5) - 1)))}
                          className="w-9 h-11 rounded-xl bg-[#1a2337] border border-neutral-700 hover:bg-neutral-700 text-neutral-300 font-black text-lg flex items-center justify-center active:scale-95 transition cursor-pointer"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min="2"
                          max="25"
                          required
                          value={paceMinutes}
                          onChange={(e) => setPaceMinutes(e.target.value)}
                          className="w-16 h-11 text-center rounded-xl border border-neutral-700 bg-[#101522] text-white font-black text-2xl font-mono focus:outline-none focus:border-orange-500"
                        />
                        <button
                          type="button"
                          onClick={() => setPaceMinutes(String(Math.min(25, (parseInt(paceMinutes, 10) || 5) + 1)))}
                          className="w-9 h-11 rounded-xl bg-[#1a2337] border border-neutral-700 hover:bg-neutral-700 text-neutral-300 font-black text-lg flex items-center justify-center active:scale-95 transition cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                      <span className="text-[10px] uppercase tracking-wider font-bold text-neutral-400 mt-1">Phút</span>
                    </div>

                    <span className="text-3xl font-black text-orange-500 mb-4">:</span>

                    {/* Seconds */}
                    <div className="flex flex-col items-center">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            const cur = parseInt(paceSeconds, 10) || 0;
                            const next = cur <= 0 ? 55 : cur - 5;
                            setPaceSeconds(String(next).padStart(2, "0"));
                          }}
                          className="w-9 h-11 rounded-xl bg-[#1a2337] border border-neutral-700 hover:bg-neutral-700 text-neutral-300 font-black text-lg flex items-center justify-center active:scale-95 transition cursor-pointer"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min="0"
                          max="59"
                          required
                          value={paceSeconds}
                          onChange={(e) => setPaceSeconds(e.target.value)}
                          className="w-16 h-11 text-center rounded-xl border border-neutral-700 bg-[#101522] text-white font-black text-2xl font-mono focus:outline-none focus:border-orange-500"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const cur = parseInt(paceSeconds, 10) || 0;
                            const next = cur >= 55 ? 0 : cur + 5;
                            setPaceSeconds(String(next).padStart(2, "0"));
                          }}
                          className="w-9 h-11 rounded-xl bg-[#1a2337] border border-neutral-700 hover:bg-neutral-700 text-neutral-300 font-black text-lg flex items-center justify-center active:scale-95 transition cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                      <span className="text-[10px] uppercase tracking-wider font-bold text-neutral-400 mt-1">Giây</span>
                    </div>

                    <div className="mb-4 pl-2">
                      <span className="text-xs font-black text-neutral-400 bg-neutral-800/80 px-2 py-1 rounded-lg">/ km</span>
                    </div>
                  </div>

                  {/* Quick Pace Presets */}
                  <div className="flex flex-wrap items-center justify-center gap-2 pt-2 border-t border-neutral-800/80">
                    <span className="text-[11px] font-semibold text-neutral-400">Pace phổ biến:</span>
                    {[
                      { label: "4:30", min: "4", sec: "30" },
                      { label: "5:00", min: "5", sec: "00" },
                      { label: "5:30", min: "5", sec: "30" },
                      { label: "6:00", min: "6", sec: "00" },
                      { label: "6:30", min: "6", sec: "30" },
                      { label: "7:00", min: "7", sec: "00" },
                    ].map((p) => {
                      const isSel = paceMinutes === p.min && (paceSeconds === p.sec || parseInt(paceSeconds, 10) === parseInt(p.sec, 10));
                      return (
                        <button
                          key={p.label}
                          type="button"
                          onClick={() => {
                            setPaceMinutes(p.min);
                            setPaceSeconds(p.sec);
                          }}
                          className={`px-3 py-1 rounded-xl text-xs font-bold transition font-mono cursor-pointer ${
                            isSel
                              ? "bg-orange-500 text-white shadow-sm"
                              : "bg-[#101522] text-neutral-400 border border-neutral-800 hover:text-white hover:border-neutral-700"
                          }`}
                        >
                          {p.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="space-y-3 p-4 sm:p-5 rounded-2xl bg-[#141b2b] border border-neutral-800/80">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-extrabold uppercase tracking-wider text-orange-400 flex items-center gap-1.5">
                      <Activity className="w-4 h-4" />
                      <span>Tổng thời gian chạy (phút)</span>
                    </label>
                  </div>

                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      min="1"
                      required
                      value={manualDuration}
                      onChange={(e) => setManualDuration(e.target.value)}
                      placeholder="30"
                      className="w-full px-5 py-3.5 rounded-2xl border border-neutral-800 bg-[#101522] text-white text-xl sm:text-2xl font-black font-mono focus:outline-none focus:border-orange-500"
                    />
                    <span className="absolute right-5 top-1/2 -translate-y-1/2 text-xs font-black px-2 py-1 rounded-md bg-neutral-800 text-neutral-300 tracking-wider">
                      PHÚT
                    </span>
                  </div>

                  {/* Quick Duration Presets */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span className="text-[11px] font-semibold text-neutral-400">Mốc thời gian:</span>
                    {[
                      { label: "15 phút", val: "15" },
                      { label: "30 phút", val: "30" },
                      { label: "45 phút", val: "45" },
                      { label: "60 phút (1h)", val: "60" },
                    ].map((d) => (
                      <button
                        key={d.label}
                        type="button"
                        onClick={() => setManualDuration(d.val)}
                        className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                          manualDuration === d.val
                            ? "bg-orange-500 text-white"
                            : "bg-[#101522] text-neutral-400 border border-neutral-800 hover:text-white hover:border-neutral-700"
                        }`}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* PHẦN 3: CÂN NẶNG */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-neutral-300">
                    Cân nặng người chạy
                  </label>
                  <span className="text-[11px] text-emerald-400 font-semibold">✓ Đã đồng bộ từ hồ sơ</span>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    step="0.5"
                    min="20"
                    max="250"
                    required
                    value={manualWeight}
                    onChange={(e) => setManualWeight(e.target.value)}
                    placeholder="60"
                    className="w-full px-5 py-3 rounded-2xl border border-neutral-800 bg-[#141b2b] text-white text-base font-bold font-mono focus:outline-none focus:border-orange-500 transition"
                  />
                  <span className="absolute right-5 top-1/2 -translate-y-1/2 text-xs font-black px-2 py-1 rounded-md bg-neutral-800 text-neutral-300 tracking-wider">
                    KG
                  </span>
                </div>
              </div>

              {/* REALTIME WORKOUT HUD TICKER (DASHBOARD PREVIEW) */}
              {(calculatedMinutes > 0 || (distNum > 0 && durNum > 0)) && (
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#121929] via-[#162035] to-[#121929] border border-orange-500/30 shadow-lg space-y-2.5 animate-fadeIn">
                  <div className="flex items-center justify-between text-xs font-black text-orange-400 uppercase tracking-wider">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      Ước tính thời gian thực
                    </span>
                    <span className="text-[11px] text-neutral-400 lowercase">công thức acsm</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 sm:gap-3 pt-1 text-center">
                    <div className="p-3 rounded-xl bg-neutral-950/70 border border-neutral-800">
                      <span className="text-[10px] text-neutral-400 block font-semibold">Thời gian</span>
                      <span className="text-sm sm:text-base font-black text-white font-mono">
                        {speedMode === "pace" ? (
                          `${Math.floor(calculatedMinutes)}m ${Math.round((calculatedMinutes - Math.floor(calculatedMinutes)) * 60).toString().padStart(2, "0")}s`
                        ) : (
                          `${durNum} phút`
                        )}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-neutral-950/70 border border-neutral-800">
                      <span className="text-[10px] text-neutral-400 block font-semibold">Tốc độ TB</span>
                      <span className="text-sm sm:text-base font-black text-emerald-400 font-mono">
                        {speedMode === "pace" && calculatedMinutes > 0 ? (
                          `${(distNum / (calculatedMinutes / 60)).toFixed(1)} km/h`
                        ) : distNum > 0 && durNum > 0 ? (
                          `${(distNum / (durNum / 60)).toFixed(1)} km/h`
                        ) : "--"}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-neutral-950/70 border border-neutral-800">
                      <span className="text-[10px] text-neutral-400 block font-semibold">Pace tương ứng</span>
                      <span className="text-sm sm:text-base font-black text-amber-400 font-mono">
                        {speedMode === "pace" ? (
                          `${paceMinutes}:${paceSeconds.padStart(2, "0")} /km`
                        ) : (
                          calculatedPaceStr || "--:--"
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* ACTION BUTTON: STRAVA ORANGE GRADIENT */}
              <button
                type="submit"
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-orange-500 via-orange-600 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-base tracking-wide shadow-lg shadow-orange-500/25 active:scale-[0.99] transition flex items-center justify-center gap-2.5 cursor-pointer"
              >
                <Flame className="w-5 h-5 fill-white" />
                <span>TÍNH TOÁN CALO ACSM</span>
              </button>
            </form>
          </div>

          {manualResult &&
            renderCalorieResult(
              manualResult,
              parseFloat(manualDistance) || 0,
              speedMode === "pace"
                ? paceToDurationMinutes(
                    parseFloat(manualDistance) || 0,
                    parseInt(paceMinutes, 10) || 0,
                    parseInt(paceSeconds, 10) || 0
                  )
                : parseFloat(manualDuration) || 0,
              "manual"
            )}
        </div>
      )}

      {/* SUB-TAB 2: CHỤP ẢNH ĐỒNG HỒ */}
      {subTab === "photo" && (
        <div className="space-y-6">
          <div className="bg-[#101522] border border-neutral-800/90 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4">
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <Watch className="w-5 h-5 text-orange-500" />
              <span>Quét thông số từ ảnh màn hình đồng hồ</span>
            </h3>
            <p className="text-xs text-neutral-400">
              Tự động đọc số liệu từ ảnh chụp Garmin, Strava, Apple Watch, Coros, Nike Run Club...
            </p>

            <ImageUploader
              onImageSelected={handlePhotoSelected}
              onClearImage={() => {
                setPhotoResult(null);
                setPhotoDistance("");
                setPhotoDuration("");
                setPhotoPace("");
                setPhotoAiNote(null);
              }}
              isLoading={photoLoading}
              label="Chụp hoặc tải ảnh màn hình kết quả chạy"
              sublabel="Đảm bảo nhìn rõ thông số Quãng đường (Distance) và Thời gian (Time) hoặc Pace"
            />
          </div>

          {/* Loading state: Athletic Pace Sensor Waveform Scanner */}
          {photoLoading && (
            <div className="bg-[#101522] border border-[#1e2638] rounded-3xl p-8 text-center space-y-5">
              {/* Athletic Waveform Scanner */}
              <div className="flex items-center justify-center gap-1.5 h-10">
                <span className="w-1.5 bg-orange-500 rounded-full animate-wave-1" />
                <span className="w-1.5 bg-amber-400 rounded-full animate-wave-2" />
                <span className="w-1.5 bg-orange-400 rounded-full animate-wave-3" />
                <span className="w-1.5 bg-amber-500 rounded-full animate-wave-4" />
              </div>

              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-black">
                  <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping" />
                  <span>GEMINI OCR SENSOR SCANNING</span>
                </div>
                <p className="font-black text-white text-base pt-1">
                  Đang trích xuất số liệu từ ảnh đồng hồ...
                </p>
                <p className="text-xs text-neutral-400 max-w-sm mx-auto">
                  Tự động nhận diện km, thời gian và tính toán Pace chuẩn sinh lý học thể thao.
                </p>
              </div>

              {/* Shimmer laser beam scanner */}
              <div className="w-48 h-1 bg-[#141b2b] rounded-full mx-auto overflow-hidden relative">
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-orange-500 to-transparent animate-shimmer-beam" />
              </div>
            </div>
          )}

          {/* Error state */}
          {photoError && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h3 className="font-bold text-red-200 text-sm">
                  Không thể đọc ảnh
                </h3>
                <p className="text-xs text-red-300/90 leading-relaxed">
                  {photoError}
                </p>
              </div>
            </div>
          )}

          {/* Form xác nhận & điều chỉnh số liệu AI đã đọc */}
          {(photoDistance || photoDuration || photoAiNote) && !photoLoading && (
            <div className="bg-[#101522] border border-neutral-800/90 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-black text-white flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Số liệu AI trích xuất (có thể chỉnh sửa)
                </h4>
                {photoPace && (
                  <span className="text-xs font-bold px-3 py-1 bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded-xl font-mono">
                    Pace: {photoPace}
                  </span>
                )}
              </div>

              {photoAiNote && (
                <p className="text-xs text-neutral-300 bg-[#141b2b] p-3.5 rounded-2xl border border-neutral-800">
                  {photoAiNote}
                </p>
              )}

              <form onSubmit={handleCalculateFromPhotoForm} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-extrabold uppercase tracking-wider text-neutral-300 mb-1.5">
                      Quãng đường (km)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.1"
                      required
                      value={photoDistance}
                      onChange={(e) => setPhotoDistance(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-neutral-800 bg-[#141b2b] text-white font-mono font-bold text-base focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold uppercase tracking-wider text-neutral-300 mb-1.5">
                      Thời gian (phút)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="1"
                      required
                      value={photoDuration}
                      onChange={(e) => setPhotoDuration(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-neutral-800 bg-[#141b2b] text-white font-mono font-bold text-base focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold uppercase tracking-wider text-neutral-300 mb-1.5">
                      Cân nặng (kg)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min="20"
                      max="250"
                      required
                      value={photoWeight}
                      onChange={(e) => setPhotoWeight(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-neutral-800 bg-[#141b2b] text-white font-mono font-bold text-base focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-black text-sm hover:opacity-95 transition shadow-md cursor-pointer"
                >
                  Tính lại với thông số trên
                </button>
              </form>
            </div>
          )}

          {photoResult &&
            renderCalorieResult(
              photoResult,
              parseFloat(photoDistance) || 0,
              parseFloat(photoDuration) || 0,
              "photo"
            )}
        </div>
      )}
    </div>
  );
}
