"use client";

import { Wallet, Info } from "lucide-react";

interface RevenueDetail {
  id: number;
  nom: string;
  description: string;
  totalFC: number;
  totalUSD: number;
}

interface RevenueDetailsSectionProps {
  revenusDetails: RevenueDetail[];
  totalFC: number;
  totalUSD: number;
}

export default function RevenueDetailsSection({ revenusDetails, totalFC, totalUSD }: RevenueDetailsSectionProps) {
  // Sort by highest USD revenue then FC to show most important first
  const sortedRevenus = [...revenusDetails].sort((a, b) => b.totalUSD - a.totalUSD || b.totalFC - a.totalFC);

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <div className="h-1 w-12 bg-primary rounded-full" />
        <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
          Détail des Revenus Générés
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedRevenus.map((rev) => (
          <div key={rev.id} className="group relative bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-start justify-between mb-6">
              <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/20 group-hover:scale-110 transition-transform duration-300">
                <Wallet className="w-5 h-5" />
              </div>
              <div className="text-right flex-1 ml-4">
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{rev.nom}</h3>
                {rev.description && (
                  <p className="text-[10px] font-bold text-slate-400 mt-1 line-clamp-2" title={rev.description}>
                    {rev.description}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-3 relative z-10">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Montant USD</span>
                <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                  +${rev.totalUSD.toLocaleString("fr-FR")}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Montant FC</span>
                <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                  +{rev.totalFC.toLocaleString("fr-FR")} <span className="text-[10px] ml-0.5">FC</span>
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {sortedRevenus.length === 0 && (
        <div className="p-10 text-center bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-200 dark:border-slate-700 border-dashed">
          <Info className="w-8 h-8 text-slate-400 mx-auto mb-3 opacity-50" />
          <p className="text-sm font-bold text-slate-500 uppercase tracking-tight">Aucun détail de revenu disponible</p>
        </div>
      )}
    </div>
  );
}
