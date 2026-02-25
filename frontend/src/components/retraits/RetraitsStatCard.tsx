import { CalendarDays, LineChart } from 'lucide-react';

interface RetraitsStatCardProps {
  title: string;
  value: string;
  trendText: string;
  accent?: 'primary' | 'emerald';
}

export default function RetraitsStatCard({ title, value, trendText, accent = 'primary' }: RetraitsStatCardProps) {
  const icon = accent === 'emerald' ? LineChart : CalendarDays;
  const iconBg = accent === 'emerald' ? 'bg-emerald-500/5 text-emerald-600 dark:text-emerald-400' : 'bg-primary/5 text-primary';
  const trendBg = accent === 'emerald' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400';
  const Icon = icon;

  return (
    <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 relative overflow-hidden group">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
          <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-1">{value}</h3>
        </div>
        <div className={`p-2 rounded-xl ${iconBg}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${trendBg}`}>
          {trendText}
        </span>
        <span className="text-xs text-slate-400">vs hier</span>
      </div>
      <div className="absolute -right-8 -bottom-10 opacity-5 group-hover:opacity-10 transition-opacity text-slate-900 dark:text-white">
        <div className="w-24 h-24 rounded-full bg-slate-900 dark:bg-white" />
      </div>
    </div>
  );
}
