"use client";

import { useMemo, useState } from "react";
import RemboursementsHeader from "@/components/remboursements/RemboursementsHeader";
import RemboursementsStatsSection from "@/components/remboursements/RemboursementsStatsSection";
import RemboursementsTable from "@/components/remboursements/RemboursementsTable";
import CreateRepaymentModal from "@/components/remboursements/CreateRepaymentModal";
import { useRepayments, useCreateRepayment } from "@/hooks/useRepayments";
import { useSoldeDashboard } from "@/hooks/useBalances";
import { RepaymentInput } from "@/lib/validations";

export default function RemboursementsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: response } = useRepayments();
  const repayments = response?.data ?? [];
  const { mutateAsync: createRepayment } = useCreateRepayment();
  const { data: dashboard } = useSoldeDashboard();

  const stats = useMemo(() => {
    return { 
      activeCount: dashboard?.overview.activeCreditsCount ?? 0, 
      totalRepaidFC: dashboard?.overview.totalRemboursements.fc ?? 0, 
      totalRepaidUSD: dashboard?.overview.totalRemboursements.usd ?? 0, 
      overdueCount: dashboard?.overview.overdueCreditsCount ?? 0,
    };
  }, [dashboard]);

  const handleCreateRepayment = async (data: RepaymentInput) => {
    try {
      await createRepayment(data);
      setIsModalOpen(false);
    } catch (error) {
      console.error("Failed to create repayment:", error);
    }
  };

  return (
    <div className="space-y-8">
      <RemboursementsHeader onCreateClick={() => setIsModalOpen(true)} />

      <RemboursementsStatsSection
        activeCount={stats.activeCount}
        totalRepaidFC={stats.totalRepaidFC}
        totalRepaidUSD={stats.totalRepaidUSD}
        overdueCount={stats.overdueCount}
      />

      <RemboursementsTable />

      <CreateRepaymentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateRepayment}
      />
    </div>
  );
}
