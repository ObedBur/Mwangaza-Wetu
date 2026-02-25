import RetraitsStatCard from '@/components/retraits/RetraitsStatCard';

interface RetraitsStatsSectionProps {
  todayTotalFC: number;
  todayTotalUSD: number;
  monthCount: number;
  monthTotalUSD: number;
}

export default function RetraitsStatsSection({
  todayTotalFC,
  todayTotalUSD,
  monthCount,
  monthTotalUSD,
}: RetraitsStatsSectionProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
      <RetraitsStatCard
        title="Aujourd&apos;hui (Volume total)"
        value={`${formatAmount(todayTotalFC)} FC / $${formatAmount(todayTotalUSD)}`}
        trendText="+12.5%"
      />
      <RetraitsStatCard
        title="Totaux Cumulés (Mois)"
        value={`${monthCount} Opérations / $${formatAmount(monthTotalUSD)}`}
        trendText="+5.2%"
        accent="emerald"
      />
    </div>
  );
}

function formatAmount(n: number) {
  return new Intl.NumberFormat('fr-FR').format(n);
}
