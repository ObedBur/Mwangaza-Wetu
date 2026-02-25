import { ArrowDownLeft, ArrowUpRight, Scale, Clock, TrendingUp, TrendingDown } from 'lucide-react';

interface ComptabiliteStatCardProps {
  title: string;
  value: string;
  trend: string;
  icon: 'arrow-down' | 'arrow-up' | 'scale' | 'clock';
  color: 'green' | 'red' | 'blue' | 'amber';
}

const iconMap = {
  'arrow-down': ArrowDownLeft,
  'arrow-up': ArrowUpRight,
  'scale': Scale,
  'clock': Clock,
};

const colorClasses = {
  green: {
    bg: 'bg-emerald-50 dark:bg-emerald-900/30',
    text: 'text-emerald-600 dark:text-emerald-400',
    border: 'hover:border-emerald-200 dark:hover:border-emerald-800',
  },
  red: {
    bg: 'bg-red-50 dark:bg-red-900/30',
    text: 'text-red-600 dark:text-red-400',
    border: 'hover:border-red-200 dark:hover:border-red-800',
  },
  blue: {
    bg: 'bg-blue-50 dark:bg-blue-900/30',
    text: 'text-primary',
    border: 'hover:border-blue-200 dark:hover:border-blue-800',
  },
  amber: {
    bg: 'bg-amber-50 dark:bg-amber-900/30',
    text: 'text-amber-600 dark:text-amber-400',
    border: 'hover:border-amber-200 dark:hover:border-amber-800',
  },
};

export default function ComptabiliteStatCard({ title, value, trend, icon, color }: ComptabiliteStatCardProps) {
  const Icon = iconMap[icon];
  const colors = colorClasses[color];
  const isNeutral = color === 'amber' || color === 'blue';

  return (
    <div className={`bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between h-full group ${colors.border} transition-all`}>
      <div className="flex justify-between items-start mb-4">
        <div className={`p-2 rounded-lg ${colors.bg} ${colors.text}`}>
          <Icon className="w-5 h-5" />
        </div>
        {!isNeutral && (
          <span className={`flex items-center text-xs font-bold px-2 py-1 rounded-full ${color === 'green' ? 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400' : 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400'}`}>
            {color === 'green' ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
            {trend}
          </span>
        )}
        {isNeutral && (
          <span className="flex items-center text-xs font-bold px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
            {trend}
          </span>
        )}
      </div>
      <div>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{title}</p>
        <h3 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white">{value}</h3>
      </div>
    </div>
  );
}
