import ComptabiliteStatCard from '@/components/comptabilite/ComptabiliteStatCard';

interface ComptabiliteStatsSectionProps {
  totalDebit: number;
  totalCredit: number;
  netBalance: number;
  pendingCount: number;
}

export default function ComptabiliteStatsSection({
  totalDebit,
  totalCredit,
  netBalance,
  pendingCount,
}: ComptabiliteStatsSectionProps) {
  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
      <ComptabiliteStatCard
        title="Total Débit"
        value={formatAmount(totalDebit)}
        trend="+12%"
        icon="arrow-down"
        color="green"
      />
      <ComptabiliteStatCard
        title="Total Crédit"
        value={formatAmount(totalCredit)}
        trend="+5%"
        icon="arrow-up"
        color="red"
      />
      <ComptabiliteStatCard
        title="Solde Net"
        value={formatAmount(netBalance)}
        trend="Équilibré"
        icon="scale"
        color="blue"
      />
      <ComptabiliteStatCard
        title="Écritures en Attente"
        value={pendingCount.toString()}
        trend="Validation requise"
        icon="clock"
        color="amber"
      />
    </section>
  );
}

function formatAmount(n: number) {
  return new Intl.NumberFormat('fr-FR').format(n) + ' $';
}
