"use client";

import { useMemo, useState } from "react";
import RetraitsHeader from "@/components/retraits/RetraitsHeader";
import RetraitsStatsSection from "@/components/retraits/RetraitsStatsSection";
import RetraitsTable from "@/components/retraits/RetraitsTable";
import CreateWithdrawalModal from "@/components/retraits/CreateWithdrawalModal";
import { useRetraits, useCreateWithdrawal } from "@/hooks/useRetraits";
import { WithdrawalInput } from "@/lib/validations";

/**
 * Page de gestion des retraits refactorisée avec TanStack Query.
 */
export default function RetraitsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: response } = useRetraits();
  const transactions = response?.data ?? [];
  const createMutation = useCreateWithdrawal();

  const stats = useMemo(() => {
    const todayISO = new Date().toISOString().split("T")[0];
    const todayTx = transactions.filter((t) => t.dateISO === todayISO);

    const todayTotalFC = todayTx
      .filter((t) => t.currency === "FC")
      .reduce((sum, t) => sum + t.amount, 0);
    const todayTotalUSD = todayTx
      .filter((t) => t.currency === "USD")
      .reduce((sum, t) => sum + t.amount, 0);

    const monthCount = transactions.length;
    const monthTotalUSD = transactions
      .filter((t) => t.currency === "USD")
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      todayTotalFC,
      todayTotalUSD,
      monthCount,
      monthTotalUSD,
    };
  }, [transactions]);

  const handleCreateWithdrawal = async (data: WithdrawalInput) => {
    try {
      await createMutation.mutateAsync(data);
      setIsModalOpen(false);
    } catch (error) {
      console.error("Erreur lors de la création:", error);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <RetraitsHeader
        onCreateClick={() => setIsModalOpen(true)}
        transactions={transactions}
      />

      <RetraitsStatsSection
        todayTotalFC={stats.todayTotalFC}
        todayTotalUSD={stats.todayTotalUSD}
        monthCount={stats.monthCount}
        monthTotalUSD={stats.monthTotalUSD}
      />

      <RetraitsTable />

      <CreateWithdrawalModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateWithdrawal}
        isLoading={createMutation.isPending}
      />
    </div>
  );
}
