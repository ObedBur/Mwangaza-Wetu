// 
'use client'

import { Home, Users, PiggyBank, ArrowRight, Wallet, Receipt, CreditCard, Settings, BarChart3, Store } from 'lucide-react';

export default function BalanceSidebar() {
  const navItems = [
    { icon: Home, label: 'Tableau de bord', href: '/dashboard', active: false },
    { icon: Users, label: 'Membres', href: '/dashboard/members', active: false },
    { icon: PiggyBank, label: 'Épargne', href: '/dashboard/epargne', active: false },
    { icon: ArrowRight, label: 'Retraits', href: '/dashboard/retraits', active: false },
    { icon: CreditCard, label: 'Crédits', href: '/dashboard/credits', active: false },
    { icon: Receipt, label: 'Remboursements', href: '/dashboard/remboursements', active: false },
    { icon: Wallet, label: 'Solde Total', href: '/dashboard/balance', active: true },
    { icon: BarChart3, label: 'Comptabilité', href: '/dashboard/comptabilite', active: false },
    { icon: Store, label: 'Guichets', href: '/dashboard/guichets', active: false },
    { icon: Settings, label: 'Paramètres', href: '/dashboard/parametres', active: false },
  ];
  
  return (
    <aside className="w-full md:w-64 bg-slate-900 text-slate-300 flex-shrink-0 flex flex-col h-auto md:h-screen sticky top-0">
      <div className="p-6 flex items-center gap-3 border-b border-slate-800">
        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
          <Wallet className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-white font-bold text-lg leading-tight">Mwangaza</h1>
          <p className="text-xs text-slate-400">Gestion des Soldes</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <a
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                item.active
                  ? 'bg-primary/10 text-primary border border-primary/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span className="truncate">{item.label}</span>
            </a>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
          <p className="text-xs text-slate-500 mb-1">État du système</p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm font-medium text-slate-300">Opérationnel</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
