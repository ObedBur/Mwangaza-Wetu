'use client'

import { Save, RotateCcw } from 'lucide-react';

interface ParametresHeaderProps {
  onSave: () => void;
  onReset: () => void;
}

export default function ParametresHeader({ onSave, onReset }: ParametresHeaderProps) {
  return (
    <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          Paramètres du Système
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
          Configuration de la coopérative et préférences système
        </p>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Réinitialiser</span>
        </button>
        <button
          type="button"
          onClick={onSave}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-md shadow-primary/20"
        >
          <Save className="w-4 h-4" />
          <span>Enregistrer</span>
        </button>
      </div>
    </header>
  );
}
