"use client";

import { TrendingUp, TrendingDown, Landmark, Wallet } from "lucide-react";

interface OverviewData {
  totalEpargne: { usd: number; fc: number };
  totalRetrait: { usd: number; fc: number };
  totalCredits: { usd: number; fc: number };
  totalRemboursements: { usd: number; fc: number };
}

export default function BalancesByTypeSection({ overview }: { overview: OverviewData }) {
  const format = (val: number) => (val || 0).toLocaleString("fr-FR");

  const cards = [
    {
      title: "Épargnes Totales",
      usd: overview.totalEpargne.usd,
      fc: overview.totalEpargne.fc,
      icon: <TrendingUp className="w-6 h-6 text-sky-600 dark:text-sky-400" />,
      color: "sky",
      label: "Flux entrant"
    },
    {
      title: "Retraits Totaux",
      usd: overview.totalRetrait.usd,
      fc: overview.totalRetrait.fc,
      icon: <TrendingDown className="w-6 h-6 text-rose-600 dark:text-rose-400" />,
      color: "rose",
      label: "Flux sortant"
    },
    {
      title: "Crédits Octroyés",
      usd: overview.totalCredits.usd,
      fc: overview.totalCredits.fc,
      icon: <Landmark className="w-6 h-6 text-amber-600 dark:text-amber-400" />,
      color: "amber",
      label: "Encours"
    },
    {
      title: "Remboursements",
      usd: overview.totalRemboursements.usd,
      fc: overview.totalRemboursements.fc,
      icon: <Wallet className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />,
      color: "emerald",
      label: "Recouvrement"
    }
  ];

  return (
    <div className="space-y-8 py-4">
      <div className="flex items-center gap-3">
        <div className="h-1 w-12 bg-primary rounded-full" />
        <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
          Analyse des flux financiers globaux
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {cards.map((card, idx) => (
          <div
            key={idx}
            className="group relative bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-2xl transition-all duration-500"
          >
            <div className="flex items-center justify-between mb-8">
              <div className={`p-4 rounded-2xl bg-${card.color}-50 dark:bg-${card.color}-900/10 border border-${card.color}-100 dark:border-${card.color}-900/20 group-hover:scale-110 transition-transform duration-500`}>
                {card.icon}
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest block">{card.label}</span>
                <span className="text-xs font-bold text-slate-900 dark:text-white">{card.title}</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className={`p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/50 group-hover:bg-white dark:hover:bg-slate-800 transition-colors shadow-sm`}>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Montant USD</p>
                <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">
                  ${format(card.usd)}
                </div>
              </div>

              <div className={`p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/50 group-hover:bg-white dark:hover:bg-slate-800 transition-colors shadow-sm`}>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Montant FC</p>
                <div className="text-xl font-black text-slate-900 dark:text-white tracking-tighter">
                  {format(card.fc)} <span className="text-[10px] font-bold text-slate-400 ml-1">FC</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
