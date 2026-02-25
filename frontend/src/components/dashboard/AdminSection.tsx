'use client';

import React from 'react';
import { DollarSign, Wallet } from 'lucide-react';

interface AdminCard {
  title: string;
  description: string;
  icon: React.ReactNode;
  buttons: Array<{
    label: string;
    icon: React.ReactNode;
    onClick?: () => void;
    variant?: 'primary' | 'secondary';
  }>;
}

export default function AdminSection() {
  const adminCards: AdminCard[] = [
    {
      title: 'Paiement des salaires',
      description:
        'Effectuer le versement du salaire mensuel ou des primes exceptionnelles aux employés et agents de la coopérative.',
      icon: <DollarSign className="w-[120px] h-[120px]" />,
      buttons: [
        {
          label: 'Verser un salaire',
          icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" /></svg>,
          variant: 'primary',
        },
        {
          label: 'Historique des paiements',
          icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M13 3a9 9 0 0 0-9 9H1l3.89 3.89.07 1.04L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42A8.954 8.954 0 0 0 13 21a9 9 0 0 0 9-9 9 9 0 0 0-9-9zm3.5 4v5l4.28 2.54.46.79-1.42 1.42-.79-.46L12 12.35V7h1.5z" /></svg>,
          variant: 'secondary',
        },
      ],
    },
    {
      title: 'Retrait de salaire',
      description:
        'Permettre aux membres de retirer tout ou une partie de leur salaire versé via leur compte coopérative.',
      icon: <Wallet className="w-[120px] h-[120px]" />,
      buttons: [
        {
          label: 'Retrait de salaire',
          icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 12h-2v-2h-3v2h-2v-2h-3v2H5v2h2v3H5v2h2v3h3v-3h2v3h3v-3h2v-3h2v-2zm-7 2h-2v-3h2v3z" /></svg>,
          variant: 'primary',
        },
        {
          label: 'Historique des retraits',
          icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M13 3a9 9 0 0 0-9 9H1l3.89 3.89.07 1.04L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42A8.954 8.954 0 0 0 13 21a9 9 0 0 0 9-9 9 9 0 0 0-9-9zm3.5 4v5l4.28 2.54.46.79-1.42 1.42-.79-.46L12 12.35V7h1.5z" /></svg>,
          variant: 'secondary',
        },
      ],
    },
  ];

  return (
    <section>
      <h2 className="text-base sm:text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-4 sm:mb-6">
        <svg
          className="w-4 sm:w-5 h-4 sm:h-5 text-primary flex-shrink-0"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 6 15.5 6 14 6.67 14 7.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 6 8.5 6 7 6.67 7 7.5 7.67 9 8.5 9zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
        </svg>
        Gestion Administrative
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        {adminCards.map((card) => (
            <div key={card.title} className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-xl sm:rounded-2xl custom-shadow border border-slate-100 dark:border-slate-700 relative overflow-hidden group">
            <div className="absolute -right-10 -top-10 text-slate-50 dark:text-slate-700 group-hover:text-primary/5 transition-colors opacity-30">
              {card.icon}
            </div>
            <div className="relative">
              <h3 className="text-lg sm:text-xl font-bold mb-2">{card.title}</h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mb-6 sm:mb-8 max-w-sm">
                {card.description}
              </p>
              <div className="flex flex-wrap gap-2 sm:gap-4">
                {card.buttons.map((button) => (
        <button
                    key={button.label}
                    className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg font-semibold text-xs sm:text-sm flex items-center gap-2 transition-all whitespace-nowrap ${
                      button.variant === 'primary'
                        ? 'bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-600'
                    }`}
                    onClick={button.onClick}
                  >
                    {button.icon}
                    <span className="hidden sm:inline">{button.label}</span>
                    <span className="sm:hidden text-[10px]">{button.label.split(' ')[0]}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
