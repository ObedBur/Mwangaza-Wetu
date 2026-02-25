'use client'

import { RefreshCw, FileText, Download, Plus } from 'lucide-react';

interface ComptabiliteHeaderProps {
  onCreateClick: () => void;
}

export default function ComptabiliteHeader({ onCreateClick }: ComptabiliteHeaderProps) {
  return (
    <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          Journal des Opérations
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
          Suivi et gestion des écritures comptables en temps réel
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
        >
          <RefreshCw className="w-4 h-4" />
          <span className="hidden sm:inline">Rafraîchir</span>
        </button>
        <button
          type="button"
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
        >
          <FileText className="w-4 h-4" />
          <span className="hidden sm:inline">PDF</span>
        </button>
        <button
          type="button"
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
        >
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">Excel</span>
        </button>
        <button
          type="button"
          onClick={onCreateClick}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-md shadow-primary/20 ml-2"
        >
          <Plus className="w-4 h-4" />
          <span>Nouvel Écrit</span>
        </button>
      </div>
    </header>
  );
}
