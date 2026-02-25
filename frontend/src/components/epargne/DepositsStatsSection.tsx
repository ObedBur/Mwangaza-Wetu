import DepositsStatCard from '@/components/epargne/DepositsStatCard';

interface DepositsStatsSectionProps {
  totalFC: number;
  totalUSD: number;
}

export default function DepositsStatsSection({ totalFC, totalUSD }: DepositsStatsSectionProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      <DepositsStatCard title="Solde Total (FC)" value={formatAmount(totalFC)} subtitle="Franc Congolais" />
      <DepositsStatCard title="Solde Total (USD)" value={formatAmount(totalUSD)} subtitle="Dollar Américain" />
      <DepositsStatCard title="Transactions" value="3" subtitle="Mock" isSkeleton />
      <DepositsStatCard title="Dernière mise à jour" value="2 min" subtitle="Mock" isSkeleton />
    </div>
  );
}

function formatAmount(n: number) {
  return new Intl.NumberFormat('fr-FR').format(n);
}
