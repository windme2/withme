"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Layers } from "lucide-react";
import { CustomLoadingScreen } from "@/components/ui/custom-loading";
import { authApi } from "@/lib/api";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showLoadingScreen, setShowLoadingScreen] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Call Real API
      const response = await authApi.login({ email, password });

      if (response && response.token) {
        localStorage.setItem("token", response.token);
        localStorage.setItem("user", JSON.stringify(response.user));
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("userRole", response.user.role);

        setIsLoading(false);
        setShowLoadingScreen(true);

        // Simulate System Loading for transition effect
        await new Promise((resolve) => setTimeout(resolve, 1500));

        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("Invalid username or password. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Loading Overlay */}
      {showLoadingScreen && <CustomLoadingScreen />}

      {/* Main Container */}
      <div className="min-h-screen flex items-center justify-center bg-white p-4 relative overflow-hidden">
        {/* Decorative Background (Subtle) */}
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-50 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-slate-50 rounded-full blur-[100px] pointer-events-none" />

        <div className="w-full max-w-md relative z-10 flex flex-col items-center">
          {/* --- Logo Section (Monotone Blue/Slate) --- */}
          <div className="mb-8 flex flex-col items-center">
            <div className="relative w-20 h-20 flex items-center justify-center mb-4 group cursor-default">
              {/* Main Box */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl shadow-2xl flex items-center justify-center border border-blue-400/20 group-hover:scale-105 transition-transform duration-300">
                <Layers className="w-10 h-10 text-white drop-shadow-md" />
              </div>

              {/* Shine Effect */}
              <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/10 to-transparent rounded-t-2xl"></div>
            </div>

            <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-1">
              Withme
            </h1>
            <p className="text-slate-600 text-sm font-light tracking-wide uppercase">
              Inventory Management System
            </p>
          </div>

          {/* --- Login Card --- */}
          <Card className="w-full border border-slate-200 shadow-2xl bg-white">
            <CardHeader className="text-center pb-2 space-y-1">
              <CardTitle className="text-xl font-medium text-slate-900">
                Login
              </CardTitle>
              <p className="text-slate-600 text-xs">
                Enter your credentials to access the dashboard
              </p>
            </CardHeader>

            <CardContent className="mt-4">
              <form onSubmit={handleLogin} className="space-y-5">
                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm text-slate-700">
                    Username / Email
                  </Label>
                  <div className="relative">
                    <Input
                      id="email"
                      type="text"
                      placeholder="Enter your username"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-11 pl-4 bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20 transition-all"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label
                      htmlFor="password"
                      className="text-sm text-slate-700"
                    >
                      Password
                    </Label>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-11 pl-4 bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20 transition-all"
                    disabled={isLoading}
                  />
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="remember"
                      checked={rememberMe}
                      onCheckedChange={(checked) =>
                        setRememberMe(checked as boolean)
                      }
                      disabled={isLoading}
                      className="border-slate-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                    />
                    <Label
                      htmlFor="remember"
                      className="text-slate-700 font-normal cursor-pointer hover:text-slate-900 transition-colors"
                    >
                      Remember me
                    </Label>
                  </div>
                </div>

                {/* Button */}
                <Button
                  type="submit"
                  className="w-full h-11 bg-blue-600 hover:bg-blue-500 text-white font-medium shadow-lg shadow-blue-900/20 border-0 transition-all duration-300 hover:scale-[1.02]"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* --- Footer --- */}
          <div className="mt-8 text-center">
            <p className="text-slate-600 text-xs font-medium tracking-wide">
              © 2025 Withme | All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
