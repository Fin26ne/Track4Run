"use client";

import React from "react";
import { Flame } from "lucide-react";

interface StreakBadgeProps {
  streak: number;
}

export default function StreakBadge({ streak }: StreakBadgeProps) {
  const isBurning = streak > 0;

  return (
    <div
      className={`inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-2xl border transition-all shadow-sm ${
        isBurning
          ? "bg-gradient-to-r from-orange-500/15 via-amber-500/10 to-orange-500/5 border-orange-500/30 text-orange-400"
          : "bg-[#141b2b] border-[#1e2638] text-neutral-400"
      }`}
    >
      <div
        className={`flex items-center justify-center w-6 h-6 rounded-xl ${
          isBurning
            ? "bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/30"
            : "bg-[#101522] border border-[#1e2638] text-neutral-500"
        }`}
      >
        <Flame className="w-3.5 h-3.5" />
      </div>

      <div className="flex items-baseline gap-1.5 text-xs">
        <span className="font-black text-sm text-white">
          {streak}
        </span>
        <span className="font-bold text-neutral-300">
          {streak === 1 ? "ngày streak" : "ngày streak liên tiếp"}
        </span>
      </div>
    </div>
  );
}
