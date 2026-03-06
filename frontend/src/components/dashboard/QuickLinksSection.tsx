'use client';

import React from 'react';
import {
  Users,
  BarChart3,
  CreditCard,
  PiggyBank,
  Receipt,
  Wallet,
  FileText,
  LucideIcon,
} from 'lucide-react';

interface QuickLink {
  icon: LucideIcon;
  label: string;
  href: string;
}

const quickLinks: QuickLink[] = [
  { icon: Users, label: 'Membres', href: '/dashboard/members' },
  { icon: BarChart3, label: 'Épargnes', href: '/dashboard/épargne' },
  { icon: CreditCard, label: 'Retraits', href: '/dashboard/retraits' },
  { icon: PiggyBank, label: 'Crédits', href: '/dashboard/credits' },
  { icon: Receipt, label: 'Remboursements', href: '/dashboard/remboursements' },
  { icon: Wallet, label: 'Solde Total', href: '/dashboard/balance' },
  { icon: FileText, label: 'Rapport', href: '/dashboard/rapports' },
];

export default function QuickLinksSection() {
  return (
    <section>
      <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-6">
        <svg
          className="w-5 h-5 text-primary"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
        </svg>
        Section Caisse - Actions Rapides
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2 sm:gap-3 md:gap-4">
        {quickLinks.map((link) => {
          const Icon = link.icon;
          return (
            <a
              key={link.label}
              className="glossy-card group flex flex-col items-center justify-center p-4 sm:p-5 text-center border-t border-white/60 dark:border-white/5 hover:border-primary/50 hover:shadow-[0_0_25px_rgba(30,59,138,0.15)] dark:hover:shadow-[0_0_25px_rgba(30,59,138,0.3)] transition-all duration-300"
              href={link.href}
            >
              <div className="bg-primary/5 dark:bg-primary/20 p-2.5 sm:p-3 rounded-xl mb-3 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                <Icon className="w-6 sm:w-7 h-6 sm:h-7 text-primary group-hover:text-white transition-colors duration-300" />
              </div>
              <span className="text-[10px] sm:text-xs font-bold text-slate-700 dark:text-slate-200 text-center line-clamp-2 group-hover:text-primary dark:group-hover:text-primary-300 transition-colors">
                {link.label}
              </span>
            </a>
          );
        })}
      </div>
    </section>
  );
}
