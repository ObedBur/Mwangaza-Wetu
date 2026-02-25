'use client'

import { LogOut, LayoutDashboard, CreditCard, Users, BookOpen, BarChart3, Settings, Store } from 'lucide-react';

export default function GuichetsSidebar() {
  return (
    <aside className="hidden lg:flex w-64 flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 h-screen sticky top-0">
      <div className="flex h-20 items-center gap-3 px-6 border-b border-slate-100 dark:border-slate-800">
        <div className="bg-center bg-no-repeat bg-cover rounded-full h-10 w-10 shrink-0 bg-slate-200" />
        <div className="flex flex-col">
          <h1 className="text-slate-900 dark:text-white text-sm font-bold leading-tight">Mwangaza Wetu</h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs font-medium">Admin Panel</p>
        </div>
      </div>
      
      <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
        <a
          href="/dashboard"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-primary transition-colors group"
        >
          <LayoutDashboard className="w-5 h-5 text-slate-400 group-hover:text-primary transition-colors" />
          <span className="text-sm font-medium">Tableau de bord</span>
        </a>
        <a
          href="/dashboard/guichets"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-primary/10 text-primary"
        >
          <Store className="w-5 h-5 text-primary" />
          <span className="text-sm font-medium">Guichets</span>
        </a>
        <a
          href="/dashboard/credits"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-primary transition-colors group"
        >
          <CreditCard className="w-5 h-5 text-slate-400 group-hover:text-primary transition-colors" />
          <span className="text-sm font-medium">Crédits</span>
        </a>
        <a
          href="/dashboard/remboursements"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-primary transition-colors group"
        >
          <CreditCard className="w-5 h-5 text-slate-400 group-hover:text-primary transition-colors" />
          <span className="text-sm font-medium">Remboursements</span>
        </a>
        <a
          href="/dashboard/comptabilite"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-primary transition-colors group"
        >
          <BookOpen className="w-5 h-5 text-slate-400 group-hover:text-primary transition-colors" />
          <span className="text-sm font-medium">Comptabilité</span>
        </a>
        <a
          href="/dashboard/members"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-primary transition-colors group"
        >
          <Users className="w-5 h-5 text-slate-400 group-hover:text-primary transition-colors" />
          <span className="text-sm font-medium">Membres</span>
        </a>
        <a
          href="/dashboard/rapports"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-primary transition-colors group"
        >
          <BarChart3 className="w-5 h-5 text-slate-400 group-hover:text-primary transition-colors" />
          <span className="text-sm font-medium">Rapports</span>
        </a>
        <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
          <a
            href="/dashboard/parametres"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-primary transition-colors group"
          >
            <Settings className="w-5 h-5 text-slate-400 group-hover:text-primary transition-colors" />
            <span className="text-sm font-medium">Paramètres</span>
          </a>
        </div>
      </nav>
      
      <div className="p-4 border-t border-slate-100 dark:border-slate-800">
        <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-slate-100 dark:bg-slate-800 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
          <LogOut className="w-4 h-4" />
          <span>Déconnexion</span>
        </button>
      </div>
    </aside>
  );
}
