'use client'

import { ArrowLeft, FileText, Plus } from 'lucide-react';

interface RetraitsHeaderProps {
  onCreateClick: () => void;
}

export default function RetraitsHeader({ onCreateClick }: RetraitsHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div>
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
          <span>Gestion Financière</span>
          <span className="text-slate-400">/</span>
          <span className="text-primary font-medium">Retraits</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Gestion des Retraits
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Surveillez et validez les sorties de fonds en temps réel.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <a
          href="/dashboard"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour
        </a>
        <button
          type="button"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
        >
          <FileText className="w-4 h-4" />
          Export PDF
        </button>
        <button
          type="button"
          onClick={onCreateClick}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-white text-sm font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all"
        >
          <Plus className="w-4 h-4" />
          Nouveau Retrait
        </button>
      </div>
    </div>
  );
}
