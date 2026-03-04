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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Landmark className="w-5 h-5 text-primary" />
          Analyse de la Trésorerie (Liquidités Réelles)
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {currencies.map((curr) => (
          <div key={curr.code} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-all hover:shadow-md">
            <div className={`h-1.5 w-full bg-${curr.color}-500`} />
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <span className="text-sm font-black text-slate-400 uppercase tracking-widest">Trésorerie {curr.code}</span>
                <span className={`px-2.5 py-1 rounded-lg bg-${curr.color}-50 dark:bg-${curr.color}-900/20 text-${curr.color}-600 dark:text-${curr.color}-400 text-xs font-bold`}>
                  Réserve 20% incluse
                </span>
              </div>

              <div className="grid grid-cols-2 gap-6">
                {/* Solde en Caisse */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
                    <Wallet className="w-3.5 h-3.5" />
                    Caisse Réelle
                  </div>
                  <p className="text-2xl font-black text-slate-900 dark:text-white">
                    {curr.symbol}{curr.values.caisse.toLocaleString("fr-FR")}
                  </p>
                  <p className="text-[10px] text-slate-400 font-medium">Total dépôts - retraits - frais</p>
                </div>

                {/* Réserve Obligatoire */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Réserve (20%)
                  </div>
                  <p className="text-xl font-bold text-orange-600 dark:text-orange-400">
                    -{curr.symbol}{curr.values.reserve.toLocaleString("fr-FR")}
                  </p>
                  <p className="text-[10px] text-slate-400 font-medium">Provision indisponible</p>
                </div>

                {/* Encours Crédits */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
                    <CreditCard className="w-3.5 h-3.5" />
                    Crédits En cours
                  </div>
                  <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                    -{curr.symbol}{curr.values.encoursCredits.toLocaleString("fr-FR")}
                  </p>
                  <p className="text-[10px] text-slate-400 font-medium">Capital prêté non remboursé</p>
                </div>

                {/* Disponible Net */}
                <div className="space-y-1 pt-2 border-t border-slate-100 dark:border-slate-800 col-span-2">
                  <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-wider">
                    Fonds Prêtables (Disponibilité Nette)
                  </div>
                  <p className={`text-3xl font-black ${curr.values.disponible > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600"}`}>
                    {curr.symbol}{curr.values.disponible.toLocaleString("fr-FR")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
