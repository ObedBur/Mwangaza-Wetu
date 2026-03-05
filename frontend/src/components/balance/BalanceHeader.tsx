'use client'

import { RefreshCw, Plus, Download } from 'lucide-react';

interface BalanceHeaderProps {
  onCreateClick: () => void;
}

export default function BalanceHeader({ onCreateClick }: BalanceHeaderProps) {
  return (
    <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 border-b border-slate-100 dark:border-slate-800/50">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2 h-6 bg-primary rounded-full" />
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Solde Total
          </h1>
        </div>
        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium ml-4">
          Vue consolidée de tous les comptes et soldes financiers
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex bg-slate-100 dark:bg-slate-800/50 p-1 rounded-xl border border-slate-200 dark:border-slate-700/50 shadow-inner">
          <button
            type="button"
            className="inline-flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 hover:shadow-sm transition-all"
            title="Rafraîchir les données"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline uppercase tracking-tighter">Actualiser</span>
          </button>
          <button
            type="button"
            className="inline-flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 hover:shadow-sm transition-all border-l border-slate-200 dark:border-slate-700"
            title="Exporter les rapports"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline uppercase tracking-tighter">Exporter</span>
          </button>
        </div>

        <button
          type="button"
          onClick={onCreateClick}
          className="group inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-sm font-black hover:bg-primary dark:hover:bg-primary hover:text-white dark:hover:text-white transition-all shadow-lg hover:shadow-primary/30"
        >
          <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
          <span className="uppercase tracking-tight text-xs">Ouvrir un Compte</span>
        </button>
      </div>
    </header>
  );
}
