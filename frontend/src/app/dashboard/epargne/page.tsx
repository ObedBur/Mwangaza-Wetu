"use client";

import { useMemo, useState } from "react";
import DepositsHeader from "@/components/epargne/DepositsHeader";
import DepositsStatsSection from "@/components/epargne/DepositsStatsSection";
import DepositsTable from "@/components/epargne/DepositsTable";
import CreateDepositModal from "@/components/epargne/CreateDepositModal";
import { useSavings, useCreateSavings } from "@/hooks/useSavings";
import { SavingsInput } from "@/lib/validations";
import { toast } from "sonner";

export default function EpargnePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: response, isLoading, dataUpdatedAt } = useSavings();
  const transactions = response?.data ?? [];
  const meta = response?.meta;
  const { mutateAsync: createSavings } = useCreateSavings();

  const totals = useMemo(() => {
    const totalFC = transactions
      .filter((t: any) => t.devise === "FC")
      .reduce((sum: number, t: any) => sum + t.montant, 0);
    const totalUSD = transactions
      .filter((t: any) => t.devise === "USD")
      .reduce((sum: number, t: any) => sum + t.montant, 0);

    return { totalFC, totalUSD };
  }, [transactions]);

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
        totalFC={totals.totalFC}
        totalUSD={totals.totalUSD}
        totalTransactions={meta?.total}
        lastUpdatedAt={dataUpdatedAt ? new Date(dataUpdatedAt).toISOString() : null}
        isLoading={isLoading}
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
