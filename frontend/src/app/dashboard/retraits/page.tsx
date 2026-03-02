"use client";

import { useMemo, useState } from "react";
import RetraitsHeader from "@/components/retraits/RetraitsHeader";
import RetraitsStatsSection from "@/components/retraits/RetraitsStatsSection";
import RetraitsTable from "@/components/retraits/RetraitsTable";
import CreateWithdrawalModal from "@/components/retraits/CreateWithdrawalModal";
import { useRetraits, useCreateWithdrawal } from "@/hooks/useRetraits";
import { WithdrawalInput } from "@/lib/validations";
import { toast } from "sonner";

/**
 * Page de gestion des retraits refactorisée avec TanStack Query.
 */
export default function RetraitsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: response } = useRetraits();
  const transactions = response?.data ?? [];
  const meta = response?.meta;
  const { mutateAsync: createWithdrawal } = useCreateWithdrawal();

  const stats = useMemo(() => {
    const todayISO = new Date().toISOString().split("T")[0];
    const todayTx = transactions.filter((t: any) => t.dateISO === todayISO);

    const todayTotalFC = todayTx
      .filter((t: any) => t.currency === "FC")
      .reduce((sum: number, t: any) => sum + t.amount, 0);
    const todayTotalUSD = todayTx
      .filter((t: any) => t.currency === "USD")
      .reduce((sum: number, t: any) => sum + t.amount, 0);

    const monthCount = transactions.length;
    const monthTotalUSD = transactions
      .filter((t: any) => t.currency === "USD")
      .reduce((sum: number, t: any) => sum + t.amount, 0);

    return {
      todayTotalFC,
      todayTotalUSD,
      monthCount,
      monthTotalUSD,
    };
  }, [transactions]);

  const handleCreateWithdrawal = async (data: WithdrawalInput) => {
    const toastId = toast.loading("Traitement du retrait...");
    try {
      await createWithdrawal(data);
      toast.success("Retrait effectué avec succès !", { id: toastId });
      setIsModalOpen(false);
    } catch (error: any) {
      console.error("Erreur lors de la création:", error);
      toast.error(error.message || "Erreur lors du retrait", { id: toastId });
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
      />
    </div>
  );
}
