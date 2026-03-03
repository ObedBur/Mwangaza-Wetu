"use client";

import { useCreditStats } from "@/hooks/useCredits";
import CreditsStatCard from "@/components/credits/CreditsStatCard";
import { Loader2 } from "lucide-react";

export default function CreditsStatsSection() {
  const { data: creditStats, isLoading, isError } = useCreditStats();

  if (isLoading) {
    return (
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="h-32 bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse"
          />
        ))}
      </section>
    );
  }

  if (isError || !creditStats) {
    return (
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="h-32 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800 flex items-center justify-center"
          >
            <Loader2 className="h-6 w-6 text-red-500 animate-spin" />
          </div>
        ))}
      </section>
    );
  }

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
      <CreditsStatCard
        title="Total des Crédits"
        value={formatDualAmount(creditStats.totalAmount)}
        trend="+12%"
        icon="wallet"
        color="blue"
      />
      <CreditsStatCard
        title="Crédits Actifs"
        value={formatDualAmount(creditStats.activeAmount)}
        trend="+5%"
        icon="check"
        color="green"
      />
      <CreditsStatCard
        title="En Retard"
        value={formatDualAmount(creditStats.overdueAmount)}
        trend="-2%"
        icon="warning"
        color="red"
      />
      <CreditsStatCard
        title="Solde Disponible"
        value={formatDualAmount(creditStats.availableBalance)}
        trend="+8%"
        icon="savings"
        color="indigo"
      />
    </section>
  );
}

function formatDualAmount(amounts: { usd: number; fc: number }) {
  const usd = new Intl.NumberFormat("fr-FR").format(amounts.usd || 0) + " $";
  const fc = new Intl.NumberFormat("fr-FR").format(amounts.fc || 0) + " FC";
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white leading-none tracking-tight">{usd}</span>
      <span className="text-sm font-bold text-slate-500 dark:text-slate-400">{fc}</span>
    </div>
  );
}
