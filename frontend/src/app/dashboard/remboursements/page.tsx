"use client";

import { useMemo, useState } from "react";
import RemboursementsHeader from "@/components/remboursements/RemboursementsHeader";
import RemboursementsStatsSection from "@/components/remboursements/RemboursementsStatsSection";
import RemboursementsTable from "@/components/remboursements/RemboursementsTable";
import CreateRepaymentModal from "@/components/remboursements/CreateRepaymentModal";
import { useRepayments, useCreateRepayment } from "@/hooks/useRepayments";
import { RepaymentInput } from "@/lib/validations";

export default function RemboursementsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: response } = useRepayments();
  const repayments = response?.data ?? [];
  const { mutateAsync: createRepayment } = useCreateRepayment();

  const stats = useMemo(() => {
    const list = repayments;
    const activeCount = list.filter((r) => r.status === "active").length;

    // In a real app, these totals would likely come from the API/hook
    const totalRepaidFC = list
      .filter((r) => r.currency === "FC")
      .reduce((sum, r) => sum + r.paidAmount, 0);
    const totalRepaidUSD = list
      .filter((r) => r.currency === "USD")
      .reduce((sum, r) => sum + r.paidAmount, 0);
    const overdueCount = list.filter((r) => r.status === "overdue").length;

    return { activeCount, totalRepaidFC, totalRepaidUSD, overdueCount };
  }, [repayments]);

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
