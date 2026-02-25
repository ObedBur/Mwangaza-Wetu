import RapportsStatCard from '@/components/rapports/RapportsStatCard';

interface RapportsStatsSectionProps {
  totalReports: number;
  approvedCount: number;
  pendingCount: number;
  totalDownloads: number;
}

export default function RapportsStatsSection({
  totalReports,
  approvedCount,
  pendingCount,
  totalDownloads,
}: RapportsStatsSectionProps) {
  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
      <RapportsStatCard
        title="Total Rapports"
        value={totalReports.toString()}
        trend="+3 ce mois"
        icon="file"
        color="blue"
      />
      <RapportsStatCard
        title="Rapports Approuvés"
        value={approvedCount.toString()}
        trend="Prêt à consulter"
        icon="check"
        color="green"
      />
      <RapportsStatCard
        title="En Attente"
        value={pendingCount.toString()}
        trend="Validation requise"
        icon="clock"
        color="amber"
      />
      <RapportsStatCard
        title="Téléchargements"
        value={totalDownloads.toLocaleString('fr-FR')}
        trend="Populaires"
        icon="download"
        color="indigo"
      />
    </section>
  );
}
