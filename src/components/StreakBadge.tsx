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
      className={`inline-flex items-center gap-2 px-2.5 sm:px-3.5 py-1.5 rounded-2xl border transition-all shadow-sm shrink-0 whitespace-nowrap ${
        isBurning
          ? "bg-gradient-to-r from-orange-500/15 via-amber-500/10 to-orange-500/5 border-orange-500/30 text-orange-400"
          : "bg-[#141b2b] border-[#1e2638] text-neutral-400"
      }`}
    >
      <div
        className={`flex items-center justify-center w-6 h-6 rounded-xl shrink-0 ${
          isBurning
            ? "bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/30"
            : "bg-[#101522] border border-[#1e2638] text-neutral-500"
        }`}
      >
        <Flame className={`w-3.5 h-3.5 ${isBurning ? "fill-white text-white" : ""}`} />
      </div>

      <div className="flex items-center gap-1.5 shrink-0 whitespace-nowrap">
        <span className="font-bold text-xs text-neutral-300">Chuỗi</span>
        <span className="font-black text-sm sm:text-base font-mono text-white leading-none">
          {streak}
        </span>
      </div>
    </div>
  );
}
