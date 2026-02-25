"use client";

import React, { useState, forwardRef } from "react";
import { User, Lock, Eye, EyeOff, Info } from "lucide-react";

interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: "badge" | "lock";
  helperText?: string;
  showPasswordToggle?: boolean;
}

const iconMap: { [key: string]: React.ReactNode } = {
  badge: <User className="w-4 h-4" />,
  lock: <Lock className="w-4 h-4" />,
};

const AuthInput = forwardRef<HTMLInputElement, AuthInputProps>(
  (
    {
      label,
      name,
      type = "text",
      placeholder,
      icon,
      helperText,
      showPasswordToggle = false,
      required = false,
      ...props
    },
    ref,
  ) => {
    const [showPassword, setShowPassword] = useState(false);

    const inputType =
      type === "password" && showPasswordToggle
        ? showPassword
          ? "text"
          : "password"
        : type;

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label
            htmlFor={name}
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
          {type === "password" && (
            <a
              href="#"
              className="text-xs font-medium text-primary hover:text-emerald-accent dark:text-blue-400 transition-colors"
            >
              Forgot Password?
            </a>
          )}
        </div>

        <div className="relative group">
          {icon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-400 group-focus-within:text-primary transition-colors">
                {iconMap[icon] || icon}
              </span>
            </div>
          )}

          <input
            id={name}
            name={name}
            type={inputType}
            placeholder={placeholder}
            ref={ref}
            {...props}
            className="block w-full pl-10 pr-10 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm sm:text-base placeholder-gray-400 transition duration-200 ease-in-out transform focus:scale-105"
          />

          {showPasswordToggle && type === "password" && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          )}
        </div>

        {helperText && (
          <p className="text-xs text-gray-500 dark:text-gray-500 flex items-center gap-1">
            <Info className="w-4 h-4" />
            {helperText}
          </p>
        )}
      </div>
    );
  },
);

AuthInput.displayName = "AuthInput";

export default AuthInput;
