"use client";

import { useState } from "react";
import BalanceHeader from "@/components/balance/BalanceHeader";
import BalanceStatsSection from "@/components/balance/BalanceStatsSection";
import TreasurySection from "@/components/balance/TreasurySection";
import BalancesByTypeSection from "@/components/balance/BalancesByTypeSection";
import SoldeHistoryChart from "@/components/balance/SoldeHistoryChart";
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
          {/* Section 1: Top Stats - Données globales */}
          <BalanceStatsSection
            totalAccounts={accountsResponse?.meta?.total || 0}
            totalBalanceUSD={dashboard.overview.totalCaisse.usd}
            totalBalanceFC={dashboard.overview.totalCaisse.fc}
            activeAccounts={dashboard.byType.reduce((sum, t) => sum + t.soldeUSD, 0) > 0 ? 1 : 0} // Placeholder, à affiner si besoin
          />

          {/* Section 2: Analyse de la Trésorerie (Disponibilité réelle) */}
          <TreasurySection data={dashboard.tresorerie} />

          {/* Section 3: Graphique et Evolution */}
          <div className="grid grid-cols-1 gap-8">
            <SoldeHistoryChart data={dashboard.history} />
          </div>

          {/* Section 4: Répartition par Type de Compte */}
          <BalancesByTypeSection data={dashboard.byType} />
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
