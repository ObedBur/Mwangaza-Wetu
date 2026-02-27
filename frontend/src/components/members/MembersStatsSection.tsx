import MembersStatsCard from './MembersStatsCard';
import { Users, UserX, Users2, TrendingUp, Loader2 } from 'lucide-react';
import { useMemberStats } from '@/hooks/useMembers';

export default function MembersStatsSection() {
  const { data: serverStats, isLoading } = useMemberStats();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary opacity-20" />
      </div>
    );
  }

  // Calcul du ratio de genre
  const totalGender = (serverStats?.hommes || 0) + (serverStats?.femmes || 0);
  const percentFemmes = totalGender > 0 ? Math.round((serverStats.femmes / totalGender) * 100) : 0;
  const percentHommes = totalGender > 0 ? Math.round((serverStats.hommes / totalGender) * 100) : 0;

  const stats = [
    {
      id: 1,
      icon: <Users className="w-5 sm:w-6 h-5 sm:h-6" />,
      label: 'Active Members',
      value: serverStats?.actifs?.toString() || '0',
      percentage: '12%',
      trend: 'up' as const,
      trendColor: 'green' as const,
      chart: true,
    },
    {
      id: 2,
      icon: <UserX className="w-5 sm:w-6 h-5 sm:h-6" />,
      label: 'Inactive',
      value: serverStats?.inactifs?.toString() || '0',
      percentage: '2%',
      trend: 'down' as const,
      trendColor: 'amber' as const,
      chart: true,
    },
    {
      id: 3,
      icon: <Users2 className="w-5 sm:w-6 h-5 sm:h-6" />,
      label: 'Gender Ratio',
      value: `${percentFemmes}% F / ${percentHommes}% M`,
      trendColor: 'blue' as const,
    },
    {
      id: 4,
      icon: <TrendingUp className="w-5 sm:w-6 h-5 sm:h-6" />,
      label: 'Growth %',
      value: serverStats?.total > 0 ? '+0.2%' : '0%', // Simulation de croissance ou base fixe
      percentage: '0.2%',
      trend: 'up' as const,
      trendColor: 'primary' as const,
      chart: true,
    },
  ];

  return (
    <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-8">
      {stats.map((stat) => (
        <MembersStatsCard key={stat.id} {...stat} />
      ))}
    </div>
  );
}
