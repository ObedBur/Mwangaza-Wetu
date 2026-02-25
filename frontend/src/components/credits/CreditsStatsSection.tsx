import CreditsStatCard from '@/components/credits/CreditsStatCard';

interface CreditsStatsSectionProps {
  totalCredits: number;
  activeCredits: number;
  overdueCredits: number;
  availableBalance: number;
}

export default function CreditsStatsSection({
  totalCredits,
  activeCredits,
  overdueCredits,
  availableBalance,
}: CreditsStatsSectionProps) {
  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
      <CreditsStatCard
        title="Total des Crédits"
        value={formatAmount(totalCredits)}
        trend="+12%"
        icon="wallet"
        color="blue"
      />
      <CreditsStatCard
        title="Crédits Actifs"
        value={formatAmount(activeCredits)}
        trend="+5%"
        icon="check"
        color="green"
      />
      <CreditsStatCard
        title="En Retard"
        value={formatAmount(overdueCredits)}
        trend="-2%"
        icon="warning"
        color="red"
      />
      <CreditsStatCard
        title="Solde Disponible"
        value={formatAmount(availableBalance)}
        trend="+8%"
        icon="savings"
        color="indigo"
      />
    </section>
  );
}

function formatAmount(n: number) {
  return new Intl.NumberFormat('fr-FR').format(n) + ' $';
}
