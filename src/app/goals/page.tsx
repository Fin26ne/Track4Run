"use client";

import React, { useState, useEffect } from "react";
import GoalForm from "@/components/GoalForm";
import { createClient } from "@/lib/supabase/client";
import { Goal, Profile } from "@/lib/types";
import { Target, Weight, CheckCircle2, AlertCircle, Sparkles } from "lucide-react";

export default function GoalsPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [weightKg, setWeightKg] = useState<number>(60);

  const [savingWeight, setSavingWeight] = useState(false);
  const [weightNotice, setWeightNotice] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) return;
        setUserId(user.id);

        const [goalsRes, profileRes] = await Promise.all([
          supabase.from("goals").select("*").eq("user_id", user.id),
          supabase.from("profiles").select("*").eq("id", user.id).single(),
        ]);

        if (goalsRes.data) {
          setGoals(goalsRes.data as Goal[]);
        }
        if (profileRes.data) {
          setWeightKg(Number(profileRes.data.weight_kg || 60));
        }
      } catch (err) {
        console.error("Lỗi tải mục tiêu:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [supabase]);

  const handleUpdateWeight = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    setSavingWeight(true);
    setWeightNotice(null);

    try {
      const { error } = await supabase.from("profiles").upsert({
        id: userId,
        weight_kg: weightKg,
      });

      if (error) throw error;
      setWeightNotice("Đã cập nhật cân nặng thành công!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Không thể lưu cân nặng.";
      setWeightNotice(msg);
    } finally {
      setSavingWeight(false);
    }
  };

  return (
    <div className="space-y-6 pb-8 animate-fadeIn">
      <div className="flex items-center gap-3.5">
        <div className="w-10 h-10 rounded-2xl bg-[#101522] border border-[#1e2638] flex items-center justify-center text-orange-500 shadow-sm">
          <Target className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-orange-500">
              Target & Milestones
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">
            Kế hoạch & Mục tiêu
          </h1>
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
          <p className="font-bold text-white text-sm">Đang tải dữ liệu mục tiêu...</p>
          <div className="w-40 h-1 bg-[#141b2b] rounded-full mx-auto overflow-hidden relative">
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-orange-500 to-transparent animate-shimmer-beam" />
          </div>
        </div>
      ) : userId ? (
        <div className="space-y-6">
          {/* Card cập nhật cân nặng cơ thể */}
          <div className="bg-[#101522] border border-[#1e2638] rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#141b2b] border border-[#1e2638] text-orange-500 flex items-center justify-center">
                <Weight className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-white">
                  Cân nặng cơ thể
                </h3>
                <p className="text-xs text-neutral-400">
                  Dùng trong công thức sinh lý ACSM để tự động tính calo đốt chính xác
                </p>
              </div>
            </div>

            <form onSubmit={handleUpdateWeight} className="flex flex-col sm:flex-row sm:items-center gap-3 pt-1">
              <div className="relative flex-1">
                <input
                  type="number"
                  min="20"
                  max="250"
                  step="0.5"
                  required
                  value={weightKg}
                  onChange={(e) => setWeightKg(parseFloat(e.target.value) || 0)}
                  className="w-full pl-4 pr-12 py-3 rounded-2xl border border-[#1e2638] bg-[#141b2b] text-base font-bold text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-neutral-400 uppercase">
                  kg
                </span>
              </div>

              <button
                type="submit"
                disabled={savingWeight}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-xs transition-all shadow-md active:scale-[0.98] disabled:opacity-50"
              >
                {savingWeight ? "Đang lưu..." : "Cập nhật cân nặng"}
              </button>
            </form>

            {weightNotice && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-400 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{weightNotice}</span>
              </div>
            )}
          </div>

          {/* Form danh sách 4 loại mục tiêu */}
          <GoalForm initialGoals={goals} userId={userId} />
        </div>
      ) : (
        <div className="p-12 text-center text-sm text-neutral-400 bg-[#101522] border border-[#1e2638] rounded-3xl">
          Vui lòng đăng nhập để thiết lập mục tiêu.
        </div>
      )}
    </div>
  );
}
