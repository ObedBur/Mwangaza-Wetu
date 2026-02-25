"use client";

import { RefreshCw, Download, Plus } from "lucide-react";

interface RapportsHeaderProps {
  onCreateClick: () => void;
}

export default function RapportsHeader({ onCreateClick }: RapportsHeaderProps) {
  return (
    <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          Centre de Rapports
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
          Génération et gestion des rapports institutionnels
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
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">Export Tous</span>
        </button>
        <button
          type="button"
          onClick={onCreateClick}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-md shadow-primary/20 ml-2"
        >
          <Plus className="w-4 h-4" />
          <span>Nouveau Rapport</span>
        </button>
      </div>
    </header>
  );
}
