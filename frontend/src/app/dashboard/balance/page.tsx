"use client";

import { useMemo, useState } from "react";
import BalanceHeader from "@/components/balance/BalanceHeader";
import BalanceStatsSection from "@/components/balance/BalanceStatsSection";
import BalanceTable from "@/components/balance/BalanceTable";
import CreateBalanceModal from "@/components/balance/CreateBalanceModal";
import { useBalances, useCreateBalance } from "@/hooks/useBalances";
import { BalanceInput } from "@/lib/validations";

export default function BalancePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: response } = useBalances();
  const accounts = response?.data ?? [];
  const { mutateAsync: createAccount } = useCreateBalance();

  const stats = useMemo(() => {
    const list = accounts;
    const totalAccounts = list.length;
    const activeAccounts = list.filter((a) => a.status === "active").length;
    const totalBalanceUSD = list.reduce((sum, a) => sum + a.balanceUSD, 0);
    const totalBalanceFC = list.reduce((sum, a) => sum + a.balanceFC, 0);

    return { totalAccounts, totalBalanceUSD, totalBalanceFC, activeAccounts };
  }, [accounts]);

  const handleCreateAccount = async (data: BalanceInput) => {
    try {
      await createAccount(data);
      setIsModalOpen(false);
    } catch (error) {
      console.error("Failed to create account:", error);
    }
  };

  return (
    <div className="space-y-8">
      <BalanceHeader onCreateClick={() => setIsModalOpen(true)} />

      <BalanceStatsSection
        totalAccounts={stats.totalAccounts}
        totalBalanceUSD={stats.totalBalanceUSD}
        totalBalanceFC={stats.totalBalanceFC}
        activeAccounts={stats.activeAccounts}
      />

      <BalanceTable />

      <CreateBalanceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateAccount}
      />
    </div>
  );
}
