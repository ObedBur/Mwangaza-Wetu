import BalanceStatCard from '@/components/balance/BalanceStatCard';

interface BalanceStatsSectionProps {
  totalAccounts: number;
  totalBalanceUSD: number;
  totalBalanceFC: number;
  activeAccounts: number;
}

export default function BalanceStatsSection({
  totalAccounts,
  totalBalanceUSD,
  totalBalanceFC,
  activeAccounts,
}: BalanceStatsSectionProps) {
  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
      <BalanceStatCard
        title="Comptes Actifs"
        value={totalAccounts.toString()}
        trend={`${activeAccounts} actifs`}
        icon="users"
        color="blue"
      />
      <BalanceStatCard
        title="Solde Total (USD)"
        value={`$${totalBalanceUSD.toLocaleString('fr-FR')}`}
        trend="Épargne USD"
        icon="wallet"
        color="green"
      />
      <BalanceStatCard
        title="Solde Total (FC)"
        value={`${totalBalanceFC.toLocaleString('fr-FR')} FC`}
        trend="Épargne FC"
        icon="savings"
        color="amber"
      />
      <BalanceStatCard
        title="Crédits Actifs"
        value="3"
        trend="En cours"
        icon="credit"
        color="purple"
      />
    </section>
  );
}
