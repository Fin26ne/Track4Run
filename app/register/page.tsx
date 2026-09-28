"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
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

export default function RegisterPage() {
  // form input state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // error state
  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  // success message state
  const [successMessage, setSuccessMessage] = useState("");

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
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

    // if all valid, show success and clear errors
    if (!hasError) {
      setNameError("");
      setEmailError("");
      setPasswordError("");
      setConfirmPasswordError("");
      setSuccessMessage("Registration successful (demo)");
    } else {
      setSuccessMessage("");
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white border border-gray-200">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-2xl font-bold text-gray-900">
            Create an Account
          </CardTitle>
          <CardDescription className="text-sm text-gray-500">
            Sign up to start shopping our handcrafted candles
          </CardDescription>
        </CardHeader>

        <CardContent>
          {successMessage && (
            <div
              data-testid="form-success"
              className="mb-4 rounded-md bg-green-50 p-3 text-sm text-green-700 border border-green-200"
            >
              {successMessage}
            </div>
          )}

          <form
            data-testid="register-form"
            noValidate
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            <div className="space-y-1">
              <Label htmlFor="name">Full Name</Label>
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
                }}
                placeholder="Jane Doe"
              />
              {nameError && (
                <p data-testid="error-name" className="text-xs text-red-600">
                  {nameError}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="email">Email</Label>
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
                }}
                placeholder="••••••••"
              />
              {passwordError && (
                <p data-testid="error-password" className="text-xs text-red-600">
                  {passwordError}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input
                id="confirm-password"
                type="password"
                data-testid="register-confirm-password"
                value={confirmPassword}
                onChange={(e) => {
                  const val = e.target.value;
                  setConfirmPassword(val);
                  if (confirmPasswordError && val && val === password) {
                    setConfirmPasswordError("");
                  }
                }}
                placeholder="••••••••"
              />
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
              className="w-full cursor-pointer"
            >
              Register
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex justify-center text-sm text-gray-500 pt-0">
          <span>Already have an account? </span>
          <Link href="/login" className="ml-1 text-blue-600 hover:underline">
            Login
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
