import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";
import "./globals.css";

export const metadata: Metadata = {
  title: "Track4Run - Theo Dõi Calo & Chạy Bộ ACSM",
  description:
    "Web app theo dõi calo thông minh kiểu Strava: Nhận diện calo món ăn bằng Gemini AI Vision, tính calo tiêu thụ khi chạy bộ theo phương trình chuyển hóa ACSM và đồng bộ đám mây với Supabase.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className="antialiased min-h-screen flex flex-col justify-between selection:bg-orange-500 selection:text-white bg-[#f8fafc] dark:bg-[#0a0d14] text-neutral-900 dark:text-neutral-100">
        <Navbar />
        <main className="flex-grow w-full max-w-3xl mx-auto px-3.5 sm:px-6 pt-3.5 sm:pt-8 pb-28 md:pb-12">
          {children}
        </main>
        <BottomNav />
      </body>
    </html>
  );
}
