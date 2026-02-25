'use client';

import React from 'react';
import { BarChart3 } from 'lucide-react';

export default function DashboardFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 mt-8 sm:mt-12">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-6 sm:py-8 flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6 text-center sm:text-left">
        <div className="flex items-center gap-2 justify-center sm:justify-start">
          <BarChart3 className="w-4 sm:w-5 h-4 sm:h-5 text-primary flex-shrink-0" />
          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm">
            © {year} Mwangaza Wetu. Tous droits réservés.
          </p>
        </div>
        <div className="flex items-center gap-6 sm:gap-8 text-xs sm:text-sm flex-wrap justify-center">
          <a
            className="font-medium text-slate-600 dark:text-slate-400 hover:text-primary transition-colors"
            href="#"
          >
            À propos
          </a>
          <a
            className="font-medium text-slate-600 dark:text-slate-400 hover:text-primary transition-colors"
            href="#"
          >
            Support
          </a>
          <a
            className="font-medium text-slate-600 dark:text-slate-400 hover:text-primary transition-colors"
            href="#"
          >
            Confidentialité
          </a>
        </div>
      </div>
    </footer>
  );
}
