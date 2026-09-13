"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  Utensils,
  Flame,
  Target,
} from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();

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
    <header className="sticky top-0 z-40 hidden md:block w-full bg-[#0a0d14]/90 backdrop-blur-xl border-b border-[#1e2638] shadow-sm transition">
      <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo & Brand */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 via-orange-600 to-amber-500 flex items-center justify-center text-white shadow-md shadow-orange-500/25 group-hover:scale-105 transition">
            <Flame className="w-5 h-5 fill-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-black tracking-tight text-white flex items-center gap-1">
              Track<span className="text-orange-500">4</span>Run
            </span>
            <span className="text-[10px] tracking-wider uppercase font-semibold text-neutral-400">
              Calorie & Athletics
            </span>
          </div>
        </Link>

        {/* Navigation items */}
        <nav className="flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? "bg-orange-500/10 text-orange-400 shadow-sm border border-orange-500/20"
                    : "text-neutral-400 hover:text-white hover:bg-[#141b2b]"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-orange-400" : ""}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
