"use client";

import { Users, UserCheck, Briefcase, UserPlus } from "lucide-react";

interface AccountTypeData {
  type: string;
  soldeFC: number;
  soldeUSD: number;
  epargneFC: number;
  epargneUSD: number;
  retraitFC: number;
  retraitUSD: number;
}

export default function BalancesByTypeSection({ data }: { data: AccountTypeData[] }) {
  const getIcon = (type: string) => {
    switch (type.toUpperCase()) {
      case "PRIVILEGE": return <UserCheck className="w-5 h-5 text-purple-500" />;
      case "ENTREPRISE": return <Briefcase className="w-5 h-5 text-blue-500" />;
      case "DELERE": return <UserPlus className="w-5 h-5 text-orange-500" />;
      default: return <Users className="w-5 h-5 text-slate-500" />;
    }
  };

  const getLabel = (type: string) => {
    switch (type.toUpperCase()) {
      case "PRIVILEGE": return "Membres Privilège";
      case "ORDINAIRE": return "Membres Ordinaires";
      case "DELERE": return "Délégués";
      case "ENTREPRISE": return "Comptes Entreprise";
      default: return type;
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
        <Users className="w-5 h-5 text-primary" />
        Répartition par Type de Compte
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {data.map((item) => (
          <div key={item.type} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                {getIcon(item.type)}
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-tight">
                  {getLabel(item.type)}
                </h3>
                <p className="text-[10px] text-slate-400 font-medium tracking-widest">SOUS-TOTAL DÉTE(NU)</p>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex justify-between items-end bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                <span className="text-[11px] font-bold text-slate-500">SOLDE USD</span>
                <span className="text-lg font-black text-slate-900 dark:text-white line-clamp-1">
                  ${(item.soldeUSD ?? 0).toLocaleString("fr-FR")}
                </span>
              </div>
              <div className="flex justify-between items-end bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                <span className="text-[11px] font-bold text-slate-500">SOLDE FC</span>
                <span className="text-lg font-black text-slate-900 dark:text-white line-clamp-1">
                  {(item.soldeFC ?? 0).toLocaleString("fr-FR")} ₣
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-[10px] uppercase font-bold text-slate-400">
                <div className="flex flex-col">
                    <span>Épargne USD</span>
                <span className="text-slate-600 dark:text-slate-400">${(item.epargneUSD ?? 0).toLocaleString()}</span>
                </div>
                <div className="flex flex-col text-right">
                    <span>Retrait USD</span>
                <span className="text-red-500">${(item.retraitUSD ?? 0).toLocaleString()}</span>
                </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
