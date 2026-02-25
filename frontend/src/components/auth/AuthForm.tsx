"use client";

import React from "react";
import { Fingerprint } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginInput } from "@/lib/validations";
import AuthInput from "./AuthInput";
import AuthButton from "./AuthButton";

interface AuthFormProps {
  onSubmit: (data: LoginInput) => void | Promise<void>;
  isLoading?: boolean;
}

export default function AuthForm({
  onSubmit,
  isLoading = false,
}: AuthFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      accountNumber: "",
      password: "",
    },
  });

  const handleBiometricLogin = () => {
    console.log("Biometric login initiated");
    // Handle biometric login
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-1">
      {/* Account Number Input */}
      <div>
        <AuthInput
          label="Member / Account Number"
          placeholder="COOP-A-001234"
          icon="badge"
          helperText="Format: COOP-A-... or COOP-M-..."
          required
          {...register("accountNumber")}
        />
        {errors.accountNumber && (
          <p className="text-red-500 text-xs mt-1">
            {errors.accountNumber.message}
          </p>
        )}
      </div>

      {/* Password Input */}
      <div>
        <AuthInput
          label="Password"
          type="password"
          placeholder="••••••••"
          icon="lock"
          showPasswordToggle
          required
          {...register("password")}
        />
        {errors.password && (
          <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
        )}
      </div>

      {/* Primary Action */}
      <AuthButton
        variant="primary"
        type="submit"
        loading={isLoading || isSubmitting}
      >
        Log In
      </AuthButton>

      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white dark:bg-[#1A202C] text-gray-500">
            Or continue with
          </span>
        </div>
      </div>

      {/* Biometric Button */}
      <AuthButton
        variant="biometric"
        type="button"
        onClick={handleBiometricLogin}
        icon={<Fingerprint className="w-5 h-5 text-emerald-accent" />}
      >
        Biometric Login
      </AuthButton>
    </form>
  );
}
