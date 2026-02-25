'use client'

import { Plus, ArrowLeft } from 'lucide-react';

interface DepositsHeaderProps {
  onCreateClick: () => void;
}

export default function DepositsHeader({ onCreateClick }: DepositsHeaderProps) {
  return (
    <div className="flex flex-col gap-3 sm:gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-lg text-primary font-bold">$</div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Gestion des Dépôts</h1>
            <p className="text-xs sm:text-sm text-slate-500">Historique et saisie des dépôts d&apos;épargne</p>
          </div>
        </div>

        <div className="flex flex-col xs:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={onCreateClick}
            className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-2.5 rounded-lg font-semibold text-sm transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Ajouter
          </button>

          <a
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 px-4 py-2.5 rounded-lg font-semibold text-sm transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </a>
        </div>
      </div>
    </div>
  );
}
