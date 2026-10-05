"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AccountPage() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div
      data-testid="account-page"
      className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4"
    >
      <Card className="w-full max-w-md bg-white border border-gray-200">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-2xl font-bold text-gray-900">
            Account Details
          </CardTitle>
          <CardDescription className="text-sm text-gray-500">
            Manage your account credentials
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-gray-50 p-4 border border-gray-100">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider block mb-1">
              Email Address
            </span>
            <span
              data-testid="account-email"
              className="text-base font-medium text-gray-900 break-all"
            >
              {user.email}
            </span>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-2 pt-0">
          <Button
            type="button"
            variant="outline"
            className="w-full cursor-pointer"
            onClick={() => signOut()}
          >
            Logout
          </Button>
          <Link
            href="/"
            className="text-center text-sm text-gray-500 hover:underline mt-2"
          >
            &larr; Back to Products
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
