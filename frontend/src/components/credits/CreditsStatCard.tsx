import { Wallet, CheckCircle, AlertTriangle, PiggyBank, TrendingUp, TrendingDown } from 'lucide-react';

interface CreditsStatCardProps {
  title: string;
  value: string;
  trend: string;
  icon: 'wallet' | 'check' | 'warning' | 'savings';
  color: 'blue' | 'green' | 'red' | 'indigo';
}

const iconMap = {
  wallet: Wallet,
  check: CheckCircle,
  warning: AlertTriangle,
  savings: PiggyBank,
};

const colorClasses = {
  blue: {
    bg: 'bg-blue-50 dark:bg-blue-900/30',
    text: 'text-blue-600 dark:text-blue-400',
    border: 'hover:border-blue-200 dark:hover:border-blue-800',
  },
  green: {
    bg: 'bg-green-50 dark:bg-green-900/30',
    text: 'text-green-600 dark:text-green-400',
    border: 'hover:border-green-200 dark:hover:border-green-800',
  },
  red: {
    bg: 'bg-red-50 dark:bg-red-900/30',
    text: 'text-red-600 dark:text-red-400',
    border: 'hover:border-red-200 dark:hover:border-red-800',
  },
  indigo: {
    bg: 'bg-indigo-50 dark:bg-indigo-900/30',
    text: 'text-indigo-600 dark:text-indigo-400',
    border: 'hover:border-indigo-200 dark:hover:border-indigo-800',
  },
};

export default function CreditsStatCard({ title, value, trend, icon, color }: CreditsStatCardProps) {
  const Icon = iconMap[icon];
  const colors = colorClasses[color];
  const isNegative = trend.startsWith('-');

  return (
    <div className={`bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between h-full group ${colors.border} transition-all`}>
      <div className="flex justify-between items-start mb-4">
        <div className={`p-2 rounded-lg ${colors.bg} ${colors.text}`}>
          <Icon className="w-5 h-5" />
        </div>
        <span className={`flex items-center text-xs font-bold px-2 py-1 rounded-full ${isNegative ? 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400' : 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400'}`}>
          {isNegative ? <TrendingDown className="w-3 h-3 mr-1" /> : <TrendingUp className="w-3 h-3 mr-1" />}
          {trend}
        </span>
      </div>
      <div>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{title}</p>
        <h3 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white">{value}</h3>
      </div>
    </div>
  );
}
