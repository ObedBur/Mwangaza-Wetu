"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Home,
  Users,
  PiggyBank,
  ArrowRight,
  Wallet,
  Receipt,
  CreditCard,
  Settings,
  BarChart3,
  Store,
  LayoutDashboard,
} from "lucide-react";

const navItems = [
  { icon: Home, label: "Tableau de bord", href: "/dashboard" },
  { icon: Users, label: "Membres", href: "/dashboard/members" },
  { icon: PiggyBank, label: "Épargne", href: "/dashboard/epargne" },
  { icon: ArrowRight, label: "Retraits", href: "/dashboard/retraits" },
  { icon: CreditCard, label: "Crédits", href: "/dashboard/credits" },
  { icon: Receipt, label: "Remboursements", href: "/dashboard/remboursements" },
  { icon: Wallet, label: "Solde Total", href: "/dashboard/balance" },
  { icon: BarChart3, label: "Comptabilité", href: "/dashboard/comptabilite" },
  { icon: Store, label: "Guichets", href: "/dashboard/guichets" },
  { icon: Settings, label: "Paramètres", href: "/dashboard/parametres" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-full md:w-64 bg-slate-900 text-slate-300 shrink-0 flex flex-col h-auto md:h-screen sticky top-0 z-40">
      <div className="p-6 flex items-center gap-3 border-b border-slate-800">
        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
          <LayoutDashboard className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-white font-bold text-lg leading-tight tracking-tight">
            Mwangaza
          </h1>
          <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">
            Administration
          </p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1 custom-scrollbar">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${
                isActive
                  ? "bg-primary text-white shadow-md shadow-primary/20"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              <Icon
                className={`w-5 h-5 shrink-0 ${isActive ? "text-white" : "text-slate-500 group-hover:text-slate-300"}`}
              />
              <span className="truncate">{item.label}</span>
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white opacity-50" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/50 backdrop-blur-sm">
          <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-2">
            État du système
          </p>
          <div className="flex items-center gap-2">
            <div className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </div>
            <span className="text-xs font-semibold text-slate-300">
              Serveur Opérationnel
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
