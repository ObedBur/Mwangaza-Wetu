"use client";

import { useMemo, useState } from "react";
import ComptabiliteHeader from "@/components/comptabilite/ComptabiliteHeader";
import ComptabiliteStatsSection from "@/components/comptabilite/ComptabiliteStatsSection";
import ComptabiliteTable from "@/components/comptabilite/ComptabiliteTable";
import CreateEntryModal from "@/components/comptabilite/CreateEntryModal";
import { useAccounting, useCreateAccountingEntry } from "@/hooks/useAccounting";
import { AccountingInput } from "@/lib/validations";

export default function ComptabilitePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: response } = useAccounting();
  const entries = response?.data ?? [];
  const { mutateAsync: createEntry } = useCreateAccountingEntry();

  const stats = useMemo(() => {
    const list = entries;
    const totalDebit = list.reduce((sum, e) => sum + e.debit, 0);
    const totalCredit = list.reduce((sum, e) => sum + e.credit, 0);
    const netBalance = totalDebit - totalCredit;
    const pendingCount = list.filter((e) => e.status === "pending").length;

    return { totalDebit, totalCredit, netBalance, pendingCount };
  }, [entries]);

  const handleCreateEntry = async (data: AccountingInput) => {
    try {
      await createEntry(data);
      setIsModalOpen(false);
    } catch (error) {
      console.error("Failed to create accounting entry:", error);
    }
  };

  return (
    <div className="space-y-8">
      <ComptabiliteHeader onCreateClick={() => setIsModalOpen(true)} />

      <ComptabiliteStatsSection
        totalDebit={stats.totalDebit}
        totalCredit={stats.totalCredit}
        netBalance={stats.netBalance}
        pendingCount={stats.pendingCount}
      />

      <ComptabiliteTable />

      <CreateEntryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateEntry}
      />
    </div>
  );
}
