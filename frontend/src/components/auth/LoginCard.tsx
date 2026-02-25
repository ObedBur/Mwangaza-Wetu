'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import AuthForm from './AuthForm';

export default function LoginCard() {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (formData: {
    accountNumber: string;
    password: string;
  }) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log('Login attempt:', formData);
      // Handle login logic here
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="w-full max-w-md mx-auto bg-white dark:bg-[#1A202C] rounded-2xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800 relative z-10 transform transition-all duration-300 hover:shadow-3xl">
      {/* Decorative Top Bar */}
      <div className="h-1 w-full bg-linear-to-r from-primary via-emerald-accent to-primary"></div>

      <div className="p-6 sm:p-8 md:p-10">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-24 w-24 mb-4">
            <Image
              src="/logo.jpg"
              alt="Mwangaza Wetu Logo"
              width={96}
              height={96}
              className="object-contain"
              priority
            />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Secure Member Portal
            
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Please enter your credentials to access your finances.
          </p>
        </div>

        {/* Auth Form */}
        <AuthForm onSubmit={handleSubmit} isLoading={isLoading} />
      </div>

      {/* Footer */}
      <div className="px-6 sm:px-8 py-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-800 text-center">
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
          Not a member yet?{' '}
          <a
            href="#"
            className="font-medium text-primary hover:text-emerald-accent dark:text-blue-400 transition-colors duration-200"
          >
            Register for Online Banking
          </a>
        </p>
      </div>
    </main>
  );
}
