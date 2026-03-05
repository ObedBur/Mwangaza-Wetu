"use client";

import { useState } from "react";
import DepositsHeader from "@/components/epargne/DepositsHeader";
import DepositsStatsSection from "@/components/epargne/DepositsStatsSection";
import DepositsTable from "@/components/epargne/DepositsTable";
import CreateDepositModal from "@/components/epargne/CreateDepositModal";
import { useSavings, useCreateSavings, useSavingsTotals } from "@/hooks/useSavings";
import { SavingsInput } from "@/lib/validations";
import { toast } from "sonner";

export default function EpargnePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: response, isLoading: isListLoading, dataUpdatedAt } = useSavings();
  const { data: totalsData, isLoading: isTotalsLoading } = useSavingsTotals();

  const transactions = response?.data ?? [];
  const meta = response?.meta;
  const { mutateAsync: createSavings } = useCreateSavings();

  const handleCreateDeposit = async (data: SavingsInput) => {
    const toastId = toast.loading("Enregistrement du dépôt...");
    try {
      await createSavings(data);
      toast.success("Dépôt enregistré avec succès !", { id: toastId });
      setIsModalOpen(false);
    } catch (error: any) {
      console.error("Failed to create deposit:", error);
      toast.error(error.message || "Erreur lors de la création du dépôt", { id: toastId });
    }
  };

  return (
    <div className="space-y-6">
      <DepositsHeader onCreateClick={() => setIsModalOpen(true)} transactions={transactions} />
      <DepositsStatsSection
        totalFC={totalsData?.totalFC ?? 0}
        totalUSD={totalsData?.totalUSD ?? 0}
        totalTransactions={meta?.total}
        lastUpdatedAt={dataUpdatedAt ? new Date(dataUpdatedAt).toISOString() : null}
        isLoading={isTotalsLoading || isListLoading}
      />

      <div>
        <DepositsTable />
      </div>

      <CreateDepositModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateDeposit}
      />
    </div>
  );
}
