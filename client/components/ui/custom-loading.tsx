// Custom Loading Animation Component
"use client";

import React, { useEffect, useState } from "react";

// --- ส่วนของ Loading Component (ตัวหมุนๆ) ---
interface CustomLoadingProps {
  className?: string;
  showBar?: boolean;
}

export function CustomLoading({
  className = "",
  showBar = true,
}: CustomLoadingProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-10 ${className}`}
    >
      {/* Loader SVG */}
      <div className="loader-container">
        <svg className="loader-active-path" viewBox="0 0 60 60">
          <g fill="none">
            <rect x="5" y="5" width="50" height="50" rx="5" />
          </g>
        </svg>
        <svg className="loader-bg-path" viewBox="0 0 60 60">
          <g fill="none">
            <rect x="8" y="8" width="44" height="44" rx="4" />
          </g>
        </svg>
      </div>

      {/* Loading Bar */}
      {showBar && (
        <div className="w-64 space-y-3 text-center animate-pulse">
          <div className="h-1.5 w-full rounded-full loader-bar-track border border-slate-700/30">
            <div className="loader-bar-thumb rounded-full"></div>
          </div>
          <p className="text-sm text-slate-400 font-medium tracking-wider uppercase">
            Loading Resource...
          </p>
        </div>
      )}
    </div>
  );
}

export function CustomLoadingScreen() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div
      className={`
        fixed inset-0 z-[9999] flex items-center justify-center 
        transition-opacity duration-700 ease-in-out bg-white
        ${isVisible ? "opacity-100" : "opacity-0"}
      `}
    >
      <div
        className={`relative z-10 transition-transform duration-700 ${
          isVisible ? "scale-100" : "scale-95"
        }`}
      >
        <CustomLoading />
      </div>
    </div>
  );
}
