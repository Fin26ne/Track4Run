"use client";

import { useState, type FormEvent } from "react";
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
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle2, Eye, EyeOff, Loader2, Mail, User } from "lucide-react";

export default function RegisterPage() {
  const { signUp } = useAuth();

  // form input state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // error state
  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [authError, setAuthError] = useState("");

  // success message state
  const [successMessage, setSuccessMessage] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    let hasError = false;

    // check name
    if (!name.trim()) {
      setNameError("Full name is required");
      hasError = true;
    } else {
      setNameError("");
    }

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
    } else if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      hasError = true;
    } else {
      setPasswordError("");
    }

    // check confirm password
    if (!confirmPassword) {
      setConfirmPasswordError("Confirm password is required");
      hasError = true;
    } else if (confirmPassword !== password) {
      setConfirmPasswordError("Passwords do not match");
      hasError = true;
    } else {
      setConfirmPasswordError("");
    }

    // if all valid, call signUp from AuthContext
    if (!hasError) {
      setNameError("");
      setEmailError("");
      setPasswordError("");
      setConfirmPasswordError("");
      setAuthError("");
      setSuccessMessage("");
      setLoading(true);

      try {
        const { error } = await signUp(email, password);
        if (error) {
          setAuthError(error.message);
        } else {
          setSuccessMessage("Registration successful");
        }
      } catch {
        setAuthError("Failed to register. Please try again.");
      } finally {
        setLoading(false);
      }
    } else {
      setSuccessMessage("");
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white border border-gray-200 shadow-sm">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-2xl font-bold text-gray-900 tracking-tight">
            Create an Account
          </CardTitle>
          <CardDescription className="text-sm text-gray-500">
            Sign up to start shopping our handcrafted candles
          </CardDescription>
        </CardHeader>

        <CardContent>
          {authError && (
            <div
              data-testid="error-auth"
              className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 border border-red-200 flex items-center gap-2"
            >
              <AlertCircle className="size-4 shrink-0 text-red-600" />
              <span>{authError}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 space-y-2">
              <div
                data-testid="form-success"
                className="rounded-lg bg-green-50 p-3 text-sm text-green-700 border border-green-200 flex items-center gap-2"
              >
                <CheckCircle2 className="size-4 shrink-0 text-green-600" />
                <span>{successMessage}</span>
              </div>
              <div className="rounded-lg bg-blue-50 p-3 text-xs text-blue-800 border border-blue-200 flex items-start gap-2">
                <Mail className="size-4 shrink-0 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-semibold">Check your email</p>
                  <p className="text-blue-700 mt-0.5">
                    We&apos;ve sent a confirmation link to your email. Please click it to verify your account before logging in.
                  </p>
                </div>
              </div>
            </div>
          )}

          <form
            data-testid="register-form"
            noValidate
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs font-semibold text-gray-700">
                Full Name
              </Label>
              <div className="relative">
                <Input
                  id="name"
                  type="text"
                  data-testid="register-name"
                  value={name}
                  onChange={(e) => {
                    const val = e.target.value;
                    setName(val);
                    if (nameError && val.trim()) {
                      setNameError("");
                    }
                    if (authError) setAuthError("");
                  }}
                  placeholder="Jane Doe"
                  className="pr-9"
                />
                <User className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-gray-400 pointer-events-none" />
              </div>
              {nameError && (
                <p data-testid="error-name" className="text-xs text-red-600">
                  {nameError}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-semibold text-gray-700">
                Email
              </Label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  data-testid="register-email"
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
                  data-testid="register-password"
                  value={password}
                  onChange={(e) => {
                    const val = e.target.value;
                    setPassword(val);
                    if (passwordError && val.length >= 6) {
                      setPasswordError("");
                    }
                    if (confirmPasswordError && confirmPassword && val === confirmPassword) {
                      setConfirmPasswordError("");
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

            <div className="space-y-1.5">
              <Label htmlFor="confirm-password" className="text-xs font-semibold text-gray-700">
                Confirm Password
              </Label>
              <div className="relative">
                <Input
                  id="confirm-password"
                  type={showPassword ? "text" : "password"}
                  data-testid="register-confirm-password"
                  value={confirmPassword}
                  onChange={(e) => {
                    const val = e.target.value;
                    setConfirmPassword(val);
                    if (confirmPasswordError && val && val === password) {
                      setConfirmPasswordError("");
                    }
                    if (authError) setAuthError("");
                  }}
                  placeholder="••••••••"
                  className="pr-9"
                />
              </div>
              {confirmPasswordError && (
                <p
                  data-testid="error-confirm-password"
                  className="text-xs text-red-600"
                >
                  {confirmPasswordError}
                </p>
              )}
            </div>

            <Button
              type="submit"
              data-testid="register-submit"
              disabled={loading}
              className="w-full cursor-pointer mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin mr-1.5" />
                  Creating Account...
                </>
              ) : (
                "Register"
              )}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex justify-center text-sm text-gray-500 pt-0">
          <span>Already have an account? </span>
          <Link href="/login" className="ml-1 text-blue-600 font-medium hover:underline">
            Login
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
