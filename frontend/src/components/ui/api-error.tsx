"use client";

import React from 'react';
import { AlertTriangle, Wifi, WifiOff, RefreshCw } from 'lucide-react';

interface ApiErrorProps {
  error?: Error | string;
  onRetry?: () => void;
  isRetrying?: boolean;
  type?: 'network' | 'server' | 'validation' | 'general';
}

export default function ApiError({ 
  error, 
  onRetry, 
  isRetrying = false, 
  type = 'general' 
}: ApiErrorProps) {
  const getErrorIcon = () => {
    switch (type) {
      case 'network':
        return <WifiOff className="w-5 h-5 text-red-500" />;
      case 'server':
        return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
    }
  };

  const getErrorMessage = () => {
    if (typeof error === 'string') return error;
    if (error?.message) return error.message;
    
    switch (type) {
      case 'network':
        return 'Erreur de connexion. Vérifiez votre connexion internet.';
      case 'server':
        return 'Le serveur est temporairement indisponible. Veuillez réessayer plus tard.';
      case 'validation':
        return 'Les données soumises sont invalides. Veuillez vérifier les champs.';
      default:
        return 'Une erreur est survenue. Veuillez réessayer.';
    }
  };

  const getErrorTitle = () => {
    switch (type) {
      case 'network':
        return 'Problème de connexion';
      case 'server':
        return 'Erreur serveur';
      case 'validation':
        return 'Erreur de validation';
      default:
        return 'Erreur';
    }
  };

  return (
    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          {getErrorIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-red-800 dark:text-red-200 mb-1">
            {getErrorTitle()}
          </h4>
          <p className="text-sm text-red-700 dark:text-red-300">
            {getErrorMessage()}
          </p>
          {onRetry && (
            <div className="mt-3">
              <button
                onClick={onRetry}
                disabled={isRetrying}
                className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw className={`w-3 h-3 ${isRetrying ? 'animate-spin' : ''}`} />
                {isRetrying ? 'Réessayer...' : 'Réessayer'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Composant pour les erreurs de chargement
export function LoadingError({ onRetry, isRetrying }: { onRetry?: () => void; isRetrying?: boolean }) {
  return (
    <ApiError
      type="network"
      onRetry={onRetry}
      isRetrying={isRetrying}
      error="Impossible de charger les données. Veuillez réessayer."
    />
  );
}

// Composant pour les erreurs de sauvegarde
export function SaveError({ onRetry, isRetrying }: { onRetry?: () => void; isRetrying?: boolean }) {
  return (
    <ApiError
      type="server"
      onRetry={onRetry}
      isRetrying={isRetrying}
      error="Impossible d'enregistrer les modifications. Veuillez réessayer."
    />
  );
}
