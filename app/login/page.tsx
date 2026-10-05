"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const router = useRouter();
  const { signIn } = useAuth();

  // form input state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // error state
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [authError, setAuthError] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    let hasError = false;

    // check email
    if (!email.trim()) {
      setEmailError("Email is required");
      hasError = true;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError("Please enter a valid email address");
      hasError = true;
    } else {
      setEmailError("");
    }

    // check password
    if (!password) {
      setPasswordError("Password is required");
      hasError = true;
    } else {
      setPasswordError("");
    }

    // if all valid, call signIn from AuthContext
    if (!hasError) {
      setEmailError("");
      setPasswordError("");
      setAuthError("");

      const { error } = await signIn(email, password);
      if (error) {
        setAuthError(error.message);
      } else {
        router.replace("/");
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white border border-gray-200">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-2xl font-bold text-gray-900">Sign In</CardTitle>
          <CardDescription className="text-sm text-gray-500">
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>

        <CardContent>
          {authError && (
            <div
              data-testid="error-auth"
              className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700 border border-red-200"
            >
              {authError}
            </div>
          )}

          <form
            data-testid="login-form"
            noValidate
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            <div className="space-y-1">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                data-testid="login-email"
                value={email}
                onChange={(e) => {
                  const val = e.target.value;
                  setEmail(val);
                  if (emailError && val.trim() && /\S+@\S+\.\S+/.test(val)) {
                    setEmailError("");
                  }
                }}
                placeholder="you@example.com"
              />
              {emailError && (
                <p data-testid="error-email" className="text-xs text-red-600">
                  {emailError}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                data-testid="login-password"
                value={password}
                onChange={(e) => {
                  const val = e.target.value;
                  setPassword(val);
                  if (passwordError && val) {
                    setPasswordError("");
                  }
                }}
                placeholder="••••••••"
              />
              {passwordError && (
                <p data-testid="error-password" className="text-xs text-red-600">
                  {passwordError}
                </p>
              )}
            </div>

            <Button
              type="submit"
              data-testid="login-submit"
              className="w-full cursor-pointer"
            >
              Login
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex justify-center text-sm text-gray-500 pt-0">
          <span>Don&apos;t have an account? </span>
          <Link href="/register" className="ml-1 text-blue-600 hover:underline">
            Register
          </Link>
        </CardFooter>
      </Card>

      <div className="mt-4">
        <Link href="/" className="text-sm text-gray-500 hover:underline">
          &larr; Back to Products
        </Link>
      </div>
    </div>
  );
}
