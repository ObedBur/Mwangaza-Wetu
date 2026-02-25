'use client'

import MembersStatsCard from './MembersStatsCard';
import { Users, UserX, Users2, TrendingUp } from 'lucide-react';

export default function MembersStatsSection() {
  const stats = [
    {
      id: 1,
      icon: <Users className="w-5 sm:w-6 h-5 sm:h-6" />,
      label: 'Active Members',
      value: '0',
      percentage: '12%',
      trend: 'up' as const,
      trendColor: 'green' as const,
      chart: true,
    },
    {
      id: 2,
      icon: <UserX className="w-5 sm:w-6 h-5 sm:h-6" />,
      label: 'Inactive',
      value: '0',
      percentage: '2%',
      trend: 'down' as const,
      trendColor: 'amber' as const,
      chart: true,
    },
    {
      id: 3,
      icon: <Users2 className="w-5 sm:w-6 h-5 sm:h-6" />,
      label: 'Gender Ratio',
      value: '0% F / 0% M',
      trendColor: 'blue' as const,
    },
    {
      id: 4,
      icon: <TrendingUp className="w-5 sm:w-6 h-5 sm:h-6" />,
      label: 'Growth %',
      value: '0%',
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
