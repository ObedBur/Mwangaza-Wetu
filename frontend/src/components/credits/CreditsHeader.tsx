'use client'

import { FileText, Plus } from 'lucide-react';

interface CreditsHeaderProps {
  onCreateClick: () => void;
}

export default function CreditsHeader({ onCreateClick }: CreditsHeaderProps) {
  return (
    <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-1">
          <span>Mwangaza Wetu</span>
          <span className="text-slate-400">/</span>
          <span className="font-medium text-slate-900 dark:text-white">Finance</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
          Gestion des Crédits
        </h2>
        <p className="text-slate-500 dark:text-slate-400">
          Vue d&apos;ensemble et gestion des dossiers de crédit.
        </p>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="flex items-center gap-2 px-4 h-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-sm font-semibold rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
        >
          <FileText className="w-4 h-4" />
          Export PDF
        </button>
        <button
          type="button"
          onClick={onCreateClick}
          className="flex items-center gap-2 px-5 h-10 bg-primary hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-md shadow-primary/20"
        >
          <Plus className="w-4 h-4" />
          Nouveau Crédit
        </button>
      </div>
    </header>
  );
}
