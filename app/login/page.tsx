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
import { AlertCircle, Eye, EyeOff, Loader2, Mail } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { signIn } = useAuth();

  // form input state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

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
      setLoading(true);

      try {
        const { error } = await signIn(email, password);
        if (error) {
          setAuthError(error.message);
        } else {
          router.replace("/");
        }
      } catch {
        setAuthError("Failed to sign in. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white border border-gray-200 shadow-sm">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-2xl font-bold text-gray-900 tracking-tight">
            Sign In
          </CardTitle>
          <CardDescription className="text-sm text-gray-500">
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>

        <CardContent>
          {authError && (
            <div className="mb-4 space-y-2">
              <div
                data-testid="error-auth"
                className="rounded-lg bg-red-50 p-3 text-sm text-red-700 border border-red-200 flex items-center gap-2"
              >
                <AlertCircle className="size-4 shrink-0 text-red-600" />
                <span>{authError}</span>
              </div>
              {authError.toLowerCase().includes("invalid") && (
                <div className="rounded-lg bg-amber-50 p-3 text-xs text-amber-800 border border-amber-200 flex items-start gap-2">
                  <Mail className="size-4 shrink-0 text-amber-600 mt-0.5" />
                  <div>
                    <p className="font-semibold">Having trouble signing in?</p>
                    <p className="text-amber-700 mt-0.5">
                      If you recently registered, please check your email inbox (or Spam folder) to confirm your account.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          <form
            data-testid="login-form"
            noValidate
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-semibold text-gray-700">
                Email
              </Label>
              <div className="relative">
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
                    if (authError) setAuthError("");
                  }}
                  placeholder="you@example.com"
                  className="pr-9"
                />
                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-gray-400 pointer-events-none" />
              </div>
              {emailError && (
                <p data-testid="error-email" className="text-xs text-red-600">
                  {emailError}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-semibold text-gray-700">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  data-testid="login-password"
                  value={password}
                  onChange={(e) => {
                    const val = e.target.value;
                    setPassword(val);
                    if (passwordError && val) {
                      setPasswordError("");
                    }
                    if (authError) setAuthError("");
                  }}
                  placeholder="••••••••"
                  className="pr-9"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer focus:outline-none"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
              {passwordError && (
                <p data-testid="error-password" className="text-xs text-red-600">
                  {passwordError}
                </p>
              )}
            </div>

            <Button
              type="submit"
              data-testid="login-submit"
              disabled={loading}
              className="w-full cursor-pointer mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin mr-1.5" />
                  Signing In...
                </>
              ) : (
                "Login"
              )}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex justify-center text-sm text-gray-500 pt-0">
          <span>Don&apos;t have an account? </span>
          <Link href="/register" className="ml-1 text-blue-600 font-medium hover:underline">
            Register
          </Link>
        </CardFooter>
      </Card>

      <div className="mt-4">
        <Link href="/" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
          &larr; Back to Products
        </Link>
      </div>
    </div>
  );
}
