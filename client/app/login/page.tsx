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

    // --- Mock Login Logic ---
    const mockCredentials = [
      { email: "wind", password: "admin123", role: "admin" },
      { email: "jame", password: "admin123", role: "admin" },
    ];

    // Simulate API Delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const user = mockCredentials.find(
      (cred) =>
        (cred.email === email || cred.email === email.toLowerCase()) &&
        cred.password === password
    );

    if (user) {
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("userEmail", user.email);
      localStorage.setItem("userRole", user.role);

      setIsLoading(false);
      setShowLoadingScreen(true);

      // Simulate System Loading
      await new Promise((resolve) => setTimeout(resolve, 2000));

      router.push("/dashboard");
    } else {
      alert("Invalid email or password. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Loading Overlay */}
      {showLoadingScreen && <CustomLoadingScreen />}

      {/* Main Container */}
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-800 via-slate-900 to-slate-950 p-4 relative overflow-hidden">
        {/* Decorative Background (Blue Only - No Purple) */}
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-slate-700/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="w-full max-w-md relative z-10 flex flex-col items-center">
          {/* --- Logo Section (Monotone Blue/Slate) --- */}
          <div className="mb-8 flex flex-col items-center">
            <div className="relative w-20 h-20 flex items-center justify-center mb-4 group cursor-default">
              {/* Layer 1: Shadow Base */}
              <div className="absolute inset-0 bg-slate-800 rounded-2xl transform rotate-6 opacity-80 blur-[1px] border border-slate-700/50 transition-transform duration-500 group-hover:rotate-12"></div>

              {/* Layer 2: Main Box */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl shadow-2xl flex items-center justify-center border border-blue-400/20 group-hover:scale-105 transition-transform duration-300">
                <Layers className="w-10 h-10 text-white drop-shadow-md" />
              </div>

              {/* Layer 3: Shine Effect */}
              <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/10 to-transparent rounded-t-2xl"></div>
            </div>

            <h1 className="text-3xl font-bold text-white tracking-tight mb-1">
              Withme
            </h1>
            <p className="text-slate-400 text-sm font-light tracking-wide uppercase">
              Inventory Management System
            </p>
          </div>

          {/* --- Login Card --- */}
          <Card className="w-full border border-slate-700/50 shadow-2xl bg-slate-900/80 backdrop-blur-xl">
            <CardHeader className="text-center pb-2 space-y-1">
              <CardTitle className="text-xl font-medium text-white">
                Login
              </CardTitle>
              <p className="text-slate-400 text-xs">
                Enter your credentials to access the dashboard
              </p>
            </CardHeader>

            <CardContent className="mt-4">
              <form onSubmit={handleLogin} className="space-y-5">
                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm text-slate-300">
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
                      className="h-11 pl-4 bg-slate-950/50 border-slate-700 text-slate-100 placeholder:text-slate-600 focus:border-blue-500 focus:ring-blue-500/20 transition-all"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label
                      htmlFor="password"
                      className="text-sm text-slate-300"
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
                    className="h-11 pl-4 bg-slate-950/50 border-slate-700 text-slate-100 placeholder:text-slate-600 focus:border-blue-500 focus:ring-blue-500/20 transition-all"
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
                      className="border-slate-600 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                    />
                    <Label
                      htmlFor="remember"
                      className="text-slate-300 font-normal cursor-pointer hover:text-white transition-colors"
                    >
                      Remember me
                    </Label>
                  </div>
                  <Link
                    href="/forgot-password"
                    className="text-blue-400 hover:text-blue-300 transition-colors font-medium"
                  >
                    Forgot password?
                  </Link>
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
            <p className="text-white text-xs font-medium tracking-wide opacity-90">
              © 2025 Withme | All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
