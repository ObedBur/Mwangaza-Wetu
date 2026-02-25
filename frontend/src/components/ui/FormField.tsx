import React, { forwardRef, InputHTMLAttributes } from "react";
import { FieldError } from "react-hook-form";

export interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: FieldError;
  icon?: React.ReactNode;
}

export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  ({ label, error, icon, className = "", ...props }, ref) => {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">
          {label}
        </label>
        <div className="relative">
          {icon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={`w-full ${icon ? "pl-12" : "px-4"} py-3 bg-slate-50 dark:bg-slate-800 border rounded-xl focus:ring-2 transition-all outline-none font-medium ${
              error
                ? "border-red-500 focus:ring-red-500/20 focus:border-red-500 dark:border-red-500 text-red-900 dark:text-red-100"
                : "border-slate-200 dark:border-slate-700 focus:ring-primary/20 focus:border-primary/50"
            } ${className}`}
            {...props}
          />
        </div>
        {error && (
          <p className="text-red-500 text-xs mt-1 font-medium">
            {error.message}
          </p>
        )}
      </div>
    );
  },
);

FormField.displayName = "FormField";
