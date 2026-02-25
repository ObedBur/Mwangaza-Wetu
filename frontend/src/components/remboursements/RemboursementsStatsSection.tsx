import RemboursementsStatCard from "@/components/remboursements/RemboursementsStatCard";

interface RemboursementsStatsSectionProps {
  activeCount: number;
  totalRepaidFC: number;
  totalRepaidUSD: number;
  overdueCount: number;
}

export default function RemboursementsStatsSection({
  activeCount,
  totalRepaidFC,
  totalRepaidUSD,
  overdueCount,
}: RemboursementsStatsSectionProps) {
  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <RemboursementsStatCard
        title="Crédits Actifs"
        value={activeCount.toString()}
        trend="+12% ce mois"
        icon="wallet"
        color="blue"
      />
      <RemboursementsStatCard
        title="Total Remboursé (FC)"
        value={`${totalRepaidFC.toLocaleString("fr-FR")} FC`}
        trend="+5% progression"
        icon="money"
        color="green"
      />
      <RemboursementsStatCard
        title="Total Remboursé (USD)"
        value={`$${totalRepaidUSD.toLocaleString("fr-FR")}`}
        trend="+8% progression"
        icon="dollar"
        color="green"
      />
      <RemboursementsStatCard
        title="Crédits En Retard"
        value={overdueCount.toString()}
        trend="Attention requise"
        icon="warning"
        color="red"
      />
    </section>
  );
}
