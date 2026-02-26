"use client";

import React from 'react';
import { Users, Plus, RefreshCw, AlertCircle } from 'lucide-react';

interface EmptyStateProps {
  type?: 'members' | 'savings' | 'credits' | 'general';
  title?: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  };
  onRetry?: () => void;
  isRetrying?: boolean;
}

export default function EmptyState({ 
  type = 'general', 
  title, 
  description, 
  action, 
  onRetry, 
  isRetrying = false 
}: EmptyStateProps) {
  const getEmptyStateContent = () => {
    switch (type) {
      case 'members':
        return {
          icon: <Users className="w-16 h-16 text-slate-300 dark:text-slate-600" />,
          defaultTitle: "Aucun membre pour le moment",
          defaultDescription: "Commencez par ajouter votre premier membre à la coopérative."
        };
      case 'savings':
        return {
          icon: <Users className="w-16 h-16 text-slate-300 dark:text-slate-600" />,
          defaultTitle: "Aucune épargne enregistrée",
          defaultDescription: "Les transactions d'épargne apparaîtront ici une fois ajoutées."
        };
      case 'credits':
        return {
          icon: <Users className="w-16 h-16 text-slate-300 dark:text-slate-600" />,
          defaultTitle: "Aucun crédit accordé",
          defaultDescription: "Les crédits accordés aux membres apparaîtront ici."
        };
      default:
        return {
          icon: <AlertCircle className="w-16 h-16 text-slate-300 dark:text-slate-600" />,
          defaultTitle: "Aucune donnée disponible",
          defaultDescription: "Les données apparaîtront ici une fois disponibles."
        };
    }
  };

  const content = getEmptyStateContent();

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="text-center max-w-md">
        {/* Icône */}
        <div className="flex justify-center mb-6">
          {content.icon}
        </div>

        {/* Titre */}
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
          {title || content.defaultTitle}
        </h3>

        {/* Description */}
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
          {description || content.defaultDescription}
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {action && (
            <button
              onClick={action.onClick}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors"
            >
              {action.icon || <Plus className="w-4 h-4" />}
              {action.label}
            </button>
          )}
          
          {onRetry && (
            <button
              onClick={onRetry}
              disabled={isRetrying}
              className="inline-flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-4 h-4 ${isRetrying ? 'animate-spin' : ''}`} />
              {isRetrying ? 'Actualisation...' : 'Actualiser'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Composant spécial pour l'état vide des membres
export function MembersEmptyState({ onCreateMember, onRetry, isRetrying }: { 
  onCreateMember?: () => void; 
  onRetry?: () => void; 
  isRetrying?: boolean; 
}) {
  return (
    <EmptyState
      type="members"
      action={onCreateMember ? {
        label: "Ajouter un membre",
        onClick: onCreateMember,
        icon: <Plus className="w-4 h-4" />
      } : undefined}
      onRetry={onRetry}
      isRetrying={isRetrying}
    />
  );
}

// Composant pour l'état d'erreur serveur
export function ServerErrorState({ onRetry, isRetrying }: { 
  onRetry?: () => void; 
  isRetrying?: boolean; 
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="text-center max-w-md">
        <div className="flex justify-center mb-6">
          <AlertCircle className="w-16 h-16 text-red-300 dark:text-red-600" />
        </div>
        
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
          Serveur indisponible
        </h3>
        
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
          Le serveur rencontre des difficultés techniques. Veuillez réessayer dans quelques instants.
        </p>
        
        {onRetry && (
          <button
            onClick={onRetry}
            disabled={isRetrying}
            className="inline-flex items-center gap-2 px-4 py-2 border border-red-200 dark:border-red-600 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-4 h-4 ${isRetrying ? 'animate-spin' : ''}`} />
            {isRetrying ? 'Réessayer...' : 'Réessayer'}
          </button>
        )}
      </div>
    </div>
  );
}
