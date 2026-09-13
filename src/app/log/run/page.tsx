"use client";

import React from "react";
import Link from "next/link";
import RunCalculator from "@/components/RunCalculator";
import { ArrowLeft } from "lucide-react";

export default function LogRunPage() {
  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header section with athletic accents */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <Link
            href="/"
            className="w-10 h-10 rounded-2xl bg-[#101522] border border-[#1e2638] hover:border-orange-500/50 hover:bg-[#141b2b] flex items-center justify-center text-neutral-300 transition shadow-sm"
            title="Quay lại Dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-orange-500">
                Workout Activity
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-neutral-900 dark:text-white">
              Ghi nhận buổi chạy
            </h1>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-bold">
          <span>Chuẩn ACSM 🏃</span>
        </div>
      </div>

      <RunCalculator />
    </div>
  );
}
