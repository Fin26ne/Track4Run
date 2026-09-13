"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Calendar, Utensils, Flame, Target } from "lucide-react";

export default function BottomNav() {
  const pathname = usePathname();

  // Không hiển thị thanh điều hướng trên trang đăng nhập
  if (pathname === "/login") {
    return null;
  }

  const navItems = [
    { href: "/", label: "Tổng quan", icon: LayoutDashboard },
    { href: "/history", label: "Lịch sử", icon: Calendar },
    { href: "/log/food", label: "Nạp vào", icon: Utensils },
    { href: "/log/run", label: "Chạy bộ", icon: Flame },
    { href: "/goals", label: "Mục tiêu", icon: Target },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-[#0a0d14]/95 backdrop-blur-lg border-t border-[#1e2638] safe-area-bottom">
      <div className="max-w-xl mx-auto flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all ${
                isActive
                  ? "text-orange-400 font-black scale-105"
                  : "text-neutral-400 hover:text-neutral-200 font-medium"
              }`}
            >
              <div
                className={`p-1.5 rounded-xl transition-all ${
                  isActive
                    ? "bg-orange-500/10 text-orange-400 border border-orange-500/20"
                    : ""
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
