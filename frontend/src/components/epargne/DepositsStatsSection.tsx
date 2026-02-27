import DepositsStatCard from '@/components/epargne/DepositsStatCard';

interface DepositsStatsSectionProps {
  totalFC: number;
  totalUSD: number;
  totalTransactions?: number;
  lastUpdatedAt?: string | null;
  isLoading?: boolean;
}

export default function DepositsStatsSection({
  totalFC,
  totalUSD,
  totalTransactions,
  lastUpdatedAt,
  isLoading = false,
}: DepositsStatsSectionProps) {
  const formattedLastUpdate = lastUpdatedAt
    ? formatRelativeTime(lastUpdatedAt)
    : null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      <DepositsStatCard
        title="Solde Total (FC)"
        value={formatAmount(totalFC)}
        subtitle="Franc Congolais"
        isSkeleton={isLoading}
      />
      <DepositsStatCard
        title="Solde Total (USD)"
        value={formatAmount(totalUSD)}
        subtitle="Dollar Américain"
        isSkeleton={isLoading}
      />
      <DepositsStatCard
        title="Transactions"
        value={totalTransactions !== undefined ? String(totalTransactions) : '—'}
        subtitle="Total enregistrées"
        isSkeleton={isLoading || totalTransactions === undefined}
      />
      <DepositsStatCard
        title="Dernière mise à jour"
        value={formattedLastUpdate ?? '—'}
        subtitle="Synchronisation"
        isSkeleton={isLoading || formattedLastUpdate === null}
      />
    </div>
  );
}

function formatAmount(n: number) {
  return new Intl.NumberFormat('fr-FR').format(n);
}

/** Formate une date ISO en durée relative (ex: "il y a 2 min") */
function formatRelativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  if (diffMin < 1) return "à l'instant";
  if (diffMin < 60) return `il y a ${diffMin} min`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `il y a ${diffH} h`;
  return `il y a ${Math.floor(diffH / 24)} j`;
}
