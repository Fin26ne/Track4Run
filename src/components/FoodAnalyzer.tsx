"use client";

import React, { useState } from "react";
import ImageUploader from "./ImageUploader";
import { FoodAnalysisResult } from "@/lib/types";
import {
  Utensils,
  AlertCircle,
  Sparkles,
  CheckCircle2,
  Info,
  Flame,
  MessageSquareQuote,
  RefreshCw,
  Ruler,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function FoodAnalyzer() {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<FoodAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // State lưu trữ prompt/ngữ cảnh bổ sung của người dùng
  const [userPrompt, setUserPrompt] = useState("");

  // Lưu lại ảnh hiện tại để cho phép phân tích lại với prompt mới
  const [currentImage, setCurrentImage] = useState<{
    base64Image: string;
    mimeType: string;
  } | null>(null);

  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [saveNotice, setSaveNotice] = useState<string | null>(null);

  const analyzeMeal = async (
    base64Image: string,
    mimeType: string,
    customPrompt?: string
  ) => {
    setLoading(true);
    setError(null);
    setResult(null);
    setSavedSuccess(false);
    setSaveNotice(null);

    try {
      const response = await fetch("/api/analyze-food", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          base64Image,
          mimeType,
          userContext: customPrompt !== undefined ? customPrompt.trim() : userPrompt.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Không thể phân tích ảnh món ăn.");
      }

      setResult(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Đã có lỗi xảy ra. Vui lòng thử lại.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelected = async (base64Image: string, mimeType: string) => {
    setCurrentImage({ base64Image, mimeType });
    await analyzeMeal(base64Image, mimeType, userPrompt);
  };

  const handleReanalyze = async () => {
    if (!currentImage || loading) return;
    await analyzeMeal(currentImage.base64Image, currentImage.mimeType, userPrompt);
  };

  const handleClear = () => {
    setCurrentImage(null);
    setResult(null);
    setError(null);
    setSavedSuccess(false);
    setSaveNotice(null);
  };

  const handleSaveToDatabase = async () => {
    if (!result || result.items.length === 0) return;
    setSaving(true);
    setSaveNotice(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setSaveNotice("Vui lòng đăng nhập để lưu vào lịch sử.");
        return;
      }

      // Format ngày địa phương YYYY-MM-DD
      const now = new Date();
      const localDateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

      const { error: insertError } = await supabase.from("food_logs").insert({
        user_id: user.id,
        log_date: localDateStr,
        items: result.items,
        total_calories: result.totalMealCalories,
        note: result.note || null,
      });

      if (insertError) throw insertError;
      setSavedSuccess(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Lỗi khi lưu dữ liệu.";
      setSaveNotice(msg);
    } finally {
      setSaving(false);
    }
  };

  // Badge hiển thị mức độ tin cậy của AI
  const renderConfidenceBadge = (confidence: "low" | "medium" | "high") => {
    switch (confidence) {
      case "high":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3 h-3" /> Tin cậy cao
          </span>
        );
      case "medium":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-[11px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Info className="w-3 h-3" /> Trung bình
          </span>
        );
      case "low":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-[11px] font-bold bg-orange-500/10 text-orange-400 border border-orange-500/20">
            <AlertCircle className="w-3 h-3" /> Tham khảo
          </span>
        );
      default:
        return null;
    }
  };

  // Tổng hợp dinh dưỡng đa lượng (Macros)
  const displayProtein = Math.round(
    result?.totalProtein ??
      result?.items?.reduce((sum, item) => sum + (item.proteinGrams || 0), 0) ??
      0
  );
  const displayCarbs = Math.round(
    result?.totalCarbs ??
      result?.items?.reduce((sum, item) => sum + (item.carbsGrams || 0), 0) ??
      0
  );
  const displayFat = Math.round(
    result?.totalFat ??
      result?.items?.reduce((sum, item) => sum + (item.fatGrams || 0), 0) ??
      0
  );

  return (
    <div className="space-y-6">
      {/* Khối tải ảnh & nhập Prompt tùy chỉnh */}
      <div className="bg-[#101522] border border-[#1e2638] rounded-2xl sm:rounded-3xl p-4 sm:p-7 shadow-xl space-y-4 sm:space-y-5">
        <div>
          <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
            <Utensils className="w-5 h-5 text-emerald-500 shrink-0" />
            Nhận diện calo bữa ăn
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Chụp đĩa cơm, tô phở hoặc đồ ăn vặt. Gemini Vision sẽ ước lượng gram và tính calo từng món.
          </p>
        </div>

        <ImageUploader
          onImageSelected={handleImageSelected}
          onClearImage={handleClear}
          isLoading={loading}
          label="Chụp ảnh món ăn của bạn"
          sublabel="Chụp thẳng từ trên xuống để AI ước lượng thể tích chính xác nhất"
        />

        {/* Ô nhập Prompt / Ngữ cảnh người dùng (Kích thước đĩa, khẩu phần ăn, loại trừ) */}
        <div className="pt-2 border-t border-[#1e2638]/70 space-y-2">
          <label className="text-xs font-bold text-neutral-300 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <MessageSquareQuote className="w-4 h-4 text-emerald-400" />
              Ghi chú thêm cho AI (kích thước đĩa, khẩu phần ăn, món không dùng...)
            </span>
            <span className="text-[10px] text-neutral-500 font-semibold uppercase tracking-wider">
              Tùy chọn
            </span>
          </label>

          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={userPrompt}
              onChange={(e) => setUserPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && currentImage && !loading) {
                  handleReanalyze();
                }
              }}
              placeholder="Ví dụ: Cái đĩa này tầm 15cm đấy, tôi chỉ ăn 1 nửa, không ăn nước dùng..."
              className="flex-1 px-3.5 py-2.5 rounded-xl bg-[#141b2b] border border-[#1e2638] focus:border-emerald-500 text-xs sm:text-sm text-white placeholder-neutral-500 outline-none transition shadow-inner"
            />

            {currentImage && (
              <button
                type="button"
                onClick={handleReanalyze}
                disabled={loading}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20 hover:from-emerald-500/30 hover:to-teal-500/30 border border-emerald-500/40 text-emerald-300 hover:text-white text-xs font-bold transition flex items-center justify-center gap-2 shrink-0 disabled:opacity-50 cursor-pointer shadow-sm"
                title="Phân tích lại ảnh hiện tại với ghi chú mới"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                <span>Phân tích lại</span>
              </button>
            )}
          </div>

          <p className="text-[11px] text-neutral-400 leading-relaxed">
            💡 <strong className="text-neutral-300">Mẹo tính chuẩn:</strong> Nếu thấy calo bị dư, hãy nhập kích thước đĩa (ví dụ: <em>&quot;đĩa 15cm&quot;</em>) hoặc phần bỏ lại (ví dụ: <em>&quot;ăn 1/2&quot;</em>, <em>&quot;bỏ nước béo&quot;</em>).
          </p>
        </div>
      </div>

      {/* Loading state: Athletic Biometric Vision Scanner */}
      {loading && (
        <div className="bg-[#101522] border border-[#1e2638] rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-center space-y-4 sm:space-y-5 animate-fadeIn">
          {/* Athletic Waveform Scanner */}
          <div className="flex items-center justify-center gap-1.5 h-10">
            <span className="w-1.5 bg-emerald-500 rounded-full animate-wave-1" />
            <span className="w-1.5 bg-teal-400 rounded-full animate-wave-2" />
            <span className="w-1.5 bg-emerald-400 rounded-full animate-wave-3" />
            <span className="w-1.5 bg-teal-500 rounded-full animate-wave-4" />
          </div>

          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-black">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>GEMINI VISION SCANNING</span>
            </div>
            <p className="font-black text-white text-base pt-1">
              Đang phân tích món ăn & định lượng calo...
            </p>
            <p className="text-xs text-neutral-400 max-w-sm mx-auto">
              Đang nhận diện kích thước dụng cụ, bóc tách thành phần và hiệu chuẩn calo theo ghi chú của bạn.
            </p>
          </div>

          {/* Shimmer laser beam scanner */}
          <div className="w-48 h-1 bg-[#141b2b] rounded-full mx-auto overflow-hidden relative">
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-shimmer-beam" />
          </div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="bg-red-950/30 border border-red-900/60 rounded-xl sm:rounded-2xl p-3.5 sm:p-4 flex items-start gap-2.5 sm:gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h3 className="font-bold text-red-200 text-sm">
              Không thể phân tích ảnh
            </h3>
            <p className="text-xs text-red-300 leading-relaxed">
              {error}
            </p>
          </div>
        </div>
      )}

      {/* Kết quả phân tích */}
      {result && (
        <div className="space-y-4 sm:space-y-5 animate-fadeIn">
          {/* Banner thông báo AI đã áp dụng Prompt của người dùng */}
          {result.appliedContextNote && (
            <div className="bg-gradient-to-r from-emerald-950/40 via-teal-950/30 to-[#101522] border border-emerald-500/30 rounded-2xl p-3.5 sm:p-4 flex items-start gap-3 shadow-lg">
              <Sparkles className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5 text-xs sm:text-sm">
                <span className="font-extrabold text-emerald-300 block">
                  AI đã áp dụng ghi chú của bạn:
                </span>
                <p className="text-emerald-100/90 leading-relaxed">
                  {result.appliedContextNote}
                </p>
              </div>
            </div>
          )}

          {/* Card tổng calo nổi bật + Nút Lưu Nhật Ký */}
          <div className="bg-gradient-to-br from-[#101522] via-[#121827] to-[#141b2b] border border-[#1e2638] rounded-2xl sm:rounded-3xl p-4 sm:p-7 shadow-xl space-y-4 sm:space-y-5">
            <div className="flex items-center justify-between gap-2">
              <div>
                <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-widest text-neutral-400">
                  Tổng năng lượng thực nạp
                </span>
                <div className="flex items-baseline gap-1.5 sm:gap-2 mt-1">
                  <span className="text-3xl sm:text-5xl font-black tracking-tight text-white font-mono">
                    {result.totalMealCalories.toLocaleString()}
                  </span>
                  <span className="text-base sm:text-lg font-bold text-neutral-400">
                    kcal
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-[#141b2b] border border-[#1e2638] text-orange-400 flex items-center justify-center shadow-md shrink-0">
                <Flame className="w-6 h-6 sm:w-8 sm:h-8 fill-orange-500 text-orange-500" />
              </div>
            </div>

            {/* Bảng bóc tách dinh dưỡng đa lượng (Macronutrients) */}
            {(displayProtein > 0 || displayCarbs > 0 || displayFat > 0) && (
              <div className="grid grid-cols-3 gap-2 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-[#0c0f17] border border-[#1e2638]">
                <div className="text-center p-1">
                  <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-emerald-400 block">
                    Đạm (Protein)
                  </span>
                  <span className="text-base sm:text-xl font-black text-white font-mono block mt-0.5">
                    {displayProtein}g
                  </span>
                  <span className="text-[10px] text-neutral-400 block">
                    ~{displayProtein * 4} kcal
                  </span>
                </div>

                <div className="text-center p-1 border-x border-[#1e2638]">
                  <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-amber-400 block">
                    Đường bột (Carbs)
                  </span>
                  <span className="text-base sm:text-xl font-black text-white font-mono block mt-0.5">
                    {displayCarbs}g
                  </span>
                  <span className="text-[10px] text-neutral-400 block">
                    ~{displayCarbs * 4} kcal
                  </span>
                </div>

                <div className="text-center p-1">
                  <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-rose-400 block">
                    Chất béo (Fat)
                  </span>
                  <span className="text-base sm:text-xl font-black text-white font-mono block mt-0.5">
                    {displayFat}g
                  </span>
                  <span className="text-[10px] text-neutral-400 block">
                    ~{displayFat * 9} kcal
                  </span>
                </div>
              </div>
            )}

            {/* Nút lưu vào nhật ký Supabase */}
            <div className="pt-3 sm:pt-4 border-t border-[#1e2638] flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                disabled={saving || savedSuccess || (result.items.length === 0)}
                onClick={handleSaveToDatabase}
                className={`w-full sm:w-auto px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl text-xs font-black tracking-wide transition-all flex items-center justify-center gap-2 shadow-lg active:scale-[0.98] ${
                  savedSuccess
                    ? "bg-emerald-600 text-white"
                    : "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-emerald-500/20 disabled:opacity-50 cursor-pointer"
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  {saving
                    ? "Đang lưu..."
                    : savedSuccess
                    ? "Đã lưu vào nhật ký!"
                    : "Lưu bữa ăn vào nhật ký"}
                </span>
              </button>

              {saveNotice && (
                <span className="text-xs text-amber-400 font-semibold">
                  {saveNotice}
                </span>
              )}
            </div>
          </div>

          {/* Ghi chú dinh dưỡng từ AI */}
          {result.note && (
            <div className="bg-[#101522] border border-[#1e2638] rounded-xl sm:rounded-2xl p-3.5 sm:p-5 flex items-start gap-2.5 sm:gap-3">
              <Info className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                <span className="font-bold text-white">
                  Nhận xét của AI:{" "}
                </span>
                {result.note}
              </div>
            </div>
          )}

          {/* Danh sách từng món ăn & Căn cứ kích thước */}
          {result.items && result.items.length > 0 ? (
            <div className="bg-[#101522] border border-[#1e2638] rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl">
              <div className="p-3.5 sm:p-5 border-b border-[#1e2638] bg-[#0c0f17] flex items-center justify-between">
                <h3 className="font-black text-white text-xs sm:text-sm">
                  Chi tiết thành phần món ăn ({result.items.length} món)
                </h3>
              </div>

              <div className="divide-y divide-[#1e2638]/60">
                {result.items.map((item, index) => (
                  <div
                    key={index}
                    className="p-3.5 sm:p-5 flex items-start justify-between gap-3 hover:bg-[#141b2b]/40 transition"
                  >
                    <div className="space-y-1.5 min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2.5">
                        <span className="font-bold text-white text-xs sm:text-base">
                          {item.name}
                        </span>
                        {renderConfidenceBadge(item.confidence)}
                      </div>

                      {/* Căn cứ trực quan ước lượng kích thước */}
                      {item.portionReasoning && (
                        <div className="flex items-center gap-1.5 text-[11px] text-neutral-400 bg-[#0c0f17]/70 border border-[#1e2638]/60 rounded-lg px-2 py-1 max-w-fit">
                          <Ruler className="w-3 h-3 text-emerald-400 shrink-0" />
                          <span className="italic">{item.portionReasoning}</span>
                        </div>
                      )}

                      {/* Công thức tính & Macros món ăn */}
                      <div className="text-[11px] sm:text-xs text-neutral-400 flex flex-wrap items-center gap-2 sm:gap-3">
                        <span className="font-mono text-neutral-300">
                          ~{item.weightGrams}g × {item.caloriesPer100g} kcal/100g
                        </span>

                        {(item.proteinGrams !== undefined ||
                          item.carbsGrams !== undefined ||
                          item.fatGrams !== undefined) && (
                          <>
                            <span>•</span>
                            <span className="text-neutral-400">
                              Đạm: <strong className="text-emerald-400">{item.proteinGrams || 0}g</strong>
                              {" "}| Carbs: <strong className="text-amber-400">{item.carbsGrams || 0}g</strong>
                              {" "}| Béo: <strong className="text-rose-400">{item.fatGrams || 0}g</strong>
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-lg sm:text-xl font-black text-white font-mono">
                        {item.totalCalories}
                      </span>
                      <span className="text-[10px] sm:text-xs font-bold text-neutral-400 ml-1">
                        kcal
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-[#101522] border border-[#1e2638] rounded-xl sm:rounded-2xl p-5 sm:p-6 text-center text-xs sm:text-sm text-neutral-400">
              Không phát hiện được món ăn cụ thể nào trong ảnh này.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
