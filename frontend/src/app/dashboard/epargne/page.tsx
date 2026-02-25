"use client";

import { useMemo, useState } from "react";
import DepositsHeader from "@/components/epargne/DepositsHeader";
import DepositsStatsSection from "@/components/epargne/DepositsStatsSection";
import DepositsTable from "@/components/epargne/DepositsTable";
import CreateDepositModal from "@/components/epargne/CreateDepositModal";
import { useSavings, useCreateSavings } from "@/hooks/useSavings";
import { SavingsInput } from "@/lib/validations";

export default function EpargnePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: response } = useSavings();
  const transactions = response?.data ?? [];
  const { mutateAsync: createSavings } = useCreateSavings();

  const totals = useMemo(() => {
    const list = transactions;
    const totalFC = list
      .filter((t) => t.currency === "FC")
      .reduce((sum, t) => sum + t.amount, 0);
    const totalUSD = list
      .filter((t) => t.currency === "USD")
      .reduce((sum, t) => sum + t.amount, 0);

    return { totalFC, totalUSD };
  }, [transactions]);

  const handleCreateDeposit = async (data: SavingsInput) => {
    try {
      await createSavings(data);
      setIsModalOpen(false);
    } catch (error) {
      console.error("Failed to create deposit:", error);
    }
  };

  return (
    <div className="space-y-6">
      <DepositsHeader onCreateClick={() => setIsModalOpen(true)} />
      <DepositsStatsSection
        totalFC={totals.totalFC}
        totalUSD={totals.totalUSD}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8">
          <DepositsTable />
        </div>

        <aside className="lg:col-span-4 space-y-6">
          <div className="bg-amber-50 dark:bg-amber-900/10 p-5 rounded-2xl border border-amber-200 dark:border-amber-900/30">
            <div className="flex gap-3">
              <div className="mt-0.5 h-8 w-8 rounded-lg bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center text-amber-700 dark:text-amber-400 font-bold font-mono">
                !
              </div>
              <div>
                <h4 className="text-sm font-bold text-amber-800 dark:text-amber-500">
                  Validation Requise
                </h4>
                <p className="text-xs text-amber-700 dark:text-amber-600 mt-1 leading-relaxed">
                  Les transactions &gt; $5,000 nécessitent une approbation
                  manuelle.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-slate-900 dark:text-white mb-4">
              Actions Rapides
            </h3>
            <button
              onClick={() => setIsModalOpen(true)}
              className="w-full py-3 px-4 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-sm shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5"
            >
              Nouvel Dépôt
            </button>
          </div>
        </aside>
      </div>

      <CreateDepositModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateDeposit}
      />
    </div>
  );
}
