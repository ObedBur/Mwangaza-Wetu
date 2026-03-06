"use client";

import { useMemo } from "react";
import { MemberDashboardData } from "@/hooks/useMemberDashboard";
import { 
  Wallet, PiggyBank, CreditCard, Activity, ArrowUpRight, 
  ArrowDownRight, RefreshCw, BarChart2 
} from "lucide-react";

export default function MemberDashboardView({ data }: { data: MemberDashboardData }) {
  const { profile, balances, activeCreditsDetails, recentTransactions } = data;

  const initials = profile.nomComplet.substring(0, 2).toUpperCase();

  const transactions = useMemo(() => {
    return recentTransactions.map((tx, idx) => {
      const isPositive = tx.type === "depot" || tx.type === "remboursement";
      return (
        <div 
          key={idx} 
          className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <div className="flex items-center gap-4">
            <div className={`p-2.5 rounded-lg flex-shrink-0 ${
              isPositive ? 'bg-green-100 dark:bg-green-900/30 text-green-600' : 'bg-red-100 dark:bg-red-900/30 text-red-600'
            }`}>
              {tx.type === 'depot' ? <ArrowDownRight className="w-5 h-5" /> : 
               tx.type === 'retrait' ? <ArrowUpRight className="w-5 h-5" /> : 
               <RefreshCw className="w-5 h-5" />}
            </div>
            <div>
              <p className="font-bold text-slate-800 dark:text-slate-200 text-sm capitalize">
                {tx.type}
              </p>
              <p className="text-xs text-slate-500 max-w-[200px] sm:max-w-md truncate">
                {tx.description || (tx.type === "depot" ? "Versement d'épargne" : tx.type === "retrait" ? "Retrait d'épargne" : "Remboursement de crédit")}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className={`font-black text-sm sm:text-base ${isPositive ? 'text-green-600' : 'text-slate-800 dark:text-white'}`}>
              {isPositive ? "+" : "-"} {new Intl.NumberFormat("fr-FR", { style: tx.devise === "FC" ? "decimal" : "currency", currency: tx.devise || "USD" }).format(tx.montant)}
              {tx.devise === "FC" && " FC"}
            </p>
            <p className="text-[10px] sm:text-xs text-slate-400 font-medium">
              {new Date(tx.date).toLocaleDateString("fr-FR", { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
          </div>
        </div>
      );
    });
  }, [recentTransactions]);

  return (
    <div className="space-y-6 sm:space-y-8 pb-12">
      {/* ─── EN-TÊTE PROFIL ─── */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl flex flex-col sm:flex-row items-center sm:items-start gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-primary to-blue-600 text-white font-black text-2xl sm:text-3xl flex items-center justify-center shadow-lg shadow-primary/30 shrink-0 border-4 border-white dark:border-slate-800 z-10">
          {initials}
        </div>
        
        <div className="text-center sm:text-left z-10 flex-1">
          <div className="inline-block px-3 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-full mb-3">
            {profile.typeCompte}
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white mb-1 tracking-tight">
            {profile.nomComplet}
          </h1>
          <p className="text-sm font-medium text-slate-500 flex items-center justify-center sm:justify-start gap-2">
            <span className="font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-primary">
              {profile.numeroCompte}
            </span>
            <span>•</span>
            Adhérent depuis {new Date(profile.dateAdhesion).getFullYear()}
          </p>
        </div>
      </div>

      {/* ─── RÉSUMÉ FINANCIER (CARTES) ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Epargnes USD */}
        <div className="glossy-card p-6 border-t-4 border-t-green-500">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
              <PiggyBank className="w-6 h-6 text-green-600" />
            </div>
            <div className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded font-bold text-xs text-slate-500">
              USD
            </div>
          </div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
            Épargne Disponible
          </p>
          <h3 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white">
            {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(balances.savings.USD)}
          </h3>
        </div>

        {/* Epargnes FC */}
        <div className="glossy-card p-6 border-t-4 border-t-green-400">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
              <Wallet className="w-6 h-6 text-green-500" />
            </div>
            <div className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded font-bold text-xs text-slate-500">
              CDF
            </div>
          </div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
            Épargne Disponible
          </p>
          <h3 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white">
            {new Intl.NumberFormat("fr-FR", { style: "decimal" }).format(balances.savings.FC)} FC
          </h3>
        </div>

        {/* Credits USD */}
        <div className="glossy-card p-6 border-t-4 border-t-orange-500">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-xl">
              <CreditCard className="w-6 h-6 text-orange-600" />
            </div>
            <div className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded font-bold text-xs text-slate-500">
              USD
            </div>
          </div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
            Crédits à Rembourser
          </p>
          <h3 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white">
            {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(balances.activeCredits.USD)}
          </h3>
        </div>

        {/* Credits FC */}
        <div className="glossy-card p-6 border-t-4 border-t-orange-400">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-xl">
              <Activity className="w-6 h-6 text-orange-500" />
            </div>
            <div className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded font-bold text-xs text-slate-500">
              CDF
            </div>
          </div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
            Crédits à Rembourser
          </p>
          <h3 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white">
            {new Intl.NumberFormat("fr-FR", { style: "decimal" }).format(balances.activeCredits.FC)} FC
          </h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* ─── HISTORIQUE DES TRANSACTIONS ─── */}
        <div className="lg:col-span-2 glass-panel p-6 sm:p-8 rounded-3xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-primary" />
              Historique Récent
            </h2>
            <div className="text-xs font-semibold text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
              Dernières 15 opérations
            </div>
          </div>

          <div className="space-y-3">
            {transactions.length > 0 ? (
              transactions
            ) : (
              <div className="text-center py-10 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                <BarChart2 className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-sm font-semibold text-slate-500">Aucune transaction récente.</p>
              </div>
            )}
          </div>
        </div>

        {/* ─── CRÉDITS EN COURS (DÉTAILS) ─── */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-6">
            <CreditCard className="w-5 h-5 text-orange-500" />
            Détails des Crédits Actifs
          </h2>

          <div className="space-y-4">
            {activeCreditsDetails.length > 0 ? (
              activeCreditsDetails.map((credit, idx) => (
                <div key={idx} className="bg-slate-50 dark:bg-slate-800/80 p-5 rounded-2xl border border-slate-100 dark:border-slate-700">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider mb-2 ${
                        credit.statut === 'en_retard' ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'
                      }`}>
                        {credit.statut === 'en_retard' ? 'En Retard' : 'Actif'}
                      </span>
                      <p className="text-sm font-bold text-slate-800 dark:text-white">
                        Prêt de {credit.devise === "FC" 
                          ? `${new Intl.NumberFormat("fr-FR", { style: "decimal" }).format(credit.montantInitial)} FC` 
                          : new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(credit.montantInitial)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-500 font-medium tracking-tight">Reste à payer</p>
                      <p className="font-black text-orange-600">
                        {credit.devise === "FC" 
                          ? `${new Intl.NumberFormat("fr-FR", { style: "decimal" }).format(credit.restant)} FC` 
                          : new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(credit.restant)}
                      </p>
                    </div>
                  </div>

                  {/* Barre de progression */}
                  <div className="mt-4">
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span className="text-slate-400">Progression</span>
                      <span className="text-slate-600 dark:text-slate-300">{Math.round(credit.progression)}%</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden">
                      <div 
                        className="bg-primary h-2.5 rounded-full transition-all duration-1000" 
                        style={{ width: `${Math.min(100, Math.max(0, credit.progression))}%` }} 
                      />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
                <p className="text-sm font-semibold text-slate-500">Aucun crédit actif.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
