'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import AuthForm from './AuthForm';
import { authService } from '@/services/auth.service';
import { useAuth } from '@/providers/AuthProvider';
import { useToast } from '@/hooks/use-toast';
import { LoginInput } from '@/lib/validations';

export default function LoginCard() {
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const { error: toastError, success: toastSuccess } = useToast();

  const handleSubmit = async (formData: LoginInput) => {
    setIsLoading(true);
    try {
      const response = await authService.login(formData);

      // Enregistrement dans le contexte d'auth (cookies + redirection)
      login(response.token, {
        id: response.user.id,
        email: response.user.email,
        role: response.user.role,
      });

      toastSuccess('Connexion réussie', `Bienvenue ${response.user.nom_complet || response.user.email}`);
    } catch (err: any) {
      console.error('Login error:', err);
      // Extraction du message d'erreur normalisé par l'apiClient
      const message = err.message || 'Une erreur est survenue';
      toastError('Échec de connexion', message);
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
            Membre se connecter
            
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Veuillez entrer vos identifiants pour accéder à votre compte.
          </p>
        </div>

        {/* Auth Form */}
        <AuthForm onSubmit={handleSubmit} isLoading={isLoading} />
      </div>

      {/* Footer */}
      <div className="px-6 sm:px-8 py-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-800 text-center">
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
          Pas encore membre?{' '}
          <a
            href="#"
            className="font-medium text-primary hover:text-emerald-accent dark:text-blue-400 transition-colors duration-200"
          >
            S'inscrire
          </a>
        </p>
      </div>
    </main>
  );
}
