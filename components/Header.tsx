"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function Header() {
  const { user, signOut } = useAuth();

  return (
    <header className="border-b border-gray-200 bg-white sticky top-0 z-10 w-full">
      <div className="max-w-6xl mx-auto px-4 py-3 sm:py-4 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <Link href="/">
            <h1 className="text-lg sm:text-xl font-bold text-gray-900 truncate">
              Lumière Candles
            </h1>
          </Link>
          <p className="hidden sm:block text-xs text-gray-500">
            Handcrafted botanical scented candles
          </p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {user ? (
            <div className="flex items-center gap-2 sm:gap-3">
              <Link href="/account" className="hover:underline">
                <span
                  data-testid="user-email"
                  className="text-xs sm:text-sm font-medium text-gray-700 bg-gray-100 px-2 py-1 rounded"
                >
                  {user.email}
                </span>
              </Link>
              <button
                type="button"
                data-testid="btn-logout"
                onClick={() => signOut()}
                className={cn(
                  buttonVariants({ variant: "ghost", size: "sm" }),
                  "sm:h-8 text-xs cursor-pointer text-gray-600 hover:text-red-600"
                )}
              >
                Logout
              </button>
            </div>
          ) : (
            <>
              <Link
                href="/login"
                data-testid="btn-login"
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                  "sm:h-8 cursor-pointer"
                )}
              >
                Login
              </Link>
              <Link
                href="/register"
                data-testid="btn-register"
                className={cn(
                  buttonVariants({ variant: "default", size: "sm" }),
                  "sm:h-8 cursor-pointer"
                )}
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
