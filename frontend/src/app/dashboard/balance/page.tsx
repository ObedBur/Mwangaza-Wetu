"use client";

import { useState } from "react";
import BalanceHeader from "@/components/balance/BalanceHeader";
import BalanceStatsSection from "@/components/balance/BalanceStatsSection";
import TreasurySection from "@/components/balance/TreasurySection";
import BalancesByTypeSection from "@/components/balance/BalancesByTypeSection";
import RevenueDetailsSection from "@/components/balance/RevenueDetailsSection";
import SoldeHistoryChart from "@/components/balance/SoldeHistoryChart";
import { MwangazaInteractiveChart } from "@/components/balance/MwangazaInteractiveChart";
import BalanceTable from "@/components/balance/BalanceTable";
import CreateBalanceModal from "@/components/balance/CreateBalanceModal";
import { useBalances, useCreateBalance, useSoldeDashboard } from "@/hooks/useBalances";
import { BalanceInput } from "@/lib/validations";
import { Loader2 } from "lucide-react";

export default function BalancePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Nouveau hook enrichi
  const { data: dashboard, isLoading: isDashLoading } = useSoldeDashboard();

  // Hook existant pour la table (pagination/search)
  const { data: accountsResponse } = useBalances();
  const { mutateAsync: createAccount } = useCreateBalance();

  const handleCreateAccount = async (data: BalanceInput) => {
    try {
      await createAccount(data);
      setIsModalOpen(false);
    } catch (error) {
      console.error("Failed to create account:", error);
    }
  };

  if (isDashLoading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-slate-500 font-medium animate-pulse text-sm">Chargement des données financières...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-10">
      <BalanceHeader onCreateClick={() => setIsModalOpen(true)} />

      {dashboard && (
        <>
          {/* Section 1: Top Stats - Données globales du backend */}
          <BalanceStatsSection
            totalAccounts={dashboard.overview.totalAccounts}
            totalBalanceUSD={dashboard.overview.totalCaisse.usd}
            totalBalanceFC={dashboard.overview.totalCaisse.fc}
            activeMembers={dashboard.overview.activeMembersCount}
            activeCredits={dashboard.overview.activeCreditsCount}
          />

          {/* Section 2: Analyse de la Trésorerie (Disponibilité réelle) */}
          <TreasurySection data={dashboard.tresorerie} />

          {/* Section 3: Graphiques Interactifs Shadcn - Flux réels */}
          <div className="grid grid-cols-1 gap-8">
            <MwangazaInteractiveChart data={dashboard.dailyHistory} />
            <SoldeHistoryChart data={dashboard.history} />
          </div>

          {/* Section 4: Répartition des Flux Globaux */}
          <BalancesByTypeSection overview={dashboard.overview} />

          {/* Section 5: Détail analytique des revenus */}
          <RevenueDetailsSection 
            revenusDetails={dashboard.revenusDetails} 
            totalFC={dashboard.overview.totalRevenus.fc}
            totalUSD={dashboard.overview.totalRevenus.usd}
          />
        </>
      )}

      {/* Liste détaillée des comptes */}
      <div className="space-y-6">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white px-1">Registre des Comptes Membres</h2>
        <BalanceTable />
      </div>

      <CreateBalanceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateAccount}
      />
    </div>
  );
}
