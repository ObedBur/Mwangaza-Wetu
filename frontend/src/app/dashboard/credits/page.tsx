"use client";

import { useMemo, useState } from "react";
import CreditsHeader from "@/components/credits/CreditsHeader";
import CreditsStatsSection from "@/components/credits/CreditsStatsSection";
import CreditsTable from "@/components/credits/CreditsTable";
import CreateCreditModal from "@/components/credits/CreateCreditModal";
import { useCredits, useCreateCredit } from "@/hooks/useCredits";
import { LoanInput } from "@/lib/validations";

export default function CreditsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: response } = useCredits();
  const credits = response?.data ?? [];
  const { mutateAsync: createCredit } = useCreateCredit();

  const stats = useMemo(() => {
    const list = credits;
    const totalCredits = list.reduce((sum, c) => sum + c.amount, 0);
    const activeCredits = list
      .filter((c) => c.status === "active")
      .reduce((sum, c) => sum + (c.remainingAmount || 0), 0);
    const overdueCredits = list
      .filter((c) => c.status === "overdue")
      .reduce((sum, c) => sum + (c.remainingAmount || 0), 0);
    const availableBalance = 355000; // Mock or could be from another hook

    return { totalCredits, activeCredits, overdueCredits, availableBalance };
  }, [credits]);

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
