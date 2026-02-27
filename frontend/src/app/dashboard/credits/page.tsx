"use client";

import { useMemo, useState } from "react";
import CreditsHeader from "@/components/credits/CreditsHeader";
import CreditsStatsSection from "@/components/credits/CreditsStatsSection";
import CreditsTable from "@/components/credits/CreditsTable";
import CreateCreditModal from "@/components/credits/CreateCreditModal";
import { useCredits, useCreateCredit, useCreditStats } from "@/hooks/useCredits";
import { LoanInput } from "@/lib/validations";

export default function CreditsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: response } = useCredits();
  const credits = response?.data ?? [];
  const { mutateAsync: createCredit } = useCreateCredit();

  // Statistiques globales des crédits depuis le backend
  const { data: creditStatsData } = useCreditStats();

  const stats = useMemo(() => {
    // Si le backend fournit des stats agrégées, on les utilise en priorité
    if (creditStatsData) {
      return {
        totalCredits: creditStatsData.totalAmount ?? 0,
        activeCredits: creditStatsData.activeAmount ?? 0,
        overdueCredits: creditStatsData.overdueAmount ?? 0,
        availableBalance: creditStatsData.availableBalance ?? 0,
      };
    }

    // Fallback : calcul côté client depuis la liste paginée courante
    const totalCredits = credits.reduce((sum, c) => sum + c.amount, 0);
    const activeCredits = credits
      .filter((c) => c.status === "active")
      .reduce((sum, c) => sum + (c.remainingAmount || 0), 0);
    const overdueCredits = credits
      .filter((c) => c.status === "overdue")
      .reduce((sum, c) => sum + (c.remainingAmount || 0), 0);

    return { totalCredits, activeCredits, overdueCredits, availableBalance: 0 };
  }, [credits, creditStatsData]);

  const handleCreateCredit = async (data: LoanInput) => {
    try {
      await createCredit(data);
      setIsModalOpen(false);
    } catch (error) {
      console.error("Failed to create credit:", error);
    }
  };

  return (
    <div className="space-y-8">
      <CreditsHeader onCreateClick={() => setIsModalOpen(true)} />

      <CreditsStatsSection
        totalCredits={stats.totalCredits}
        activeCredits={stats.activeCredits}
        overdueCredits={stats.overdueCredits}
        availableBalance={stats.availableBalance}
      />

      <CreditsTable />

      <CreateCreditModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateCredit}
      />
    </div>
  );
}
