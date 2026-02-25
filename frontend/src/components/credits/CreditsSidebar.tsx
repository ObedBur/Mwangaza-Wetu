'use client'

import { LogOut, LayoutDashboard, CreditCard, Users, BarChart3, Settings } from 'lucide-react';

export default function CreditsSidebar() {
  return (
    <aside className="w-full md:w-[280px] flex-shrink-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col h-screen overflow-y-auto sticky top-0 z-20">
      <div className="p-6 flex flex-col gap-6 flex-1">
        {/* User Profile */}
        <div className="flex items-center gap-4 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0 border-2 border-primary/20">
            MW
          </div>
          <div className="flex flex-col overflow-hidden">
            <h1 className="text-sm font-semibold truncate text-slate-900 dark:text-white">Mwangaza Wetu</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">Admin Finance</p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex flex-col gap-2">
          <a
            href="/dashboard"
            className="flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors group"
          >
            <LayoutDashboard className="w-5 h-5 text-slate-400 group-hover:text-primary transition-colors" />
            <span className="text-sm font-medium">Tableau de bord</span>
          </a>
          <a
            href="/dashboard/credits"
            className="flex items-center gap-3 px-4 py-3 bg-primary/10 text-primary rounded-lg transition-colors"
          >
            <CreditCard className="w-5 h-5" />
            <span className="text-sm font-bold">Gestion des Crédits</span>
          </a>
          <a
            href="/dashboard/members"
            className="flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors group"
          >
            <Users className="w-5 h-5 text-slate-400 group-hover:text-primary transition-colors" />
            <span className="text-sm font-medium">Membres</span>
          </a>
          <a
            href="#"
            className="flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors group"
          >
            <BarChart3 className="w-5 h-5 text-slate-400 group-hover:text-primary transition-colors" />
            <span className="text-sm font-medium">Rapports</span>
          </a>
          <a
            href="#"
            className="flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors group"
          >
            <Settings className="w-5 h-5 text-slate-400 group-hover:text-primary transition-colors" />
            <span className="text-sm font-medium">Paramètres</span>
          </a>
        </nav>
      </div>

      <div className="p-6">
        <button className="w-full flex items-center justify-center gap-2 h-10 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg transition-colors text-sm font-medium">
          <LogOut className="w-4 h-4" />
          <span>Déconnexion</span>
        </button>
      </div>
    </aside>
  );
}
