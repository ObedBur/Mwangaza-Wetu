'use client'

interface MembersStatsCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  percentage?: string;
  trend?: 'up' | 'down';
  trendColor?: 'green' | 'amber' | 'blue' | 'primary';
  chart?: boolean;
}

export default function MembersStatsCard({
  icon,
  label,
  value,
  percentage,
  trend,
  trendColor = 'green',
  chart = false,
}: MembersStatsCardProps) {
  const bgColorMap = {
    green: 'bg-green-100 text-green-600',
    amber: 'bg-amber-100 text-amber-600',
    blue: 'bg-blue-100 text-blue-600',
    primary: 'bg-primary/10 text-primary',
  };

  const badgeBgMap = {
    green: 'bg-green-50 text-green-600',
    amber: 'bg-amber-50 text-amber-600',
    blue: 'bg-blue-50 text-blue-600',
    primary: 'bg-primary/5 text-primary',
  };

  return (
    <div className="glass-card rounded-2xl p-4 sm:p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-2.5 rounded-xl ${bgColorMap[trendColor]}`}>{icon}</div>
        {percentage && (
          <span className={`text-xs font-bold px-2 py-1 rounded-lg ${badgeBgMap[trendColor]}`}>
            {trend === 'down' && '-'}
            {trend === 'up' && '+'}
            {percentage}
          </span>
        )}
      </div>
      <div>
        <p className="text-slate-500 text-[10px] sm:text-xs font-semibold uppercase tracking-wider mb-1">
          {label}
        </p>
        <div className="flex items-end justify-between">
          <h3 className="text-2xl sm:text-3xl font-bold line-clamp-1">{value}</h3>
          {chart && (
            <div className="w-12 sm:w-16 h-6 sm:h-8 bg-gradient-to-t from-green-500/20 to-transparent rounded flex items-end gap-[2px]">
              <div className="bg-green-500/60 w-full rounded-t-sm" style={{ height: '40%' }}></div>
              <div className="bg-green-500/60 w-full rounded-t-sm" style={{ height: '60%' }}></div>
              <div className="bg-green-500/60 w-full rounded-t-sm" style={{ height: '50%' }}></div>
              <div className="bg-green-500/60 w-full rounded-t-sm" style={{ height: '80%' }}></div>
              <div className="bg-green-500/60 w-full rounded-t-sm" style={{ height: '100%' }}></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
