"use client";

import React, { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Goal, GoalType } from "@/lib/types";
import { Target, CheckCircle2, AlertCircle, Save } from "lucide-react";

interface GoalFormProps {
  initialGoals: Goal[];
  userId: string;
}

interface GoalConfig {
  type: GoalType;
  title: string;
  unit: string;
  description: string;
  defaultVal: number;
}

const GOAL_CONFIGS: GoalConfig[] = [
  {
    type: "daily_intake_max",
    title: "Trần calo nạp mỗi ngày",
    unit: "kcal",
    description: "Giới hạn năng lượng nạp tối đa trong ngày để kiểm soát cân nặng",
    defaultVal: 2000,
  },
  {
    type: "daily_burn_min",
    title: "Sàn calo đốt mỗi ngày",
    unit: "kcal",
    description: "Lượng calo tối thiểu cần tiêu hao khi chạy bộ trong ngày",
    defaultVal: 300,
  },
  {
    type: "weekly_distance_km",
    title: "Mục tiêu quãng đường tuần",
    unit: "km",
    description: "Tổng quãng đường chạy bộ cần tích lũy trong một tuần (T2 - CN)",
    defaultVal: 20,
  },
  {
    type: "monthly_deficit_kcal",
    title: "Mục tiêu thâm hụt tháng",
    unit: "kcal",
    description: "Tổng lượng thâm hụt calo tích lũy trong một tháng (hỗ trợ giảm mỡ)",
    defaultVal: 5000,
  },
];

export default function GoalForm({ initialGoals, userId }: GoalFormProps) {
  const supabase = createClient();

  // Khởi tạo state cho từng goal
  const [goalsState, setGoalsState] = useState<
    Record<GoalType, { target_value: number; is_active: boolean }>
  >(() => {
    const state: Record<GoalType, { target_value: number; is_active: boolean }> = {
      daily_intake_max: { target_value: 2000, is_active: false },
      daily_burn_min: { target_value: 300, is_active: false },
      weekly_distance_km: { target_value: 20, is_active: false },
      monthly_deficit_kcal: { target_value: 5000, is_active: false },
    };

    initialGoals.forEach((g) => {
      if (state[g.goal_type]) {
        state[g.goal_type] = {
          target_value: Number(g.target_value),
          is_active: g.is_active,
        };
      }
    });

    return state;
  });

  const [saving, setSaving] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSaveGoal = async (type: GoalType) => {
    setSaving(type);
    setSuccessMsg(null);
    setErrorMsg(null);

    const goalData = goalsState[type];

    try {
      const { error } = await supabase.from("goals").upsert(
        {
          user_id: userId,
          goal_type: type,
          target_value: goalData.target_value,
          is_active: goalData.is_active,
        },
        { onConflict: "user_id,goal_type" }
      );

      if (error) throw error;
      setSuccessMsg(`Đã cập nhật "${GOAL_CONFIGS.find((c) => c.type === type)?.title}" thành công!`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Không thể lưu mục tiêu.";
      setErrorMsg(msg);
    } finally {
      setSaving(null);
    }
  };

  return (
    <div className="space-y-4">
      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-400 flex items-center gap-2.5 shadow-sm">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-red-950/40 border border-red-900/60 text-xs font-bold text-red-400 flex items-center gap-2.5 shadow-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {GOAL_CONFIGS.map((config) => {
          const state = goalsState[config.type];
          const isCurrentSaving = saving === config.type;

          return (
            <div
              key={config.type}
              className={`p-5 sm:p-6 rounded-3xl border transition-all ${
                state.is_active
                  ? "bg-[#101522] border-[#1e2638] shadow-xl"
                  : "bg-[#101522]/40 border-[#1e2638]/40 opacity-70"
              }`}
            >
              <div className="flex items-start justify-between gap-4 mb-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-[#141b2b] border border-[#1e2638] flex items-center justify-center text-orange-500 shrink-0">
                      <Target className="w-4 h-4" />
                    </div>
                    <h4 className="font-black text-base text-white">
                      {config.title}
                    </h4>
                  </div>
                  <p className="text-xs text-neutral-400 pl-10">
                    {config.description}
                  </p>
                </div>

                {/* Toggle bật/tắt kích hoạt mục tiêu */}
                <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                  <input
                    type="checkbox"
                    checked={state.is_active}
                    onChange={(e) =>
                      setGoalsState((prev) => ({
                        ...prev,
                        [config.type]: {
                          ...prev[config.type],
                          is_active: e.target.checked,
                        },
                      }))
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-[#141b2b] border border-[#1e2638] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-neutral-400 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500 peer-checked:after:bg-white peer-checked:border-orange-500"></div>
                </label>
              </div>

              {/* Input giá trị & Nút Lưu */}
              <div className="flex items-center gap-3 mt-4 pt-4 border-t border-[#1e2638]">
                <div className="relative flex-1">
                  <input
                    type="number"
                    min="1"
                    step="1"
                    disabled={!state.is_active}
                    value={state.target_value}
                    onChange={(e) =>
                      setGoalsState((prev) => ({
                        ...prev,
                        [config.type]: {
                          ...prev[config.type],
                          target_value: parseFloat(e.target.value) || 0,
                        },
                      }))
                    }
                    className="w-full pl-4 pr-14 py-3 rounded-2xl border border-[#1e2638] bg-[#141b2b] text-base font-bold text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 disabled:opacity-40 transition [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-neutral-400 uppercase">
                    {config.unit}
                  </span>
                </div>

                <button
                  type="button"
                  disabled={isCurrentSaving || !state.is_active}
                  onClick={() => handleSaveGoal(config.type)}
                  className={`px-6 py-3 rounded-2xl font-black text-xs transition-all flex items-center gap-2 shadow-md active:scale-[0.98] disabled:opacity-40 ${
                    state.is_active
                      ? "bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white"
                      : "bg-[#141b2b] border border-[#1e2638] text-neutral-500 cursor-not-allowed"
                  }`}
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isCurrentSaving ? "Đang lưu..." : "Lưu"}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
