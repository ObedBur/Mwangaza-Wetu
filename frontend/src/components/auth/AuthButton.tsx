"use client";

import React from "react";
import { Loader2 } from "lucide-react";

interface AuthButtonProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "biometric";
  type?: "button" | "submit";
  loading?: boolean;
  onClick?: () => void;
  icon?: React.ReactNode;
  className?: string;
}

export default function AuthButton({
  children,
  variant = "primary",
  type = "button",
  loading = false,
  onClick,
  icon,
  className = "",
}: AuthButtonProps) {
  const baseStyles =
    "w-full flex items-center justify-center gap-3 py-3 px-4 rounded-lg shadow-sm text-sm font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary:
      "bg-primary hover:bg-blue-900 text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transform active:scale-[0.98] hover:scale-105",
    secondary:
      "border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-accent hover:scale-105",
    biometric:
      "border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-accent hover:scale-105",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={loading}
      className={`${baseStyles} ${variants[variant]} ${className}`}
    >
      {loading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        icon && (
          <span className="group-hover:scale-110 transition-transform">
            {icon}
          </span>
        )
      )}
      {loading ? "Loading..." : children}
    </button>
  );
}
