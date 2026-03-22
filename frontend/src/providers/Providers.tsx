"use client";

import React from "react";
import QueryProvider from "./QueryProvider";
import { AuthProvider } from "./AuthProvider";
import { Toaster } from "@/components/ui/toaster";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <React.Suspense fallback={null}>
      <QueryProvider>
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </QueryProvider>
    </React.Suspense>
  );
}
