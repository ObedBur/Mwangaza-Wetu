"use client";

import { useState } from "react";
import CreditsHeader from "@/components/credits/CreditsHeader";
import CreditsStatsSection from "@/components/credits/CreditsStatsSection";
import CreditsTable from "@/components/credits/CreditsTable";
import CreateCreditModal from "@/components/credits/CreateCreditModal";
import { useCreateCredit } from "@/hooks/useCredits";
import { LoanInput } from "@/lib/validations";

export default function CreditsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { mutateAsync: createCredit } = useCreateCredit();

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

      <CreditsStatsSection />

      <CreditsTable />

      <CreateCreditModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateCredit}
      />
    </div>
  );
}
