"use client";

import { Wallet, ShieldCheck, CreditCard, Landmark } from "lucide-react";

interface TreasuryData {
  fc: { caisse: number; reserve: number; encoursCredits: number; disponible: number };
  usd: { caisse: number; reserve: number; encoursCredits: number; disponible: number };
}

export default function TreasurySection({ data }: { data: TreasuryData }) {
  const currencies = [
    { code: "USD", symbol: "$", values: data.usd, color: "blue" },
    { code: "FC", symbol: "FC", values: data.fc, color: "emerald" },
  ];

  const colorMap = {
    blue: {
      border: "border-blue-500",
      bg: "bg-blue-50/50 dark:bg-blue-900/10",
      accent: "text-blue-600 dark:text-blue-400",
      badge: "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
    },
    emerald: {
      border: "border-emerald-500",
      bg: "bg-emerald-50/50 dark:bg-emerald-900/10",
      accent: "text-emerald-600 dark:text-emerald-400",
      badge: "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <div className="h-1 w-12 bg-primary rounded-full" />
        <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
          Analyse des liquidités
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {currencies.map((curr) => {
          const styles = colorMap[curr.color as keyof typeof colorMap];
          return (
            <div key={curr.code} className="group relative bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
              <div className={`h-2 w-full bg-gradient-to-r from-transparent via-${curr.color}-500 to-transparent opacity-60`} />

              <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Trésorerie Réelle</span>
                    <span className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Devise: {curr.code}</span>
                  </div>
                  <span className={`px-3 py-1.5 rounded-xl ${styles.badge} text-[10px] font-black uppercase tracking-widest shadow-sm`}>
                    Réserve 20% Sécurisée
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-8">
                  {/* Solde en Caisse */}
                  <div className="space-y-2 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/50">
                    <div className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                      <Wallet className="w-3.5 h-3.5 text-primary" />
                      Caisse Brute
                    </div>
                    <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">
                      {curr.symbol}{curr.values.caisse.toLocaleString("fr-FR")}
                    </p>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">Total des dépôts nets</p>
                  </div>

                  {/* Réserve Obligatoire */}
                  <div className="space-y-2 p-4 rounded-2xl bg-orange-50/30 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/20">
                    <div className="flex items-center gap-2 text-orange-600/60 dark:text-orange-400/60 text-[10px] font-black uppercase tracking-widest">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Réserve Prov.
                    </div>
                    <p className="text-2xl font-black text-orange-600 dark:text-orange-400 tracking-tighter">
                      -{curr.symbol}{curr.values.reserve.toLocaleString("fr-FR")}
                    </p>
                    <p className="text-[9px] text-orange-400/80 font-bold uppercase tracking-tight">Provision 20% interne</p>
                  </div>

                  {/* Encours Crédits */}
                  <div className="space-y-2 p-4 rounded-2xl bg-blue-50/30 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20">
                    <div className="flex items-center gap-2 text-blue-600/60 dark:text-blue-400/60 text-[10px] font-black uppercase tracking-widest">
                      <CreditCard className="w-3.5 h-3.5" />
                      Encours Prêts
                    </div>
                    <p className="text-2xl font-black text-blue-600 dark:text-blue-400 tracking-tighter">
                      -{curr.symbol}{curr.values.encoursCredits.toLocaleString("fr-FR")}
                    </p>
                    <p className="text-[9px] text-blue-400/80 font-bold uppercase tracking-tight">Capital prêté actif</p>
                  </div>

                  {/* Disponible Net */}
                  <div className="relative p-6 rounded-3xl bg-slate-900 dark:bg-white border border-slate-800 dark:border-slate-100 col-span-2 overflow-hidden shadow-xl">
                    <div className="absolute top-0 right-0 p-4">
                      <div className={`w-8 h-8 rounded-full blur-xl opacity-50 bg-${curr.color}-500`} />
                    </div>
                    <div className="relative z-10">
                      <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2">
                        Surplus Prêtable (Net)
                      </div>
                      <p className={`text-4xl font-black tracking-tighter ${curr.values.disponible > 0 ? "text-emerald-400 dark:text-emerald-600" : "text-red-500"}`}>
                        {curr.symbol}{curr.values.disponible.toLocaleString("fr-FR")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
