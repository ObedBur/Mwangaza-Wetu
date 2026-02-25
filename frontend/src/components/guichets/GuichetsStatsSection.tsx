import GuichetsStatCard from '@/components/guichets/GuichetsStatCard';

interface GuichetsStatsSectionProps {
  activeCount: number;
  openCount: number;
  todayTransactions: number;
  totalAmount: number;
}

export default function GuichetsStatsSection({
  activeCount,
  openCount,
  todayTransactions,
  totalAmount,
}: GuichetsStatsSectionProps) {
  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
      <GuichetsStatCard
        title="Caissiers Actifs"
        value={activeCount.toString()}
        trend={`${activeCount} sur 5`}
        icon="users"
        color="blue"
      />
      <GuichetsStatCard
        title="Guichets Ouverts"
        value={openCount.toString()}
        trend="En service"
        icon="open"
        color="green"
      />
      <GuichetsStatCard
        title="Transactions Aujourd&apos;hui"
        value={todayTransactions.toLocaleString('fr-FR')}
        trend="+12% vs hier"
        icon="transactions"
        color="amber"
      />
      <GuichetsStatCard
        title="Montant Total"
        value={`$${totalAmount.toLocaleString('fr-FR')}`}
        trend="Volume traité"
        icon="money"
        color="indigo"
      />
    </section>
  );
}
