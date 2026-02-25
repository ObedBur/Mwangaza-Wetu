"use client";

import { useMemo, useState } from "react";
import GuichetsHeader from "@/components/guichets/GuichetsHeader";
import GuichetsStatsSection from "@/components/guichets/GuichetsStatsSection";
import GuichetsTable from "@/components/guichets/GuichetsTable";
import CreateCashierModal from "@/components/guichets/CreateCashierModal";
import { useCashiers, useCreateCashier } from "@/hooks/useCashiers";
import { CashierInput } from "@/lib/validations";

export default function GuichetsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: response } = useCashiers();
  const cashiers = response?.data ?? [];
  const { mutateAsync: createCashier } = useCreateCashier();

  const stats = useMemo(() => {
    const list = cashiers;
    const activeCount = list.filter((c) => c.status === "active").length;
    const openCount = list.filter((c) => c.shiftStatus === "open").length;
    const todayTransactions = list.reduce(
      (sum, c) => sum + c.todayTransactions,
      0,
    );
    const totalAmount = list.reduce((sum, c) => sum + c.totalAmount, 0);

    return { activeCount, openCount, todayTransactions, totalAmount };
  }, [cashiers]);

  const handleCreateCashier = async (data: CashierInput) => {
    try {
      await createCashier(data);
      setIsModalOpen(false);
    } catch (error) {
      console.error("Failed to create cashier:", error);
    }
  };

  return (
    <div className="space-y-8">
      <GuichetsHeader onCreateClick={() => setIsModalOpen(true)} />

      <GuichetsStatsSection
        activeCount={stats.activeCount}
        openCount={stats.openCount}
        todayTransactions={stats.todayTransactions}
        totalAmount={stats.totalAmount}
      />

      <GuichetsTable />

      <CreateCashierModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateCashier}
      />
    </div>
  );
}
