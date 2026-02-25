"use client";

import React, { useMemo } from "react";
import { Users, PiggyBank, CreditCard, TrendingUp } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import StatsCard from "./StatsCard";
import { useMembers } from "@/hooks/useMembers";
import { useSavings } from "@/hooks/useSavings";
import { useCredits } from "@/hooks/useCredits";

interface Stat {
  icon: LucideIcon;
  label: string;
  value: string | number;
  tooltip?: string;
  isHighlight?: boolean;
}

export default function StatsSection() {
  const { data: members } = useMembers();
  const { data: savings } = useSavings();
  const { data: credits } = useCredits();

  const stats: Stat[] = useMemo(() => {
    const memberData = members?.data ?? [];
    const activeMembers =
      members?.meta?.total ??
      memberData.filter((m) => m.statut === "actif").length;

    const savingsData = savings?.data ?? [];
    const totalSavingsFC = savingsData
      .filter((s) => s.currency === "FC")
      .reduce((sum: number, s) => sum + s.amount, 0);
    const totalSavingsUSD = savingsData
      .filter((s) => s.currency === "USD")
      .reduce((sum: number, s) => sum + s.amount, 0);

    const creditsData = credits?.data ?? [];
    const totalCreditsFC = creditsData
      .filter((c) => c.currency === "FC")
      .reduce((sum: number, c) => sum + (c.remainingAmount || 0), 0);
    const totalCreditsUSD = creditsData
      .filter((c) => c.currency === "USD")
      .reduce((sum: number, c) => sum + (c.remainingAmount || 0), 0);

    return [
      {
        icon: Users,
        label: "Membres Actifs",
        value: activeMembers.toString(),
        tooltip: "Nombre total de membres actifs",
      },
      {
        icon: PiggyBank,
        label: "Épargne (FC)",
        value: totalSavingsFC.toLocaleString() + " FC",
        tooltip: "Épargne totale en Francs Congolais",
      },
      {
        icon: CreditCard,
        label: "Épargne (USD)",
        value: "$" + totalSavingsUSD.toLocaleString(),
        tooltip: "Épargne totale en Dollars US",
      },
      {
        icon: CreditCard,
        label: "Crédits (FC)",
        value: totalCreditsFC.toLocaleString() + " FC",
        tooltip: "Crédits non encore remboursés (FC)",
      },
      {
        icon: PiggyBank,
        label: "Crédits (USD)",
        value: "$" + totalCreditsUSD.toLocaleString(),
        tooltip: "Crédits non encore remboursés (USD)",
      },
      {
        icon: TrendingUp,
        label: "Bénéfices",
        value: "0 FC", // Logic for benefits could be added later
        tooltip: "Voir le détail des bénéfices",
        isHighlight: true,
      },
    ];
  }, [members, savings, credits]);

  return (
    <section>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
        <h2 className="text-base sm:text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <svg
            className="w-4 sm:w-5 h-4 sm:h-5 text-primary shrink-0"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M3 13h2v8H3zm4-8h2v16H7zm4-2h2v18h-2zm4-2h2v20h-2zm4 4h2v16h-2zm4-4h2v20h-2z" />
          </svg>
          Tableau de Bord
        </h2>
      </div>
      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-2 sm:gap-3 md:gap-4">
        {stats.map((stat) => (
          <StatsCard
            key={stat.label}
            icon={stat.icon}
            label={stat.label}
            value={stat.value}
            tooltip={stat.tooltip}
            isHighlight={stat.isHighlight}
          />
        ))}
      </div>
    </section>
  );
}
