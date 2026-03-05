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
    <aside className="w-full md:w-64 bg-slate-900 text-slate-300 flex-shrink-0 flex flex-col h-auto md:h-screen sticky top-0 border-r border-slate-800 shadow-2xl">
      <div className="p-8 flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-lg shadow-primary/20 rotate-3 group-hover:rotate-0 transition-transform">
          <Wallet className="w-7 h-7 text-white" />
        </div>
        <div>
          <h1 className="text-white font-black text-xl tracking-tighter uppercase leading-none">Mwangaza</h1>
          <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1">Wetu System</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <a
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-[13px] font-bold transition-all duration-300 ${item.active
                  ? 'bg-white dark:bg-white text-slate-900 shadow-xl shadow-white/5'
                  : 'text-slate-500 hover:text-white hover:bg-slate-800/50'
                }`}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 ${item.active ? 'text-primary' : ''}`} />
              <span className="truncate tracking-tight uppercase tracking-tighter">{item.label}</span>
            </a>
          );
        })}
      </nav>

      <div className="p-6">
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900 rounded-3xl p-5 border border-slate-800/50 shadow-inner group/status">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Live Status</p>
          <div className="flex items-center gap-3">
            <div className="relative">
              <span className="w-3 h-3 rounded-full bg-emerald-500 block" />
              <span className="absolute inset-0 w-3 h-3 rounded-full bg-emerald-500 animate-ping opacity-75" />
            </div>
            <span className="text-xs font-black text-slate-300 uppercase tracking-tight">Système Actif</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
